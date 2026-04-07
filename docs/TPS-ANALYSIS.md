# Besa Chain TPS Analysis & Theoretical Maximum

**Date:** April 7, 2026  
**Analysis Type:** Infrastructure Capacity & Theoretical Limits  
**Status:** Based on Current AWS Configuration

---

## 1. Current AWS Infrastructure

### 1.1 Shared Infrastructure with LibyaChain

| Resource | Specification | Shared With |
|----------|--------------|-------------|
| **EC2 Instance** | t3.xlarge (4 vCPU, 16GB RAM) | LibyaChain L1 + L2 |
| **Storage** | EBS gp3 (3000 IOPS baseline) | Shared volume |
| **Network** | Up to 5 Gbps | Shared bandwidth |
| **Region** | eu-west-1 (Ireland) | Same |

**Critical Issue:** The current setup plans to share a `t3.xlarge` instance between LibyaChain AND BesaChain. This is insufficient for high-throughput blockchain operations.

### 1.2 Current Genesis Configuration

**Besa L1:**
```json
{
  "gasLimit": "0x2625a00",    // 40,000,000 gas
  "parlia": {
    "period": 3,               // 3 second blocks
    "epoch": 200
  }
}
```

**Besa L2:**
```json
{
  "gasLimit": "0x5f5e100"     // 100,000,000 gas
}
```

---

## 2. Theoretical Max TPS Calculation

### 2.1 Formula

```
Max TPS = Gas Limit per Block / (Average Gas per Transaction × Block Time in Seconds)
```

### 2.2 Transaction Types & Gas Costs

| Transaction Type | Gas Used | Notes |
|-----------------|----------|-------|
| Simple Transfer | 21,000 | ETH/BNB transfer |
| ERC-20 Transfer | 45,000 - 65,000 | Token transfer |
| Uniswap Swap | 120,000 - 180,000 | DEX swap |
| Contract Deployment | 200,000 - 1,000,000+ | Varies by size |
| ML-DSA Verify | ~20,000 | Post-quantum signature |
| ML-DSA Sign | ~30,000 | Post-quantum signing |
| EIP-7702 Auth | ~35,000 | Account abstraction |

### 2.3 Theoretical Maximums (Gas-Only)

#### Besa L1 (40M gas limit, 3s blocks)

| Scenario | Gas/Tx | Max TPS | Notes |
|----------|--------|---------|-------|
| Simple Transfers | 21,000 | **635** | Best case |
| ERC-20 Transfers | 50,000 | **267** | Realistic token use |
| Uniswap Swaps | 150,000 | **89** | DeFi operations |
| Mixed Load (50/50) | 35,500 | **376** | Balanced realistic |
| ML-DSA + EIP-7702 | 85,000 | **157** | Post-quantum AA |

#### Besa L2 (100M gas limit, 250ms blocks)

| Scenario | Gas/Tx | Max TPS | Notes |
|----------|--------|---------|-------|
| Simple Transfers | 21,000 | **1,904,762** | Theoretical max |
| ERC-20 Transfers | 50,000 | **800,000** | Token ops |
| Uniswap Swaps | 150,000 | **266,667** | DeFi on L2 |
| Mixed Load (50/50) | 35,500 | **1,126,760** | Balanced |
| ML-DSA + EIP-7702 | 85,000 | **470,588** | Post-quantum AA |

### 2.4 Combined L1 + L2 Theoretical Maximum

```
L1: 376 TPS (realistic mixed load)
L2: 1,126,760 TPS (realistic mixed load)
─────────────────────────────────────────
Total: ~1,127,136 TPS theoretical maximum
```

**However, this is purely gas-based and ignores real-world constraints.**

---

## 3. Real-World Constraints Analysis

### 3.1 Hardware Limitations (Current t3.xlarge)

| Constraint | t3.xlarge Limit | Impact on TPS |
|------------|-----------------|---------------|
| **CPU** | 4 vCPU (burst) | Signature verification bottleneck |
| **Memory** | 16 GB | State cache limitations |
| **Storage IOPS** | 3,000 baseline | Transaction logging bottleneck |
| **Network** | 5 Gbps | P2P gossip limitations |

**Realistic TPS on t3.xlarge:**
- L1: **50-100 TPS** (CPU bound on signature verification)
- L2: **500-2,000 TPS** (sequencer single-threaded)

### 3.2 Optimized Infrastructure Requirements

To achieve 200K+ TPS on L2, the infrastructure needs:

| Component | Minimum Spec | Recommended Spec |
|-----------|--------------|------------------|
| **L1 Validators** | 4× c7i.2xlarge | 8× c7i.4xlarge |
| **L2 Sequencers** | 2× c7i.8xlarge | 4× c7i.12xlarge |
| **Storage** | io2 16,000 IOPS | io2 64,000 IOPS |
| **Network** | 10 Gbps | 25 Gbps |
| **Memory** | 32 GB | 64 GB |

### 3.3 Bottleneck Analysis

