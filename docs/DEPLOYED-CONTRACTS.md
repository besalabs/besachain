# BesaChain Deployed Contracts

**Network:** L1 Testnet (Chain 14440)
**RPC:** http://54.235.85.175:1444
**Date:** 2026-04-12

## ML-DSA Precompiles (Protocol Level)

| Address | Function | Gas Cost |
|---------|----------|----------|
| `0x0000000000000000000000000000000000000120` | ML-DSA-65 single signature verify | 20,000 |
| `0x0000000000000000000000000000000000000121` | ML-DSA-65 batch signature verify | 15,000/sig |

**Verified:** Real ML-DSA-65 keypair generated, signed, and verified on-chain.

## ML-DSA Account Abstraction (Smart Contracts)

| Contract | Address | Verified |
|----------|---------|----------|
| **MLDSAEntryPoint** | `0xed37ad4ed48283739f3bf449bb71356040cfe0bb` | TX: 0xaf3152... |
| **MLDSAAccountFactory** | `0x2310e337d83fC5Df54c845a5f46955F3e6BEe812` | TX: 0x4c0e62... |
| **MLDSAAccount** (first) | `0x8aa4b7b187374d197781ee3e93a9c6c3095b09fa` | 5,660 bytes deployed |

**Factory.entryPoint()** returns `0xed37ad...` (verified)
**Account** deployed via `factory.createAccount(pubkey, salt)` with real 1,952-byte ML-DSA-65 public key.

## Validator

| Role | Address |
|------|---------|
| V1 Validator + Deployer | `0x07eA646728edbFaf665d1884894F53C2bE2dD609` |

## L2 (Chain 19120)

Running on port 1912. No contracts deployed yet.
