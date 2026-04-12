# Flood Tool Quick Reference

**Updated:** April 12, 2026  
**Tool:** `/tmp/flood-batch` (improved TX injection tool, 40.9% faster than original)

---

## Overview

The improved `flood-batch` tool uses batch JSON-RPC to achieve higher TX submission rates.

- **Old tool:** `/tmp/flood` (1,735 TX/s)
- **New tool:** `/tmp/flood-batch` (2,447 TX/s)
- **Improvement:** +40.9%

---

## Installation

Tool is already compiled and ready on V1:
```bash
ssh ec2-user@54.235.85.175
/tmp/flood-batch --help  # Shows usage
```

If you need to rebuild:
```bash
ssh ec2-user@54.235.85.175
cd /tmp/flood-build
go build -o /tmp/flood-batch flood-batch.go
```

---

## Basic Usage

### Default mode (200 accounts, 100 TXs each):
```bash
/tmp/flood-batch
```

### Custom parameters:
```bash
/tmp/flood-batch <url> <accounts> <txs_per_account> <chain_id> <workers> <batch_size>

# Example: 500 accounts, 100 TXs, 300 workers, batch 50
/tmp/flood-batch http://localhost:1444 500 100 14440 300 50
```

### Parameters:
- **url:** RPC endpoint (default: `http://localhost:1444`)
- **accounts:** Number of funded accounts to generate (default: 200)
- **txs_per_account:** TXs per account (default: 100)
- **chain_id:** Blockchain chain ID (default: 14440)
- **workers:** Concurrent workers (default: 50, recommended: 200-300)
- **batch_size:** TXs per HTTP request (default: 100, recommended: 50)

---

## Performance Tuning

### For maximum submit rate (2,400+ TX/s):
```bash
/tmp/flood-batch http://localhost:1444 300 100 14440 300 50
# 300 accounts × 100 TXs = 30K TXs
# 300 workers × batch 50 TXs = ~600 HTTP requests
# Expected: 2,250-2,300 TX/s submit rate
```

### For lower latency (fewer TXs but faster completion):
```bash
/tmp/flood-batch http://localhost:1444 100 50 14440 100 100
# 100 accounts × 50 TXs = 5K TXs
# 100 workers × batch 100 TXs = ~50 HTTP requests
# Expected: 2,000+ TX/s submit rate, completes in ~2.5s
```

### For large-scale stress test:
```bash
/tmp/flood-batch http://localhost:1444 500 100 14440 200 100
# 500 accounts × 100 TXs = 50K TXs
# 200 workers × batch 100 TXs = ~500 HTTP requests
# Expected: 1,700-1,900 TX/s submit rate, takes ~30s
```

---

## Expected Output

```
=== BESACHAIN FLOOD (BATCH MODE) ===
URL: http://localhost:1444 | Accounts: 300 | TXs/acct: 100 | Total: 30000 | Chain: 14440
Workers: 300 | Batch size: 50 | Requests: 600

Generating 300 accounts...
Funding 300 accounts from 0x07eA646728edbFaf665d1884894F53C2bE2dD609...
Waiting for funding...
Pre-signing 30000 transactions...
All TXs signed

Start block: 45755
Flooding 30000 raw TXs (batch mode) with 300 workers...
Sent 30000 OK, 0 failed in 13.101s (2290 TX/s)
Mining for 30s...

Blocks: 45755 -> 45851 (96)

==========================================
  BESACHAIN TPS (batch mode)
==========================================
Total TXs:     29934 / 30000 sent
Max TXs/block: 3570
Max gas/block: 74987596 (25.0% of 300M)
Block time:    312ms
TPS:           997.8
Gas/sec:       20972811
Protocol max:  45714 TPS
Submit rate:   2290 TX/s
==========================================
```

---

## Key Metrics to Watch

### Submit Rate (TX/s)
- **Metric:** How fast TXs are sent to the RPC
- **Limited by:** HTTP overhead, RPC handler concurrency
- **Target:** 2,200+ TX/s
- **Tuning:** Increase workers (200-300) and batch size (50-100)

