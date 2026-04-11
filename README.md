# BesaChain Smart Contracts

BesaChain is an L1+L2 blockchain ecosystem with high gas limits for maximum throughput.

## Chain Configuration

| Parameter | L1 (BSC Geth) | L2 (op-geth) |
|-----------|---------------|--------------|
| Chain ID | 1444 | 1445 |
| Gas Limit | 1,000,000,000 (1B) | 100,000,000 (100M) |
| RPC Endpoint | http://54.235.85.175:8545 | http://54.235.85.175:9545 |
| Consensus | Clique (PoA) | Optimism Rollup |
| Block Time | 1 second | 1 second |

## Contract Architecture

### Core Contracts

```
besachain/
├── contracts/
│   ├── token/
│   │   └── BesaToken.sol          # BESA governance token
│   ├── dex/
│   │   ├── BesaFactory.sol        # DEX factory
│   │   ├── BesaPair.sol           # Trading pair
│   │   └── BesaERC20.sol          # LP token base
│   ├── bridge/
│   │   └── BesaBridgeRelayer.sol  # L1<->L2 bridge
│   └── ...
└── scripts/
    ├── deploy-besachain.sh        # Deployment script
    └── measure-tps.sh             # TPS measurement
```

### Token Distribution (BESA)

| Allocation | Amount | Percentage |
|------------|--------|------------|
| Treasury | 400M | 40% |
| Ecosystem Fund | 350M | 35% |
| Liquidity Mining | 250M | 25% |
| **Total Supply** | **1B** | **100%** |

## Quick Start

### Check Chain Status

```bash
# L1 Status
curl -X POST http://54.235.85.175:8545 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# L2 Status
curl -X POST http://54.235.85.175:9545 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### Measure TPS

```bash
cd /Users/senton/besachain
./scripts/measure-tps.sh
```

### Deploy Contracts

```bash
cd /Users/senton/besachain
./scripts/deploy-besachain.sh
```

## TPS Capacity

| Chain | Gas Limit | Theoretical TPS (Simple Transfer) |
|-------|-----------|-----------------------------------|
| L1 | 1,000,000,000 | ~47,619 TPS |
| L2 | 100,000,000 | ~4,762 TPS |

*Based on 21,000 gas per simple transfer*

## Differences from LibyaChain/LYDX

1. **Chain IDs**: Updated to 1444 (L1) and 1445 (L2)
2. **Gas Limits**: Optimized for 1B (L1) and 100M (L2)
3. **Naming**: LYDX -> BESA, LibyaChain -> BesaChain
4. **Bridge**: Configured for L1<->L2 communication
5. **Token**: Same distribution, different name/symbol

## License

MIT
