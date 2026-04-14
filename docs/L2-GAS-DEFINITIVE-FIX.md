# L2 Gas Overflow — Definitive Root Cause and Fix

## Root Cause (Final)

The L1Block predeploy on L2 (address `0x4200000000000000000000000000000000000015`) stores the Bedrock gas parameters in slots 3 and 4:
- Slot 3: overhead (should be 2100)
- Slot 4: scalar (should be 1000000)

**BUT:** The `op-node genesis l2` tool reads the SystemConfig contract's `scalar()` function, which returns the **Ecotone-encoded** scalar (uint256 with version byte = `4.52e74`). This gets baked into slot 4 of the L1Block predeploy in the L2 genesis allocs.

Since our rollup config does NOT enable Ecotone (`ecotone_time` not set), op-geth uses the **Bedrock cost function** which reads slot 4 as a raw multiplier. `4.52e74 * 3e9 / 1e6 = 1.36e78` — overflow.

## Why All Previous Fixes Failed

| Fix Attempted | Why It Failed |
|---|---|
| `setGasConfig(2100, 1000000)` on SystemConfig | Sets Bedrock values BUT `scalar()` getter still returns Ecotone-encoded uint256 |
| `setGasConfigEcotone(0, 0)` | Sets Ecotone scalars to 0, but Bedrock fallback triggers when blobBaseFee=0 |
| Set blobBaseFee=1 in genesis | Ecotone not enabled in rollup config → Bedrock path still used |
| Enable ecotone_time=0 in rollup | op-geth returns "Unsupported fork" (L2 genesis chain config doesn't have Ecotone) |
| Regenerate L2 allocs | `L2Genesis.s.sol` reads `scalar()` which returns Ecotone-encoded value |
| Patch rollup_cost.go | Patch checked wrong storage slot |

## The Fix

**Option A (Recommended): Disable ALL post-Regolith forks**

Remove Canyon, Delta, Ecotone from deploy config:
```json
{
    "l2GenesisCanyonTimeOffset": null,
    "l2GenesisDeltaTimeOffset": null,
    "gasPriceOracleOverhead": 2100,
    "gasPriceOracleScalar": 1000000,
    "gasPriceOracleBaseFeeScalar": 0,
    "gasPriceOracleBlobBaseFeeScalar": 0
}
```

Then regenerate L2 allocs. Without Canyon/Delta/Ecotone, the SystemConfig stores scalar as a raw uint256 (not Ecotone-encoded), and the Bedrock cost function reads it correctly.

**Option B: Manually set slot 4 in L2 genesis**

After `op-node genesis l2` generates the L2 genesis, manually override slot 4 of the L1Block predeploy:
```python
g["alloc"]["4200000000000000000000000000000000000015"]["storage"]["0x...04"] = "0x...0f4240"  # 1000000
```

This overrides the Ecotone-encoded value with the raw Bedrock scalar. But op-node may overwrite this with the L1 SystemConfig values on the first L2 block.

**Option C: Patch SystemConfig.scalar() to return raw value**

Modify the SystemConfig Solidity contract to return `overhead` and `scalar` as raw uint256 values (not Ecotone-encoded). Then redeploy SystemConfig implementation and regenerate allocs.

## Current State

- L1: 3-validator Parlia, block 7000+, 300M gas, 167 TPS measured, CLEAN
- L2: op-geth + op-node running, producing blocks, 10B BESA funded
- L2 gas: overflow `1.9e78` persists due to Ecotone scalar encoding in L1Block slot 4
- SystemConfig on L1: overhead=2100, scalar=1000000 (set via setGasConfig)
- L1Block on L2: slot 3=0, slot 4=`7.1e47` (batcher address, NOT scalar)

## Files

- Deploy config: `opbnb/packages/contracts-bedrock/deploy-config/besachain.json`
- L2 allocs: `opbnb/packages/contracts-bedrock/state-dump-19120-fjord.json`
- L1 deployments: `opbnb/packages/contracts-bedrock/deployments/14440-deploy.json`
- Patched op-geth: `/tmp/besachain-l2-geth-fixed` (rollup_cost.go patch)
- Patched BSC geth: `/tmp/besachain-geth-allpatches` (non-fatal system TXs)
- op-node: `/tmp/op-node`
- Flood tool: `/tmp/flood2`

## Systemd Services (DISABLED)

7 systemd services were auto-restarting old binaries with old configs. ALL have been stopped and disabled:
- besachain-l1, besachain-l2, besachain-op-node
- besachain-parlia-l1, besachain-testnet-l1, besachain-testnet-l2, besachain-testnet-op-node
