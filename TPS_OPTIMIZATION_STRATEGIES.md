# BesaChain TPS Optimization Strategies
## Beyond 201,058 TPS: A Comprehensive Performance Engineering Roadmap

**Date:** April 9, 2026  
**Current Status:** L1: 10,582 TPS | L2: 190,476 TPS | Combined: 201,058 TPS  
**Target:** 500,000+ TPS (L1+L2 combined)

---

## Executive Summary

BesaChain currently achieves an industry-leading **201,058 combined TPS** through its dual-layer architecture. This report outlines practical strategies to push beyond **500,000 TPS**, organized by implementation timeline and effort-to-impact ratio.

| Metric | Current | Target (12 months) | Theoretical Max |
|--------|---------|-------------------|-----------------|
| L1 TPS | 10,582 | 25,000 | 50,000 |
| L2 TPS | 190,476 | 400,000 | 1,000,000+ |
| Combined | 201,058 | 425,000+ | 1,050,000+ |

---

## 1. Quick Wins (Low Effort, High Impact)

### 1.1 L1 Block Time Optimization (Immediate - 2 weeks)

**Current:** 450ms (Parlia with period: 0.45)  
**Target:** 200-250ms  
**Expected TPS Gain:** +50-80% (15,873 - 19,048 TPS)

**Implementation:**
```json
// genesis.json modification
{
  "config": {
    "parlia": {
      "period": 0.2,        // Reduce from 0.45 to 0.2
      "epoch": 200
    }
  }
}
```

**Trade-offs:**
- ✅ Faster finality (600ms vs 1.35s)
- ✅ Higher throughput
- ⚠️ Increased uncle rate if network latency > 50ms
- ⚠️ Higher validator hardware requirements

**Technical Notes:**
- BNB Chain successfully reduced block time from 3s to 0.45s (2025)
- Requires validators to have <50ms inter-node latency
- Consider geographic validator distribution

---

### 1.2 L2 Gas Limit Increase (Immediate - 1 week)

**Current:** 1,000,000,000 gas (1B)  
**Target:** 2,000,000,000 gas (2B)  
**Expected TPS Gain:** +100% (380,952 TPS theoretical)

**Implementation:**
```json
// rollup.json
{
  "genesis": {
    "system_config": {
      "gasLimit": 2000000000
    }
  }
}
```

**Hardware Requirements:**
| Component | Current | Required |
|-----------|---------|----------|
| RAM | 64GB | 128GB |
| NVMe SSD | 2TB | 4TB |
| CPU Cores | 16 | 24+ |

**Trade-offs:**
- ✅ Linear TPS increase
- ⚠️ 2x state growth rate
- ⚠️ Higher validator operational costs
- ⚠️ Increased sync time for new nodes

---

### 1.3 Calldata Compression (2-4 weeks)

**Current:** Standard transaction encoding  
**Target:** ZLIB/Brotli compression + dictionary optimization  
**Expected TPS Gain:** +15-25% (throughput efficiency)

**Implementation:**
```go
// op-batcher modification
func compressBatch(txs []Transaction) []byte {
    // Use Brotli with custom dictionary for EVM transactions
    encoder, _ := brotli.NewWriterLevel(nil, brotli.BestSpeed)
    // Apply BesaChain-specific dictionary
    encoder.Write(txs.Serialize())
    return encoder.Close()
}
```

**Benchmarks:**
- Simple transfers: 30% size reduction
- ERC-20 transfers: 25% size reduction
- Complex DeFi swaps: 15-20% size reduction

---

### 1.4 Mempool Optimization (2-3 weeks)

**Strategy:** Implement priority-based transaction ordering with price-time algorithm

**Expected Impact:**
- 10-15% reduction in block processing time
- Better MEV resistance
- Improved gas efficiency

**Implementation:**
```go
type TxPoolConfig struct {
    PriceBump:        10,        // % price increase required
    PriceLimit:       1,         // Minimum gas price (gwei)
    GlobalSlots:      8192,      // Max executable txs
    GlobalQueue:      16384,     // Max non-executable txs
    Lifetime:         3 * time.Hour,
}
```

---

## 2. Medium-Term Improvements (3-6 Months)

### 2.1 EIP-4844 Blob Transaction Integration (2-3 months)

**Current:** Calldata-based L1→L2 data posting  
**Target:** Blob transactions with KZG commitments  
**Expected Impact:**
- 50-70% reduction in L1 data costs
- 2-3x increase in effective batch sizes
- ~190,476 → ~400,000 effective L2 TPS

