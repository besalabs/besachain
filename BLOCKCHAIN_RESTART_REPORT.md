# BesaChain Blockchain Restart Report

**Date:** April 8, 2026  
**Instance:** 54.235.85.175 (AWS EC2 - i-0c0d1218308b3506d)  
**Status:** PARTIAL SUCCESS

---

## Summary

This report documents the restart and reconfiguration of the BesaChain L1 and L2 blockchain infrastructure. L1 has been successfully restarted with the correct configuration, while L2 encountered startup issues requiring further investigation.

---

## 1. L1 Configuration (Chain 1444) ✅ SUCCESS

### Status
- **State:** Active and running
- **Block Time:** 450ms (parlia period: 0.45)
- **Gas Limit:** 100,000,000 (0x5f5e100)
- **Validator:** 0x7447651c2c66E93356F22c40101ea629a03AE6f2 (deployer address)

### Changes Made
1. Updated genesis.json with:
   - `gasLimit`: "0x5f5e100" (100M)
   - `parlia.period`: 0.45 (450ms block time)
   - Added validator to extraData field
   - Added deployer address to alloc

2. Imported deployer private key:
   - Address: 0x7447651c2c66E93356F22c40101ea629a03AE6f2
   - Key location: /data/besachain-l1/keys/deployer.key

3. Updated service file to enable mining:
   - Added `--mine` flag
   - Added `--miner.etherbase 0x7447651c2c66E93356F22c40101ea629a03AE6f2`

### Endpoints
- **RPC:** http://54.235.85.175:1444
- **WebSocket:** ws://54.235.85.175:14444
- **P2P:** 31444
- **Metrics:** http://54.235.85.175:14440

---

## 2. L1 Contract Deployment ⚠️ NOT COMPLETED

### Status
- **Issue:** Deployment tools (Foundry/cast/forge) not installed on server
- **Impact:** L1 contracts not deployed, L2 operating in standalone mode

### Contracts That Need Deployment
Using `/Users/senton/besachain/contracts/deploy-alternative/quick-deploy.sh`:
- L1StandardBridge
- L1CrossDomainMessenger
- OptimismPortal
- SystemConfig
- L2OutputOracle

### Deployer Information
- **Address:** 0x7447651c2c66E93356F22c40101ea629a03AE6f2
- **Private Key:** 0xabf64eef6431a04411978c81f7caa18eb582264536b6f73953ee06071cf19f52

### Next Steps for Deployment
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Run deployment
cd /Users/senton/besachain/contracts/deploy-alternative/
./quick-deploy.sh
```

---

## 3. L2 Configuration (Chain 1445) ✅ CONFIGURED, ⚠️ SERVICE ISSUES

### Configuration Status
Successfully updated `/data/besachain-l2/config/rollup.json`:
- **Block Time:** 0.25 seconds (250ms) ✅
- **Fourier Time:** 0 (millisecond support enabled) ✅
- **Gas Limit:** 1,000,000,000 (1B) ✅
- **Max Sequencer Drift:** 1200 ✅

### Service Status
- **State:** Activation failures (exit code 1)
- **Issue:** Lock file conflicts and possible port issues

### Troubleshooting Attempted
1. Cleared /data/besachain-l2/data/LOCK
2. Changed metrics port from 14450 → 14460
3. Reinitialized L2 genesis data
4. Multiple service restarts

### Remaining Issues
The L2 op-geth service continues to fail with:
- "datadir already used by another process" (even after removing LOCK)
- Service exits with status 1 during activation

### Manual Test Results
```bash
# Manual execution shows:
# Fatal: Failed to create the protocol stack: datadir already used by another process
```

### Endpoints (When Running)
- **RPC:** http://54.235.85.175:1445
- **WebSocket:** ws://54.235.85.175:14445
- **P2P:** 31445
- **Metrics:** http://54.235.85.175:14460

---

## 4. L2 Service Configuration

### besachain-l2-geth.service
```ini
[Unit]
Description=BesaChain L2 Execution (op-geth 250ms)
After=network.target besachain-l1.service

