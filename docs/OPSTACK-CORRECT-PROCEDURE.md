# OP Stack L2 Deployment — Correct Procedure

**Source:** `opbnb/bedrock-devnet/devnet/__init__.py` lines 178-239

## Architecture

- **L1 Fermi**: 3-validator Parlia PoSA — STAYS RUNNING, DO NOT TOUCH
- **L2 Fourier**: Single sequencer (op-node + op-geth via Engine API) — deployed ON V1 alongside L1

L2 is NOT a multi-validator chain. It's a single sequencer that reads L1 for data availability. The OP Stack contracts are deployed TO L1 as regular smart contracts (like any dapp). L1 validators are unaffected.

## Step 1: Deploy opBNB CREATE2 Deployer to L1

opBNB uses a BSC-adapted CREATE2 deployer (byte 66: `6039`, not canonical `6014`). 
This is why Forge rejected our CREATE2 deployer with "invalid bytecode".

L1 must have `--rpc.allow-unprotected-txs` flag (for the pre-signed TX).

```bash
# Fund the deployer address
cast send --private-key $KEY --rpc-url $L1_RPC --gas-price 10000000000 --legacy \
  --value 1ether 0x3fAB184622Dc19b6109349B94811493BF2a45362

# Deploy opBNB's CREATE2 (NOT the canonical Ethereum one)
cast publish --rpc-url $L1_RPC \
  '0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222'
```

## Step 2: Deploy OP Stack Contracts to L1

Use opBNB's exact flags. DO NOT stop L1 validators.

```bash
cd opbnb/packages/contracts-bedrock

forge script scripts/Deploy.s.sol:Deploy \
  --private-key $KEY \
  --with-gas-price 10000000000 \
  --legacy \
  --rpc-url $L1_RPC \
  --broadcast
```

Env vars (set BEFORE running):
```bash
export DEPLOYMENT_OUTFILE=deployments/14440-deploy.json
export DEPLOY_CONFIG_PATH=deploy-config/besachain.json
```

NOTE: opBNB uses `DEPLOYMENT_OUTFILE`, not `DEPLOYMENT_CONTEXT`.

If nonce race occurs (likely with 350ms blocks), use `--slow` flag. 
If `--slow` is also broken, use the web3.py approach from `OPSTACK-DEFINITIVE-FIX.md`.

## Step 3: Generate L2 Genesis + Rollup Config

```bash
op-node genesis l2 \
  --deploy-config deploy-config.json \
  --l1-deployments deployments/14440-deploy.json \
  --l2-allocs l2-allocs.json \
  --l1-rpc $L1_RPC \
  --outfile.l2 l2-genesis.json \
  --outfile.rollup rollup.json
```

### Critical: L2 timestamp must be > L1 Parlia ms timestamp
Parlia uses millisecond-precision timestamps. `op-node genesis l2` generates L2 time in seconds.
Set `l2_time` in rollup.json to L1 block timestamp + 1 second.

### Add funded accounts to L2 genesis
```python
g["alloc"]["f39Fd6e51aad88F6F4ce6aB8827279cffFb92266"] = {"balance": "0x204FCE5E3E25026110000000"}
g["alloc"]["07eA646728edbFaf665d1884894F53C2bE2dD609"] = {"balance": "0x204FCE5E3E25026110000000"}
```
Then re-init op-geth and update rollup.json with the new L2 genesis hash.

## Step 4: Start L2 on V1

### op-geth (execution client)
```bash
nohup op-geth \
  --datadir /data/besachain-l2-opstack \
  --networkid 19120 --port 31912 --nodiscover \
  --http --http.addr 0.0.0.0 --http.port 1912 \
  --http.api eth,net,web3,txpool,debug,admin \
  --authrpc.addr 0.0.0.0 --authrpc.port 8551 \
  --authrpc.jwtsecret /data/besachain-l2-opstack/jwt-secret.hex \
  --authrpc.vhosts "*" \
  --syncmode full --gcmode archive \
  --rollup.disabletxpoolgossip=true \
  --parallel.txdag \
  > geth.log 2>&1 &
```

NOTE: op-geth does NOT use `--mine` or `--unlock`. Block production is controlled by op-node.

### op-node (consensus/sequencer)
```bash
nohup op-node \
  --l1 http://localhost:1444 --l1.trustrpc \
  --l2 http://localhost:8551 \
  --l2.jwt-secret /data/besachain-l2-opstack/jwt-secret.hex \
  --rollup.config rollup.json \
  --sequencer.enabled --sequencer.l1-confs 0 \
  --p2p.disable \
  --rpc.addr 0.0.0.0 --rpc.port 9545 \
  > op-node.log 2>&1 &
```

`--l1.trustrpc` required because BSC Parlia computes different block hashes than standard geth.

## Deploy.s.sol Patches Required

1. Remove `{ salt: _implSalt() }` from all `new Contract` calls (no CREATE2 salt)
2. Replace `deploySafe("SystemOwnerSafe")` with `save("SystemOwnerSafe", msg.sender)`
3. Replace `_callViaSafe` to do direct `_target.call(_data)` instead of Safe.execTransaction
4. Replace `_upgradeAndCallViaSafe` to call `ProxyAdmin.upgradeAndCall` directly
5. Move `transferProxyAdminOwnership()` to end of `_run()` (or comment out)
6. Comment out `transferDisputeGameFactoryOwnership()` and `transferDelayedWETHOwnership()`

All patches are in the current `scripts/Deploy.s.sol` (backed up as `.bak` and `.bak2`).

## Mistakes NOT To Repeat

1. **DO NOT stop L1 validators for L2 deployment** — L2 contracts are just dapp contracts on L1
2. **DO NOT use Optimism's `op-deployer`** — it doesn't support BSC chain IDs
3. **DO NOT use Optimism's canonical CREATE2 deployer** — use opBNB's BSC-adapted version
4. **DO NOT use `DEPLOYMENT_CONTEXT` env var** — opBNB uses `DEPLOYMENT_OUTFILE`
5. **DO NOT swap L1 binaries** during deployment — causes chain state corruption
6. **DO NOT modify L1 genesis** after validators are running — wipes chain history
7. **Clear txpool journal** (`rm transactions.rlp`, restart geth) if stuck TXs block nonces
