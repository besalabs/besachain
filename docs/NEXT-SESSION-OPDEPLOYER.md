# Next Session: Use op-deployer for OP Stack L2

**op-deployer v0.6.0** installed at `/tmp/op-deployer-0.6.0-darwin-arm64/op-deployer`

## Why op-deployer instead of Forge Script

Forge script `--broadcast` has a [known nonce tracking bug](https://github.com/foundry-rs/foundry/issues/8452) on fast-block-production chains. Our L1 (350ms blocks) causes nonce desync. `op-deployer` is Optimism's official tool that handles this correctly.

## Steps

### 1. Init op-deployer workspace

```bash
cd /Users/senton/besachain
/tmp/op-deployer-0.6.0-darwin-arm64/op-deployer init \
  --l1-chain-id 14440 \
  --l2-chain-ids 19120 \
  --workdir .deployer \
  --intent-type standard-overrides
```

### 2. Edit .deployer/intent.toml

Set L1 chain ID 14440, L2 chain ID 19120, all role addresses to validator `0x07eA646728edbFaf665d1884894F53C2bE2dD609`.

### 3. Deploy

```bash
/tmp/op-deployer-0.6.0-darwin-arm64/op-deployer apply \
  --workdir .deployer \
  --l1-rpc-url http://54.235.85.175:1444 \
  --private-key 0x32ff42462337421d9f9fcaa660f713d42d28d5c903a07c5f175e170c64a34dec
```

### 4. Generate genesis + rollup config

```bash
/tmp/op-deployer-0.6.0-darwin-arm64/op-deployer inspect genesis \
  --workdir .deployer 19120 > .deployer/genesis.json

/tmp/op-deployer-0.6.0-darwin-arm64/op-deployer inspect rollup \
  --workdir .deployer 19120 > .deployer/rollup.json
```

### 5. Upload to V1 and start op-geth + op-node

Same as current plan Phase 4 (Tasks 6-7).

## Current Infrastructure

- L1: 2 validators running (V1+V2), block 16,000+
- V3: stopped
- op-geth binary: `/tmp/besachain-l2-geth-txdag` on V1
- op-node binary: `/tmp/op-node` on V1
- L2 genesis with funded accounts (needs regeneration after op-deployer)
- JWT secret: `/data/besachain-l2-opstack/jwt-secret.hex` on V1
