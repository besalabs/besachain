# BesaChain L1 Fermi + L2 Fourier Full Redeploy Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy a production-grade BesaChain with L1 Fermi (3-validator Parlia PoSA, 300M gas) and L2 Fourier (opBNB OP Stack with op-geth + op-node sequencer, 1B gas).

**Architecture:** L1 uses BSC v1.7.2 with Parlia consensus, 3 validators in round-robin. L2 uses opBNB OP Stack: op-geth (execution) + op-node (consensus/sequencer) connected via Engine API (JWT auth). op-node reads L1 for data availability and produces L2 blocks. OP Stack L1 contracts (OptimismPortal, SystemConfig, L2OutputOracle, etc.) deployed on L1 via Forge.

**Tech Stack:** BSC geth v1.7.2 (L1), opBNB op-geth v0.5.9 (L2), opBNB op-node v0.10.14 (L2 consensus), Forge v1.5.1 (contract deployment), Go 1.25.8 (binary compilation)

---

## Critical Rules (From Lessons Learned)

1. **NEVER wipe V1 chain data once L1 is producing blocks.** All subsequent steps build ON TOP of L1.
2. **Deploy OP Stack contracts FIRST, then generate L2 genesis from the live L1 state.**
3. **L1 must have a non-zero genesis timestamp.** The current genesis has timestamp=0 which breaks op-node. Solution: use a non-genesis L1 block as the starting point for L2.
4. **V2/V3 use `--miner.recommit 120s`** to prevent fork-on-startup.
5. **`static-nodes.json` is DEPRECATED in BSC v1.7.2.** Use `config.toml [Node.P2P] StaticNodes`.
6. **op-geth is a post-Merge client.** It CANNOT mine standalone. It MUST have op-node as its consensus client via Engine API.
7. **Deploy.s.sol must NOT use CREATE2 salt.** The `{ salt: _implSalt() }` syntax was removed in our patched version.
8. **Always get fresh enodes after restart** — nodekeys can change.

## Infrastructure

| Resource | Value |
|----------|-------|
| V1 (L1 + L2) | `54.235.85.175` (t3.medium, 4GB RAM) |
| V2 (L1 validator) | `44.203.7.219` (t3.medium, 4GB RAM) |
| V3 (L1 validator) | `44.205.250.27` (t3.medium, 4GB RAM) |
| SSH key | `~/.ssh/libyachain-validators.pem` |
| Security group V1 | `sg-024068aafc52c36b2` |
| Security group V2/V3 | `sg-00fc3596750d6dfe1` |
| L1 BSC binary | `/tmp/besachain-geth-txdag-opt` (84MB, on V1) |
| L2 op-geth binary | `/tmp/besachain-l2-geth-txdag` (84MB, on V1, bubble sort fixed) |
| L2 op-node binary | `/tmp/op-node` (52MB, on V1) |
| Flood tool | `/tmp/flood` (20MB, on V1) |
| Validator key | `0x32ff42462337421d9f9fcaa660f713d42d28d5c903a07c5f175e170c64a34dec` |
| Validator address | `0x07eA646728edbFaf665d1884894F53C2bE2dD609` |
| V2 validator | `0x3e3084b8577bec36B6d85233b4bB7e507449B6B3` |
| V3 validator | `0x91b14DE6832Ecc6dc6e0506F89e0d3f6DE6605C0` |
| Password | `besachain-testnet` |
| Forge (local Mac) | v1.5.1-stable |
| Deploy config | `/Users/senton/besachain/opbnb/packages/contracts-bedrock/deploy-config/besachain.json` |
| L2 allocs | `/Users/senton/besachain/opbnb/packages/contracts-bedrock/state-dump-19120-fjord.json` |

## Specs

| Parameter | L1 Fermi | L2 Fourier |
|-----------|----------|------------|
| Chain ID | 14440 | 19120 |
| Consensus | Parlia PoSA (3 validators) | OP Stack (op-node sequencer) |
| Block time | ~450ms (period=3, 3 validators) | 2s (opBNB config) |
| Gas limit | 300,000,000 (300M) | 1,000,000,000 (1B) |
| Binary | besachain-geth-txdag-opt | besachain-l2-geth-txdag + op-node |
| RPC port | 1444 | 1912 |
| P2P port | 31444 | 31912 |
| Engine API port | N/A | 8551 |
| op-node RPC | N/A | 9545 |

