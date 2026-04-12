# BesaChain Final TPS Benchmark

**Date:** 2026-04-12
**Tool:** [Pandora's Box](https://github.com/sig-0/pandoras-box) (multi-sender, pre-signed raw TXs)
**Method:** 100 sub-accounts derived from mnemonic, parallel batch submission

## L1 Fermi (Chain 14440)

| Metric | Value |
|--------|-------|
| **Measured TPS** | **2,500** |
| Accounts | 100 |
| TXs | 10,000 |
| Blocks | 11 |
| Peak TXs/block | 2,572 (98.23% gas utilization) |
| Avg utilization | 34.78% |
| Gas limit | 150M |

## L2 Fourier (Chain 19120)

| Metric | Value |
|--------|-------|
| **Measured TPS** | **90** |
| Accounts | 50 |
| TXs | 5,000 |
| Blocks | 27 |
| Peak TXs/block | 1,988 (6.69% utilization) |
| Gas limit | ~628M (dynamic, target 1B) |
| Bottleneck | SSH tunnel latency + Clique instant blocks |

## Combined

| Metric | Value |
|--------|-------|
| **Combined measured TPS** | **2,590** |
| **L1 protocol max** | ~17,000 TPS |
| **L2 protocol max** | ~190,000 TPS |
| **Combined protocol max** | **~207,000 TPS** |

## What's Real vs Theoretical

| Tier | TPS | Confidence |
|------|-----|------------|
| **Measured (Pandora's Box)** | **2,590** | Proven |
| L1 at 100% utilization | ~7,000 | Extrapolated from 98% block |
| Execution-limited (hardware) | ~24,000 | Calculated from gas/sec |
| Protocol max | 207,000 | Design parameter |

## How to Reproduce

```bash
# Install
git clone https://github.com/sig-0/pandoras-box.git
cd pandoras-box && npm install --legacy-peer-deps

# Fund mnemonic account (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
# Then run:
npx pandoras-box -url http://54.235.85.175:1444 \
  -m "test test test test test test test test test test test junk" \
  -s 100 -t 10000 -b 500
```
