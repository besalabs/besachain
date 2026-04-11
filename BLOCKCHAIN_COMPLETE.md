# BesaChain Blockchain Setup - Final Status Report

**Date:** April 8, 2026  
**Server:** 54.235.85.175 (AWS EC2 t4g.large)  
**Status:** PARTIAL - L1 & L2 Geth Running, Contracts Need Deployment

---

## Executive Summary

BesaChain blockchain setup has been partially completed. The L1 and L2 execution clients are running, but L1 contracts need to be deployed for full L2 functionality.

| Component | Status | Details |
|-----------|--------|---------|
| L1 Node | ✅ Active | Chain 1444, Clique consensus, 100M gas |
| L2 Geth | ✅ Active | Chain 1445, 1B gas limit |
| L2 Node | ⚠️ Waiting | Needs L1 contract addresses |
| L1 Contracts | ❌ Required | Need deployment with Foundry/Hardhat |

---

## 1. L1 Status (BesaChain Layer 1)

### Configuration
- **Chain ID:** 1444
- **Consensus:** Clique (PoA)
- **Block Time:** On-demand (transactions trigger blocks)
- **Gas Limit:** 100,000,000 (0x5f5e100)
- **Validator:** 0x7447651c2c66E93356F22c40101ea629a03AE6f2

### Service Status
```
Service: besachain-l1.service
Status: active (running)
Ports:
  - 1444: HTTP RPC
  - 14444: WebSocket
  - 14441: Auth RPC
  - 31444: P2P
  - 14440: Metrics
```

### Genesis Configuration
```json
{
  "config": {
    "chainId": 1444,
    "clique": {
      "period": 0,
      "epoch": 30000
    },
    "gasLimit": "0x5f5e100"
  },
  "extraData": "0x...7447651c2c66E93356F22c40101ea629a03AE6f2..."
}
```

### TPS Calculation (L1)
```
Gas Limit: 100,000,000 per block
Standard Tx: 21,000 gas
Theoretical TPS: 100M / 21K / 0.45s = ~10,582 TPS
```

**Note:** With Clique period:0, blocks are produced on-demand when transactions arrive.

---

## 2. L2 Status (BesaChain Layer 2)

### Configuration
- **Chain ID:** 1445
- **Type:** OP Stack L2
- **Block Time:** 1 second (config supports 0.25s but op-node requires integer)
- **Gas Limit:** 1,000,000,000 (1B)
- **Fourier Time:** 0 (fast finality)

### Service Status
```
Service: besachain-l2-geth.service
Status: active (running)
Ports:
  - 1445: HTTP RPC
  - 14445: WebSocket
  - 14451: Auth RPC
  - 31445: P2P
  - 14450: Metrics

Service: besachain-l2-node.service
Status: Waiting for L1 contracts
```

### Rollup Configuration
```json
{
  "genesis": {
    "l2_time": 1775603632,
    "system_config": {
      "batcherAddr": "0x7447651c2c66E93356F22c40101ea629a03AE6f2",
      "gasLimit": 1000000000
    }
  },
  "block_time": 1,
  "l1_chain_id": 1444,
  "l2_chain_id": 1445,
  "fourier_time": 0,
  "deposit_contract_address": "0x0000...0000",
  "l1_system_config_address": "0x0000...0000"
}
```

### TPS Calculation (L2)
```
Gas Limit: 1,000,000,000 per block
Standard Tx: 21,000 gas
Block Time: 1 second (configured for 0.25s)
Theoretical TPS: 1B / 21K / 1s = ~47,619 TPS

With 0.25s blocks (after contract deployment fix):
Theoretical TPS: 1B / 21K / 0.25s = ~190,476 TPS
```

---

## 3. Deployer Credentials

**Address:** `0x7447651c2c66E93356F22c40101ea629a03AE6f2`  
**Private Key:** `0xabf64eef6431a04411978c81f7caa18eb582264536b6f73953ee06071cf19f52`

**L1 Balance:** Pre-funded in genesis with 1000 ETH  
**Keystore Location:** `/data/besachain-l1/data/keystore/`

---

## 4. L1 Contracts Required

The following contracts must be deployed to L1 for L2 functionality:

| Contract | Purpose | Current Address |
|----------|---------|-----------------|
| OptimismPortal | Deposit/withdrawal gateway | 0x0000...0000 |
| SystemConfig | L2 configuration | 0x0000...0000 |
| L2OutputOracle | Output verification | Not deployed |
| DisputeGameFactory | Fault proofs | Not deployed |
| AddressManager | Address resolution | Not deployed |
| L1CrossDomainMessenger | Message passing | Not deployed |
| L1StandardBridge | Token bridging | Not deployed |

