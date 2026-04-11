# BesaChain TPS Measurement - FINAL

## Summary
**Block Production: ✅ ACTIVE**  
**Consensus: Parlia PoSA**  
**Block Time: ~3 seconds**

## Test Results

### Transaction Submission
| Metric | Value |
|--------|-------|
| Transactions Sent | 100 |
| Submission Time | 861ms |
| **Submission Rate** | **116 tx/s** |

### Transaction Confirmation
| Metric | Value |
|--------|-------|
| Transactions Confirmed | 102/100 |
| Blocks Mined | 7 |
| Block Time | ~3 seconds |

### Block Production Rate
- **~20 blocks/minute** (1 block per 3 seconds)
- Validator: `0xe8415a307106a5078ceadf69f3421ddc03e97b54`

## Theoretical Maximum TPS

With current configuration:
- **Block Gas Limit**: 100,000,000
- **Block Time**: 3 seconds
- **Simple Transfer**: 21,000 gas
- **Max TPS**: ~1,587 tx/s

## Key Configuration

```json
{
  "config": {
    "chainId": 14440,
    "parlia": {
      "period": 1,
      "epoch": 200
    }
  },
  "gasLimit": "100000000"
}
```

## Network Details
- **RPC**: http://54.235.85.175:18445
- **Chain ID**: 14440
- **Validator**: 0xe841...e97b54

## Notes
- Gas price minimum: 1 gwei (1000000000)
- Transactions require proper gas price to be accepted
- Block production requires `miner_start` to be called (even for Parlia)

---
**Measured**: April 10, 2026  
**Status**: ✅ OPERATIONAL