## Port Requirements

Ensure these ports are open in security groups:

| Port | Protocol | Instance | Purpose |
|------|----------|----------|---------|
| 31444 | TCP+UDP | V1, V2, V3 | L1 P2P |
| 1444 | TCP | V1 | L1 RPC (external access for Forge) |
| 1912 | TCP | V1 | L2 RPC |
| 8551 | TCP | V1 (localhost only) | Engine API (op-geth ↔ op-node) |
| 9545 | TCP | V1 | op-node RPC |

---

## Phase 1: Verify L1 is Stable (DO NOT RESTART)

### Task 1: Verify L1 3-Validator Consensus

**Files:** None — observation only

- [ ] **Step 1: Check all 3 validators are synced**

```bash
for IP in 54.235.85.175 44.203.7.219 44.205.250.27; do
  B=$(ssh -o ConnectTimeout=5 -i ~/.ssh/libyachain-validators.pem ec2-user@$IP \
    'curl -sf -X POST http://localhost:1444 -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}"' \
    | python3 -c "import json,sys;print(int(json.load(sys.stdin)['result'],16))")
  P=$(ssh -o ConnectTimeout=5 -i ~/.ssh/libyachain-validators.pem ec2-user@$IP \
    'curl -sf -X POST http://localhost:1444 -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"net_peerCount\",\"params\":[],\"id\":1}"' \
    | python3 -c "import json,sys;print(int(json.load(sys.stdin)['result'],16))")
  echo "$IP: block=$B peers=$P"
done
```

Expected: All 3 at similar block numbers (within 10), each with 1-2 peers. Block number advancing.

**STOP if:** Any validator is down or at block 0. Fix P2P first using `admin_addPeer`.

- [ ] **Step 2: Record the L1 starting block for L2**

```bash
# Get a recent L1 block (NOT genesis, which has timestamp=0)
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 \
  'curl -sf -X POST http://localhost:1444 -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBlockByNumber\",\"params\":[\"latest\",false],\"id\":1}"' \
  | python3 -c "
import json, sys
b = json.load(sys.stdin)['result']
print('L1_STARTING_BLOCK_NUMBER:', int(b['number'], 16))
print('L1_STARTING_BLOCK_HASH:', b['hash'])
print('L1_STARTING_BLOCK_TIMESTAMP:', int(b['timestamp'], 16))
"
```

**Save these values — they are needed in Task 3 and Task 5.**

- [ ] **Step 3: Verify gas limit is 300M**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 \
  'curl -sf -X POST http://localhost:1444 -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBlockByNumber\",\"params\":[\"latest\",false],\"id\":1}"' \
  | python3 -c "import json,sys;b=json.load(sys.stdin)['result'];print('Gas limit:', round(int(b['gasLimit'],16)/1e6), 'M')"
```

Expected: `Gas limit: 300 M`. If lower, wait for it to ramp up (increases 1/1024 per block).

---

## Phase 2: Deploy OP Stack L1 Contracts

### Task 2: Ensure CREATE2 Deployer Exists on L1

**Files:** None — use `cast` CLI

- [ ] **Step 1: Check if CREATE2 deployer is deployed**

```bash
cast code --rpc-url http://54.235.85.175:1444 0x4e59b44847b379578588920cA78FbF26c0B4956C
```

Expected: `0x7fff...f3` (69 bytes of bytecode). 

If output is `0x` (empty), the deployer is NOT deployed. Proceed to Step 2.
If output is bytecode, SKIP to Task 3.

- [ ] **Step 2: Deploy CREATE2 deployer (only if missing)**

First, ensure V1 was started with `--rpc.allow-unprotected-txs`. If not:
```bash
# Restart V1 with the flag (keep chain data!)
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
  sudo kill $(pgrep -f "besachain-geth-txdag-opt.*14440")
  sleep 2
  nohup /tmp/besachain-geth-txdag-opt --datadir /data/besachain-l1 \
    --networkid 14440 --port 31444 --syncmode full \
    --http --http.addr 0.0.0.0 --http.port 1444 \
    --http.api eth,net,web3,txpool,parlia,debug,admin,miner,personal \
    --mine --miner.etherbase 0x07eA646728edbFaf665d1884894F53C2bE2dD609 \
    --unlock 0x07eA646728edbFaf665d1884894F53C2bE2dD609 \
    --password /data/besachain-l1/password.txt --allow-insecure-unlock \
    --miner.gaslimit 300000000 --cache 8192 \
    --nat extip:54.235.85.175 \
    --rpc.allow-unprotected-txs \
    --verbosity 3 > /data/besachain-l1/geth.log 2>&1 &