[Service]
Type=simple
User=besachain
Group=besachain
ExecStart=/usr/local/bin/besachain-op-geth \
  --datadir /data/besachain-l2/data \
  --port 31445 \
  --http --http.addr 0.0.0.0 --http.port 1445 \
  --http.api eth,net,web3,txpool,debug \
  --http.corsdomain "*" --http.vhosts "*" \
  --ws --ws.addr 0.0.0.0 --ws.port 14445 \
  --ws.api eth,net,web3 --ws.origins "*" \
  --metrics --metrics.addr 0.0.0.0 --metrics.port 14460 \
  --authrpc.addr 0.0.0.0 --authrpc.port 14451 \
  --authrpc.vhosts "*" \
  --authrpc.jwtsecret /data/besachain-l2/secret/jwt-secret.txt \
  --networkid 1445 --syncmode full --gcmode archive \
  --maxpeers 50 --nat=extip:54.235.85.175
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### besachain-l2-node.service
```ini
[Unit]
Description=BesaChain L2 Node (op-node 250ms)
After=network.target besachain-l2-geth.service

[Service]
Type=simple
User=besachain
Group=besachain
WorkingDirectory=/data/besachain-l2
ExecStart=/usr/local/bin/besachain-op-node \
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
  --l1.epoch-poll-interval 375ms
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

---

## 5. Target TPS Analysis

### L1 Capabilities
- Block Time: 450ms
- Gas Limit: 100M
- Target TPS: ~100-200 TPS (depending on transaction complexity)

### L2 Capabilities (When Running)
- Block Time: 250ms
- Gas Limit: 1B
- Target TPS: 200,000+ TPS (with proper batching and compression)

### Requirements for 200K+ TPS
1. ✅ L1: 450ms blocks with 100M gas
2. ✅ L2: 250ms blocks with 1B gas
3. ✅ L2: fourier_time enabled for millisecond support
4. ⚠️ L1 contracts: Need deployment for full L2 functionality
5. ⚠️ L2 services: Need to resolve startup issues
6. ⚠️ Batcher/Proposer: Need to start for transaction batching

---

## 6. Commands for Further Debugging

### Check L1 Status
```bash
systemctl status besachain-l1
journalctl -u besachain-l1 -f
curl -X POST http://localhost:1444 -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Debug L2 Issues
```bash
# Check for lock files
ls -la /data/besachain-l2/data/geth/

# Check for port conflicts
lsof -i :14450
lsof -i :14451
lsof -i :1445
lsof -i :14445

# Check logs
journalctl -u besachain-l2-geth -n 50

# Try manual start with verbose output
sudo -u besachain /usr/local/bin/besachain-op-geth \
  --datadir /data/besachain-l2/data \
  --http --http.port 1445 \
  --authrpc.port 14451 \
  --authrpc.jwtsecret /data/besachain-l2/secret/jwt-secret.txt \
  --networkid 1445 2>&1
```

### Deploy Contracts (When Ready)
```bash
cd /Users/senton/besachain/contracts/deploy-alternative/
export L1_RPC_URL=http://localhost:1444
export PRIVATE_KEY=0xabf64eef6431a04411978c81f7caa18eb582264536b6f73953ee06071cf19f52
export ADMIN_ADDRESS=0x7447651c2c66E93356F22c40101ea629a03AE6f2
./quick-deploy.sh
```

---

## 7. Summary

| Component | Status | Notes |
|-----------|--------|-------|
| L1 Service | ✅ Active | Producing blocks at 450ms |
| L1 Genesis | ✅ Configured | 100M gas, 450ms blocks |
| L1 Validator | ✅ Running | Deployer address mining |
| L1 Contracts | ⚠️ Not Deployed | Needs Foundry installation |
| L2 Genesis | ✅ Configured | 1B gas, 250ms blocks |
| L2 Rollup Config | ✅ Updated | fourier_time: 0 enabled |
| L2 Geth Service | ❌ Failing | Lock/datadir issues |
| L2 Node Service | ⏸️ Not Started | Waiting for L2 geth |
| L2 Batcher | ⏸️ Not Started | Waiting for contracts |
| L2 Proposer | ⏸️ Not Started | Waiting for contracts |

---

## 8. Recommendations

### Immediate Actions
1. **Debug L2 datadir issue:** Check for any remaining lock files or running processes
2. **Install Foundry:** Required for contract deployment
3. **Deploy L1 Contracts:** Run quick-deploy.sh after Foundry installation

### For 200K+ TPS Target
1. Ensure L2 geth starts successfully with 250ms blocks
2. Start L2 node with sequencer enabled
3. Deploy L1 contracts for full L2 functionality
4. Start batcher and proposer services
5. Run TPS benchmark tests

---

**Report Generated:** April 8, 2026  
**Report Location:** `/Users/senton/besachain/BLOCKCHAIN_RESTART_REPORT.md`
