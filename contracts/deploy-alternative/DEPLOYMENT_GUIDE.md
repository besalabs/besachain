# BesaChain L1 Contract Deployment Guide

## Problem Statement

The standard OP Stack contract deployment requires:
- **16GB+ RAM** to compile 551 Solidity files using Forge
- Docker with 10GB RAM still fails with SIGSEGV
- Building from source is memory-intensive

## Solution Overview

This directory provides **three alternative methods** that avoid building from source:

| Method | Memory Required | Complexity | Recommendation |
|--------|-----------------|------------|----------------|
| **op-deployer (tagged artifacts)** | < 500MB | Low | ⭐ **Recommended** |
| **Hardhat + npm artifacts** | < 2GB | Medium | Alternative |
| **Manual bytecode deployment** | < 500MB | High | Advanced |

---

## Method 1: op-deployer with Pre-Built Artifacts (Recommended)

### Why This Works

```
┌─────────────────────────────────────────────────────────────┐
│  Standard Method (Memory Heavy)                              │
│  ─────────────────────────────                               │
│  1. Clone optimism repo                                      │
│  2. Install dependencies (pnpm, forge)                      │
│  3. forge build (551 files → 16GB+ RAM)                     │
│  4. Deploy                                                   │
└─────────────────────────────────────────────────────────────┘
                              vs
┌─────────────────────────────────────────────────────────────┐
│  This Method (Memory Light)                                  │
│  ──────────────────────────                                  │
│  1. Download op-deployer binary (~50MB)                     │
│  2. Download pre-built artifacts from GCS (~30MB)           │
│  3. Deploy (no compilation)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Prerequisites

```bash
# Required
- Go 1.21+ (for building from source, OR use pre-built binary)
- curl or wget
- Access to BesaChain L1 RPC (http://localhost:1444)

# Optional but recommended
- jq (for JSON parsing)
- python3 (for helper scripts)
```

### Step-by-Step Deployment

#### Step 1: Download op-deployer

```bash
cd /Users/senton/besachain/contracts/deploy-alternative

# Run the setup script
./setup-op-deployer.sh

# Or manually download:
# macOS ARM64
# curl -L -o op-deployer.tar.gz \
#   "https://github.com/ethereum-optimism/optimism/releases/download/op-deployer/v0.6.0/op-deployer-0.6.0-darwin-arm64.tar.gz"

# Linux AMD64
# curl -L -o op-deployer.tar.gz \
#   "https://github.com/ethereum-optimism/optimism/releases/download/op-deployer/v0.6.0/op-deployer-0.6.0-linux-amd64.tar.gz"
```

#### Step 2: Configure Deployment

```bash
# Copy the example configuration
cp intent.example.toml intent.toml

# Edit with your addresses
nano intent.toml
```

Key values to update in `intent.toml`:

```toml
# L1 Configuration
l1_chain_id = 1444

# Use pre-built artifacts (NO COMPILATION!)
l1_contracts_locator = "tag://op-contracts/v6.0.0"
l2_contracts_locator = "tag://op-contracts/v6.0.0"

# Your BesaChain addresses
[[chains]]
chain_id = 1445
block_time = 1  # or 0.25 for 250ms

# CRITICAL: Update these addresses
l1_proxy_admin_owner = "0xYOUR_ADMIN_ADDRESS"
system_config_owner = "0xYOUR_ADMIN_ADDRESS"
batcher = "0xYOUR_BATCHER_ADDRESS"
proposer = "0xYOUR_PROPOSER_ADDRESS"
unsafe_block_signer = "0xYOUR_SEQUENCER_ADDRESS"
```

#### Step 3: Deploy

```bash
# Set environment variables
export L1_RPC_URL=http://localhost:1444
export PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Run deployment
./deploy.sh
```

This will:
1. Download pre-built artifacts from GCS
2. Deploy all L1 contracts
3. Save state to `.deployer/state.json`
4. Generate `rollup.json` and `genesis.json`

#### Step 4: Generate Rollup Config

```bash
./generate-rollup-config.sh
```

Output will be saved to:
- `.deployer/rollup.json`
- `.deployer/genesis.json`
- `/data/besachain-l2/config/` (if directory exists)

### Expected Output

```
=== Deployment Summary ===

Working directory: .deployer
Intent file: .deployer/intent.toml
State file: .deployer/state.json

Deployed Contracts:
  OptimismPortalProxy: 0x...
  L2OutputOracleProxy: 0x...
  SystemConfigProxy: 0x...
  L1StandardBridgeProxy: 0x...
  L1CrossDomainMessengerProxy: 0x...
```

---

## Method 2: Hardhat with NPM Artifacts

If op-deployer doesn't work for your use case, use the Hardhat alternative:

```bash
cd hardhat-alternative

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Deploy
npx hardhat run deploy.js --network besachain
```

### How It Works

Uses `@eth-optimism/contracts-bedrock` npm package which includes:
- Pre-compiled contract artifacts
- Contract ABIs
- Deployment bytecode

No local compilation needed!

---

## Method 3: Manual Bytecode Deployment (Advanced)

For maximum control, you can manually deploy using pre-compiled bytecode:

### Step 1: Download Artifacts

```bash
# Download from GCS directly
curl -L -o artifacts.tar.gz \
  "https://storage.googleapis.com/oplabs-contract-artifacts/artifacts-v1.8.0.tar.gz"

tar -xzf artifacts.tar.gz
```

### Step 2: Extract Bytecode

```bash
# Get bytecode for specific contract
cat forge-artifacts/OptimismPortal.sol/OptimismPortal.json | jq -r '.bytecode.object'
```

### Step 3: Deploy Using cast/sendTransaction

```bash
# Deploy using cast
cast send --create --rpc-url $L1_RPC_URL --private-key $PRIVATE_KEY \
  $(cat OptimismPortal.bin)
```

---

## Rollup.json Format Reference

```json
{
  "genesis": {
    "l1": {
      "hash": "0x...",
      "number": 0
    },
    "l2": {
      "hash": "0x...",
      "number": 0
    },
    "l2_time": 0,
    "system_config": {
      "batcherAddr": "0x...",
      "overhead": "0x0",
      "scalar": "0x...",
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
  "deposit_contract_address": "0x...",
  "l1_system_config_address": "0x...",
  "protocol_versions_address": "0x..."
}
```

---

## Troubleshooting

### "unsupported tag" error

The tag format changed. Try:
```toml
# Old format (may not work)
l1_contracts_locator = "tag://op-contracts/v1.8.0"

# New format
l1_contracts_locator = "tag://op-contracts/v6.0.0"
```

Or use a local file:
```bash
# Download artifacts manually
curl -L -o artifacts.tar.gz \
  "https://storage.googleapis.com/oplabs-contract-artifacts/artifacts-v1.8.0.tar.gz"
tar -xzf artifacts.tar.gz

# Use file locator
l1_contracts_locator = "file://./artifacts"
```

### "insufficient funds" error

Ensure your deployer address has ETH on chain 1444:
```bash
cast balance $DEPLOYER_ADDRESS --rpc-url http://localhost:1444
```

### Connection refused

Verify L1 is running:
```bash
curl -X POST http://localhost:1444 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### Missing dependencies

Install jq (optional):
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Or download binary
curl -L -o /usr/local/bin/jq \
  https://github.com/jqlang/jq/releases/download/jq-1.7.1/jq-linux-amd64
chmod +x /usr/local/bin/jq
```

---

## Contract Addresses

After successful deployment, you'll have these key contracts:

| Contract | Purpose | Proxy Address |
|----------|---------|---------------|
| OptimismPortal | L2 deposit/withdrawal entry | `OptimismPortalProxy` |
| L2OutputOracle | Output commitments storage | `L2OutputOracleProxy` |
| SystemConfig | System parameters | `SystemConfigProxy` |
| L1StandardBridge | Token bridging | `L1StandardBridgeProxy` |
| L1CrossDomainMessenger | Cross-domain messages | `L1CrossDomainMessengerProxy` |
| AddressManager | Address resolution | `AddressManager` |
| ProxyAdmin | Proxy administration | `ProxyAdmin` |

---

## Next Steps

After deploying L1 contracts:

1. **Copy configs to L2 node**:
   ```bash
   cp .deployer/rollup.json /data/besachain-l2/config/
   cp .deployer/genesis.json /data/besachain-l2/config/
   ```

2. **Start L2 services**:
   ```bash
   sudo systemctl start besachain-l2-node
   sudo systemctl start besachain-l2-batcher
   sudo systemctl start besachain-l2-proposer
   ```

3. **Verify deployment**:
   ```bash
   curl -X POST http://localhost:1445 \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
   ```

---

## References

- [OP Deployer Documentation](https://docs.optimism.io/operators/chain-operators/tools/op-deployer)
- [OP Stack Deployment Guide](https://docs.optimism.io/operators/chain-operators/deploy)
- [Contract Artifacts GCS](https://storage.googleapis.com/oplabs-contract-artifacts/)
- [Optimism GitHub Releases](https://github.com/ethereum-optimism/optimism/releases)
