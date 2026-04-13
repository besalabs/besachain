# BesaChain 3-Validator Parlia PoSA Deployment Guide

**Proven working:** 2026-04-13
**Applicable to:** BesaChain (chain 14440) and LibyaChain (chain 21801)

---

## The Critical Fix

```
--miner.recommit 120s
```

This single flag solves the fork-on-startup problem. It delays block production for 120 seconds after startup, giving P2P time to sync before mining begins. Without it, all validators produce their own block 1 before connecting, creating incompatible forks.

## Architecture

- **Consensus:** Parlia PoSA (BSC v1.7.2 fork)
- **Validators:** 3 (scalable to 21)
- **Block time:** ~293ms (3.4 blocks/sec with 3 validators)
- **Gas limit:** 300M (configurable via `--miner.gaslimit`)
- **P2P:** config.toml `[Node.P2P] StaticNodes` (static-nodes.json is DEPRECATED in BSC v1.7.2)

## Prerequisites

- 3 instances: minimum t3.medium (4GB RAM, 2 vCPU)
- BSC geth binary with Parlia consensus
- Genesis JSON with all 3 validator addresses in extraData
- Port 31444 (TCP+UDP) open between all validators
- Port 1444 (TCP) for RPC

## Genesis ExtraData Format (Luban+Bohr)

```
vanity(32 bytes) + validatorNum(1 byte) + N*(address(20) + BLS_pubkey(48)) + turnLength(1 byte) + seal(65 bytes)
```

For 3 validators with zero BLS keys (testnet):
```python
extraData = "0x" + "00"*32 + "03" + addr1+"00"*48 + addr2+"00"*48 + addr3+"00"*48 + "01" + "00"*65
# Total: 303 bytes
```

## Step-by-Step Deployment

### Step 1: Create Genesis

```python
# Use existing genesis as template, modify extraData for 3 validators
import json
g = json.load(open("template-genesis.json"))
g["extraData"] = "0x" + "00"*32 + "03" + v1_addr + "00"*48 + v2_addr + "00"*48 + v3_addr + "00"*48 + "01" + "00"*65
g["config"]["parlia"] = {"period": 3, "epoch": 200}
json.dump(g, open("genesis-3val.json", "w"))
```

### Step 2: Initialize All Validators

```bash
# On EACH validator:
geth init --datadir /data/chain genesis-3val.json
echo "password" > /data/chain/password.txt
```

Verify all have the same genesis hash.

### Step 3: Start V1 First (Builds Canonical Chain)

```bash
nohup geth \
  --datadir /data/chain \
  --networkid <CHAIN_ID> \
  --port 31444 \
  --http --http.addr 0.0.0.0 --http.port 1444 \
  --http.api eth,net,web3,txpool,parlia,debug,admin,miner \
  --mine \
  --miner.etherbase <V1_ADDRESS> \
  --miner.gaslimit 300000000 \
  --miner.recommit 120s \
  --unlock <V1_ADDRESS> \
  --password /data/chain/password.txt \
  --allow-insecure-unlock \
  --cache 8192 \
  --nat extip:<V1_PUBLIC_IP> \
  --verbosity 3 \
  > /data/chain/geth.log 2>&1 &
```

Wait 30 seconds for V1 to build initial blocks.

### Step 4: Create config.toml on V2/V3

Get V1's enode:
```bash
curl -X POST http://V1_IP:1444 -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"admin_nodeInfo","params":[],"id":1}'
```

Create `/data/chain/config.toml`:
```toml
[Node.P2P]
StaticNodes = ["enode://<V1_PUBKEY>@<V1_IP>:31444"]
MaxPeers = 25
NoDiscovery = true
ListenAddr = ":31444"
```

**IMPORTANT:** `static-nodes.json` is DEPRECATED in BSC v1.7.2. Use `config.toml` only.

### Step 5: Start V2/V3 with Delayed Mining

```bash
nohup geth \
  --datadir /data/chain \
  --config /data/chain/config.toml \
  --networkid <CHAIN_ID> \
  --syncmode full \
  --http --http.addr 0.0.0.0 --http.port 1444 \
  --http.api eth,net,web3,txpool,parlia,debug,admin,miner \
  --mine \
  --miner.etherbase <V2_OR_V3_ADDRESS> \
  --miner.gaslimit 300000000 \
  --miner.recommit 120s \
  --unlock <V2_OR_V3_ADDRESS> \
  --password /data/chain/password.txt \
  --allow-insecure-unlock \
  --cache 2048 \
  --nat extip:<PUBLIC_IP> \
  --verbosity 3 \
  > /data/chain/geth.log 2>&1 &
```

The `--miner.recommit 120s` ensures V2/V3 sync V1's chain before producing blocks.

### Step 6: Add Peers (Speed Up Connection)

After V2/V3 start, add them as peers on V1:
```bash
curl -X POST http://V1_IP:1444 -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"admin_addPeer","params":["enode://V2_PUBKEY@V2_IP:31444"],"id":1}'
```

### Step 7: Verify

```bash
# All 3 should show same block number and 2 peers
for IP in V1 V2 V3; do
  curl -X POST http://$IP:1444 -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
  curl -X POST http://$IP:1444 -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}'
done
```

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Validators fork at block 1 | Use `--miner.recommit 120s` |
| 0 peers despite config.toml | Enodes change on restart — get fresh enodes and use `admin_addPeer` |
| `static-nodes.json` ignored | BSC v1.7.2 deprecated it — use `config.toml [Node.P2P] StaticNodes` |
| OOM on small instances | Minimum t3.medium (4GB RAM), use `--cache 2048` |
| "Signed recently, must wait" | Normal with 3 validators — each signs 1 of every 2 blocks |
| Epoch boundary halt | Need genesis validator fallback patch or `--miner.recommit` to bypass |

## Scaling to 21 Validators

The same process works for 21 validators:
1. Genesis extraData with 21 addresses (21 * 68 bytes for addr+BLS)
2. Start V1 first
3. Start V2-V21 with `--miner.recommit 120s` + config.toml pointing to V1
4. Each validator connects to V1, syncs, then mines
5. For 21 validators, increase `MaxPeers` to 50+

Hardware per validator (production):
- m7g.4xlarge (16 vCPU, 64GB RAM, 25 Gbps)
- `--cache 32768` (32GB)
- NVMe SSD for chaindata

## LibyaChain Application

Replace:
- Chain ID: 21801 (L1), 21802 (L2)
- Validator addresses: LibyaChain validator set
- Gas limit: same 300M L1 / 1B L2
- Binary: same BSC v1.7.2 fork with ML-DSA precompile

Everything else is identical.