```
┌─────────────────────────────────────────────────────────────┐
│  L2 Sequencer (Single threaded)                            │
│  ├─ Signature verification: ~0.1ms per tx (ECDSA)         │
│  ├─ Signature verification: ~0.5ms per tx (ML-DSA)        │
│  ├─ State update: ~0.05ms per tx                          │
│  └─ Network broadcast: ~0.02ms per tx                     │
│                                                             │
│  Max single-threaded: ~1,000-2,000 TPS (current)          │
│  With parallelization: ~10,000-50,000 TPS                 │
│  Optimized batching: ~100,000-200,000+ TPS                │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Claimed vs. Actual TPS

### 4.1 What Was Claimed (217K+ peak)

**Conditions for 217K TPS:**
- Bare metal servers (not EC2)
- NVMe SSDs with 100K+ IOPS
- 100 Gbps network
- Optimized batching (1000+ tx per batch)
- Simple transfer transactions only
- No signature verification (pre-signed batches)
- No network propagation latency

### 4.2 What Current AWS Setup Can Achieve

| Setup | L1 TPS | L2 TPS | Notes |
|-------|--------|--------|-------|
| **Current (t3.xlarge shared)** | 50-100 | 500-2,000 | Resource contention |
| **Dedicated t3.xlarge** | 100-200 | 1,000-3,000 | No contention |
| **c7i.8xlarge (whitepaper spec)** | 1,000-3,000 | 10,000-50,000 | Better but still limited |
| **Cluster (4× c7i.12xlarge)** | 5,000-10,000 | 100,000-200,000+ | Target architecture |

---

## 5. Path to 200K+ TPS

### 5.1 Required Infrastructure Investment

| Phase | Infrastructure | Cost/Month | L2 TPS |
|-------|---------------|------------|--------|
| **Phase 1** | Single c7i.8xlarge | ~$300 | 5,000-10,000 |
| **Phase 2** | 2× c7i.8xlarge + load balancer | ~$600 | 15,000-30,000 |
| **Phase 3** | 4× c7i.12xlarge cluster | ~$2,000 | 50,000-100,000 |
| **Phase 4** | 8× c7i.24xlarge + dedicated network | ~$8,000 | 150,000-250,000+ |

### 5.2 Software Optimizations Required

1. **Parallel Transaction Execution**
   - Current: Single-threaded
   - Target: 16-32 parallel threads
   - Gain: 10-20x TPS improvement

2. **Batch Signature Verification**
   - Current: One-by-one verification
   - Target: BLS aggregate signatures
   - Gain: 5-10x TPS improvement

3. **State Caching**
   - Current: Disk-based state reads
   - Target: In-memory state cache
   - Gain: 2-5x TPS improvement

4. **Optimized P2P**
   - Current: Standard devp2p
   - Target: Compressed batch propagation
   - Gain: 2-3x TPS improvement

---

## 6. Benchmarking Methodology

### 6.1 Recommended Test Setup

```bash
# 1. Deploy isolated test environment
terraform apply -var="environment=benchmark"

# 2. Run sustained load test
./benchmark.sh \
  --duration 3600 \
  --tx-type mixed \
  --tps-target 200000 \
  --nodes 8 \
  --latency-matrix realistic

# 3. Measure actual metrics
# - Committed TPS (not just submitted)
# - 95th percentile latency
# - Block propagation time
# - State growth rate
# - Memory/CPU usage
```

### 6.2 Key Metrics to Track

| Metric | Target | Acceptable |
|--------|--------|------------|
| Sustained TPS | 200,000 | >100,000 |
| Latency (p95) | <1s | <5s |
| Block propagation | <100ms | <500ms |
| Finality time | <3s | <10s |
| State growth | <100GB/day | <500GB/day |

---

## 7. Recommendations

### 7.1 Immediate Actions

1. **Separate Infrastructure**
   - Do NOT share t3.xlarge with LibyaChain
   - Deploy Besa on dedicated instances

2. **Conservative Claims**
   - Current realistic: **1,000-5,000 TPS**
   - Target with investment: **50,000-100,000 TPS**
   - Ultimate goal: **200,000+ TPS** (requires Phase 4 infrastructure)

3. **Benchmark Before Publishing**
   - Run sustained 1-hour tests
   - Measure under realistic network conditions
   - Document all hardware specs

### 7.2 Whitepaper Corrections

| Current Claim | Suggested Correction |
|---------------|---------------------|
| "217,000+ TPS sustained" | "217,000+ TPS peak in controlled conditions; target 100,000+ sustained" |
| "200,000+ TPS L2" | "Target: 200,000+ TPS L2 with optimized infrastructure" |
| "c7i.8xlarge benchmarks" | "c7i.8xlarge represents target infrastructure; current tests on [actual hardware]" |

---

## 8. Conclusion

**Theoretical Maximum:** ~1.1M TPS (gas-based calculation)  
**Realistic with Current Setup:** 500-2,000 TPS  
**Achievable with Investment:** 50,000-200,000+ TPS  

**Bottom Line:** The 200K+ TPS claim is achievable but requires:
1. Significant infrastructure investment ($2,000-8,000/month)
2. Software optimizations (parallel execution, batching)
3. Realistic testing under production-like conditions

**Current whitepaper claims are 50-100x optimistic** given the actual AWS setup.

---

## Appendix: Gas Limit Deep Dive

### L1 Gas Limit: 40,000,000

```
Decimal: 40,000,000 gas/block
Block Time: 3 seconds
Gas per second: 13,333,333

Simple Transfer: 21,000 gas
Max TPS = 13,333,333 / 21,000 = 635 TPS
```

### L2 Gas Limit: 100,000,000

```
Decimal: 100,000,000 gas/block
Block Time: 0.25 seconds (250ms)
Gas per second: 400,000,000

Simple Transfer: 21,000 gas
Max TPS = 400,000,000 / 21,000 = 19,048 TPS per core

With 10 parallel cores: 190,480 TPS
With 20 parallel cores: 380,952 TPS
```

**The gas limit alone doesn't guarantee high TPS** — execution speed and parallelization are the bottlenecks.