### On-chain TPS
- **Metric:** How many TXs actually made it into blocks
- **Limited by:** Block time, gas limit
- **Target:** 600-1,000+ TPS
- **Why lower than submit rate:** Block generation takes 250-350ms, not all submitted TXs fit in one block

### Block Time
- **Metric:** Time between blocks (in milliseconds)
- **Expected:** 250-350ms with single validator
- **With 3 validators:** ~250-350ms per validator (one block every 75-120ms aggregate)

### Max TXs/Block
- **Metric:** Peak TXs in a single block
- **Target:** 2,500-3,500+ (depends on gas limits)
- **Gas limit:** 300M (configurable via `--miner.gaslimit`)

### Protocol Max (theoretical)
- **Calculation:** (Gas limit / 21000) / Block time
- **Example:** (300M / 21000) / 0.31s = 45,714 TPS theoretical maximum
- **Realistic achievable:** 30-40% of protocol max (1,200-2,000 TPS) due to RPC overhead

---

## Troubleshooting

### "Connection refused" error
```
Error: post http://localhost:1444: dial tcp [::1]:1444: connect: connection refused
```
**Fix:** Ensure Geth is running on port 1444
```bash
curl -s http://localhost:1444 -X POST -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq .
```

### Funding fails
```
Funding 300 accounts from 0x07eA...
(nothing happens)
```
**Fix:** Validator address must be unlocked. Check Geth started with `--unlock --allow-insecure-unlock`

### Very low submit rate (< 1,000 TX/s)
- Reduce batch size (from 100 to 50)
- Increase workers (to 300+)
- Check network latency: `ping localhost`
- Check Geth CPU/memory: `ps aux | grep geth`

### Blocks not advancing
- Check Geth is running: `ps aux | grep geth | grep mine`
- Verify `--mine` flag is present
- Check block time: Should be 250-350ms
- If stuck: Restart Geth with `systemctl restart besachain-l1`

---

## Recommended Test Patterns

### Quick baseline test (5 minutes)
```bash
/tmp/flood-batch http://localhost:1444 200 100 14440 200 50
# ~20K TXs, quick validation of performance
```

### Standard performance test (10 minutes)
```bash
/tmp/flood-batch http://localhost:1444 500 100 14440 300 50
# ~50K TXs, good snapshot of sustained performance
```

### Long-duration stress test (20 minutes)
```bash
/tmp/flood-batch http://localhost:1444 1000 100 14440 300 50
# ~100K TXs, tests stability over extended run
```

### Multi-validator test (when 3 validators available)
```bash
# Run flood-batch on each validator's RPC endpoint
for ip in 54.235.85.175 44.223.91.64 3.84.251.178; do
  ssh ec2-user@$ip /tmp/flood-batch http://localhost:1444 300 100 14440 200 50 &
done
wait
# Expect: TPS scales ~3× with 3 validators
```

---

## Source Code

Available on V1:
```bash
/tmp/flood-build/flood-batch.go
```

Key improvements over original:
1. Batch JSON-RPC requests (50-100 TXs per HTTP request)
2. Connection pooling with high concurrency
3. Pre-sign all TXs before flooding (reduces per-TX overhead)
4. Parallel account funding
5. Configurable batch size and worker count

---

## Comparison with Original Tool

| Metric | Original `/tmp/flood` | New `/tmp/flood-batch` | Improvement |
|--------|----------------------|----------------------|-------------|
| Submit rate | 1,735 TX/s | 2,447 TX/s | +41% |
| Workers (default) | 50 | 300 | 6× |
| Batch size | 1 TX/req | 50 TXs/req | 50× |
| Accounts | 200 | 500 | 2.5× |
| TPS achieved | 664 | 998 | +50% |
| Max block size | 2,251 TXs | 3,570 TXs | +59% |

---

## Notes

- All TXs are pre-signed to focus on RPC submission overhead
- Target address is hardcoded to `0x0000000000000000000000000000000000000001`
- Gas price is set to 1 Gwei (1e9 wei)
- Each TX transfers 1 wei to target
- Validator must be unlocked for account funding
- Tool expects EIP-155 signable transactions

---

**End of Reference**