'
```

Then fund and deploy:
```bash
# Fund the canonical deployer
cast send --rpc-url http://54.235.85.175:1444 \
  --private-key 0x32ff42462337421d9f9fcaa660f713d42d28d5c903a07c5f175e170c64a34dec \
  --legacy --value 1ether \
  0x3fAB184622Dc19b6109349B94811493BF2a45362

sleep 5

# Broadcast the pre-signed canonical TX
cast publish --rpc-url http://54.235.85.175:1444 \
  "0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156014578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222"

sleep 5

# Verify
cast code --rpc-url http://54.235.85.175:1444 0x4e59b44847b379578588920cA78FbF26c0B4956C
```

If the canonical TX fails (EIP-155 rejection even with flag), fall back to genesis injection:
- This requires restarting L1 with a new genesis that includes the CREATE2 deployer in alloc
- **THIS WILL WIPE L1 CHAIN DATA** — only do this as last resort
- If using this approach, return to Phase 1 and rebuild the 3-validator setup

### Task 3: Update Deploy Config

**Files:**
- Modify: `/Users/senton/besachain/opbnb/packages/contracts-bedrock/deploy-config/besachain.json`

- [ ] **Step 1: Update deploy config with current L1 state**

Use the values from Task 1, Step 2:

```python
import json, time

with open('/Users/senton/besachain/opbnb/packages/contracts-bedrock/deploy-config/besachain.json') as f:
    d = json.load(f)

# Use the L1 block hash from Task 1 Step 2
d['l1StartingBlockTag'] = '<L1_STARTING_BLOCK_HASH>'  # e.g., "0x10240326da..."
d['l2OutputOracleStartingTimestamp'] = <L1_STARTING_BLOCK_TIMESTAMP>  # e.g., 1776088115
d['l2OutputOracleStartingBlockNumber'] = 0
d['l2BlockTime'] = 2  # opBNB uses integer seconds; Fourier halves this to 1s or 500ms
d['l1BlockTime'] = 3  # Parlia period
d['l1ChainID'] = 14440
d['l2ChainID'] = 19120

with open('/Users/senton/besachain/opbnb/packages/contracts-bedrock/deploy-config/besachain.json', 'w') as f:
    json.dump(d, f, indent=2)
```

**CRITICAL:** `l1StartingBlockTag` must be a block hash from the CURRENTLY RUNNING L1, not a previous instance.

### Task 4: Deploy OP Stack Contracts to L1

**Files:**
- Use: `/Users/senton/besachain/opbnb/packages/contracts-bedrock/scripts/Deploy.s.sol` (already patched, no CREATE2 salt)

- [ ] **Step 1: Deploy contracts via Forge**

```bash
cd /Users/senton/besachain/opbnb/packages/contracts-bedrock

export DEPLOY_CONFIG_PATH="deploy-config/besachain.json"
export DEPLOYMENT_CONTEXT="besachain"
export IMPL_SALT=$(openssl rand -hex 32)

forge script scripts/Deploy.s.sol:Deploy \
  --rpc-url http://54.235.85.175:1444 \
  --broadcast \
  --private-key 0x32ff42462337421d9f9fcaa660f713d42d28d5c903a07c5f175e170c64a34dec \
  --legacy \
  --slow
