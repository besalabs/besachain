# Aptos Innovations Adoptable for BesaChain TPS

**Date:** 2026-04-11
**Purpose:** Technical assessment of Aptos innovations that can be ported to BesaChain (BSC fork, Go/EVM)

---

## Summary Table

| Innovation | TPS Impact | Integration Difficulty | Priority |
|-----------|-----------|----------------------|----------|
| **Block-STM (production-grade)** | 3-5x | HIGH | 1 (foundational) |
| **Batch Signature Verification** | 1.2-1.5x | LOW | 1 (easy win) |
| **Zaptos Pipelining** | 1.3-1.5x | MEDIUM | 2 (after Block-STM) |
| **Orderless Transactions** | 1.3-1.8x | MEDIUM | 2 (protocol change) |
| **Quorum Store (Narwhal DAG)** | 2-4x | MEDIUM-HIGH | 3 (if mempool bottleneck) |
| **Aggregators** | 1.5-2x | MEDIUM | 3 (app-level, contract changes) |
| **JellyfishMerkle Tree** | 2-3x | HIGH | 4 (long-term, state rewrite) |
| **Raptr Consensus** | Latency only | HIGH | Skip (Parlia is sufficient) |
| **Shardines** | 10x+ | IMPOSSIBLE | Skip (incompatible with Parlia) |

**Cumulative realistic impact:** 9.5K → 60-80K TPS through Phases 1-4.

---

## Phase 1: Easy Wins (1-2 weeks)

### Batch Signature Verification

Instead of verifying ECDSA signatures one-by-one during block validation, batch 100-1000 sigs and verify in parallel using SIMD or batched crypto.

**How:** Use `libsecp256k1` batch verification for mempool transaction admission. Collect signatures in batches, verify all at once using multi-scalar multiplication.

**Performance:** 10K sigs sequential = 1000ms → batched = 250-500ms (2-4x faster sig verification)

**Integration:** LOW — add batch verification to mempool admission, no consensus changes.

### MPT Cache Warming

Pre-warm geth's state trie cache per block based on pending transactions in mempool. Reduces cold storage reads during execution.

**Expected:** 1.2x throughput improvement from reduced I/O wait.

---

## Phase 2: Block-STM Production Grade (6-10 weeks)

We already have a basic Block-STM port (Phase 3 in parallel-evm/). To make it production-grade like Aptos, we need:

### 1. Dynamic Dependency Estimation

Aptos doesn't just re-execute on conflict — it *estimates* dependencies before execution using the preset transaction order. Dependent transactions wait instead of executing blindly and aborting.

**Key insight:** Use "estimated write" markers. If TX 5 is estimated to write key K, TX 6 (which reads K) waits for TX 5 to finish rather than executing speculatively and aborting.

### 2. Efficient Concurrent Ordered Set

Replace priority queues with two atomic counters (execution index, validation index). This reduces synchronization overhead from O(log n) to O(1) per operation.

Our current scheduler uses `atomic.Int32` — this is already close. Need to add the estimation markers.

### 3. SLOAD/SSTORE Instrumentation

EVM can't declare read/write sets upfront (unlike Move). We must instrument SLOAD and SSTORE opcodes to track dependencies at runtime.

**Modification to geth:** Wrap `StateDB.GetState()` and `StateDB.SetState()` to record all storage accesses per transaction, feeding them into the Block-STM dependency tracker.

### 4. Lazy Commit via Double Collect

Commit entire blocks atomically using atomic counters rather than per-transaction commits. Our lazy beneficiary (Phase 2a) is the first step — extend to all state writes.

**Expected:** 3-5x TPS improvement over sequential (40K-50K combined L1+L2).

---

## Phase 3: Execution Pipelining — Zaptos Pattern (4-6 weeks)

Aptos pipelines *between* blocks. While block N undergoes consensus, block N-1 executes, block N-2 commits:

```
Time T:   Consensus(N)       Execution(N-1)      Commit(N-2)
Time T+1: Consensus(N+1)     Execution(N)        Commit(N-1)
```

### Key Techniques:

1. **Optimistic Execution** — Execute blocks immediately upon receiving them, before formal consensus completion. If consensus rejects, roll back.

2. **Decoupled State Certification** — Calculate state root in a background thread while the next block executes. Geth currently couples execution and state root tightly — need to decouple.

3. **Piggybacking Certification** — State root certification runs in parallel with the next consensus round.

**Result at 20K TPS:** Latency drops from 1.32s to 0.78s (41% reduction). Throughput increases 1.3-1.5x because execution no longer blocks consensus.

### Integration with Parlia:

- Parlia validators receive block proposals → immediately start executing speculatively
- If the block passes consensus (BLS fast finality), execution result is already available
- If rejected (rare), discard execution result
- State root calculation runs in background goroutine

**Expected:** 50K-70K combined TPS.

---

## Phase 4: Orderless Transactions (2-4 weeks)

