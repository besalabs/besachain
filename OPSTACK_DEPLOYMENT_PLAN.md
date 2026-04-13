# OP Stack L2 Deployment Plan for BesaChain

**Date:** April 13, 2026  
**Objective:** Replace standalone Parlia L2 (chain 19120) with opBNB OP Stack (op-geth + op-node sequencer, 250ms blocks)

---

## Current State

### L1 (BesaChain)
- Chain ID: 14440
- Type: Parlia PoSA (BSC fork)
- RPC: http://54.235.85.175:1444
- Validators: V1 only (0x07eA646728edbFaf665d1884894F53C2bE2dD609)
- Status: Running, block producing

### L2 (Current - Standalone)
- Chain ID: 19120
- Type: Parlia PoSA (BSC fork, standalone)
- RPC: http://54.235.85.175:1912
- Validator: Same as L1
- Block time: ~350ms
- Status: Running but isolated (no L1 connection)

---

## Deployment Tasks

### Task 1: Deploy OP Stack L1 Contracts

**Objective:** Deploy essential L1 contracts on chain 14440 to enable L2 sequencing

**Required Contracts:**
1. OptimismPortal / OptimismPortal2 - Handles user deposits/withdrawals
2. L2OutputOracle - Accepts state root commitments from sequencer
3. SystemConfig - Stores L2 chain parameters
4. L1StandardBridge - Token bridging
5. ProxyAdmin - Manages proxy upgrades
6. AddressManager - Legacy address registry

**Deployment Method:**
- Use Foundry `forge script` with Deploy.s.sol from opBNB
- Deploy account: 0x07eA646728edbFaf665d1884894F53C2bE2dD609 (L1 validator, unlocked)
- RPC: http://54.235.85.175:1444
- Deploy-config: Create for BesaChain (chain 14440 → L2 chain 19120 mapping)

**Artifacts Location:**
- scripts: `/Users/senton/besachain/opbnb/packages/contracts-bedrock/scripts/`
- contracts: `/Users/senton/besachain/opbnb/packages/contracts-bedrock/src/`
- Deploy.s.sol will output addresses.json

**Steps:**
1. Prepare deploy-config for BesaChain (JSON with chain params)
2. Run: `forge script Deploy.s.sol --rpc-url http://54.235.85.175:1444 --sender 0x07eA... --broadcast`
3. Export contract addresses to rollup.json

---

### Task 2: Generate rollup.json

**Objective:** Create L2 sequencer configuration file

**Contents:**
```json
{
  "genesis": {
    "l1": { "hash": "<L1 genesis hash>", "number": 0 },
    "l2": { "hash": "<L2 genesis hash>", "number": 0 },
    "l2_time": <unix timestamp>,
    "system_config": {
      "batcherAddr": "<address>",
      "overhead": 0,
      "scalar": 10000,
      "gasLimit": 1000000000
    }
  },
  "block_time": 2,
  "max_sequencer_drift": 600,
  "seq_window_size": 3600,
  "channel_timeout": 300,
  "l1_chain_id": 14440,
  "l2_chain_id": 19120,
  "l1_system_config_address": "<SystemConfig address>",
  "l1_standard_bridge_address": "<L1StandardBridge address>",
  "l1_cross_domain_messenger_address": "<L1CrossDomainMessenger address>",
  "l2_to_l1_message_passer_address": "<predeploy>",
  "l2_standard_bridge_address": "<predeploy>",
  "l2_cross_domain_messenger_address": "<predeploy>",
  "l2_output_oracle_address": "<L2OutputOracle address>",
  "optimism_portal_address": "<OptimismPortal address>"
}
```

**Note:** Some addresses are deployed on L1, some are predeploy addresses on L2

---

### Task 3: Start op-geth (L2 Execution Engine)

**Objective:** Run op-geth in Engine API mode, listening for rollup blocks

