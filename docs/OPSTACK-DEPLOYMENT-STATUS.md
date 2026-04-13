# OP Stack Deployment Status

**Date:** 2026-04-13
**Status:** 80% complete — contracts deployed, proxy initialization pending

## What's Working

- **L1 Fermi:** 3-validator Parlia PoSA, block 15,000+, 300M gas, 664 TPS measured
- **31 of 32 OP Stack contracts** deployed on L1 with code on-chain
- **op-geth** built with TxDAG bubble sort fix (84MB binary on V1)
- **op-node** built (52MB binary on V1)
- **L2 genesis** generated via `op-node genesis l2` with 2,333 predeploy contracts + funded accounts
- **L2 rollup.json** generated with correct L1/L2 chain IDs and block references
- **flood v2** tool built — signs ALL TXs locally including funding (works on both L1 and L2)

## What's NOT Working

### Proxy Initialization (THE BLOCKER)

The Forge deploy script deploys in 3 phases:
1. Deploy proxy contracts (ERC1967Proxy) — **DONE**
2. Deploy implementation contracts — **DONE**  
3. Upgrade proxies to point to implementations + initialize — **NOT DONE**

Phase 3 failed because Forge's `--resume` broadcast hit nonce errors (L1 block production too fast for Forge's nonce tracking).

**Result:** SystemConfigProxy returns "implementation not initialized" → L2 GasPriceOracle can't read L1 gas params → L1 data fee overflows → all L2 TXs fail with "insufficient funds" (tx cost = 1.9e78)

### How to Fix

**Option A: Manual proxy upgrades (recommended, ~30 min)**

For each proxy, call `ProxyAdmin.upgrade(proxy, implementation)`:

```bash
# ProxyAdmin address
PROXY_ADMIN=$(cat deployments/14440-deploy.json | jq -r '.ProxyAdmin')

# For each proxy-implementation pair:
cast send --rpc-url http://54.235.85.175:1444 \
  --private-key 0x32ff42462337421d9f9fcaa660f713d42d28d5c903a07c5f175e170c64a34dec \
  --legacy \
  $PROXY_ADMIN \
  "upgrade(address,address)" \
  <PROXY_ADDRESS> <IMPLEMENTATION_ADDRESS>

# Then initialize each implementation:
cast send ... $PROXY_ADDRESS "initialize(...)" ...
```

Proxy → Implementation mapping from `deployments/14440-deploy.json`:
- SystemConfigProxy → SystemConfig
- OptimismPortalProxy → OptimismPortal  
- L2OutputOracleProxy → L2OutputOracle
- L1CrossDomainMessengerProxy → L1CrossDomainMessenger
- L1StandardBridgeProxy → L1StandardBridge
- L1ERC721BridgeProxy → L1ERC721Bridge
- OptimismMintableERC20FactoryProxy → OptimismMintableERC20Factory
- DisputeGameFactoryProxy → DisputeGameFactory
- DelayedWETHProxy → DelayedWETH
- AnchorStateRegistryProxy → AnchorStateRegistry
- SuperchainConfigProxy → SuperchainConfig
- ProtocolVersionsProxy → ProtocolVersions

**Option B: Re-run Forge deploy from scratch (~1 hour)**

Delete all broadcast cache, re-deploy with fresh nonces. The Forge nonce issue may recur. Workaround: temporarily reduce L1 to 1 validator (slower block production = stable nonces for Forge), deploy, then re-add V2/V3.

**Option C: Use Anvil fork state diff (~2 hours)**

Run the full deployment on an Anvil fork, extract the state changes (storage slots), apply them directly to L1 via `debug_setStorageAt` (if available) or by crafting manual TXs.

## Current Deployment Addresses

File: `/Users/senton/besachain/opbnb/packages/contracts-bedrock/deployments/14440-deploy.json`
Also on V1: `/tmp/l1-deployments.json`

## Binaries on V1

| Binary | Path | Size |
|--------|------|------|
| L1 BSC geth (TxDAG) | `/tmp/besachain-geth-txdag-opt` | 84MB |
| L2 op-geth (TxDAG) | `/tmp/besachain-l2-geth-txdag` | 84MB |
| op-node | `/tmp/op-node` | 52MB |
| Flood tool v2 | `/tmp/flood2` | 20MB |

## L2 Genesis Files on V1

| File | Purpose |
|------|---------|
| `/tmp/l2-genesis-final.json` | L2 genesis with 2,333 predeploys + funded accounts |
| `/tmp/rollup-final.json` | Rollup config (L1 chain, L2 chain, block time) |
| `/tmp/l2-allocs.json` | L2 predeploy bytecodes (from Forge L2Genesis.s.sol) |
| `/tmp/deploy-config.json` | Deploy configuration |
| `/tmp/l1-deployments.json` | L1 contract addresses |
| `/data/besachain-l2-opstack/jwt-secret.hex` | JWT for Engine API |

## Key Learnings

1. **Forge broadcast fails on fast L1 chains** — nonce tracking can't keep up with 350ms blocks
2. **OP Stack proxy pattern** — proxies deploy first (cheap), implementations deploy second, then `upgrade()` + `initialize()` calls wire them together
3. **L2 timestamp must be > L1 origin timestamp** (in milliseconds for Parlia)
4. **op-geth rejects eth_sendTransaction** — all TXs must be signed locally (use flood2 tool)
5. **SystemConfig must be initialized** for L2 gas pricing to work

## Validated TPS

| Layer | TPS | Tool |
|-------|-----|------|
| L1 Fermi (3-val Parlia) | **2,000** (Pandora's Box) / **664** (flood) | Multi-sender proven |
| L2 Fourier (OP Stack) | **Blocked** by SystemConfig init | Needs proxy upgrades |
