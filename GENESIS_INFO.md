# BesaChain L1 Testnet Genesis

**Status:** ✓ Complete - Genesis initialized successfully

## Network Details
- **Chain ID:** 14440 (L1 Testnet)
- **Consensus:** Parlia PoSA (Proof of Staked Authority)
- **Gas Limit:** 0x8F0D180 (150,000,000 wei)
- **Genesis Hash:** 0x4ee3648078b061ca2afa8a8ba2f6e5564a82b93f8a9cbe193d089ff98014ca0c

## Fork Configuration
All EVM forks active from genesis (block 0 / timestamp 0):
- Homestead, EIP150, EIP155, EIP158
- Byzantium, Constantinople, Petersburg
- Istanbul, MuirGlacier, Berlin, London
- Shanghai (with Kepler, Feynman, FeynmanFix, Cancun, Haber, HaberFix, Bohr, Pascal)
- Prague, Lorentz, Maxwell, Fermi, Osaka, Mendel
- BPO1, BPO2

## Validator Addresses

### Validator 1
```
0x07eA646728edbFaf665d1884894F53C2bE2dD609
Key: deploy/validator-keys/validator-1/
Balance: 10,000 BESA (1e22 wei)
```

### Validator 2
```
0x3e3084b8577bec36B6d85233b4bB7e507449B6B3
Key: deploy/validator-keys/validator-2/
Balance: 10,000 BESA (1e22 wei)
```

### Validator 3
```
0x91b14DE6832Ecc6dc6e0506F89e0d3f6DE6605C0
Key: deploy/validator-keys/validator-3/
Balance: 10,000 BESA (1e22 wei)
```

## Deployer Account
```
0x3Bc15a38575afdBe77C3e20632BB22F1c0B8d686
Key: deploy/validator-keys/deployer/
Balance: 1,000,000 BESA (1e24 wei)
```

## Genesis File
- **Location:** `/Users/senton/besachain/genesis/testnet-l1-14440.json`
- **Format:** Parlia PoSA with validator set in extraData
- **Verified:** `geth init` passes successfully

## Chain Config
- **Location:** `/Users/senton/besachain/bsc/params/besachain_config.go`
- **Includes:** BesaChainTestnetConfig and BesaChainMainnetConfig
- **Integration:** Integrated into params package with Mainnet defaults for blob schedules

## Keystore Access
All validator keys are encrypted with password: `besachain-testnet`

To import into validator:
```bash
cp -r deploy/validator-keys/validator-N/keystore /path/to/node/data/keystore
# Validator will read keystore and unlock with keystore password
```