**Implementation:**
```solidity
// Modify OptimismPortal to support blob verification
function depositTransactionWithBlob(
    address _to,
    uint256 _value,
    uint64 _gasLimit,
    bool _isCreation,
    bytes memory _data,
    VersionedHash[] memory _blobHashes
) external payable {
    // Verify KZG commitments
    require(verifyKZG(_blobHashes), "Invalid blob commitment");
    // Process deposit
    _depositTransaction(...);
}
```

**Technical Requirements:**
- Integrate c-kzg-4844 library
- Modify op-batcher to construct blob transactions
- Update L2 derivation pipeline

**Reference:** Ethereum's Dencun upgrade (March 2024) demonstrated 52% gas cost reduction

---

### 2.2 Optimistic Parallel Execution (3-4 months)

**Strategy:** Implement Block-STM style optimistic concurrency control for L2

**Expected TPS Gain:** +50-150% depending on workload
- DeFi heavy: +50%
- Gaming/NFT: +150%
- Simple transfers: +100%

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│  Transaction Scheduler                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │  Thread 1   │ │  Thread 2   │ │  Thread N   │        │
│  │  TXs 1-100  │ │ TXs 101-200 │ │ TXs ...     │        │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘        │
│         │                │                │              │
│         ▼                ▼                ▼              │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Conflict Detection & Resolution (MVCC)          │    │
│  │  - Detect write-write conflicts                  │    │
│  │  - Re-execute conflicting transactions           │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Implementation Approach:**
1. Modify op-geth to support parallel execution
2. Implement MVCC (Multi-Version Concurrency Control)
3. Add static analysis for dependency graph construction
4. Fallback to sequential for high-conflict blocks

**Reference Projects:**
- Aptos Block-STM (production proven)
- Sei Giga (200K+ TPS on devnet)
- Monad (10K sustained TPS)

---

### 2.3 Flashblocks / Preconfirmations (2-3 months)

**Strategy:** Subdivide L2 blocks into 200ms "flashblocks" for near-instant UX

**Expected Impact:**
- 200ms user-perceived latency (vs 250ms block time)
- 5x improvement in UX metrics
- Better MEV protection

**Implementation:**
```go
// op-node flashblock configuration
type FlashblockConfig struct {
    Enabled:           true,
    Interval:          200 * time.Millisecond,  // Flashblock interval
    FullBlockInterval: 1000 * time.Millisecond, // Full block interval
}

// Subdivide each 1s block into 5 flashblocks
func (s *Sequencer) createFlashblock(txs []Transaction) *Flashblock {
    return &Flashblock{
        Timestamp: time.Now(),
        Transactions: txs,
        ParentHash: s.lastFlashblock.Hash(),
    }
}
```

**Reference:** Base (Coinbase) implemented Flashblocks in July 2025, reducing perceived latency from 2s to 200ms

---

### 2.4 Hardware Optimization Guide (1-2 months)

**Current Validator Spec:**
- CPU: 16 cores
- RAM: 64GB
- Storage: 2TB NVMe SSD

**Optimized Spec for 2B Gas Limit:**
| Component | Minimum | Recommended | Enterprise |
|-----------|---------|-------------|------------|
| CPU | 24 cores | 32 cores (AMD EPYC) | 48+ cores |
| RAM | 128GB DDR4 | 256GB DDR5 | 512GB ECC |
| Storage | 4TB NVMe Gen4 | 8TB NVMe Gen4 RAID 0 | 16TB NVMe Gen5 |
| Network | 1 Gbps | 10 Gbps | 25 Gbps |

**Storage Optimization:**
```bash
# Enable NVMe queue depth optimization
echo 1024 > /sys/block/nvme0n1/queue/nr_requests

# Enable deadline scheduler for better I/O
echo deadline > /sys/block/nvme0n1/queue/scheduler

# Increase TCP buffer sizes for P2P
sysctl -w net.core.rmem_max=134217728
sysctl -w net.core.wmem_max=134217728
```

---

### 2.5 Reth Client Integration (3-6 months)

**Strategy:** Replace Geth with Reth (Rust-based) for L2 execution

**Expected Performance Gains:**
- 30-40% faster block processing
- 50% reduction in memory usage
- Better parallelization support

**Reference:** BNB Chain achieved 30% sync improvement + 40% TrieDB optimization with Reth

**Implementation Path:**
1. Run Reth alongside Geth for shadow validation (month 1-2)
2. Gradual traffic migration (month 3-4)
3. Full Reth migration for L2 (month 5-6)

---

