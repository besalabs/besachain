# L2 Gas Pricing Overflow — Debug Guide

## The Bug

Every L2 TX is rejected with `insufficient funds` and an astronomical tx cost (~1e50 to 1e78).
Even with SystemConfig scalar=0 and overhead=0, the L1 data fee calculation overflows.

## What's Working

- L2 produces blocks (op-node sequencer, 2s blocks)
- L2 funded (10B BESA on funder + mnemonic accounts)  
- `eth_estimateGas` returns 24,338 gas (normal)
- `eth_gasPrice` returns ~200M wei (normal)
- GasPriceOracle `baseFeeScalar=0`, `blobBaseFeeScalar=0`, `l1BaseFee=3 gwei`, `getL1Fee=0`

## What's Broken

- `eth_sendRawTransaction` rejects ALL TXs with overflow cost
- Cost = ~1.8e50 for gasPrice=1wei, ~1.9e78 for gasPrice=1gwei
- Both legacy (EIP-155) and EIP-1559 TXs fail
- The overflow is NOT from the gas execution cost (21000 * gasPrice is tiny)
- The overflow IS from the L1 data fee calculation in op-geth

## Where to Look

File: `opbnb-geth/core/types/rollup_cost.go` (or similar)

The L1 cost calculation in op-geth (Ecotone era):
```
l1Cost = (baseFeeScalar * l1BaseFee * txDataGas + blobBaseFeeScalar * l1BlobBaseFee * txDataGas) / 1e6
```

With both scalars=0, this should be 0. But it's not. Possible causes:
1. The L1BlockInfo deposit TX in L2 blocks carries the ENCODED scalar (uint256) not the individual scalars
2. op-geth decodes the scalar incorrectly (version byte mismatch)
3. The L1 blob base fee is uninitialized and enormous
4. Integer overflow in the multiplication

## Debug Steps

1. Read `rollup_cost.go` in op-geth source
2. Find the `L1Cost` function
3. Check how it reads `baseFeeScalar` and `blobBaseFeeScalar` from L1BlockInfo
4. Check the L1 blob base fee value
5. Add debug logging to see exact values in the calculation

## Files on V1

- op-geth source: `/tmp/opbnb-geth/`
- op-geth binary: `/tmp/besachain-l2-geth-txdag`
- L2 data: `/data/besachain-l2-opstack/`
- L2 logs: `/data/besachain-l2-opstack/geth.log`

## Current SystemConfig

Address: `0x55b75637D0A24C79acCeC9A4EeAC8E16aD3dE84e`
- gasLimit: 30,000,000
- scalar: 452312848583266388373324160190187140051835877600158453279131187530910662656 (Ecotone encoding of basefeeScalar=0, blobbasefeeScalar=0)
- overhead: 0

## UPDATE: Root Cause Found

**The overflow is in TX pool validation, NOT in gas estimation.**

- `eth_estimateGas` → works (returns 24,338 gas) ✓
- `eth_sendRawTransaction` → overflows with 1.9e78 cost ✗
- `GasPriceOracle.getL1Fee()` → returns 0 (correct with scalar=0) ✓
- `GasPriceOracle.overhead()` → returns 2100 ✓
- `GasPriceOracle.scalar()` → returns 1000000 ✓

**The TX pool validation** reads L1 cost from a DIFFERENT code path than `estimateGas`.

**Where to look:**
- `opbnb-geth/core/txpool/legacypool/legacypool.go` — `validateTx()` function
- `opbnb-geth/core/state_transition.go` — `buyGas()` or `preCheck()`
- The L1 cost is added to the TX cost BEFORE balance check
- This L1 cost uses the `RollupCostData` from `rollup_cost.go`

**The Bedrock fallback issue (from rollup_cost.go line ~143):**
```go
firstEcotoneBlock := l1BlobBaseFee.BitLen() == 0 && 
    bytes.Equal(emptyScalars, l1FeeScalars[scalarSectionStart:scalarSectionStart+8])
if firstEcotoneBlock {
    return newL1CostFuncBedrock(config, statedb, blockTime)
}
```

When `l1BlobBaseFee=0` (our L1 has no blobs) AND Ecotone scalars = 0, it falls back to Bedrock.
Bedrock reads the RAW scalar from the L1BlockInfo (which is Ecotone-encoded = 4.52e74).

**Fix options:**
1. Patch op-geth: skip Bedrock fallback when scalar is Ecotone-encoded
2. Set `l1BlobBaseFee > 0` in the L1BlockInfo deposit
3. Use pre-Ecotone config (but our allocs include Ecotone contracts)

**We set Bedrock scalar=1000000 via setGasConfig but the L2 blocks still show the OLD L1BlockInfo** 
because the L1 event needs to propagate through op-node → L2 deposit TX → L2 state update.
This propagation may take time depending on how far behind op-node is.

**Next session: wait for L2 to catch up to the L1 block with the setGasConfig TX, then test.**
