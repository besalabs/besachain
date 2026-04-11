# OP Stack L1 Contracts Deployment - Alternative Method

## Overview
This directory contains an alternative deployment method for OP Stack L1 contracts that **DOES NOT REQUIRE BUILDING FROM SOURCE**. This solves the memory limitation issues (16GB+ RAM needed for Forge builds).

## Solution: op-deployer with Pre-Built Artifacts

### Why This Works
- Uses `op-deployer` tool which downloads **pre-compiled contract bytecode** from GCS
- No local compilation needed - avoids the 551 Solidity files build process
- Works with systems having < 4GB RAM
- Uses tagged artifacts: `tag://op-contracts/v6.0.0`

### Requirements
- Go 1.21+ (for building op-deployer, or use pre-built binary)
- Access to L1 RPC endpoint (chain 1444 for BesaChain)
- Deployer account with ETH for gas
- ~100MB disk space (vs 10GB+ for full build)

---

## Quick Start

```bash
# 1. Download and setup op-deployer
./setup-op-deployer.sh

# 2. Configure your deployment
cp intent.example.toml intent.toml
# Edit intent.toml with your specific addresses

# 3. Deploy contracts
./deploy.sh

# 4. Generate rollup.json
./generate-rollup-config.sh
```

---

## Detailed Steps

### Step 1: Download op-deployer

The script `setup-op-deployer.sh` will:
- Detect your OS/architecture
- Download the appropriate binary from GitHub releases
- Verify checksums
- Install to `./bin/op-deployer`

### Step 2: Configure Deployment Intent

Edit `intent.toml` to set:
- L1 chain ID (1444 for BesaChain)
- L2 chain ID (1445 for BesaChain L2)
- Admin addresses
- Sequencer/Batcher/Proposer addresses
- Fee recipient addresses

### Step 3: Deploy

The `deploy.sh` script will:
1. Initialize the deployment state
2. Download pre-built contract artifacts (tag://op-contracts/v6.0.0)
3. Deploy all L1 contracts
4. Save deployment state to `state.json`

### Step 4: Generate Configs

Generate `rollup.json` and `genesis.json` for your L2 node.

---

## Contract Addresses Output

After deployment, the following contract addresses will be available:

| Contract | Purpose |
|----------|---------|
| `OptimismPortalProxy` | Main entry point for L2 deposits |
| `L2OutputOracleProxy` | Stores L2 output commitments |
| `SystemConfigProxy` | System configuration |
| `L1StandardBridgeProxy` | Standard token bridge |
| `L1CrossDomainMessengerProxy` | Cross-domain messaging |
| `AddressManager` | Address resolution |
| `ProxyAdmin` | Proxy administration |

---

## Files Description

| File | Purpose |
|------|---------|
| `setup-op-deployer.sh` | Downloads and installs op-deployer binary |
| `deploy.sh` | Main deployment script |
| `intent.example.toml` | Example configuration template |
| `generate-rollup-config.sh` | Creates rollup.json from deployment state |
| `deploy-with-hardhat.js` | Alternative: Hardhat deployment using npm artifacts |
| `package.json` | Node.js dependencies for Hardhat alternative |

---

## Troubleshooting

### "unsupported tag" error
Use local artifacts instead:
```bash
# Download artifacts manually
curl -L -o artifacts.tar.gz \
  "https://storage.googleapis.com/oplabs-contract-artifacts/artifacts-v1.8.0.tar.gz"
tar -xzf artifacts.tar.gz
# Use file://./artifacts in intent.toml
```

### "insufficient funds" error
Ensure your deployer account has enough ETH on L1 chain 1444.

### Connection refused
Verify L1 RPC URL is accessible: `curl -X POST $L1_RPC_URL -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'`

---

## Alternative: Hardhat Deployment

If op-deployer doesn't work, use the Hardhat alternative:

```bash
cd hardhat-alternative
npm install
npx hardhat run deploy.js --network besachain
```

This uses `@eth-optimism/contracts-bedrock` npm package which includes pre-built artifacts.

---

## References

- [OP Stack Deployment Docs](https://docs.optimism.io/operators/chain-operators/tools/op-deployer)
- [op-deployer GitHub](https://github.com/ethereum-optimism/optimism/tree/develop/op-deployer)
- [Pre-built Artifacts](https://storage.googleapis.com/oplabs-contract-artifacts/)