## 3. Long-Term Research Areas (6+ Months)

### 3.1 Parallel EVM Execution with Access Lists (6-12 months)

**Strategy:** Implement Solana Sealevel-style explicit access declarations

**Architecture Changes:**
```solidity
// Transactions must declare read/write sets
struct AccessList {
    address[] readAddresses;
    address[] writeAddresses;
    bytes32[] readSlots;
    bytes32[] writeSlots;
}

// Modified transaction format
transaction = {
    ...standardFields,
    accessList: AccessList,
    parallelizable: true
}
```

**Expected TPS:** 500,000+ sustained

**Challenges:**
- Requires breaking EVM changes
- Developer tooling updates needed
- Complex static analysis for legacy contracts

**Reference:** Solana achieves 65,000+ TPS with Sealevel parallelism

---

### 3.2 Statelessness with Verkle Trees (12-18 months)

**Strategy:** Replace Merkle Patricia Trees with Verkle Trees for state efficiency

**Benefits:**
- 90% reduction in state proof sizes
- Stateless validators (no full state needed)
- Faster sync times

**Implementation:**
```go
// Verkle tree commitment
func (t *VerkleTree) Insert(key, value []byte) error {
    // Use IPA (Inner Product Argument) commitments
    // O(log n) updates vs O(n) for Merkle
}
```

**Expected Impact:**
- 5-10x reduction in block processing time
- Enable light validators
- Better sharding support

**Reference:** Ethereum roadmap targets Verkle trees for 2026-2027

---

### 3.3 Execution Sharding (12-18 months)

**Strategy:** Partition execution across multiple L2 chains with unified settlement

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                    BesaChain L1                         │
│              (Settlement & Data Availability)           │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼───┐      ┌────▼────┐     ┌─────▼─────┐
│ L2-A  │      │  L2-B   │     │   L2-C    │
│ DeFi  │      │ Gaming  │     │   NFT     │
│ Shard │      │  Shard  │     │   Shard   │
│200K TPS│     │ 200K TPS│     │  200K TPS │
└───────┘      └─────────┘     └───────────┘

Total: 600,000+ TPS across shards
```

**Cross-Shard Communication:**
- Asynchronous message passing
- Unified liquidity through L1 bridge
- Atomic composability within shards

---

### 3.4 Custom Precompiles for ML-DSA Optimization (3-6 months)

**Current:** ML-DSA at address 0x0120  
**Optimization:** Batch verification precompile

**Implementation:**
```solidity
// Batch ML-DSA verification
address constant ML_DSA_BATCH = 0x0121;

function verifyBatch(
    bytes32[] memory messageHashes,
    bytes[] memory signatures,
    bytes32[] memory publicKeyHashes
) external view returns (bool[] memory results) {
    // Native implementation: ~20,000 gas per signature
    // Batch optimization: ~8,000 gas per signature (60% reduction)
    return precompile(ML_DSA_BATCH, abi.encode(...));
}
```

**Expected Gas Savings:**
- Single verification: 20,000 gas
- Batch (10 sigs): 80,000 gas (8,000 per sig)
- Batch (100 sigs): 600,000 gas (6,000 per sig)

---

### 3.5 Alternative VM Support (12+ months)

**Strategy:** Support SVM (Solana Virtual Machine) and MoveVM through compatibility layers

**Benefits:**
- Attract Solana developers
- Leverage Solana's parallel execution model
- Multi-VM ecosystem

**Implementation:**
```
┌─────────────────────────────────────────────────────────┐
│              BesaChain L2 Execution Layer               │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    EVM      │  │    SVM      │  │   MoveVM    │     │
│  │  (Solidity) │  │    (Rust)   │  │   (Move)    │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│       │                 │                 │             │
│       └─────────────────┼─────────────────┘             │
│                         ▼                               │
│              ┌─────────────────────┐                   │
│              │   Unified State DB  │                   │
│              └─────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Specific Recommendations with Expected TPS Gains

### Phase 1: Foundation (Months 1-3)
| Strategy | Effort | Expected TPS | Priority |
|----------|--------|--------------|----------|
| L1 Block Time → 200ms | Low | 19,048 (+80%) | 🔴 Critical |
| L2 Gas Limit → 2B | Low | 380,952 (+100%) | 🔴 Critical |
| Calldata Compression | Medium | +20% efficiency | 🟡 High |
| Mempool Optimization | Low | +15% efficiency | 🟡 High |

**Phase 1 Total: 400,000 TPS**

