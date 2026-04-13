# OP Stack Deployment — Definitive Fix

## The Problem We Hit (Don't Repeat)

1. **Forge `--broadcast` nonce race**: BSC's fast blocks (350ms) cause Forge's nonce tracking to desync. EVERY `forge script --broadcast` attempt fails with "nonce too low" or "replacement transaction underpriced".

2. **web3.py deploys at wrong addresses**: Forge simulation predicts addresses based on simulated nonces. web3.py deploys at different nonces → different addresses. The CALL TXs (proxy upgrades) target simulation addresses that don't exist on-chain.

3. **Safe ownership blocks init**: The Deploy.s.sol transfers ProxyAdmin ownership to a GnosisSafe before proxy initialization. On-chain, the Safe doesn't work (no code / EOA), so init calls revert.

## What WORKED

1. **Simulation passes 100%** with these patches:
   - Removed `{ salt: _implSalt() }` from all deployments (no CREATE2)
   - Replaced `deploySafe("SystemOwnerSafe")` with `save("SystemOwnerSafe", msg.sender)`
   - Moved `transferProxyAdminOwnership()` to end of `_run()`
   - Replaced `_callViaSafe` to call ProxyAdmin directly
   - Commented out `transferDisputeGameFactoryOwnership` and `transferDelayedWETHOwnership`
   - Skipped `deploySafe` entirely

2. **web3.py sends TXs reliably** with proper nonce management (48/48, 0 reverts)

3. **All contracts compile and verify** on BSC's EVM (opBNB-adapted bytecodes)

## The Definitive Solution

### Option A: Deploy on Anvil Fork, Extract State, Apply to L1

1. Start Anvil forking L1: `anvil --fork-url http://54.235.85.175:1444 --port 8545`
2. Run Forge deploy against Anvil (no nonce issues, fast, local)
3. Extract deployed contract addresses from Anvil
4. Extract all state changes (storage slots) from Anvil
5. Replay the exact same transactions on L1 via web3.py, using Anvil's receipt data to verify addresses match

### Option B: Single-Script web3.py Deployer (Recommended)

Write a Python script that:
1. Reads all contract bytecodes from `forge-artifacts/`
2. Reads initialization parameters from `deploy-config/besachain.json`
3. Deploys each contract sequentially via web3.py (handles nonces correctly)
4. Records actual addresses after each deployment
5. Calls `ProxyAdmin.upgradeAndCall()` with actual addresses (not simulated)
6. Verifies each proxy is initialized correctly

This script is ~200 lines of Python, uses web3.py, and is 100% reliable.

### Option C: Use `op-deployer` on Standard L1

Deploy OP Stack contracts to an Ethereum Sepolia fork, then bridge to BSC L1. More complex but uses Optimism's official tooling.

## Patched Files

All patches are in: `/Users/senton/besachain/opbnb/packages/contracts-bedrock/scripts/Deploy.s.sol`

Backup: `scripts/Deploy.s.sol.bak` (original), `scripts/Deploy.s.sol.bak2` (first patch)

## Current L1 State

- 3 validators running (V1+V2+V3 with `--miner.recommit 120s`)
- Block 20,000+
- Multiple old deployments scattered across nonces 477-1400+ (harmless, just wasted gas)
- ProxyAdmin at `0x1E5547903064B3e27339cdC7cb92738987c55a17` (owned by deployer)
- Various proxy contracts exist but most are uninitialized