```

Expected output: ~30 contracts deployed with version numbers printed. The script saves addresses to `deployments/14440-deploy.json`.

**STOP if:** "invalid CREATE2 deployer bytecode" error. Go back to Task 2.

- [ ] **Step 2: Verify deployment file exists**

```bash
cat /Users/senton/besachain/opbnb/packages/contracts-bedrock/deployments/14440-deploy.json \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print(len(d),'contracts');print('OptimismPortalProxy:',d.get('OptimismPortalProxy','MISSING'));print('SystemConfigProxy:',d.get('SystemConfigProxy','MISSING'))"
```

Expected: 30+ contracts, OptimismPortalProxy and SystemConfigProxy present.

- [ ] **Step 3: Upload deployment addresses to V1**

```bash
scp -i ~/.ssh/libyachain-validators.pem \
  /Users/senton/besachain/opbnb/packages/contracts-bedrock/deployments/14440-deploy.json \
  ec2-user@54.235.85.175:/tmp/l1-deployments.json
```

---

## Phase 3: Generate L2 Genesis

### Task 5: Generate Proper L2 Genesis via op-node

**Files:**
- Use: L2 allocs file (already generated at `state-dump-19120-fjord.json`)
- Use: Deploy config (updated in Task 3)
- Use: L1 deployments (uploaded in Task 4)

- [ ] **Step 1: Upload deploy config and L2 allocs to V1**

```bash
scp -i ~/.ssh/libyachain-validators.pem \
  /Users/senton/besachain/opbnb/packages/contracts-bedrock/deploy-config/besachain.json \
  ec2-user@54.235.85.175:/tmp/deploy-config.json

scp -i ~/.ssh/libyachain-validators.pem \
  /Users/senton/besachain/opbnb/packages/contracts-bedrock/state-dump-19120-fjord.json \
  ec2-user@54.235.85.175:/tmp/l2-allocs.json
```

- [ ] **Step 2: Generate L2 genesis and rollup.json on V1**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
/tmp/op-node genesis l2 \
  --deploy-config /tmp/deploy-config.json \
  --l1-deployments /tmp/l1-deployments.json \
  --l2-allocs /tmp/l2-allocs.json \
  --l1-rpc http://localhost:1444 \
  --outfile.l2 /tmp/l2-genesis-final.json \
  --outfile.rollup /tmp/rollup-final.json
'
```

Expected: Two files created:
- `/tmp/l2-genesis-final.json` (~9MB, 2000+ alloc entries)
- `/tmp/rollup-final.json` (~1.2KB, rollup config)

**STOP if:** "missing L2 genesis time" — the `l1StartingBlockTag` points to a block with timestamp 0 (genesis). Go back to Task 3 and use a later block.

**STOP if:** "wrong chain L1" — the L1 was restarted since the deploy config was created. Go back to Task 3 and update `l1StartingBlockTag`.