### Phase 2: Scale (Months 4-6)
| Strategy | Effort | Expected TPS | Priority |
|----------|--------|--------------|----------|
| EIP-4844 Blobs | High | 2x batch efficiency | 🔴 Critical |
| Flashblocks | Medium | 5x UX improvement | 🟡 High |
| Hardware Optimization | Medium | +30% performance | 🟡 High |
| Parallel Execution (V1) | High | +50% throughput | 🟢 Medium |

**Phase 2 Total: 500,000+ TPS**

### Phase 3: Next-Gen (Months 7-18)
| Strategy | Effort | Expected TPS | Priority |
|----------|--------|--------------|----------|
| Reth Migration | High | +40% performance | 🟡 High |
| Full Parallel EVM | Very High | 3-5x throughput | 🟢 Medium |
| Execution Sharding | Very High | Linear scaling | 🔵 Research |
| Verkle Trees | Very High | Stateless clients | 🔵 Research |

**Phase 3 Total: 1,000,000+ TPS**

---

## 5. Technical Implementation Notes

### 5.1 Block Time Reduction Safety Checks

```go
// Minimum viable block time calculator
func calculateMinimumBlockTime(validators []Validator) time.Duration {
    maxLatency := 0
    for _, v := range validators {
        if v.NetworkLatency > maxLatency {
            maxLatency = v.NetworkLatency
        }
    }
    
    // Block time must be > 2x max latency for safety
    minBlockTime := time.Duration(maxLatency * 2) * time.Millisecond
    
    // Add processing overhead
    processingTime := 50 * time.Millisecond
    
    return minBlockTime + processingTime
}
```

### 5.2 Gas Limit Increase Rollout

```yaml
# Staged gas limit increase
rollout:
  stage1:
    date: "2026-05-01"
    gas_limit: 1_500_000_000
    min_client_version: "v1.2.0"
  
  stage2:
    date: "2026-07-01"
    gas_limit: 2_000_000_000
    min_client_version: "v1.3.0"
    
  stage3:
    date: "2026-10-01"
    gas_limit: 3_000_000_000
    min_client_version: "v1.4.0"
```

### 5.3 Monitoring & Alerting

```yaml
# Key metrics to monitor
metrics:
  - name: block_processing_time
    alert_threshold: "> 80% of block time"
    
  - name: transaction_confirmation_time
    alert_threshold: "> 2 seconds"
    
  - name: state_growth_rate
    alert_threshold: "> 100GB per day"
    
  - name: peer_sync_lag
    alert_threshold: "> 5 blocks"
    
  - name: mempool_size
    alert_threshold: "> 10,000 pending txs"
```

---

## 6. Risk Assessment

| Strategy | Technical Risk | Economic Risk | Mitigation |
|----------|---------------|---------------|------------|
| Block Time Reduction | Medium | Low | Phased rollout, rollback plan |
| Gas Limit Increase | Low | Medium | Staged increases, hardware surveys |
| Parallel Execution | High | Low | Extensive testnet validation |
| EIP-4844 Integration | Medium | Low | Reference Ethereum implementation |
| Execution Sharding | Very High | High | Research phase first, gradual adoption |

---

## 7. Benchmarking Methodology

### 7.1 Test Environment
```
Hardware: AWS c7i.8xlarge (32 vCPU, 64GB RAM, NVMe)
Network: 100 Gbps internal, <1ms latency
Duration: 1 hour sustained load per test
Transaction Mix: 70% transfers, 20% DeFi, 10% complex contracts
```

### 7.2 Success Criteria
- Sustained TPS: Target maintained for 1 hour
- Latency: p95 < 2 seconds
- Finality: 100% within target block time
- Resource Usage: <80% CPU, <70% RAM

---

## 8. Conclusion

BesaChain can realistically achieve **500,000+ TPS** within 6 months through:

1. **Quick wins** (L1 block time, L2 gas limit) → 400,000 TPS
2. **Medium-term** (EIP-4844, Flashblocks, Parallel execution) → 500,000+ TPS
3. **Long-term** (Sharding, Verkle trees, Alternative VMs) → 1,000,000+ TPS

The key is phased implementation with extensive testing at each stage. The foundation of Parlia consensus + OP Stack provides a solid base for these optimizations.

**Next Steps:**
1. Implement Phase 1 quick wins (April-May 2026)
2. Set up comprehensive benchmarking suite
3. Begin EIP-4844 integration research
4. Evaluate parallel execution frameworks (Block-STM, Sealevel)

---

*Document Version: 1.0*  
*Last Updated: April 9, 2026*  
*Author: BesaChain Performance Engineering*
