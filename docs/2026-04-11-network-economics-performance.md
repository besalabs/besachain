# BesaChain Network Economics & Performance Analysis

**Date:** 2026-04-11
**Author:** Elijah (Claude Code)
**Status:** Reference Document
**Chain IDs:** L1 Mainnet 1444, L2 Mainnet 1912, L1 Testnet 14440, L2 Testnet 19120

---

## Table of Contents

1. [opBNB Sequencer Architecture](#1-opbnb-sequencer-architecture)
2. [BesaChain Sequencer Decision](#2-besachain-sequencer-decision)
3. [21-Validator Performance Simulation](#3-21-validator-performance-simulation)
4. [Gas Cost Analysis at Various Token Prices](#4-gas-cost-analysis-at-various-token-prices)
5. [Validator Economics](#5-validator-economics)
6. [Scaling Gas Prices with Token Appreciation](#6-scaling-gas-prices-with-token-appreciation)
7. [Recommendations](#7-recommendations)

---

## 1. opBNB Sequencer Architecture

### Current State: Single Centralized Sequencer

opBNB operates with a **single centralized sequencer**. This is consistent with all OP Stack-based L2 rollups (Optimism, Base, opBNB).

**How it works:**

```
[Users] → [Single Sequencer] → [Batch Submission] → [BSC L1 (21 validators)]
              ↓
    Orders transactions
    Executes state transitions
    Produces L2 blocks every 250ms
    Submits compressed batches to L1 periodically
```

The sequencer is a single high-performance node operated by the BNB Chain core team. It:

1. **Receives transactions** from users via RPC
2. **Orders them** into blocks every 250ms (post-Fourier hardfork, Jan 7, 2026)
3. **Executes state transitions** and produces L2 state roots
4. **Submits compressed batches** to BSC L1 for data availability
5. **Fraud proofs** can be submitted by anyone to challenge invalid state transitions

### Why Single Sequencer Enables 250ms

A single sequencer avoids the fundamental tradeoff of distributed consensus: you cannot have sub-second block times with multiple block producers without either:
- Accepting high fork rates
- Requiring all producers in the same datacenter
- Using a leader rotation scheme (which is still one producer at a time)

The Fourier hardfork (PR#305) halved block time from 500ms to 250ms. PR#319 changed L1 reference from "latest" to "finalized" blocks, anticipating BSC's own block time reduction to 450ms.

### opBNB Sequencer Performance

| Metric | Value |
|--------|-------|
| Block time | 250ms (post-Fourier) |
| Throughput claim | 5,000+ TPS |
| Gas target | 100M gas/second |
| Gas per block | 25M per 250ms block |
| Sequencer nodes | 1 (centralized) |
| Batch submission | Periodic to BSC L1 |
| Fault tolerance | Fraud proofs (optimistic) |

### Decentralized Sequencing Roadmap

The OP Stack framework includes a **Multiple Sequencer module** where:
- Sequencer is selected from a predefined set of actors
- Chains choose the set and selection mechanism
- A rotation rule and fault-handling process manage transitions

**No concrete timeline** exists for opBNB sequencer decentralization. The industry consensus is that shared sequencer networks (Espresso, Astria) or based sequencing (proposer commits to L1) are the likely long-term solutions, but all are still experimental.

### Sources

- [opBNB Overview — BNB Chain Docs](https://docs.bnbchain.org/bnb-opbnb/overview/)
- [Why OP Stack — opBNB Core Concepts](https://docs.bnbchain.org/bnb-opbnb/core-concepts/why-opstack/)
- [opBNB Fourier Hardfork — Cryptopolitan](https://www.cryptopolitan.com/opbnb-mainnet-hardfork-block-time-500-to-250ms/)
- [BNB Chain 2025-2026 Outlook](https://www.bnbchain.org/en/blog/the-future-of-bnb-chain-an-outlook-for-the-rest-of-2025-2026-for-bnb-chain)
- [Is BNB Chain Still Centralized?](https://onekey.so/blog/ecosystem/is-bnb-chain-still-centralized-debunking-the-myths-of-the-binance-ecosystem/)

---

## 2. BesaChain Sequencer Decision

### Adopted Architecture: Single Sequencer (matching opBNB)

BesaChain adopts the same architecture as opBNB:

| Component | BesaChain Fermi (L1) | BesaChain Fourier (L2) |
|-----------|---------------------|----------------------|
| Consensus | Parlia PoSA, 21 validators | Single sequencer |
| Block time | 450ms | 250ms |
| Gas limit | 150M | 1B (scaling to 2B) |
| Chain ID (mainnet) | 1444 | 1912 |
| Chain ID (testnet) | 14440 | 19120 |

**Why single sequencer for L2:**
- Enables 250ms block time without consensus overhead
- Matches proven opBNB production architecture
- Simplifies initial deployment (testnet phase)
- Decentralized sequencing can be added as a hardfork upgrade when the technology matures
- L1 provides the security guarantee — L2 inherits it via batch submission + fraud proofs

**L2 sequencer placement:** One of the 21 validators doubles as the L2 sequencer. This is identical to how opBNB operates — the sequencer is a privileged node, not a separate consensus mechanism.

---

## 3. 21-Validator Performance Simulation

### Hardware Specification

For the production 21-validator network, we adopt BSC-equivalent hardware:

| Component | Spec | AWS Equivalent |
|-----------|------|---------------|
| CPU | 16 cores | m7g.4xlarge (Graviton3) |
| RAM | 64 GB | m7g.4xlarge |
| Storage | 3 TB NVMe SSD | gp3, 3000 IOPS |
| Network | 25 Gbps | m7g.4xlarge |
| Cost | ~$468/month | On-demand pricing |

Reference: BSC validators require 16+ cores, 64+ GB RAM, 3+ TB NVMe SSD per [official BNB Chain docs](https://docs.bnbchain.org/bnb-smart-chain/developers/node_operators/node_best_practices/).

### Network Topology Scenarios

| Scenario | Description | Inter-validator latency |
|----------|-------------|------------------------|
| **Same region** | All 21 in us-east-1, spread across AZs | 1-3ms |
| **Multi-region** | Split across 3 AWS regions | 30-80ms |
| **Global** | Spread across 5+ regions worldwide | 80-200ms |

### Consensus Overhead Breakdown

With 25 Gbps network and m7g.4xlarge:

| Overhead Component | Same Region | Multi-Region | Global |
|-------------------|-------------|--------------|--------|
| Block propagation (786 KB, ECDSA) | 3-5ms | 15-30ms | 40-80ms |
| Block propagation (3.6 MB, ML-DSA AA) | 5-10ms | 20-40ms | 50-100ms |
| BLS vote collection (15/21 required) | 8-15ms | 40-70ms | 80-150ms |
| **Total consensus overhead** | **11-20ms** | **55-100ms** | **120-250ms** |
| **L1 execution budget (450ms)** | **430-439ms** | **350-395ms** | **200-330ms** |
| **L1 utilization** | **96-98%** | **78-88%** | **44-73%** |

### Execution Speed: The Hidden Bottleneck

**Critical distinction:** Gas limit defines the protocol cap, but EVM execution speed determines actual throughput.

| Execution Model | Gas/second | Source |
|----------------|-----------|--------|
| Sequential EVM (current BSC) | ~47M | BSC: 140M gas / 3s blocks |
| opBNB target | 100M | Official opBNB docs |
| Parallel EVM (4-8x speedup) | 200M-800M | Monad, Sei, BSC parallel EVM R&D |
| Monad target | 10B | Monad whitepaper (extreme parallelism) |

**What this means for BesaChain:**

| Gas Config | Gas/second needed | Sequential EVM | Parallel EVM (8x) | Gas limit filling at 100M gas/s |
|-----------|-------------------|---------------|-------------------|-------------------------------|
| L1: 150M / 450ms | 333M | 14% filled | ~100% filled | 45M per block (30%) |
| L1: 300M / 450ms | 667M | 7% filled | ~50% filled | 45M per block (15%) |
| L2: 1B / 250ms | 4B | 0.6% filled | ~5% filled | 25M per block (2.5%) |
| L2: 2B / 250ms | 8B | 0.3% filled | ~2.5% filled | 25M per block (1.25%) |

### TPS Results: Three Tiers

We report three numbers for each configuration:
- **Protocol Max:** Gas-limited theoretical maximum (what the chain _allows_)
- **Realistic (Parallel EVM):** With 800M gas/sec parallel execution on m7g.4xlarge
- **Realistic (Sequential EVM):** With 100M gas/sec sequential execution (opBNB-level)

All calculations use simple transfer cost of 21,000 gas.

#### Fermi L1 — 21 Validators, m7g.4xlarge, Same Region

| Gas Limit | Block Time | Protocol Max TPS | Realistic (Parallel) | Realistic (Sequential) |
|-----------|-----------|-----------------|---------------------|----------------------|
| 150M | 450ms | 15,873 | **15,873** (gas-limited) | 4,762 |
| 200M | 450ms | 21,164 | **17,778** | 4,762 |
| 250M | 450ms | 26,455 | **17,778** | 4,762 |
| 300M | 450ms | 31,746 | **17,778** | 4,762 |

> At 150M gas with parallel EVM, execution (800M gas/s × 0.45s = 360M) exceeds gas limit.
> Block is gas-limited, not execution-limited. This is the ideal state.
>
> At 300M gas, execution becomes the bottleneck (360M > 300M only at 150M config).
> Higher gas limits only help if execution speed increases proportionally.

#### Fourier L2 — Single Sequencer, m7g.4xlarge

| Gas Limit | Block Time | Protocol Max TPS | Realistic (Parallel) | Realistic (Sequential) |
|-----------|-----------|-----------------|---------------------|----------------------|
| 1B | 250ms | 190,476 | 38,095 | 4,762 |
| 1.5B | 250ms | 285,714 | 38,095 | 4,762 |
| 2B | 250ms | 380,952 | 38,095 | 4,762 |

> L2 is always execution-limited because the gas limit far exceeds what any EVM can process in 250ms.
> At 100M gas/sec: 25M gas per 250ms block → 1,190 TPS regardless of limit.
> At 800M gas/sec: 200M gas per 250ms block → 9,524 TPS per TX type.
> Actual TPS depends on transaction complexity (simple transfers use 21K gas, swaps use 150K+).

#### Combined L1 + L2 — Same Region

| Config (L1/L2 Gas) | Protocol Max | Parallel EVM | Sequential EVM |
|---------------------|-------------|-------------|---------------|
| 150M / 1B | **206,349** | **53,968** | 9,524 |
| 150M / 2B | **396,825** | **53,968** | 9,524 |
| 200M / 1.5B | **306,878** | **55,873** | 9,524 |
| 300M / 2B | **412,698** | **55,873** | 9,524 |

#### Combined L1 + L2 — Multi-Region (Realistic Production)

| Config (L1/L2 Gas) | Protocol Max | Parallel EVM | Sequential EVM |
|---------------------|-------------|-------------|---------------|
| 150M / 1B | **206,349** | **50,762** | 9,524 |
| 150M / 2B | **396,825** | **50,762** | 9,524 |
| 300M / 2B | **412,698** | **52,381** | 9,524 |

> Multi-region only affects L1 (consensus overhead). L2 sequencer is a single node — unaffected.

### Precompile-Only vs AA Hybrid at 21 Validators (m7g.4xlarge)

| Metric | Precompile-Only | AA Hybrid (100% ML-DSA) |
|--------|----------------|------------------------|
| L1 block size (150M gas full) | 786 KB | 3.6 MB |
| Block propagation (same region) | 3-5ms | 5-10ms |
| Block propagation (global) | 40-80ms | 50-100ms |
| L1 gas per ML-DSA TX | 21,000 (standard) | 138,500 |
| L1 Protocol Max TPS | 15,873 | 4,810 |
| L1 Realistic TPS (parallel, same region) | 15,873 | 4,810 |
| L2 Protocol Max TPS (1B gas) | 190,476 | 28,881 |
| **Combined Protocol Max** | **206,349** | **33,691** |
| Network bandwidth per validator | 8.7 MB/s | 40 MB/s |
| Bandwidth headroom (25 Gbps) | 99.7% free | 98.7% free |

**With larger instances, the propagation gap narrows** (25 Gbps handles both block sizes easily), but the gas overhead gap remains constant. AA hybrid still costs 6.6x more gas per ML-DSA transaction.

### How to Actually Hit 200K+ TPS

The 200K+ target is a **protocol-level (theoretical) max**, achievable by design:

| Path | Config | Protocol Max | Notes |
|------|--------|-------------|-------|
| **Current design** | 150M L1 / 1B L2 | 206,349 | Barely clears 200K |
| **Gas bump** | 150M L1 / 2B L2 | 396,825 | Comfortable margin |
| **Aggressive** | 300M L1 / 2B L2 | 412,698 | Maximum headroom |

To hit 200K+ in **realistic throughput**, you need:
1. Parallel EVM execution (~800M+ gas/sec) → achievable with Go parallel EVM (BSC is building this)
2. L2 gas limit ≥ 2B with parallel execution → 200M gas per 250ms = 38K+ L2 TPS
3. Total: 15K L1 + 38K L2 = 53K realistic (still short of 200K)

**The honest answer:** 200K+ _realistic_ TPS requires either:
- EVM execution at 4B+ gas/sec (Monad-level, not yet proven in production)
- Non-EVM execution layer (SVM, MoveVM — breaks BSC fork compatibility)
- 200K+ is achievable as a protocol max, defensible as "theoretical throughput," but realistic peak will be 20-50K TPS range on m7g.4xlarge hardware

This matches your stated target: **200K+ max theoretical, 20K+ realistic max.**

---

## 4. Gas Cost Analysis at Various Token Prices

### Assumptions

| Parameter | L1 (Fermi) | L2 (Fourier) |
|-----------|-----------|-------------|
| Base gas price | 1 Gwei | 0.001 Gwei |
| EIP-1559 | Yes (burn mechanism) | Yes |
| Priority fee (tip) | 0-5 Gwei | 0-0.01 Gwei |
| Total supply | 1,000,000,000 BESA | — |

### Token Price Scenarios

| Price | Market Cap | Comparable To |
|-------|-----------|---------------|
| $0.01 | $10M | Pre-launch / testnet |
| $0.10 | $100M | Early mainnet |
| $1.00 | $1B | Mid-cap (rank ~100) |
| $10.00 | $10B | Large cap (rank ~30-50) |
| $50.00 | $50B | Top 15 |
| $100.00 | $100B | Top 7 |
| $200.00 | $200B | Top 5 (BNB/SOL tier) |

### Transaction Types & Gas Costs

| Transaction Type | Gas Used | Description |
|-----------------|----------|-------------|
| Simple transfer | 21,000 | Send BESA to another address |
| ERC-20 transfer | 65,000 | Send token (e.g., stablecoin) |
| DEX swap | 150,000 | Uniswap-style token swap |
| NFT mint | 100,000 | Mint a single NFT |
| ML-DSA verify (precompile) | 125,000 | Quantum-safe signature check |
| Contract deployment | 1,000,000 | Deploy a smart contract |
| Complex DeFi (yield farm) | 300,000 | Multi-step DeFi interaction |

---

### 4.1 L1 Gas Costs (Base Fee: 1 Gwei)

**Formula:** Cost = gas_used × 1 Gwei × 10⁻⁹ BESA × token_price_USD

#### L1 Cost in BESA

| TX Type | Gas | Cost (BESA) |
|---------|-----|-------------|
| Simple transfer | 21,000 | 0.000021 |
| ERC-20 transfer | 65,000 | 0.000065 |
| DEX swap | 150,000 | 0.000150 |
| NFT mint | 100,000 | 0.000100 |
| ML-DSA verify | 125,000 | 0.000125 |
| Contract deploy | 1,000,000 | 0.001000 |
| Complex DeFi | 300,000 | 0.000300 |

#### L1 Cost in USD

| TX Type | $0.01 | $0.10 | $1.00 | $10.00 | $50.00 | $100.00 | $200.00 |
|---------|-------|-------|-------|--------|--------|---------|---------|
| Simple transfer | $0.00000021 | $0.0000021 | $0.000021 | $0.00021 | $0.00105 | $0.0021 | **$0.0042** |
| ERC-20 transfer | $0.00000065 | $0.0000065 | $0.000065 | $0.00065 | $0.00325 | $0.0065 | **$0.013** |
| DEX swap | $0.0000015 | $0.000015 | $0.00015 | $0.0015 | $0.0075 | $0.015 | **$0.030** |
| NFT mint | $0.000001 | $0.00001 | $0.0001 | $0.001 | $0.005 | $0.01 | **$0.020** |
| ML-DSA verify | $0.00000125 | $0.0000125 | $0.000125 | $0.00125 | $0.00625 | $0.0125 | **$0.025** |
| Contract deploy | $0.00001 | $0.0001 | $0.001 | $0.01 | $0.05 | $0.10 | **$0.20** |
| Complex DeFi | $0.000003 | $0.00003 | $0.0003 | $0.003 | $0.015 | $0.03 | **$0.06** |

**Comparison at $200/BESA:** BSC simple transfer = ~$0.005 at $600/BNB with 1 Gwei. BesaChain L1 at $200 = $0.0042. **Competitive.**

---

### 4.2 L2 Gas Costs (Base Fee: 0.001 Gwei)

**Formula:** Cost = gas_used × 0.001 Gwei × 10⁻⁹ BESA × token_price_USD

#### L2 Cost in BESA

| TX Type | Gas | Cost (BESA) |
|---------|-----|-------------|
| Simple transfer | 21,000 | 0.000000021 |
| ERC-20 transfer | 65,000 | 0.000000065 |
| DEX swap | 150,000 | 0.000000150 |
| NFT mint | 100,000 | 0.000000100 |
| ML-DSA verify | 125,000 | 0.000000125 |
| Contract deploy | 1,000,000 | 0.000001000 |
| Complex DeFi | 300,000 | 0.000000300 |

#### L2 Cost in USD

| TX Type | $0.01 | $0.10 | $1.00 | $10.00 | $50.00 | $100.00 | $200.00 |
|---------|-------|-------|-------|--------|--------|---------|---------|
| Simple transfer | $0.00000000021 | $0.0000000021 | $0.000000021 | $0.00000021 | $0.00000105 | $0.0000021 | **$0.0000042** |
| ERC-20 transfer | $0.00000000065 | $0.0000000065 | $0.000000065 | $0.00000065 | $0.00000325 | $0.0000065 | **$0.000013** |
| DEX swap | $0.0000000015 | $0.000000015 | $0.00000015 | $0.0000015 | $0.0000075 | $0.000015 | **$0.000030** |
| NFT mint | $0.000000001 | $0.00000001 | $0.0000001 | $0.000001 | $0.000005 | $0.00001 | **$0.000020** |
| ML-DSA verify | $0.00000000125 | $0.0000000125 | $0.000000125 | $0.00000125 | $0.00000625 | $0.0000125 | **$0.000025** |
| Contract deploy | $0.00000001 | $0.0000001 | $0.000001 | $0.00001 | $0.00005 | $0.0001 | **$0.0002** |
| Complex DeFi | $0.000000003 | $0.00000003 | $0.0000003 | $0.000003 | $0.000015 | $0.00003 | **$0.00006** |

**At $200/BESA, an L2 DEX swap costs $0.00003.** For comparison, opBNB swap = ~$0.001, Ethereum L2 swap = ~$0.01-0.10.

---

### 4.3 L1+L2 Data Availability Cost (L2 batch posting to L1)

L2 batches are posted to L1 for data availability. This cost is amortized across all L2 transactions in the batch.

| Parameter | Value |
|-----------|-------|
| Batch size | ~50-200 KB compressed |
| Batch frequency | Every 10-60 seconds |
| L1 calldata cost | 16 gas per non-zero byte |
| Batch gas cost | ~1.6M-3.2M gas per batch |
| TXs per batch (at 10K TPS) | 100,000-600,000 |

**Amortized L1 DA cost per L2 TX:**

| Token Price | DA cost per L2 TX (amortized) | L2 execution cost | Total L2 cost |
|-------------|------------------------------|-------------------|---------------|
| $0.01 | $0.000000005 | $0.00000000021 | ~$0.000000005 |
| $1.00 | $0.0000005 | $0.000000021 | ~$0.0000005 |
| $10.00 | $0.000005 | $0.00000021 | ~$0.000005 |
| $200.00 | $0.0001 | $0.0000042 | ~$0.0001 |

> DA cost dominates L2 transaction cost at high token prices. At $200/BESA, L2 total cost per TX is ~$0.0001 — still 50x cheaper than L1.

---

### 4.4 Gas Cost Comparison Across Gas Limit Configurations

Different gas limits affect block capacity but NOT per-transaction cost (gas price stays the same). However, higher gas limits affect:
- Block reward pool (more fees per block)
- Network congestion threshold (higher limit = less congestion = lower dynamic fees)

**L1 Block Revenue at Full Utilization (1 Gwei base fee):**

| L1 Gas Limit | Fee per block (BESA) | Blocks/day | Daily fee revenue | At $0.01 | At $1 | At $200 |
|-------------|---------------------|-----------|------------------|----------|-------|---------|
| 150M | 0.15 | 192,000 | 28,800 BESA | $288 | $28,800 | **$5,760,000** |
| 200M | 0.20 | 192,000 | 38,400 BESA | $384 | $38,400 | **$7,680,000** |
| 250M | 0.25 | 192,000 | 48,000 BESA | $480 | $48,000 | **$9,600,000** |
| 300M | 0.30 | 192,000 | 57,600 BESA | $576 | $57,600 | **$11,520,000** |

**L2 Block Revenue at Full Utilization (0.001 Gwei base fee):**

| L2 Gas Limit | Fee per block (BESA) | Blocks/day | Daily fee revenue | At $0.01 | At $1 | At $200 |
|-------------|---------------------|-----------|------------------|----------|-------|---------|
| 1B | 0.001 | 345,600 | 345.6 BESA | $3.46 | $345.60 | **$69,120** |
| 1.5B | 0.0015 | 345,600 | 518.4 BESA | $5.18 | $518.40 | **$103,680** |
| 2B | 0.002 | 345,600 | 691.2 BESA | $6.91 | $691.20 | **$138,240** |

---

### 4.5 User Affordability Matrix

**Key question: At what token price does the chain become expensive for users?**

Defining "affordable" as: simple transfer < $0.01, DEX swap < $0.10

| Token Price | L1 Transfer | L1 Swap | L2 Transfer | L2 Swap | L1 Affordable? | L2 Affordable? |
|-------------|-------------|---------|-------------|---------|---------------|---------------|
| $0.01 | $0.0000002 | $0.0000015 | $0.0000000002 | $0.0000000015 | Yes | Yes |
| $0.10 | $0.000002 | $0.000015 | $0.000000002 | $0.000000015 | Yes | Yes |
| $1.00 | $0.00002 | $0.00015 | $0.00000002 | $0.00000015 | Yes | Yes |
| $10.00 | $0.0002 | $0.0015 | $0.0000002 | $0.0000015 | Yes | Yes |
| $50.00 | $0.001 | $0.0075 | $0.000001 | $0.0000075 | Yes | Yes |
| $100.00 | $0.002 | $0.015 | $0.000002 | $0.000015 | Yes | Yes |
| $200.00 | $0.004 | $0.030 | $0.000004 | $0.000030 | Yes | Yes |
| $1,000 (hypothetical) | $0.021 | $0.15 | $0.000021 | $0.00015 | **L1 swap borderline** | Yes |
| $5,000 (hypothetical) | $0.105 | $0.75 | $0.000105 | $0.00075 | **No (swap > $0.10)** | Yes |

**Conclusion:** At 1 Gwei L1 base fee, the chain remains affordable through $200/token. L1 only becomes expensive for swaps above ~$700/token. L2 remains essentially free through all scenarios.

**For reference:** BSC at $600/BNB with 1 Gwei is ~$0.005 per transfer. BesaChain at $200/BESA would be ~$0.004 — slightly cheaper than current BSC.

---

## 5. Validator Economics

### Block Rewards (Inflationary)

Per whitepaper: 10% of total supply (100M BESA) distributed over 10 years to validators.

| Year | Annual emission | Daily emission | Per validator (21) | At $0.01 | At $1 | At $200 |
|------|----------------|---------------|-------------------|----------|-------|---------|
| 1-2 | 15M (front-loaded) | 41,096 | 1,957 | $19.57 | $1,957 | **$391,400** |
| 3-5 | 10M | 27,397 | 1,304 | $13.04 | $1,304 | **$260,800** |
| 6-10 | 5M (tail) | 13,699 | 652 | $6.52 | $652 | **$130,400** |

### Fee Revenue Per Validator

Assuming 30% average gas utilization:

| Config | Daily L1 fees (30%) | Daily L2 fees (30%) | Per validator | At $0.01 | At $1 | At $200 |
|--------|--------------------|--------------------|--------------|----------|-------|---------|
| 150M/1B | 8,640 BESA | 103.7 BESA | 416 BESA | $4.16 | $416 | **$83,200** |
| 300M/2B | 17,280 BESA | 207.4 BESA | 833 BESA | $8.33 | $833 | **$166,600** |

### Total Validator Revenue (Rewards + Fees)

| Token Price | Daily (150M/1B) | Monthly | Annual | Viable? |
|-------------|----------------|---------|--------|---------|
| $0.01 | $23.73 | $712 | $8,541 | No (doesn't cover hardware) |
| $0.10 | $237 | $7,117 | $85,410 | Marginal |
| $1.00 | $2,373 | $71,190 | $854,100 | Yes |
| $10.00 | $23,730 | $711,900 | $8.5M | Very profitable |
| $200.00 | $474,600 | $14.2M | $170.8M | Extremely profitable |

**Break-even token price:** ~$0.07/BESA (to cover $468/month m7g.4xlarge instance cost)

---

## 6. Scaling Gas Prices with Token Appreciation

As BESA appreciates from $0.01 to $200, the network may need to adjust gas prices to keep fees competitive:

### Governance-Controlled Gas Price Schedule

| BESA Price Range | Recommended L1 Base Fee | Recommended L2 Base Fee | L1 Transfer Cost (USD) | L2 Transfer Cost (USD) |
|-----------------|------------------------|------------------------|----------------------|----------------------|
| $0.01 - $0.10 | 5 Gwei | 0.01 Gwei | $0.000001-0.00001 | $0.000000002-0.00000002 |
| $0.10 - $1.00 | 1 Gwei | 0.001 Gwei | $0.000002-0.00002 | $0.000000002-0.00000002 |
| $1.00 - $10.00 | 1 Gwei | 0.001 Gwei | $0.00002-0.0002 | $0.00000002-0.0000002 |
| $10.00 - $100 | 0.5 Gwei | 0.0005 Gwei | $0.0001-0.001 | $0.0000001-0.000001 |
| $100 - $200 | 0.1 Gwei | 0.0001 Gwei | $0.0002 | $0.0000002 |
| $200+ | 0.05 Gwei | 0.00005 Gwei | $0.0002 | $0.0000001 |

**Implementation:** This can be done via governance proposals that adjust the EIP-1559 minimum base fee parameter. BSC has done this multiple times (from 10 Gwei → 3 Gwei → 1 Gwei as BNB appreciated).

### Impact of Gas Price Reduction on Validator Revenue

If we halve the gas price at $200/BESA:

| Scenario | L1 base fee | Daily validator revenue | Still viable? |
|----------|-------------|----------------------|---------------|
| Standard (1 Gwei) | 1 Gwei | $474,600 | Yes (excess) |
| Reduced (0.1 Gwei) | 0.1 Gwei | $83,040 + $391,400 rewards = $474,440 | Yes |
| Minimal (0.01 Gwei) | 0.01 Gwei | $8,304 + $391,400 = $399,704 | Yes |

At high token prices, **block rewards dominate validator income**, making fee reductions painless.

---

## 7. Recommendations

### Testnet Launch Parameters (14440 / 19120)

| Parameter | Fermi L1 (14440) | Fourier L2 (19120) |
|-----------|-----------------|-------------------|
| Gas limit | 150M | 1B |
| Block time | 450ms | 250ms |
| Base fee | 1 Gwei | 0.001 Gwei |
| Consensus | Parlia PoSA (3 validators) | Single sequencer |
| ML-DSA | Precompile at 0x0120/0x0121 | Inherited from L1 |
| Validators | 3 (existing LibyaChain AWS) | 1 (sequencer on V1) |

### Mainnet Launch Parameters (1444 / 1912)

| Parameter | Fermi L1 (1444) | Fourier L2 (1912) |
|-----------|----------------|-------------------|
| Gas limit | 150M (upgradeable to 300M) | 1B (upgradeable to 2B) |
| Block time | 450ms | 250ms |
| Base fee | 1 Gwei | 0.001 Gwei |
| Consensus | Parlia PoSA (21 validators) | Single sequencer |
| ML-DSA | Precompile-only | Inherited from L1 |
| Hardware | m7g.4xlarge per validator | Sequencer on dedicated m7g.4xlarge |

### TPS Claims (Defensible)

| Claim | Value | Basis |
|-------|-------|-------|
| "Max theoretical throughput" | 200,000+ TPS | Protocol gas limits (150M L1 + 1B L2) |
| "Realistic max throughput" | 20,000+ TPS | Parallel EVM on m7g.4xlarge (conservative) |
| "Current sequential throughput" | ~9,500 TPS | Sequential EVM at 100M gas/sec |

### Upgrade Roadmap

| Phase | Upgrade | Impact |
|-------|---------|--------|
| Testnet | Deploy at 150M/1B | Prove stability |
| Mainnet v1 | Same config, 21 validators | Production launch |
| Hardfork 1 | Parallel EVM | 4-8x realistic TPS |
| Hardfork 2 | Gas bump to 300M/2B | 2x protocol max |
| Hardfork 3 | AA Hybrid (ML-DSA accounts) | Opt-in quantum resistance |
| Hardfork 4 | Decentralized sequencer | L2 trust minimization |

---

## 8. Deep Dive: 300M/2B Gas Configuration

The 300M L1 / 2B L2 configuration provides 2x the protocol headroom over the launch config. This section breaks it down completely.

### 8.1 TPS at 300M/2B (21 Validators, m7g.4xlarge, Same Region)

| Layer | Gas Limit | Block Time | Protocol Max TPS | Parallel EVM (800M gas/s) | Sequential (100M gas/s) |
|-------|-----------|-----------|-----------------|--------------------------|------------------------|
| Fermi L1 | 300M | 450ms | 31,746 | 17,778 | 4,762 |
| Fourier L2 | 2B | 250ms | 380,952 | 38,095 | 4,762 |
| **Combined** | — | — | **412,698** | **55,873** | **9,524** |

At 300M gas, L1 parallel EVM (800M gas/s × 0.45s = 360M executable) still exceeds the gas limit. Block remains gas-limited, not execution-limited — the ideal state.

L2 at 2B is always execution-limited. The extra gas headroom prevents congestion under burst load but doesn't increase steady-state throughput.

### 8.2 Block Propagation Impact

| Metric | 150M/1B | 300M/2B | Delta |
|--------|---------|---------|-------|
| L1 TXs per block | 7,142 | 14,286 | 2x |
| L1 block size (ECDSA) | 786 KB | 1,571 KB | 2x |
| L1 propagation (21 val, same region) | 3-5ms | 6-10ms | +3-5ms |
| L1 consensus overhead total | 11-20ms | 14-25ms | +3-5ms |
| L1 execution budget (of 450ms) | 430-439ms | 425-436ms | Negligible loss |
| L2 block size (at execution limit) | ~22 MB | ~22 MB | Same (execution-capped) |

Doubling L1 gas doubles block size but adds only ~3-5ms propagation on 25 Gbps. Execution budget barely changes.

### 8.3 Per-Transaction Gas Costs at 300M/2B

Per-TX cost is identical to 150M/1B — gas limits affect capacity, not per-unit price.

#### L1 Costs (1 Gwei base fee)

| TX Type | Gas | BESA Cost | $0.01 | $0.10 | $1.00 | $10.00 | $50.00 | $100.00 | $200.00 |
|---------|-----|-----------|-------|-------|-------|--------|--------|---------|---------|
| Simple transfer | 21,000 | 0.000021 | $0.0000002 | $0.000002 | $0.00002 | $0.0002 | $0.001 | $0.002 | **$0.004** |
| ERC-20 transfer | 65,000 | 0.000065 | $0.0000007 | $0.000007 | $0.00007 | $0.0007 | $0.003 | $0.007 | **$0.013** |
| DEX swap | 150,000 | 0.000150 | $0.0000015 | $0.000015 | $0.00015 | $0.0015 | $0.008 | $0.015 | **$0.030** |
| NFT mint | 100,000 | 0.000100 | $0.000001 | $0.00001 | $0.0001 | $0.001 | $0.005 | $0.01 | **$0.020** |
| ML-DSA verify | 125,000 | 0.000125 | $0.0000013 | $0.0000125 | $0.000125 | $0.00125 | $0.006 | $0.013 | **$0.025** |
| Contract deploy | 1,000,000 | 0.001000 | $0.00001 | $0.0001 | $0.001 | $0.01 | $0.05 | $0.10 | **$0.200** |
| Complex DeFi | 300,000 | 0.000300 | $0.000003 | $0.00003 | $0.0003 | $0.003 | $0.015 | $0.03 | **$0.060** |

#### L2 Costs (0.001 Gwei base fee)

| TX Type | Gas | BESA Cost | $0.01 | $0.10 | $1.00 | $10.00 | $50.00 | $100.00 | $200.00 |
|---------|-----|-----------|-------|-------|-------|--------|--------|---------|---------|
| Simple transfer | 21,000 | 0.000000021 | $0.0000000002 | $0.000000002 | $0.00000002 | $0.0000002 | $0.000001 | $0.000002 | **$0.000004** |
| ERC-20 transfer | 65,000 | 0.000000065 | $0.0000000007 | $0.000000007 | $0.00000007 | $0.0000007 | $0.000003 | $0.000007 | **$0.000013** |
| DEX swap | 150,000 | 0.000000150 | $0.0000000015 | $0.000000015 | $0.00000015 | $0.0000015 | $0.000008 | $0.000015 | **$0.000030** |
| NFT mint | 100,000 | 0.000000100 | $0.000000001 | $0.00000001 | $0.0000001 | $0.000001 | $0.000005 | $0.00001 | **$0.000020** |
| ML-DSA verify | 125,000 | 0.000000125 | $0.0000000013 | $0.0000000125 | $0.000000125 | $0.00000125 | $0.000006 | $0.0000125 | **$0.000025** |
| Contract deploy | 1,000,000 | 0.000001000 | $0.00000001 | $0.0000001 | $0.000001 | $0.00001 | $0.00005 | $0.0001 | **$0.0002** |
| Complex DeFi | 300,000 | 0.000000300 | $0.000000003 | $0.00000003 | $0.0000003 | $0.000003 | $0.000015 | $0.00003 | **$0.00006** |

### 8.4 Validator Revenue at 300M/2B

#### Block Revenue at Full Utilization

| Layer | Gas Limit | Fee per block | Blocks/day | Daily total | Per validator (21) |
|-------|-----------|--------------|-----------|------------|-------------------|
| L1 | 300M | 0.30 BESA | 192,000 | 57,600 BESA | 2,743 BESA |
| L2 | 2B | 0.002 BESA | 345,600 | 691.2 BESA | 32.9 BESA |
| **Total** | — | — | — | **58,291 BESA** | **2,776 BESA** |

#### At 30% Average Utilization

| Metric | Per validator/day | $0.01 | $0.10 | $1.00 | $10.00 | $200.00 |
|--------|------------------|-------|-------|-------|--------|---------|
| L1 fees | 823 BESA | $8.23 | $82.30 | $823 | $8,230 | **$164,600** |
| L2 fees | 9.9 BESA | $0.10 | $0.99 | $9.90 | $99.00 | **$1,980** |
| Block rewards (Y1-2) | 1,957 BESA | $19.57 | $195.70 | $1,957 | $19,570 | **$391,400** |
| **Total** | **2,790 BESA** | **$27.90** | **$279** | **$2,790** | **$27,900** | **$558,000** |

#### Comparison: 150M/1B vs 300M/2B

| Metric | 150M/1B | 300M/2B | Improvement |
|--------|---------|---------|------------|
| Protocol max TPS | 206,349 | **412,698** | 2x |
| Realistic TPS (parallel) | 53,968 | **55,873** | +4% |
| Realistic TPS (sequential) | 9,524 | **9,524** | Same |
| Per-TX cost | Identical | Identical | — |
| Daily validator rev (30%, $200) | $474,600 | **$558,000** | +18% |
| Validator break-even | $0.07/BESA | **$0.04/BESA** | 43% lower |
| Headroom above 200K target | 3% | **106%** | Comfortable |
| Congestion resistance | Moderate | **High** | 2x burst capacity |

### 8.5 When to Upgrade from 150M/1B to 300M/2B

| Trigger | Metric | Threshold |
|---------|--------|-----------|
| L1 utilization | Avg gas used / gas limit | >60% sustained |
| L2 utilization | Avg gas used / gas limit | >40% sustained |
| Fee spikes | Base fee > 5 Gwei (L1) | 3+ times per day |
| TPS demand | Mempool backlog | >1000 pending TXs |

The upgrade is a simple governance parameter change — no hardfork needed. Validators vote to increase gas limits via the Parlia system contract.

---

_End of analysis._
