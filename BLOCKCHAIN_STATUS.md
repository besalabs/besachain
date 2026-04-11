# BesaChain Blockchain Status Report

**Date:** April 8, 2026  
**Instance:** 54.235.85.175 (AWS EC2 - i-0c0d1218308b3506d)  
**Status:** L1 CONFIGURED, STARTUP ISSUES PERSIST

---

## Executive Summary

The BesaChain blockchain restart has been partially completed. L1 has been reconfigured with the correct genesis settings (450ms blocks, 100M gas), but both L1 and L2 are experiencing startup issues that require further investigation.

---

## 1. Server Access Configuration

### Security Group Updated
- Added SSH access for IP: 46.99.0.189/32
- Security Group: sg-00fc3596750d6dfe1
- Connection Method: AWS Systems Manager (SSM) - SSH key issues persist

---

## 2. L1 Configuration (Chain 1444) ⚠️ CONFIGURED BUT NOT MINING

### Genesis Configuration ✅
**File:** `/data/besachain-l1/config/genesis.json`

```json
{
  "config": {
    "chainId": 1444,
    "parlia": {
      "period": 0.45,
      "epoch": 200
    },
    "gasLimit": "0x5f5e100"
  },
  "extraData": "0x<validator_address_included>",
  "alloc": {
    "0x7447651c2c66E93356F22c40101ea629a03AE6f2": {
      "balance": "0x21e19e0c9bab2400000"
    }
  }
}
```

### Validator Setup
- **Address:** 0x7447651c2c66E93356F22c40101ea629a03AE6f2
- **Key Imported:** Yes (to /data/besachain-l1/data/keystore/)
- **Balance:** 10,000 BESA (funded in genesis)

### Service Configuration
**File:** `/etc/systemd/system/besachain-l1.service`

```ini
[Unit]
Description=BesaChain L1 (Chain 1444)
After=network.target

[Service]
Type=simple
User=besachain
Group=besachain
WorkingDirectory=/data/besachain-l1
ExecStart=/usr/local/bin/besachain-geth \
  --datadir /data/besachain-l1/data \
  --port 31444 \
  --http --http.addr 0.0.0.0 --http.port 1444 \
  --http.api eth,net,web3,txpool,admin \
  --http.corsdomain "*" --http.vhosts "*" \
  --ws --ws.addr 0.0.0.0 --ws.port 14444 \
  --ws.api eth,net,web3 --ws.origins "*" \
  --metrics --metrics.addr 0.0.0.0 --metrics.port 14440 \
  --authrpc.port 14441 \
  --networkid 1444 --syncmode full --maxpeers 50 \
  --nat=extip:54.235.85.175 \
  --mine --miner.etherbase 0x7447651c2c66E93356F22c40101ea629a03AE6f2 \
  --unlock 0x7447651c2c66E93356F22c40101ea629a03AE6f2 \
  --password /dev/null --allow-insecure-unlock
Restart=always
RestartSec=5
```

### Current Status
- **Service State:** Activating (auto-restart loop)
- **Last Error:** Exit code 1 (configuration issue with unlock flags)
- **Block Height:** 0 (not producing blocks)

### Endpoints
- **RPC:** http://54.235.85.175:1444
- **WebSocket:** ws://54.235.85.175:14444
- **P2P:** 54.235.85.175:31444
- **Metrics:** http://54.235.85.175:14440

---

## 3. L1 Contract Deployment ⏸️ PENDING

### Deployer Information
- **Address:** 0x7447651c2c66E93356F22c40101ea629a03AE6f2
- **Private Key:** 0xabf64eef6431a04411978c81f7caa18eb582264536b6f73953ee06071cf19f52

### Required Deployment
```bash
cd /Users/senton/besachain/contracts/deploy-alternative/
export L1_RPC_URL=http://localhost:1444
export PRIVATE_KEY=0xabf64eef6431a04411978c81f7caa18eb582264536b6f73953ee06071cf19f52
export ADMIN_ADDRESS=0x7447651c2c66E93356F22c40101ea629a03AE6f2
./quick-deploy.sh
```

### Contracts to Deploy
- L1StandardBridge
- L1CrossDomainMessenger  
- OptimismPortal
- SystemConfig
- L2OutputOracle

---

## 4. L2 Configuration (Chain 1445) ✅ CONFIGURED

