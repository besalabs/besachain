# Full OP Stack Deployment Guide for BesaChain

## Overview
This guide documents the steps to deploy a full OP Stack with:
- **L1 (Chain 1444)**: 450ms block time ✓ Already configured
- **L2 (Chain 1445)**: 250ms-1s block time (target 250ms)

## Current Status

### ✅ Completed
- L1 running at 450ms block time (Parlia consensus with period: 0.45)
- L2 execution client running
- Optimism monorepo cloned to `/data/optimism`
- Node.js 20 and pnpm installed
- Dependencies installed

### ⚠️ Remaining Steps

## Step 1: Generate Deployer Key

```bash
# Generate a new private key for contract deployment
export PATH="$HOME/.local/share/pnpm:$PATH"
cd /data/optimism
cast wallet new --json > deployer-key.json
export PRIVATE_KEY=$(cat deployer-key.json | jq -r '.[0].private_key')
export DEPLOYER_ADDRESS=$(cat deployer-key.json | jq -r '.[0].address')
```

## Step 2: Fund Deployer Account

Transfer BESA from the prefunded account to the deployer:

```bash
# Use cast to send funds
export RPC_URL=http://localhost:1444
cast send $DEPLOYER_ADDRESS --value 500ether --rpc-url $RPC_URL --from 0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604
```

## Step 3: Build Contracts

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

cd /data/optimism/packages/contracts-bedrock

# Install foundry dependencies
forge install

# Build contracts
pnpm build
```

## Step 4: Create Deployment Config

Create `/data/optimism/packages/contracts-bedrock/deploy-config/besachain.json`:

```json
{
  "l1ChainID": 1444,
  "l2ChainID": 1445,
  "l2BlockTime": 1,
  "finalizationPeriodSeconds": 2,
  "outputOracleSubmissionInterval": 10,
  "outputOracleStartingBlockNumber": 0,
  "outputOracleStartingTimestamp": 0,
  "l2GenesisBlockGasLimit": "0x5f5e100",
  "l2GenesisBlockBaseFeePerGas": "0x0",
  "l2GenesisBlockCoinbase": "0x4200000000000000000000000000000000000011",
  "baseFeeVaultRecipient": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "l1FeeVaultRecipient": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "sequencerFeeVaultRecipient": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "proxyAdminOwner": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "finalSystemOwner": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "portalGuardian": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "l2OutputOracleProposer": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "l2OutputOracleChallenger": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "batchSenderAddress": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "p2pSequencerAddress": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  "l1StartingBlockTag": "earliest"
}
```

## Step 5: Deploy L1 Contracts

```bash
cd /data/optimism/packages/contracts-bedrock

# Set environment variables
export ETH_RPC_URL=http://localhost:1444
export PRIVATE_KEY=<your_deployer_key>

# Deploy contracts
forge script scripts/Deploy.s.sol:Deploy \
  --rpc-url $ETH_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --slow \
  --ffi

