#!/bin/bash
# Full OP Stack Deployment Script for BesaChain
# Run this on the EC2 instance after the server recovers

set -e

echo "=== BesaChain OP Stack Deployment ==="
echo "This script will deploy the full OP Stack to BesaChain"
echo ""

# Setup environment
export NVM_DIR="/home/ec2-user/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PNPM_HOME="/home/ec2-user/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
export PATH="$HOME/.foundry/bin:$PATH"

# Configuration
DEPLOYER_KEY="/data/besachain-l2/keys/deployer.txt"
L1_RPC="http://localhost:1444"
L2_RPC="http://localhost:1445"

echo "Step 1: Checking prerequisites..."
# Verify deployer has funds
DEPLOYER_ADDR=$(cat $DEPLOYER_KEY | grep ADDRESS | cut -d= -f2)
echo "Deployer: $DEPLOYER_ADDR"

BALANCE=$(cast balance $DEPLOYER_ADDR --rpc-url $L1_RPC)
echo "Deployer balance: $BALANCE wei"

if [ "$BALANCE" = "0" ]; then
    echo "ERROR: Deployer has no funds!"
    exit 1
fi

echo ""
echo "Step 2: Building contracts..."
cd /data/optimism/packages/contracts-bedrock

# Install dependencies if needed
if [ ! -d "lib/solmate" ]; then
    echo "Installing forge dependencies..."
    forge install
fi

# Build contracts
echo "Building with pnpm..."
pnpm build

echo ""
echo "Step 3: Creating deployment config..."
# Create deployment config
cat > deploy-config/besachain.json << 'EOF'
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
EOF

echo ""
echo "Step 4: Deploying L1 contracts..."
# Get private key
PRIVATE_KEY=$(cat $DEPLOYER_KEY | grep PRIVATE_KEY | cut -d= -f2)

# Deploy using forge script
forge script scripts/Deploy.s.sol:Deploy \
    --rpc-url $L1_RPC \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --slow \
    --ffi