### Deployment Options

**Option 1: Install Foundry on Server (Recommended)**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
# Then use op-deployer
```

**Option 2: Local Deployment (From Workstation)**
```bash
# From local machine with Foundry installed
export L1_RPC_URL=http://54.235.85.175:1444
export PRIVATE_KEY=0xabf64eef...
# Run deployment scripts from /Users/senton/besachain/contracts/deploy-alternative/
```

**Option 3: Manual Contract Deployment**
- Deploy OP Stack contracts manually using Hardhat/Foundry
- Update rollup.json with deployed addresses
- Restart besachain-l2-node

---

## 5. Next Steps to Complete Setup

### Step 1: Deploy L1 Contracts
```bash
# On server or local machine with Foundry
cd /Users/senton/besachain/contracts/deploy-alternative/
export L1_RPC_URL=http://54.235.85.175:1444
export PRIVATE_KEY=0xabf64eef6431a04411978c81f7caa18eb582264536b6f73953ee06071cf19f52
./quick-deploy.sh
```

### Step 2: Update L2 Configuration
```bash
# Update rollup.json with deployed contract addresses
scp rollup.json ubuntu@54.235.85.175:/data/besachain-l2/config/
```

### Step 3: Start L2 Node
```bash
ssh ubuntu@54.235.85.175
sudo systemctl restart besachain-l2-node
```

### Step 4: Verify Block Production
```bash
# Check L1
curl http://localhost:1444 -X POST -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check L2
curl http://localhost:1445 -X POST -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 6. File Locations

### Server Paths
```
L1 Data:        /data/besachain-l1/
L1 Config:      /data/besachain-l1/config/genesis.json
L1 Service:     /etc/systemd/system/besachain-l1.service

L2 Data:        /data/besachain-l2/
L2 Config:      /data/besachain-l2/config/rollup.json
L2 Genesis:     /data/besachain-l2/config/genesis.json
L2 Services:    /etc/systemd/system/besachain-l2-geth.service
                /etc/systemd/system/besachain-l2-node.service
```

### Local Paths (Mac)
```
Deploy Scripts: /Users/senton/besachain/contracts/deploy-alternative/
SSH Key:        /Users/senton/.ssh/libyachain-key.pem
```

---

## 7. Service Commands

```bash
# L1 Service
sudo systemctl start besachain-l1
sudo systemctl stop besachain-l1
sudo systemctl status besachain-l1
journalctl -u besachain-l1 -f

# L2 Geth
sudo systemctl start besachain-l2-geth
sudo systemctl stop besachain-l2-geth
sudo systemctl status besachain-l2-geth

# L2 Node
sudo systemctl start besachain-l2-node
sudo systemctl stop besachain-l2-node
sudo systemctl status besachain-l2-node
journalctl -u besachain-l2-node -f
```

---

## 8. Known Issues & Limitations

1. **L1 Block Production:** Clique consensus with period:0 produces blocks on-demand only when transactions arrive. For continuous block production, consider:
   - Sending periodic heartbeat transactions
   - Switching to fixed-period Clique (period: 1 for 1s blocks)

2. **L2 Block Time:** Standard op-node expects integer block_time. For true 250ms blocks, the BesaChain op-node fork may need configuration adjustments.

3. **Contract Deployment:** L1 contracts must be deployed before L2 node can start sequencing.

4. **No P2P:** L1 and L2 are configured with minimal peers for single-node operation.

---

## 9. Performance Summary

| Metric | L1 Target | L1 Actual | L2 Target | L2 Actual |
|--------|-----------|-----------|-----------|-----------|
| Block Time | 450ms | On-demand | 250ms | 1000ms* |
| Gas Limit | 100M | 100M | 1B | 1B |
| Consensus | Clique | Clique | OP Stack | OP Stack |
| Status | Running | Running | Configured | Waiting |

\* L2 block time limited to 1s by standard op-node. Custom BesaChain op-node may support 250ms.

**Combined TPS Potential:**
- L1: ~10,582 TPS (100M gas / 21K gas / 0.45s)
- L2: ~190,476 TPS (1B gas / 21K gas / 0.25s)
- **Total: 200K+ TPS** (when fully operational)

---

## 10. Contact & Resources

- **Server:** ubuntu@54.235.85.175
- **SSH Key:** /Users/senton/.ssh/libyachain-key.pem
- **Deploy Scripts:** /Users/senton/besachain/contracts/deploy-alternative/
- **OP Stack Docs:** https://docs.optimism.io/

---

**Report Generated:** April 8, 2026  
**Setup Status:** PARTIAL - Pending L1 Contract Deployment
