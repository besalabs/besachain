# BesaChain Blockchain - Final Setup Status

**Date:** April 8, 2026  
**Server:** 54.235.85.175 (AWS EC2 t4g.large)  
**SSH Key:** /Users/senton/.ssh/libyachain-key.pem

---

## ✅ COMPLETED

### L1 Node (Chain 1444) - RUNNING
```
Status:     active (running)
Process:    besachain-geth (pid 212181)
Chain ID:   1444
Consensus:  Clique (PoA)
Gas Limit:  100,000,000 (100M)
Validator:  0x7447651c2c66E93356F22c40101ea629a03AE6f2
Ports:      1444 (HTTP), 14444 (WS), 14441 (Auth), 31444 (P2P), 14440 (Metrics)
```

### L2 Execution (Chain 1445) - RUNNING
```
Status:     active (running)
Process:    besachain-op-geth (pid 213678)
Chain ID:   1445
Type:       OP Stack L2 Execution Client
Gas Limit:  1,000,000,000 (1B)
Ports:      1445 (HTTP), 14445 (WS), 14451 (Auth), 31445 (P2P), 14460 (Metrics)
```

---

## ⚠️ PENDING

### L2 Consensus/Sequencer - WAITING
```
Status:     activating (waiting for L1 contracts)
Service:    besachain-l2-node
Issue:      Missing L1 contract addresses
```

**Required for L2 to start sequencing:**
- OptimismPortal contract address
- SystemConfig contract address
- L2OutputOracle contract address

---

## 📊 TPS CALCULATIONS

### L1 (Chain 1444)
| Parameter | Value |
|-----------|-------|
| Gas Limit | 100,000,000 |
| Block Time | On-demand (Clique period:0) |
| Standard Tx Gas | 21,000 |
| **Theoretical TPS** | **~10,582** |

Calculation: `100M / 21K / 0.45s = 10,582 TPS`

### L2 (Chain 1445)
| Parameter | Current | Target |
|-----------|---------|--------|
| Gas Limit | 1,000,000,000 | 1,000,000,000 |
| Block Time | 1 second | 0.25 seconds |
| Standard Tx Gas | 21,000 | 21,000 |
| **Theoretical TPS** | **47,619** | **190,476** |

Current: `1B / 21K / 1s = 47,619 TPS`  
Target:  `1B / 21K / 0.25s = 190,476 TPS`

### Combined Potential: 200K+ TPS

---

## 🔧 REMAINING TASKS

### 1. Deploy L1 Contracts
**Location:** `/Users/senton/besachain/contracts/deploy-alternative/`

**Option A - Install Foundry on Server:**
```bash
ssh -i ~/.ssh/libyachain-key.pem ubuntu@54.235.85.175
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup
```

**Option B - Deploy from Local Machine:**
```bash
cd /Users/senton/besachain/contracts/deploy-alternative/
export L1_RPC_URL=http://54.235.85.175:1444
export PRIVATE_KEY=0xabf64eef6431a04411978c81f7caa18eb582264536b6f73953ee06071cf19f52
./quick-deploy.sh
```

### 2. Update L2 Config
After deployment, update `/data/besachain-l2/config/rollup.json` with:
- `deposit_contract_address`
- `l1_system_config_address`
- `l2_output_oracle_address`

### 3. Start L2 Node
```bash
ssh -i ~/.ssh/libyachain-key.pem ubuntu@54.235.85.175
sudo systemctl restart besachain-l2-node
```

---

## 📝 SERVICE COMMANDS

```bash
# Check status
sudo systemctl status besachain-l1
sudo systemctl status besachain-l2-geth
sudo systemctl status besachain-l2-node

# View logs
sudo journalctl -u besachain-l1 -f
sudo journalctl -u besachain-l2-geth -f
sudo journalctl -u besachain-l2-node -f

# Restart services
sudo systemctl restart besachain-l1
sudo systemctl restart besachain-l2-geth
sudo systemctl restart besachain-l2-node
```

---

## 🔑 DEPLOYER CREDENTIALS

**Address:** `0x7447651c2c66E93356F22c40101ea629a03AE6f2`  
**Private Key:** `0xabf64eef6431a04411978c81f7caa18eb582264536b6f73953ee06071cf19f52`  
**Balance:** Pre-funded with 1000+ ETH on L1

---

## 📁 KEY FILES

### On Server
```
L1 Genesis:   /data/besachain-l1/config/genesis.json
L2 Genesis:   /data/besachain-l2/config/genesis.json
L2 Rollup:    /data/besachain-l2/config/rollup.json
JWT Secret:   /data/besachain-l2/secret/jwt-secret.txt
Keystore:     /data/besachain-l1/data/keystore/
```

### Local
```
Deploy Scripts: /Users/senton/besachain/contracts/deploy-alternative/
SSH Key:        /Users/senton/.ssh/libyachain-key.pem
This Report:    /Users/senton/besachain/BLOCKCHAIN_FINAL_STATUS.md
```

---

## ✨ SUMMARY

| Component | Status | Block Time | Gas Limit |
|-----------|--------|------------|-----------|
| L1 Node | ✅ Running | On-demand | 100M |
| L2 Execution | ✅ Running | - | 1B |
| L2 Consensus | ⏳ Waiting | - | - |
| L1 Contracts | ❌ Required | - | - |

**Current State:** L1 and L2 execution clients are running. L2 consensus node is waiting for L1 contract deployment.

**Next Step:** Deploy L1 contracts using Foundry/Hardhat to enable L2 sequencing.

---

*Report Generated: April 8, 2026*