**Configuration:**
```bash
/tmp/besachain-l2-geth \
  --datadir /data/besachain-l2-opstack \
  --http --http.addr 0.0.0.0 --http.port 1913 \
  --authrpc.addr 0.0.0.0 --authrpc.port 8551 \
  --authrpc.jwtsecret /data/besachain-l2-opstack/jwt.hex \
  --rollup.sequencerhttp http://localhost:8547 \
  --networkid 19120 \
  --syncmode full \
  --gcmode archive \
  --cache 4096
```

**Key Flags:**
- `--authrpc.*` - Engine API for op-node connection
- `--jwtsecret` - Pre-shared secret for authentication
- `--rollup.sequencerhttp` - Address of op-node (localhost if co-located)

---

### Task 4: Start op-node (L2 Sequencer)

**Objective:** Run op-node in sequencer mode, connecting to L1 and op-geth

**Configuration:**
```bash
/tmp/opbnb/op-node/bin/op-node \
  --l1 http://54.235.85.175:1444 \
  --l2 http://localhost:8551 \
  --l2.jwt-secret /data/besachain-l2-opstack/jwt.hex \
  --rollup.config /data/besachain-l2-opstack/rollup.json \
  --sequencer.enabled \
  --sequencer.l1-confs 0 \
  --sequencer.max-safe-lag 0 \
  --server.http.addr 0.0.0.0 \
  --server.http.port 8547 \
  --p2p.disable
```

**Key Flags:**
- `--l1` - L1 RPC endpoint
- `--l2` - Engine API endpoint (op-geth auth RPC)
- `--sequencer.enabled` - Run as sequencer (produce blocks)
- `--sequencer.l1-confs` - Wait for 0 L1 confirmations (fast sequencing)

---

## Task 2: Fix TxDAG Parallel Execution

### Current Status
- TxDAG is implemented in op-geth (from opBNB v0.5.5)
- Performance issue: bubble sort in mvstates.go causes 30x overhead
- Sync stage uses `--parallel.txdag` flag to parallelize TX verification

### Fix Strategy
1. Locate bubble sort bug in `/Users/senton/besachain/opbnb/op-geth/core/types/mvstates.go`
2. Apply same fix as BSC (replace bubble sort with binary insert)
3. Rebuild op-geth
4. Verify TPS improvement with parallel execution

### Files to Check
- `<opbnb>/op-geth/core/types/mvstates.go` - RWTxList.Append() function
- Compare with `/Users/senton/besachain/bsc/core/types/mvstates.go` (fixed version)

---

## Build Steps

### Build op-node (Go)
```bash
cd /Users/senton/besachain/opbnb/op-node
make op-node
# Output: ./bin/op-node
```

### Build op-geth with TxDAG Fix (Go)
```bash
cd /Users/senton/besachain/opbnb/op-geth
# Apply fix to core/types/mvstates.go
make geth
# Output: ./build/bin/geth
```

---

## Validation Checklist

- [ ] L1 contracts deployed successfully
- [ ] rollup.json created with correct addresses
- [ ] op-geth starts and accepts Engine API connections
- [ ] op-node starts and connects to both L1 and op-geth
- [ ] First L2 block produced and committed
- [ ] op-geth syncs blocks from op-node
- [ ] RPC queries work on L2 (eth_chainId, eth_blockNumber)
- [ ] TxDAG fix applied and op-geth rebuilt
- [ ] L2 blocks produced at ~250ms interval
- [ ] TPS measured with and without --parallel.txdag

---

## Fallback (If OP Stack Too Complex)

If contract deployment proves problematic, use simpler approach:
1. Keep op-geth in standard (non-rollup) mode
2. Configure L2 for faster block time (250ms via custom fork config)
3. Skip L1 contract deployment
4. Run L2 as standalone with reduced latency (functional upgrade, not true L2)

---

## Files & Addresses

**Deployed L1 Contracts (to be filled in after deployment):**
- OptimismPortal: 0x...
- L2OutputOracle: 0x...
- SystemConfig: 0x...
- L1StandardBridge: 0x...
- ProxyAdmin: 0x...

**L1 Deployer:** 0x07eA646728edbFaf665d1884894F53C2bE2dD609  
**L1 RPC:** http://54.235.85.175:1444  
**L2 Chain ID:** 19120

---

**Status:** READY TO EXECUTE
