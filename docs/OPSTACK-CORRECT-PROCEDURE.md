# OP Stack Deployment — Correct Procedure (From opBNB Source)

**Source:** `opbnb/bedrock-devnet/devnet/__init__.py` lines 178-239

## How opBNB Actually Deploys

opBNB deploys to a **single-node local L1** (Docker container), not a multi-validator network. The deployment script is a Python wrapper around `cast` and `forge` commands.

### Key Differences From What We Tried

| What opBNB Does | What We Did Wrong |
|-----------------|-------------------|
| Single-node L1 (no nonce race) | 2-validator L1 (nonce race) |
| `--with-gas-price 10000000000` | Default gas price |
| opBNB CREATE2 deployer (byte 66: `6039`) | Canonical CREATE2 deployer (byte 66: `6014`) |
| No `--slow`, no `--non-interactive` | Various broken flags |
| `DEPLOYMENT_OUTFILE` env var | `DEPLOYMENT_CONTEXT` env var |
| Python `run_command` wrapper | Direct CLI |

### opBNB's CREATE2 Deployer (BSC-Adapted)

```
0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffff
fffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0360160008160
2082378035828234f58015156039578182fd5b8082525050506014600cf31ba022222222
22222222222222222222222222222222222222222222222222222222a0222222222222222
2222222222222222222222222222222222222222222222222
```

Note: byte offset 66 is `6039` (opBNB) vs `6014` (canonical Ethereum). This is why Forge rejected our CREATE2 deployer.

### Exact Deployment Commands (From opBNB Source)

```bash
# 1. Deploy CREATE2 (if not exists)
cast send --private-key $KEY --rpc-url $RPC --gas-price 10000000000 --legacy \
  --value 1ether 0x3fAB184622Dc19b6109349B94811493BF2a45362

cast publish --rpc-url $RPC \
  '0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222'

# 2. Deploy contracts
forge script scripts/Deploy.s.sol:Deploy \
  --private-key $KEY \
  --with-gas-price 10000000000 \
  --legacy \
  --rpc-url $RPC \
  --broadcast \
  DEPLOYMENT_OUTFILE=deployments/deploy.json \
  DEPLOY_CONFIG_PATH=deploy-config/besachain.json
```

### Prerequisites

1. **Single-validator L1** — stop V2/V3 before deploying, restart after
2. **opBNB CREATE2 deployer** — use the BSC-adapted version, not canonical
3. **`--rpc.allow-unprotected-txs`** on L1 geth (for CREATE2 pre-signed TX)
4. **Patched Deploy.s.sol** — our patches (no CREATE2 salt, direct ProxyAdmin calls) are still needed
5. **Clear txpool** — restart L1 if stuck TXs exist

### After Deployment

```bash
# Generate L2 genesis
op-node genesis l2 \
  --deploy-config deploy-config.json \
  --l1-deployments deployments/deploy.json \
  --l2-allocs l2-allocs.json \
  --l1-rpc http://localhost:1444 \
  --outfile.l2 l2-genesis.json \
  --outfile.rollup rollup.json

# Add funded accounts to l2-genesis.json
# Set l2_time in rollup.json > L1 block timestamp (Parlia ms issue)

# Start op-geth + op-node (see 3-VALIDATOR-DEPLOYMENT-GUIDE.md)
```

### Restart V2/V3 After Deployment

Use `--miner.recommit 120s` as documented in `3-VALIDATOR-DEPLOYMENT-GUIDE.md`.