# Save deployment artifacts
cp deployments/besachain/*.json /data/besachain-l2/config/
```

## Step 6: Generate Rollup Config

Use the deployment artifacts to create `rollup.json`:

```bash
cd /data/optimism/op-node

# Run the genesis command
./bin/op-node genesis l2 \
  --deploy-config ../packages/contracts-bedrock/deploy-config/besachain.json \
  --deployment-dir ../packages/contracts-bedrock/deployments/besachain \
  --l1-rpc http://localhost:1444 \
  --l2-allocs /data/besachain-l2/config/genesis.json \
  --outfile.l2 /data/besachain-l2/config/rollup.json
```

## Step 7: Build op-batcher and op-proposer

```bash
cd /data/optimism

# Build Go binaries
make op-batcher op-proposer

# Copy binaries
cp op-batcher/bin/op-batcher /usr/local/bin/
cp op-proposer/bin/op-proposer /usr/local/bin/
chmod +x /usr/local/bin/op-*
```

## Step 8: Create Systemd Services

### op-node service
```bash
sudo tee /etc/systemd/system/besachain-l2-node.service << 'EOF'
[Unit]
Description=BesaChain L2 Node (op-node)
After=network.target besachain-l1.service

[Service]
Type=simple
User=besachain
Group=besachain
ExecStart=/usr/local/bin/op-node \
  --l1 http://localhost:1444 \
  --l2 http://localhost:14451 \
  --l2.jwt-secret /data/besachain-l2/secret/jwt-secret.txt \
  --rollup.config /data/besachain-l2/config/rollup.json \
  --sequencer.enabled \
  --sequencer.l1-confs 1 \
  --p2p.disable \
  --rpc.addr 0.0.0.0 \
  --rpc.port 18545 \
  --rpc.enable-admin \
  --log.level info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

### op-batcher service
```bash
sudo tee /etc/systemd/system/besachain-l2-batcher.service << 'EOF'
[Unit]
Description=BesaChain L2 Batcher
After=network.target besachain-l2-node.service

[Service]
Type=simple
User=besachain
Group=besachain
ExecStart=/usr/local/bin/op-batcher \
  --l1-eth-rpc http://localhost:1444 \
  --l2-eth-rpc http://localhost:1445 \
  --rollup-rpc http://localhost:18545 \
  --poll-interval 1s \
  --sub-safety-margin 6 \
  --max-channel-duration 25 \
  --private-key <BATCHER_PRIVATE_KEY> \
  --data-availability-type blobs \
  --target-num-frames 1 \
  --txmgr.receipt-query-interval 1s
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

### op-proposer service
```bash
sudo tee /etc/systemd/system/besachain-l2-proposer.service << 'EOF'
[Unit]
Description=BesaChain L2 Proposer
After=network.target besachain-l2-node.service

[Service]
Type=simple
User=besachain
Group=besachain
ExecStart=/usr/local/bin/op-proposer \
  --l1-eth-rpc http://localhost:1444 \
  --rollup-rpc http://localhost:18545 \
  --poll-interval 12s \
  --private-key <PROPOSER_PRIVATE_KEY> \
  --l2oo-address <L2OutputOracle_CONTRACT_ADDRESS>
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

## Step 9: Start Services

```bash
sudo systemctl daemon-reload

# Start in order
sudo systemctl start besachain-l2-node
sleep 10
sudo systemctl start besachain-l2-batcher
sudo systemctl start besachain-l2-proposer

# Enable all
sudo systemctl enable besachain-l2-node
sudo systemctl enable besachain-l2-batcher
sudo systemctl enable besachain-l2-proposer
```

## Step 10: Verify

```bash
# Check L2 is producing blocks
curl -s -X POST http://localhost:1445 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check op-node status
sudo systemctl status besachain-l2-node

# Check logs
sudo journalctl -u besachain-l2-node -f
```

## Block Time Configuration

### L1: 450ms ✓
Already configured in genesis:
```json
"parlia": { "period": 0.45, "epoch": 200 }
```

### L2: 1s (minimum for OP Stack)
OP Stack requires integer block times in seconds. The minimum practical is 1 second.
Set in `deploy-config/besachain.json`:
```json
"l2BlockTime": 1
```

**Note**: For true 250ms block times, a custom OP Stack modification would be required.

## Contract Addresses (Example)

After deployment, you'll have:
- `OptimismPortal`: Manages deposits/withdrawals
- `L2OutputOracle`: Stores L2 state commitments
- `SystemConfig`: System configuration
- `L1StandardBridge`: ERC20 bridge
- `L1CrossDomainMessenger`: Message passing

## Troubleshooting

### JWT Authentication
Ensure the JWT secret is the same for:
- L2 geth (`--authrpc.jwt-secret`)
- op-node (`--l2.jwt-secret`)

### L1 Funding
Deployer needs ~1-2 BESA for contract deployment.

### Network Connectivity
All services run on localhost:
- L1 RPC: http://localhost:1444
- L2 RPC: http://localhost:1445
- L2 Auth: http://localhost:14451
- op-node RPC: http://localhost:18545

## Security Considerations

1. **Private Keys**: Store deployment keys securely
2. **Contract Ownership**: Transfer ownership to multisig after deployment
3. **Challenger**: Set up a challenger for fault proofs
4. **Monitoring**: Implement monitoring for all services

## Resources

- [OP Stack Docs](https://stack.optimism.io/)
- [Contract Deployment](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/scripts/deploy/Deploy.s.sol)
- [BESACHAIN L1 Status](https://rpc.besachain.com)