Aptos v1.30 (June 2025) replaced sequential nonces with unique transaction IDs. This allows multiple transactions from the same sender to execute in parallel.

### Current (Ethereum/BSC):
```
Sender A: TX(nonce=1) → TX(nonce=2) → TX(nonce=3)
Must execute in order. TX 2 waits for TX 1.
```

### Orderless:
```
Sender A: TX(id=0xABC) TX(id=0xDEF) TX(id=0x123)
All execute in parallel. Validator tracks used IDs to prevent replay.
```

### EVM Implementation:

1. New transaction type (e.g., `0x04`) with `uniqueId` field instead of `nonce`
2. Validator maintains a bloom filter of (sender, uniqueId) pairs for last N blocks
3. Replay protection: reject any transaction with a previously-seen (sender, uniqueId)
4. Compatible with existing ECDSA and ML-DSA signing

**Expected:** 60K-80K combined TPS (removes per-sender bottleneck).

---

## Phase 5: Aggregators — Parallel Commutative Updates (4-6 weeks)

Aggregators allow multiple transactions to update the same value in parallel when the operation is commutative (addition, subtraction).

### Example: Token Balance

Without aggregators: TX 1 reads balance → writes new balance. TX 2 must wait.
With aggregators: TX 1 records delta(+100). TX 2 records delta(+200). Both execute in parallel. End of block: aggregate deltas → final balance.

### EVM Implementation:

New precompile at `0x0130` (Aggregator):
- `aggregator.delta(slot, amount)` — Record a commutative delta
- `aggregator.read(slot)` — Read current aggregated value
- Block-STM recognizes aggregator operations and defers commitment

Contracts must opt in by using the aggregator precompile instead of direct SSTORE for counters/totals.

**Expected:** 1.5-2x for workloads with shared state (DEX reserves, token supplies, voting tallies).

---

## What NOT to Adopt

### JellyfishMerkle Tree (Not Now)
JMT is superior to MPT for parallel reads (versioned keys, no locks). But replacing geth's entire state layer requires:
- Rewriting state sync, light clients, proof verification
- 6-8 weeks minimum, high risk
- **Defer to a future hardfork when storage becomes the bottleneck.**

### Raptr Consensus (Skip)
Raptr gives 20% latency improvement but requires:
- Full consensus rewrite (2000+ lines)
- DAG-based mempool (Quorum Store)
- 6 months engineering
- **Parlia is already fast enough. Focus on execution.**

### Shardines (Incompatible)
Aptos's sharding requires horizontal partitioning across validator subsets. Parlia uses a single validator set. **Architecturally incompatible.**

---

## Cumulative TPS Projection

| Phase | Innovation | TPS (Sequential Baseline: 9.5K) |
|-------|-----------|--------------------------------|
| Baseline | Sequential EVM | 9,500 |
| Phase 1 | Batch sig + cache warming | 12,000-14,000 |
| Phase 2 | Block-STM production | 40,000-50,000 |
| Phase 3 | Zaptos pipelining | 50,000-70,000 |
| Phase 4 | Orderless transactions | 60,000-80,000 |
| Phase 5 | Aggregators | 70,000-90,000 |

**Protocol max remains 200K+ (gas-limited).** Realistic throughput approaches 80-90K with all optimizations — still below protocol max but 8-9x over baseline.

To reach 200K+ realistic, you need either:
- JellyfishMerkle storage (removes I/O bottleneck) — adds another 2-3x
- Sharding — not compatible with Parlia
- Or accept that 200K+ is the theoretical ceiling and 80K+ is the realistic peak

---

## Sources

- [Block-STM: 160k+ TPS on Aptos](https://medium.com/aptoslabs/block-stm-how-we-execute-over-160k-transactions-per-second-on-the-aptos-blockchain-3b003657e4ba)
- [Quorum Store: Horizontal Consensus Scaling](https://medium.com/aptoslabs/quorum-store-how-consensus-horizontally-scales-on-the-aptos-blockchain-988866f6d5b0)
- [Zaptos: Reducing Blockchain Latency](https://medium.com/aptoslabs/zaptos-reducing-blockchain-latency-to-the-absolute-minimum-ca69c5da5727)
- [Aggregators: Parallel Sequential Workloads](https://medium.com/aptoslabs/aggregators-how-sequential-workloads-are-executed-in-parallel-on-the-aptos-blockchain-e7992c70cefb)
- [Stateless Accounts & Orderless Transactions](https://medium.com/aptoslabs/stateless-accounts-and-orderless-transactions-build-with-scale-on-aptos-d826204fded9)
- [Raptr: Prefix Consensus](https://arxiv.org/abs/2504.18649)
- [PEVM: Parallel EVM Engine](https://github.com/risechain/pevm)
- [Block-STM Paper (ACM PPoPP23)](https://dl.acm.org/doi/10.1145/3572848.3577524)