- [ ] **Step 3: Verify L2 genesis**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 'python3 -c "
import json
r = json.load(open(\"/tmp/rollup-final.json\"))
print(\"L1 chain:\", r[\"l1_chain_id\"])
print(\"L2 chain:\", r[\"l2_chain_id\"])
print(\"Block time:\", r.get(\"block_time\"))
print(\"L2 genesis hash:\", r[\"genesis\"][\"l2\"][\"hash\"])
print(\"L1 genesis hash:\", r[\"genesis\"][\"l1\"][\"hash\"])
g = json.load(open(\"/tmp/l2-genesis-final.json\"))
print(\"L2 alloc entries:\", len(g.get(\"alloc\",{})))
print(\"L2 chainId:\", g[\"config\"][\"chainId\"])
"'
```

Expected: L1 chain 14440, L2 chain 19120, block_time 2, 2000+ alloc entries.

---

## Phase 4: Start L2 OP Stack

### Task 6: Initialize and Start op-geth

**Files:** None — all on V1 via SSH

- [ ] **Step 1: Kill any existing L2 processes**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
  sudo pkill -f "besachain-l2\|op-node\|op-geth" 2>/dev/null
  sleep 2
  ps aux | grep -E "l2|op-node" | grep -v grep || echo "All L2 processes dead"
'
```

- [ ] **Step 2: Initialize op-geth with generated L2 genesis**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
  sudo rm -rf /data/besachain-l2-opstack
  mkdir -p /data/besachain-l2-opstack
  /tmp/besachain-l2-geth-txdag init --datadir /data/besachain-l2-opstack /tmp/l2-genesis-final.json
'
```

Expected: "Successfully wrote genesis state" with a hash matching the rollup.json `genesis.l2.hash`.

- [ ] **Step 3: Create JWT secret for Engine API**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
  openssl rand -hex 32 > /data/besachain-l2-opstack/jwt-secret.hex
  cat /data/besachain-l2-opstack/jwt-secret.hex
'
```

Save this value — op-node needs the same JWT secret.

- [ ] **Step 4: Start op-geth**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
nohup /tmp/besachain-l2-geth-txdag \
  --datadir /data/besachain-l2-opstack \
  --networkid 19120 \
  --port 31912 \
  --nodiscover \
  --http --http.addr 0.0.0.0 --http.port 1912 \
  --http.api eth,net,web3,txpool,debug,admin \
  --http.corsdomain "*" --http.vhosts "*" \
  --authrpc.addr 0.0.0.0 --authrpc.port 8551 \
  --authrpc.jwtsecret /data/besachain-l2-opstack/jwt-secret.hex \
  --authrpc.vhosts "*" \
  --syncmode full --gcmode archive \
  --rollup.disabletxpoolgossip=true \
  --parallel.txdag \
  --verbosity 3 \
  > /data/besachain-l2-opstack/geth.log 2>&1 &
echo "op-geth started: $!"
'
```

**NOTE:** op-geth does NOT use `--mine` or `--unlock`. Block production is controlled by op-node via Engine API.

- [ ] **Step 5: Verify op-geth is running**

```bash
sleep 10
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
  curl -sf -X POST http://localhost:1912 -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_chainId\",\"params\":[],\"id\":1}"
'
```

Expected: `{"jsonrpc":"2.0","id":1,"result":"0x4ab0"}` (chain ID 19120)

**STOP if:** No response or crash. Check `/data/besachain-l2-opstack/geth.log` for errors. Common issues:
- "Unsupported fork" — L2 genesis missing fork config fields
- "excess blob gas" — genesis has cancunTime set but Clique consensus

### Task 7: Start op-node Sequencer

**Files:** None — all on V1 via SSH

- [ ] **Step 1: Start op-node**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
nohup /tmp/op-node \
  --l1 http://localhost:1444 \
  --l1.trustrpc \
  --l2 http://localhost:8551 \
  --l2.jwt-secret /data/besachain-l2-opstack/jwt-secret.hex \
  --rollup.config /tmp/rollup-final.json \
  --sequencer.enabled \
  --sequencer.l1-confs 0 \
  --p2p.disable \
  --rpc.addr 0.0.0.0 --rpc.port 9545 \
  --log.level info \
  > /data/besachain-l2-opstack/op-node.log 2>&1 &
echo "op-node started: $!"
'
```

**NOTE:** `--l1.trustrpc` is required because our Parlia L1 computes different genesis hashes than what op-node expects (BSC vs standard geth state trie differences).

- [ ] **Step 2: Wait 30 seconds and verify op-node**

```bash
sleep 30
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
  echo "=== op-node logs ==="
  tail -10 /data/besachain-l2-opstack/op-node.log | grep -v "New L1"
  echo ""
  echo "=== L2 block ==="
  curl -sf -X POST http://localhost:1912 -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" \
    | python3 -c "import json,sys;print(int(json.load(sys.stdin)[\"result\"],16))"
'
```

Expected: L2 block > 0 (blocks being produced). op-node logs showing "creating new block" or "Inserted block".

**STOP if:** "wrong chain L1: genesis" — L1 was restarted after rollup.json was generated. Go back to Task 5.
**STOP if:** "Unsupported fork" — L2 genesis fork config doesn't match what op-geth expects. Regenerate L2 allocs (go back to Task 5 Step 1, regenerate allocs with correct fork config).
**STOP if:** "missing L2 genesis time" — rollup.json has timestamp 0. Go back to Task 5.
**STOP if:** "forkchoice: context canceled" — op-geth crashed. Check geth.log, restart op-geth (Task 6 Step 4), then restart op-node.

---

## Phase 5: Verify and Benchmark

### Task 8: Verify Both Layers

- [ ] **Step 1: Check L1 block production**

```bash
for i in 1 2 3; do
  sleep 5
  ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 \
    'curl -sf -X POST http://localhost:1444 -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}"' \
    | python3 -c "import json,sys;print('L1:', int(json.load(sys.stdin)['result'],16))"
done
```

Expected: L1 block increasing by ~10+ per 5 seconds.

- [ ] **Step 2: Check L2 block production**

```bash
for i in 1 2 3; do
  sleep 5
  ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 \
    'curl -sf -X POST http://localhost:1912 -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}"' \
    | python3 -c "import json,sys;print('L2:', int(json.load(sys.stdin)['result'],16))"
done
```

Expected: L2 block increasing. Block time should be ~2s (opBNB block_time config).

- [ ] **Step 3: Verify block times**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
# L1 block time
B1=$(curl -sf -X POST http://localhost:1444 -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" | python3 -c "import json,sys;print(int(json.load(sys.stdin)[\"result\"],16))")
sleep 10
B2=$(curl -sf -X POST http://localhost:1444 -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" | python3 -c "import json,sys;print(int(json.load(sys.stdin)[\"result\"],16))")
echo "L1: $((B2-B1)) blocks in 10s = $((10000/(B2-B1)))ms per block"

# L2 block time
L1=$(curl -sf -X POST http://localhost:1912 -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" | python3 -c "import json,sys;print(int(json.load(sys.stdin)[\"result\"],16))")
sleep 10
L2=$(curl -sf -X POST http://localhost:1912 -H "Content-Type: application/json" -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" | python3 -c "import json,sys;print(int(json.load(sys.stdin)[\"result\"],16))")
echo "L2: $((L2-L1)) blocks in 10s = $((10000/(L2-L1)))ms per block"
'
```

Expected: L1 ~450ms, L2 ~2000ms (opBNB Fourier default).

### Task 9: TPS Benchmark

- [ ] **Step 1: Benchmark L1**

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 \
  '/tmp/flood http://localhost:1444 200 100 14440'
```

Expected: 600+ TPS, 300M gas limit, ~450ms block time.

- [ ] **Step 2: Benchmark L2**

L2 uses op-geth which doesn't support `eth_sendTransaction` (no `--unlock`). The flood tool needs modification to use a funded account. For now, test with direct TX:

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 '
# Send a test TX via the op-node sequencer RPC
curl -sf -X POST http://localhost:1912 -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"0x07eA646728edbFaf665d1884894F53C2bE2dD609\",\"latest\"],\"id\":1}"
'
```

For full L2 TPS benchmark, need to modify the flood tool to:
1. Sign TXs with the validator private key
2. Submit via `eth_sendRawTransaction`
3. This already works — the flood tool signs locally

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 \
  '/tmp/flood http://localhost:1912 200 100 19120'
```

- [ ] **Step 3: Commit and document**

```bash
cd /Users/senton/besachain
git add docs/ && git commit -m "feat: full OP Stack L2 deployed (op-geth + op-node sequencer)" && git push origin main
```

---

## Rollback Plan

If any phase fails:

| Phase | Rollback |
|-------|----------|
| Phase 1 (L1 verify) | Reconnect V2/V3 with `admin_addPeer` |
| Phase 2 (contracts) | Re-run Forge deploy (idempotent for new addresses) |
| Phase 3 (L2 genesis) | Re-run `op-node genesis l2` with updated config |
| Phase 4 (L2 start) | Kill op-geth + op-node, re-init, restart |
| Phase 5 (benchmark) | No rollback needed — observation only |

**NEVER** roll back L1 chain data. All phases build on top of the running L1.

---

## Known Issues and Workarounds

| Issue | Workaround |
|-------|-----------|
| Forge "invalid CREATE2 deployer bytecode" | Deploy.s.sol was patched to remove `{ salt: _implSalt() }`. If it reappears, re-patch. |
| op-node "wrong chain L1" | L1 was restarted after rollup.json generated. Re-run Phase 3. |
| op-node "missing L2 genesis time" | L1 starting block has timestamp 0. Use a non-genesis block. |
| op-geth "Unsupported fork" | L2 genesis missing fork config. Regenerate L2 allocs. |
| V2/V3 fork on startup | Use `--miner.recommit 120s`. |
| "Signed recently, must wait" | Normal for 3-validator Parlia. Chain advances when all 3 are online. |
| op-geth can't mine standalone | Expected. op-geth requires op-node for block production via Engine API. |