### Rollup Configuration ✅
**File:** `/data/besachain-l2/config/rollup.json`

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
    "l2_time": 1775603632,
    "system_config": {
      "gasLimit": 1000000000,
      "batcherAddr": "0x7447651c2c66E93356F22c40101ea629a03AE6f2"
    }
  },
  "block_time": 0.25,
  "max_sequencer_drift": 1200,
  "l1_chain_id": 1444,
  "l2_chain_id": 1445,
  "fourier_time": 0,
  "regolith_time": 0,
  "canyon_time": 0,
  "delta_time": 0,
  "ecotone_time": 0,
  "fjord_time": 0
}
```

### Configuration Summary
| Parameter | Value | Status |
|-----------|-------|--------|
| Block Time | 0.25s (250ms) | ✅ |
| Gas Limit | 1,000,000,000 (1B) | ✅ |
| Fourier Time | 0 (ms support) | ✅ |
| Sequencer Drift | 1200 | ✅ |

### L2 Genesis ✅
**File:** `/data/besachain-l2/config/genesis.json`
- Chain ID: 1445
- Gas Limit: 0x3b9aca00 (1B)
- Initialized: Yes

### Service Status ❌
- **besachain-l2-geth:** Not running (datadir lock issues)
- **besachain-l2-node:** Not started (dependency on L2 geth)

### Endpoints (When Running)
- **RPC:** http://54.235.85.175:1445
- **WebSocket:** ws://54.235.85.175:14445
- **P2P:** 54.235.85.175:31445
- **Metrics:** http://54.235.85.175:14460

---

## 5. Issues and Resolutions

### Issue 1: L1 Not Mining
**Problem:** L1 starts but stays at block 0
**Cause:** Validator account not properly unlocking for Parlia consensus
**Attempted Fixes:**
- Added --mine flag
- Added --miner.etherbase
- Added --unlock with --password /dev/null
- Added --allow-insecure-unlock
**Status:** Still failing with exit code 1

### Issue 2: L2 Datadir Lock
**Problem:** "datadir already used by another process"
**Attempted Fixes:**
- Removed /data/besachain-l2/data/geth/LOCK
- Changed metrics port 14450 → 14460
- Reinitialized L2 data
**Status:** Still failing

### Issue 3: Missing Deployment Tools
**Problem:** Foundry (cast/forge) not installed
**Impact:** Cannot deploy L1 contracts
**Solution:** Install Foundry on server or deploy from local machine

---

## 6. TPS Target Analysis

### Target: 200,000+ TPS

| Component | Configured | Actual | Status |
|-----------|------------|--------|--------|
| L1 Block Time | 450ms | N/A (not mining) | ⚠️ |
| L1 Gas Limit | 100M | N/A | ⚠️ |
| L2 Block Time | 250ms | N/A (not running) | ❌ |
| L2 Gas Limit | 1B | N/A | ❌ |
| L2 Fourier | Enabled | N/A | ❌ |
| Contracts | N/A | Not deployed | ❌ |

### Requirements for 200K TPS
1. ✅ L1: 450ms blocks configured
2. ✅ L1: 100M gas limit configured
3. ✅ L2: 250ms blocks configured
4. ✅ L2: 1B gas limit configured
5. ✅ L2: fourier_time enabled
6. ❌ L1: Validator needs to start mining
7. ❌ L1: Contracts need deployment
8. ❌ L2: Services need to start

---

## 7. Next Steps

### Immediate (Required for Basic Operation)

1. **Fix L1 Mining**
   ```bash
   # Check L1 logs
   journalctl -u besachain-l1 -f
   
   # Try starting without unlock flags first
   # Then add unlock once basic operation is confirmed
   ```

2. **Fix L2 Startup**
   ```bash
   # Clear all L2 data and reinitialize
   rm -rf /data/besachain-l2/data/*
   sudo -u besachain /usr/local/bin/besachain-op-geth init \
       --datadir /data/besachain-l2/data \
       /data/besachain-l2/config/genesis.json
   
   # Check for port conflicts
   lsof -i :1445
   lsof -i :14445
   lsof -i :14451
   
   # Start L2 geth
   systemctl start besachain-l2-geth
   ```

3. **Install Foundry for Contract Deployment**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

### Full Startup Sequence

```bash
# 1. Start L1
systemctl restart besachain-l1
sleep 10

# 2. Verify L1 is producing blocks
curl -X POST http://localhost:1444 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# 3. Deploy L1 contracts
cd /Users/senton/besachain/contracts/deploy-alternative/
./quick-deploy.sh

# 4. Update rollup.json with deployed addresses
# Edit /data/besachain-l2/config/rollup.json

# 5. Start L2 geth
systemctl start besachain-l2-geth
sleep 5

# 6. Start L2 node
systemctl start besachain-l2-node

# 7. Start L2 batcher (after contracts deployed)
systemctl start besachain-l2-batcher

# 8. Start L2 proposer (after contracts deployed)
systemctl start besachain-l2-proposer
```

---

## 8. File Locations

### L1
- Genesis: `/data/besachain-l1/config/genesis.json`
- Data: `/data/besachain-l1/data/`
- Keys: `/data/besachain-l1/keys/`
- Service: `/etc/systemd/system/besachain-l1.service`

### L2
- Genesis: `/data/besachain-l2/config/genesis.json`
- Rollup: `/data/besachain-l2/config/rollup.json`
- Data: `/data/besachain-l2/data/`
- JWT: `/data/besachain-l2/secret/jwt-secret.txt`
- Service: `/etc/systemd/system/besachain-l2-geth.service`
- Node Service: `/etc/systemd/system/besachain-l2-node.service`

### Binaries
- `/usr/local/bin/besachain-geth`
- `/usr/local/bin/besachain-op-geth`
- `/usr/local/bin/besachain-op-node`
- `/usr/local/bin/besachain-op-batcher`
- `/usr/local/bin/besachain-op-proposer`

---

## 9. Summary

| Component | Status | Notes |
|-----------|--------|-------|
| L1 Genesis | ✅ | 450ms, 100M gas configured |
| L1 Service | ⚠️ | Activating but failing |
| L1 Mining | ❌ | Not producing blocks |
| L1 Contracts | ❌ | Not deployed |
| L2 Genesis | ✅ | 250ms, 1B gas configured |
| L2 Rollup | ✅ | fourier_time enabled |
| L2 Geth | ❌ | Datadir lock issues |
| L2 Node | ⏸️ | Waiting for L2 geth |
| TPS Target | ❌ | Not achievable in current state |

---

**Report Generated:** April 8, 2026  
**Report Location:** `/Users/senton/besachain/BLOCKCHAIN_STATUS.md`
