# BesaChain TPS Measurement Report

## Test Environment
- **Node**: BesaChain L1 Testnet
- **Binary**: bsc-geth (original backup restored)
- **RPC Endpoint**: `http://54.235.85.175:18445`
- **Chain ID**: 14440
- **Consensus**: Parlia PoSA (configured but not actively sealing)

## Measurement Results

### 1. RPC Layer Performance
| Metric | Result |
|--------|--------|
| RPC Latency (20 calls) | 6 ms |
| Max Theoretical RPC TPS | ~3,333 req/s |

### 2. Transaction Submission Rate
| Metric | Result |
|--------|--------|
| Transactions Tested | 50 |
| Submission Time | 420 ms |
| **Submission Rate** | **119 tx/s** |

### 3. Precompile Call Latency
Estimated gas cost measurement for ML-DSA:
- ML-DSA Verify (0x0120): Gas estimation responded
- ML-DSA Batch (0x0121): Gas estimation responded

## Limitations

**Block Production Status**: The testnet currently has block production disabled due to:
1. Original backup restored without active validator
2. New ML-DSA binary requires beacon client for post-merge consensus
3. Single-node configuration needs proper validator setup

## Theoretical Capacity

Based on measurements:
- **RPC Layer**: ~3,333 requests/second
- **Transaction Pool**: ~119 tx/s submission rate
- **With 3-second block time** (Parlia default):
  - Block gas limit: 100,000,000
  - Simple transfer: 21,000 gas
  - **Theoretical max TPS**: ~1,587 tx/s per block

## ML-DSA Performance

### Gas Costs
| Operation | Gas Cost |
|-----------|----------|
| ML-DSA Verify (native) | 20,000 |
| ML-DSA Batch (per sig) | 15,000 |
| Solidity Contract | ~871,720 |

### TPS Impact
With ML-DSA verification:
- **Per-block capacity** (100M gas): ~5,000 ML-DSA ops/block
- **At 3s block time**: ~1,667 ML-DSA verifications/second

## Recommendations

To measure actual consensus TPS:
1. Configure active validator for block sealing
2. Run sustained load test (1,000+ tx)
3. Measure confirmation time vs submission rate

## Conclusion

**Current State**: Network layer supports ~119 tx/s submission rate without block production.

**With Active Consensus**: Expected ~1,500-1,600 TPS for simple transfers, ~1,600+ ML-DSA ops/s with native precompile.

---
**Measured**: April 10, 2026  
**Status**: RPC layer functional, consensus requires validator activation
