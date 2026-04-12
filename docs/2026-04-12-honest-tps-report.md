# BesaChain Honest TPS Report

**Date:** 2026-04-12
**Method:** Go flood tool (multi-sender, pre-signed raw TXs, localhost on V1)

## L1 Fermi (Chain 14440)

| Metric | Value |
|--------|-------|
| **Consensus** | **Parlia PoSA** (BSC v1.7.2) — CORRECT |
| **Validators** | 1 (should be 3 — sync issue unresolved) |
| **Gas limit** | **300M** (upgraded from 55M) |
| **Block time** | **306ms** |
| **Measured TPS** | **664.5** |
| **Peak TXs/block** | 949 |
| **Peak gas/block** | 19.9M (6.6% of 300M) |
| **Submit rate** | 1,401 TX/s (localhost Go) |
| **Protocol max TPS** | **46,667** (at 300M/306ms) |
| **Pandora's Box TPS** | 2,500 (via SSH tunnel, 100 accounts) |

## L2 Fourier (Chain 19120)

| Metric | Value |
|--------|-------|
| **Consensus** | **Clique PoA** — WRONG (should be opBNB OP Stack) |
| **Sequencer** | Standalone (should be OP Stack with L1 settlement) |
| **Gas limit** | **612M** (target 1B) |
| **Block time** | **2,308ms** — WRONG (should be 250ms) |
| **Measured TPS** | **333.3** |
| **Peak TXs/block** | 2,711 |
| **Peak gas/block** | 56.9M (9.3% of 612M) |
| **Submit rate** | 1,735 TX/s (localhost Go) |
| **Protocol max TPS** | 12,636 (at current block time) |

## Combined

| Metric | Value |
|--------|-------|
| **Combined measured TPS** | **~998** (L1: 664 + L2: 333) |
| **Combined protocol max** | **~59,303** (at current block times) |
| **Target protocol max** | **206,349** (at spec block times: 450ms L1 + 250ms L2) |

## What's Working

- L1 Parlia PoSA consensus (real BSC fork)
- ML-DSA precompile verified on-chain (0x0120)
- ML-DSA Account Abstraction deployed (EntryPoint + Factory + Account)
- TxDAG recording at zero overhead (bubble sort fix)
- 300M gas limit reached
- 8GB cache, lowered prefetch threshold

## What's NOT Working

1. **L2 uses Clique, not opBNB OP Stack** — need to deploy op-node + L1 contracts
2. **Only 1 L1 validator** — 3-validator sync fails (fork divergence on startup)
3. **TxDAG doesn't parallelize** — only records, no parallel executor
4. **Block times don't match spec** — L1 at 306ms (spec 450ms), L2 at 2.3s (spec 250ms)

## Next Steps (Honest Priority)

1. **Deploy proper OP Stack L2** with op-node sequencer for real 250ms blocks
2. **Fix 3-validator startup** using bsc-genesis-contract or staggered start with genesis rewrite
3. **Implement TxDAG parallel executor** for actual throughput improvement
4. **Higher submit rate** — the Go tool hits 1,735 TX/s; need batch RPC or direct mempool injection