echo ""
echo "Step 5: Saving deployment artifacts..."
mkdir -p /data/besachain-l2/config/deployments
cp -r deployments/besachain/* /data/besachain-l2/config/deployments/ || true

echo ""
echo "Step 6: Building op-node, op-batcher, op-proposer..."
cd /data/optimism

# Build Go binaries
make op-node op-batcher op-proposer 2>/dev/null || (
    # If make fails, build manually
    cd op-node && go build -o ../bin/op-node ./cmd/main.go && cd ..
    cd op-batcher && go build -o ../bin/op-batcher ./cmd/main.go && cd ..
    cd op-proposer && go build -o ../bin/op-proposer ./cmd/main.go && cd ..
)

# Install binaries
sudo cp bin/op-* /usr/local/bin/
sudo chmod +x /usr/local/bin/op-*

echo ""
echo "Step 7: Generating rollup config..."
cd /data/optimism/op-node

# Get genesis hashes
L1_HASH=$(curl -s -X POST $L1_RPC -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x0",false],"id":1}' | \
    python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["hash"])')

L2_HASH=$(curl -s -X POST $L2_RPC -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x0",false],"id":1}' | \
    python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["hash"])')

L2_TIME=$(curl -s -X POST $L2_RPC -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x0",false],"id":1}' | \
    python3 -c 'import json,sys; print(int(json.load(sys.stdin)["result"]["timestamp"], 16))')

# Get deployed contract addresses
DEPLOYMENTS="/data/optimism/packages/contracts-bedrock/deployments/besachain"
OPTIMISM_PORTAL=$(cat $DEPLOYMENTS/OptimismPortal.json 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin)["address"])' || echo "0x0000000000000000000000000000000000000000")
L2_OUTPUT_ORACLE=$(cat $DEPLOYMENTS/L2OutputOracle.json 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin)["address"])' || echo "0x0000000000000000000000000000000000000000")
SYSTEM_CONFIG=$(cat $DEPLOYMENTS/SystemConfig.json 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin)["address"])' || echo "0x0000000000000000000000000000000000000000")

echo "L1 Genesis: $L1_HASH"
echo "L2 Genesis: $L2_HASH"
echo "L2 Time: $L2_TIME"
echo "OptimismPortal: $OPTIMISM_PORTAL"
echo "L2OutputOracle: $L2_OUTPUT_ORACLE"
echo "SystemConfig: $SYSTEM_CONFIG"

# Create rollup.json
python3 << EOF
import json

rollup = {
    "genesis": {
        "l1": {
            "hash": "$L1_HASH",
            "number": 0
        },
        "l2": {
            "hash": "$L2_HASH",
            "number": 0
        },
        "l2_time": $L2_TIME,
        "system_config": {
            "batcherAddr": "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
            "overhead": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "scalar": "0x00000000000000000000000000000000000000000000000000000000000f4240",
            "gasLimit": 100000000,
            "baseFeeScalar": 0,
            "blobBaseFeeScalar": 0
        }
    },
    "block_time": 1,
    "max_sequencer_drift": 600,
    "seq_window_size": 3600,
    "channel_timeout": 300,
    "l1_chain_id": 1444,
    "l2_chain_id": 1445,
    "regolith_time": 0,
    "canyon_time": 0,
    "delta_time": 0,
    "ecotone_time": 0,
    "fjord_time": 0,
    "batch_inbox_address": "0xff00000000000000000000000000000000001445",
    "deposit_contract_address": "$OPTIMISM_PORTAL",
    "l1_system_config_address": "$SYSTEM_CONFIG",
    "protocol_versions_address": "0x0000000000000000000000000000000000000000"
}

with open('/data/besachain-l2/config/rollup.json', 'w') as f:
    json.dump(rollup, f, indent=2)

print("Rollup config created!")
EOF

echo ""
echo "Step 8: Creating systemd services..."

# Create op-node service
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

# Create op-batcher service
sudo tee /etc/systemd/system/besachain-l2-batcher.service << EOF
[Unit]
Description=BesaChain L2 Batcher
After=network.target besachain-l2-node.service

[Service]
Type=simple
User=besachain
Group=besachain
ExecStart=/usr/local/bin/op-batcher \\
  --l1-eth-rpc http://localhost:1444 \\
  --l2-eth-rpc http://localhost:1445 \\
  --rollup-rpc http://localhost:18545 \\
  --poll-interval 1s \\
  --sub-safety-margin 6 \\
  --max-channel-duration 25 \\
  --private-key $PRIVATE_KEY \\
  --data-availability-type calldata \\
  --target-num-frames 1 \\
  --txmgr.receipt-query-interval 1s
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Create op-proposer service
sudo tee /etc/systemd/system/besachain-l2-proposer.service << EOF
[Unit]
Description=BesaChain L2 Proposer
After=network.target besachain-l2-node.service

[Service]
Type=simple
User=besachain
Group=besachain
ExecStart=/usr/local/bin/op-proposer \\
  --l1-eth-rpc http://localhost:1444 \\
  --rollup-rpc http://localhost:18545 \\
  --poll-interval 12s \\
  --private-key $PRIVATE_KEY \\
  --l2oo-address $L2_OUTPUT_ORACLE
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

echo ""
echo "Step 9: Starting services..."
sudo systemctl daemon-reload

# Stop any existing L2
echo "Stopping existing L2 services..."
sudo systemctl stop besachain-l2-sequencer 2>/dev/null || true
sudo systemctl disable besachain-l2-sequencer 2>/dev/null || true

# Start new services in order
echo "Starting op-node..."
sudo systemctl start besachain-l2-node
sleep 10

echo "Starting op-batcher..."
sudo systemctl start besachain-l2-batcher

echo "Starting op-proposer..."
sudo systemctl start besachain-l2-proposer

# Enable services
sudo systemctl enable besachain-l2-node
sudo systemctl enable besachain-l2-batcher
sudo systemctl enable besachain-l2-proposer

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Checking status..."
sleep 5

# Check status
echo "op-node status:"
sudo systemctl is-active besachain-l2-node

echo "op-batcher status:"
sudo systemctl is-active besachain-l2-batcher

echo "op-proposer status:"
sudo systemctl is-active besachain-l2-proposer

echo ""
echo "L2 Block Number:"
curl -s -X POST http://localhost:1445 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | \
  python3 -c 'import json,sys; d=json.load(sys.stdin); print(int(d["result"], 16) if "result" in d else "Error")'

echo ""
echo "View logs with:"
echo "  sudo journalctl -u besachain-l2-node -f"
echo "  sudo journalctl -u besachain-l2-batcher -f"
echo "  sudo journalctl -u besachain-l2-proposer -f"
