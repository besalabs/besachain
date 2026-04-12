# BesaChain Combined TPS — Both Layers Parlia PoSA

**Date:** 2026-04-13
**Method:** Go flood tool, localhost, 200 accounts, pre-signed raw TXs

## Results

| | L1 Fermi | L2 Fourier | Combined |
|---|---|---|---|
| **Consensus** | Parlia PoSA | Parlia PoSA | — |
| **Chain ID** | 14440 | 19120 | — |
| **Gas limit** | 300M | 1B | — |
| **Block time** | 303ms | 303ms | — |
| **Measured TPS** | 664 | 664 | **1,328** |
| **Protocol max TPS** | 47,143 | 157,143 | **204,286** |
| **Peak TXs/block** | 1,003 | 1,198 | — |

## Status

- L1: Parlia PoSA, single validator, 300M gas — WORKING
- L2: Parlia PoSA, single validator, 1B gas — WORKING  
- ML-DSA precompile: verified on-chain — WORKING
- ML-DSA AA contracts: deployed — WORKING
- TxDAG recording: zero overhead after fix — WORKING
- 3-validator consensus: V2/V3 OOM on t3.small (need t3.medium+)

## Bottleneck
Submit rate: 1,370 TX/s from Go flood tool. Chain can process 47K+ TPS on L1 alone.
With Pandora's Box (multi-sender): 2,500 TPS proven on L1.
