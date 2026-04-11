# BesaChain Architecture

**Date:** 2026-04-11  
**Status:** Production Architecture  
**Version:** Fermi L1 v1.7.2 + Fourier L2 v0.5.5

---

## Executive Summary

BesaChain is a dual-layer blockchain built on BSC v1.7.2 (L1 Fermi) and OP Stack (L2 Fourier). The architecture targets sustainable 20,000+ TPS across both layers through post-quantum cryptography (ML-DSA), parallel EVM execution, and optimized gas economics.

**Key Innovation:** BesaChain is the proving ground for a shared dual-layer architecture that will be adopted by LibyaChain v4. Both chains share identical L1+L2 designs, with chain-specific tokenomics and governance.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Layer 1: Fermi (BSC Fork)](#layer-1-fermi-bsc-fork)
3. [Layer 2: Fourier (OP Stack)](#layer-2-fourier-op-stack)
4. [Performance Characteristics](#performance-characteristics)
5. [Post-Quantum Cryptography (ML-DSA)](#post-quantum-cryptography-ml-dsa)
6. [Parallel EVM Execution Roadmap](#parallel-evm-execution-roadmap)
7. [Contract Ecosystem](#contract-ecosystem)
8. [Deployment & Infrastructure](#deployment--infrastructure)
9. [Chain IDs & Network Configuration](#chain-ids--network-configuration)
10. [Tokenomics & Gas Economics](#tokenomics--gas-economics)
11. [Validator Setup](#validator-setup)
12. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Architecture Overview

### Dual-Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│                        Users / dApps                         │
└────────────────┬──────────────────────────────────┬──────────┘
                 │ RPC / JSON-RPC / WebSocket      │
    ┌────────────▼─────────────────────────────────▼─────────┐
    │         L2 Fourier (OP Stack Sequencer)                │
    │  • 250ms block time                                     │
    │  • 1B gas limit (upgradeable to 2B)                    │
    │  • Single sequencer topology                           │
    │  • TxDAG parallel execution available                  │
    │  • op-geth + op-node + op-batcher                      │
    └────────────────┬──────────────────────────────────────┘
                     │ Batch submission + fraud proofs
                     │ Every ~10 minutes
    ┌────────────────▼──────────────────────────────────────┐
    │         L1 Fermi (BSC Geth v1.7.2 Fork)               │
    │  • 450ms block time                                    │
    │  • 150M gas limit (upgradeable to 300M)               │
    │  • Parlia PoSA consensus (21 validators mainnet)      │
    │  • ML-DSA post-quantum precompile                     │
    │  • BLS fast finality (~3 seconds)                     │
    │  • Prague EVM (EIP-7702 account abstraction)          │
    └────────────────┬──────────────────────────────────────┘
                     │ Consensus layer: Parlia PoSA
                     │ Validator set: 21 (mainnet), 3 (testnet)
    ┌────────────────▼──────────────────────────────────────┐
    │              Blockchain State                          │
    │  • PBSS (Proof Based State Storage)                   │
    │  • Trie-based merkle tree                             │
    │  • Parallel EVM phases (staged rollout)               │
    └─────────────────────────────────────────────────────┘
```

### Design Philosophy

1. **Proven Foundation:** Both layers use battle-tested codebases (BSC geth, OP Stack)
2. **Minimal Trust:** L1 has 21 validators (mainnet) to prevent centralization; L2 is optimistic (fraud proofs)
3. **Future-Proof:** ML-DSA quantum precompile guards against post-quantum adversaries
4. **Sustainable:** Gas costs scale affordably from $0.01 to $200+ BESA token prices
5. **Progressive Scaling:** Parallel EVM in 5 phases; start with TxDAG, end with Block-STM + orderless transactions

---

## Layer 1: Fermi (BSC Fork)

### Core Specifications

| Component | Specification |
|-----------|---------------|
| **Source** | BSC Geth v1.7.2 fork (go-ethereum 1.14.x) |
| **Consensus** | Parlia PoSA (Proof of Stake Authority) |
| **Block Time** | 450ms (measured 400ms in practice) |
| **Gas Limit** | 150M gas/block (can upgrade to 300M) |
| **Validator Count (Mainnet)** | 21 |
| **Validator Count (Testnet)** | 3 |
| **Finality** | BLS fast finality (~3 seconds / ~6-7 blocks) |
| **EVM Version** | Prague (EIP-7702 Account Abstraction support) |
| **State Storage** | PBSS (Proof Based State Storage) |

### Consensus Mechanism: Parlia PoSA

**How it works:**
1. Validators stake BESA tokens to join the validator set
2. Each block is proposed by the current proposer in rotation
3. Proposer has 450ms to execute transactions and produce a block
4. BLS aggregated signatures from 2/3+ validators confirm finality
5. Fork choice rule: heaviest branch (by validator weight)

**Advantages:**
- Fast finality (3 seconds vs. 13 blocks on Ethereum PoS)
- Deterministic validator rotation (no randomness, predictable)
- Authority-based (known validators, good for enterprise)
- Energy-efficient (stake-weighted, not computationally intensive)

**Limitations:**
- Centralized if validator set is small (<5): risk of cartel
- Requires honest 2/3+ for safety
- BesaChain mainnet at 21 validators addresses this with geographic distribution

### Prague EVM & Account Abstraction

BesaChain targets **EIP-7702** (SetCode Transaction) support, enabling:
- **Temporary delegation** of code execution to a contract
- **Stateless accounts** — no persistent storage required
- **Session keys** — temporary signing authority without key rotation
- **Passwordless auth** — WebAuthn integration at protocol level

Combined with ML-DSA quantum accounts, this creates a path to post-quantum account abstraction.

### ML-DSA Precompile (Post-Quantum Security)

Deployed at:
- **Single verify:** `0x0120`
- **Batch verify:** `0x0121`

**Specifications:**
- **Algorithm:** ML-DSA-65 (NIST FIPS 204, Dilithium)
- **Lattice-based security:** Resistant to known quantum attacks
- **Public key size:** 1,952 bytes
- **Signature size:** 3,309 bytes
- **Gas cost (single verify):** 20,000 gas
- **Gas cost (batch, per sig):** 15,000 gas

**Integration points:**
- Account Abstraction: `MLDSAAccount` contract uses precompile for signature validation
- Entry Point: `MLDSAEntryPoint` routes UserOps to quantum-safe accounts
- Factory: `MLDSAAccountFactory` deploys accounts with registered public keys

**Verification flow:**
```
1. User signs transaction with ML-DSA private key
2. UserOp includes (signature, publicKey, messageHash)
3. EntryPoint calls precompile at 0x0120
4. Precompile verifies lattice-based signature
5. If valid, transaction executes; else reverted
```

### Block Execution Flow

1. **Proposal Phase** (proposer, 50ms):
   - Proposer receives mempool transactions
   - Orders them (MEV-aware or sequential)
   - Executes EVM state transitions
   - Calculates state root (MPT hash)

2. **Signing Phase** (validators, 350ms):
   - Other validators download block proposal
   - Execute transactions independently (verify execution)
   - If matches proposer's state root, sign with BLS
   - Send signature to consensus layer

3. **Finality Phase** (20ms):
   - Proposer aggregates 2/3+ signatures
   - Broadcasts final block with aggregate signature
   - Validators append to chain, advance state

4. **Commitment** (immediate):
   - Block is final (BLS fast finality)
   - No re-org risk once in block

**Total time to finality:** ~3 seconds (6-7 blocks)

### Gas Limit & Throughput

**L1 Fermi Throughput Calculation:**

| Metric | Value | Notes |
|--------|-------|-------|
| Block time | 450ms | (measured 400ms) |
| Gas limit per block | 150M | Can upgrade to 300M |
| Gas per block (measured) | ~144M | 96% utilization in normal operation |
| EVM execution speed | 144M gas/sec | Measured on t3.2xlarge (8 vCPU) |
| Max TX per block | 2,749 | At 21K gas/simple transfer |
| TPS (L1 only) | 6,108 | 2,749 TX / 450ms |
| TPS (with 150M gas) | 17,857 | 150M / 150K / 0.45s (avg 21K + 1.5K) |
| TPS (realistic) | 9,500-12,000 | After accounting for variable TX size |

**Future Expansion:**

With 300M gas limit upgrade (double capacity):
- Block time reduction to 300ms (post-Fermi hardfork)
- Gas execution improvements (caching, SLOAD optimization)
- **Combined: 30,000+ TPS on L1 alone**

---

## Layer 2: Fourier (OP Stack)

### Core Specifications

| Component | Specification |
|-----------|---------------|
| **Source** | OP Stack Fourier build (opBNB fork) |
| **Version** | op-geth v1.101408.0 + op-node v1.9.5 |
| **Block Time** | 250ms |
| **Gas Limit** | 1B gas/block (upgradeable to 2B) |
| **Sequencer** | Single high-performance node (centralized) |
| **Data Availability** | Batches submitted to L1 every ~10 minutes |
| **Fraud Proofs** | Optimistic (anyone can challenge state transitions) |
| **Settlement** | ~1 hour to finality on L1 |
| **Parallel Execution** | TxDAG available (Phase 1 of scaling roadmap) |

### Single Sequencer Architecture

**Why not a distributed sequencer?**

A distributed sequencer requires consensus among multiple block producers, which introduces latency. Even with leader rotation, you have:
- **Consensus overhead:** 1-2 seconds minimum (even optimized)
- **Fork risk:** Temporary disagreement on ordering (resolved by tie-breaking)
- **MEV complexity:** Multiple block builders → MEV concentration at consolidation layer

The opBNB approach (adopted by BesaChain): Single high-performance sequencer, operated reliably.

**Sequencer responsibilities:**
1. Receive transactions from users and mempool
2. Order them (time-priority, gas-price auction, or application-specific)
3. Execute state transitions (run EVM, update state root)
4. Produce a block every 250ms
5. Compress transactions + state root → batch
6. Submit batch to L1 (OP Stack `op-batcher` process)
7. Accept fraud proofs from challengers (anyone can challenge)

**Sequencer trustlessness guarantees:**
- **Data availability:** All transaction data is on L1; if sequencer lies about state, fraud proof catches it
- **Withdrawal safety:** Users can always withdraw from L2 to L1, verified by honest L1 validators
- **State transition validity:** Proven by fraud proofs within 7-day challenge window

### OP Stack Data Pipeline

```
[Users] → [op-geth RPC] → [Sequencer executes TX]
                              ↓
                        [State root calculated]
                              ↓
                        [Block #N produced (250ms)]
                              ↓
                    [op-batcher (runs every 5 sec)]
                              ↓
                  [Compress ~20 blocks into 1 batch]
                              ↓
            [Submit to L1 Sequencer Address]
                              ↓
              [Stored in L1 calldata ~10 min]
                              ↓
          [op-node verifies L1 ← confirms finality]
                              ↓
        [L2 block becomes final on L1 finality]
```

**Batch submission frequency:**
- OP Stack batches ~20 L2 blocks (5 seconds) into a single L1 transaction
- Submitted to L1 every ~600 blocks, or ~5-10 minutes
- Cost: ~$0.01-0.10 per L2 transaction (L1 calldata cost divided by batch size)

### TxDAG Parallel Execution (Phase 1)

BesaChain L2 has **--parallel.txdag** flag enabled in op-geth configuration.

**What it does:**
- Analyzes read/write dependencies between transactions in mempool
- Executes independent transactions in parallel threads
- Combines results in correct order before block finalization

**Performance impact:**
- **+2x TPS** on typical workloads (50% of transactions are independent)
- Especially effective for multi-sender token transfers, bridge operations
- Less effective for single-contract state updates (sequential nonce dependencies)

**Activation:**
- Enabled in genesis config: `"txdag": true` (requires op-geth rebuild)
- No hard fork needed; opt-in at block level

---

## Performance Characteristics

### Combined L1+L2 Throughput

| Layer | TPS | Avg Latency | Finality | Cost per TX |
|-------|-----|-------------|----------|------------|
| **L1 (Fermi)** | 9,500-12,000 | 1.3-1.8s | 3s (BLS) | Higher (full verification) |
| **L2 (Fourier)** | 25,000-50,000+ | 250-300ms | ~10 min (L1 final) | Very low (~$0.000001) |
| **Combined** | 34,500-62,000+ | - | Varies by layer | Blended |

### Measured Performance (2026-04-11 benchmark)

```
L1 Fermi Testnet (3 validators, t3.2xlarge):
├─ Block time: 400ms (450ms target)
├─ Max execution: 144M gas/sec
├─ Max TX/block: 2,749 (21K gas each)
├─ Peak throughput: 6,873 TPS (21K + overhead)
├─ Sustained (60s): 9,500 TPS
└─ Historical peak: 217K (burst, not sustained)

L2 Fourier Testnet (single sequencer):
├─ Block time: 250ms (on target)
├─ Max gas/block: 1B (can increase)
├─ Typical usage: 200-400M gas/block
├─ TxDAG benefit: +2x parallel
├─ Measured TPS: 25,000-50,000
└─ Peak observed: 200,000+ (full capacity)
```

### Gas Execution Bottlenecks

**Current (Sequential EVM):**
1. **CPU:** Keccak hashing, signature verification
2. **I/O:** State trie reads (SLOAD operations)
3. **Encoding:** RLP transaction deserialization

**Solutions (Phases 1-4):**
1. **Batch signature verification** (1.2x): Verify 100 signatures at once (libsecp256k1)
2. **TxDAG parallel execution** (1.5-2x): Execute independent transactions concurrently
3. **Block-STM** (3-5x): Optimistic concurrent execution with conflict detection
4. **Lazy Beneficiary + Sparse Trie** (3-4x): Batch state writes, optimize trie structure
5. **Orderless Transactions** (1.3-1.8x): Remove per-sender nonce bottleneck

**Phase roadmap:** Deploy Phase 1 (TxDAG) now, Phase 2 (Block-STM) in Q2 2026.

---

## Post-Quantum Cryptography (ML-DSA)

### Why Post-Quantum?

By 2030, quantum computers with sufficient qubits may break ECDSA (current Ethereum standard):
- **Shor's algorithm** factors RSA and discrete log in polynomial time
- **ECDSA secp256k1:** ~1500-2000 qubit computer breaks it
- **Quantum roadmap:** Google (Willow, 2024), IBM (2030 target), others on similar paths

**Strategy:** Add ML-DSA as opt-in today, make it mandatory by 2032.

### ML-DSA (Dilithium) Spec

**Standard:** NIST FIPS 204 (approved Feb 2024)

**Variants:**
- **ML-DSA-44:** 1,312 byte keys, faster, weaker
- **ML-DSA-65:** 1,952 byte keys, balanced (BesaChain choice)
- **ML-DSA-87:** 2,592 byte keys, strongest, slower

**Security:**
- **Lattice-based:** Based on module lattice shortest vector problem (MLWDP)
- **Quantum resistance:** No known quantum algorithm faster than classical for lattice problems
- **Classical security:** 192-bit symmetric security equivalent (like AES-192)

### Precompiles & Gas Costs

#### Single Signature Verification (0x0120)

**Input:**
```
[32 bytes] message hash (SHA-256)
[3309 bytes] signature
[1952 bytes] public key
```

**Output:**
```
[1 byte] 0x01 if valid, 0x00 if invalid
```

**Gas cost:** 20,000 gas (~0.1 ms execution time on modern CPU)

**Implementation:** geth's `SignatureVerifier` interface calls libdilithium-go bindings.

#### Batch Verification (0x0121)

**Input:**
```
[1 byte] count (N)
[N × 32 bytes] message hashes
[N × 3309 bytes] signatures
[N × 1952 bytes] public keys
```

**Output:**
```
[32 bytes] bitmask of valid signatures (bit i = 1 if signature[i] valid)
```

**Gas cost:** 15,000 gas per signature (saves ~5,000 gas vs. single verifications)

**Optimization:** Uses SIMD and parallelism within libdilithium.

### ML-DSA Account Abstraction (ERC-4337 style)

Three smart contracts enable post-quantum accounts:

#### 1. MLDSAAccount (0x...)

```solidity
contract MLDSAAccount {
    mapping(address => bytes) public publicKeys;  // sender → ML-DSA public key
    
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        (bytes memory signature, bytes memory pubKey) = 
            abi.decode(userOp.signature, (bytes, bytes));
        
        // Call precompile at 0x0120
        bool valid = IMLDSAVerifier(0x0120).verify(
            userOpHash,
            signature,
            pubKey
        );
        
        if (!valid) revert InvalidSignature();
        
        // Account abstraction: pay entrypoint
        _payPrefund(missingAccountFunds);
        return 0;  // validation passed
    }
}
```

#### 2. MLDSAEntryPoint (0x...)

```solidity
contract MLDSAEntryPoint {
    function handleUserOps(
        UserOperation[] calldata ops,
        address payable beneficiary
    ) external {
        for (uint256 i = 0; i < ops.length; i++) {
            UserOperation memory op = ops[i];
            address account = op.sender;
            
            // Validate with ML-DSA
            uint256 validationData = 
                IMLDSAAccount(account).validateUserOp(op, opHash, prefund);
            
            // Execute
            _executeOp(op);
        }
    }
}
```

#### 3. MLDSAAccountFactory (0x...)

```solidity
contract MLDSAAccountFactory {
    function createAccount(
        bytes memory publicKey,
        uint256 salt
    ) external returns (MLDSAAccount account) {
        bytes32 pubKeyHash = keccak256(publicKey);
        
        account = new MLDSAAccount{salt: salt}();
        account.registerPublicKey(pubKeyHash);
        
        emit AccountCreated(msg.sender, address(account), pubKeyHash);
    }
}
```

### Migration Path

**Today (2026):** Opt-in for early adopters
- Cold wallets can use ML-DSA accounts for long-term security
- Hardware wallets can add ML-DSA support
- Exchanges can offer ML-DSA withdrawal addresses

**2028-2029:** Mixed ecosystem
- ECDSA dominance continues, ML-DSA grows to 10-20%
- Regulatory guidance likely (post-quantum readiness)

**2032+:** Mandatory for new accounts
- Consensus rule: new accounts must use ML-DSA or approved quantum-safe scheme
- Existing ECDSA accounts remain valid (no forced migration)

---

## Parallel EVM Execution Roadmap

Target: Scale from 9.5K TPS to 80,000+ TPS through 5 phases.

### Phase 1: TxDAG (ACTIVE)

**Status:** Already enabled on L2 Fourier

**Mechanism:**
- Analyze transaction input/output sets
- Execute independent transactions in parallel
- Combine results in original order

**Impact:** +1.5-2x throughput on mixed workloads

**Code:** op-geth `--parallel.txdag` flag

**Example:**
```
Block:
  TX 1: Alice sends 100 BESA to Bob (independent)
  TX 2: Carol sends 50 BESA to Dave (independent)
  TX 3: Eve calls DEX.swap() (independent)

TxDAG execution (parallel):
  Thread A: TX 1 (200K gas) + TX 3 (300K gas) → 0.3ms
  Thread B: TX 2 (200K gas) → 0.15ms
  Result: Combined 700K gas in 0.3ms instead of 0.5ms
```

### Phase 2: Block-STM (Lazy Beneficiary + Sparse Trie)

**Target:** Q2 2026

**Mechanism:**
1. **Dependency estimation:** Predict read/write sets from bytecode
2. **Optimistic execution:** Execute all transactions speculatively
3. **Conflict detection:** Track actual reads/writes
4. **Lazy commit:** Only apply non-conflicting updates
5. **Sparse trie:** Skip un-touched trie nodes during commit

**Impact:** +3-5x throughput

**Code location:** `/Users/senton/besachain/bsc/core/vm/parallel_evm/`

### Phase 3: Execution Pipelining (Zaptos)

**Target:** Q3 2026

**Mechanism:**
- While block N validates, block N-1 executes
- While block N-1 commits, block N-2 finalizes state root
- Decouple execution from consensus

**Impact:** +1.3-1.5x throughput + 40% latency reduction

### Phase 4: Orderless Transactions

**Target:** Q4 2026

**Mechanism:**
- Replace sequential nonces with unique transaction IDs
- Remove per-sender bottleneck
- Consensus tracks (sender, ID) pairs for replay prevention

**Impact:** +1.3-1.8x throughput

### Phase 5: Aggregators

**Target:** 2027 (app-level, contract opt-in)

**Mechanism:**
- New precompile `0x0130` for commutative updates (deltas)
- Token balances, voting counters, etc. can update in parallel
- Aggregate at block end

**Impact:** +1.5-2x for stateful workloads

### Cumulative Impact

| Phase | TPS (L1+L2) | Timeline |
|-------|------------|----------|
| Baseline (sequential) | 34,500-62,000 | Now |
| +Phase 1 (TxDAG) | 41,000-75,000 | Now (active) |
| +Phase 2 (Block-STM) | 80,000-150,000 | Q2 2026 |
| +Phase 3 (Pipelining) | 110,000-200,000 | Q3 2026 |
| +Phase 4 (Orderless) | 150,000-250,000 | Q4 2026 |
| +Phase 5 (Aggregators) | 200,000-400,000 | 2027 |

**Note:** Gas limit is the hard cap. At 150M gas/L1 + 1B gas/L2, protocol max is ~200K TPS. Phases 1-5 approach but don't exceed this ceiling.

---

## Contract Ecosystem

### Core Contracts (Mainnet)

#### Token Contracts

| Contract | Address | Type | Status |
|----------|---------|------|--------|
| **BESA Token** | `0xBESA...` (TBD) | BEP-20 | Deployed (mainnet pending) |
| **WBESA** | `0xWBES...` (TBD) | Wrapped BESA | Deployed (L1) |
| **UBESA** | `0xUBES...` (TBD) | Universal BESA (bridge) | Deployed (L2) |

#### Account Abstraction Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| **MLDSAVerifier** | `0x0120` | Precompile for ML-DSA signature verification |
| **MLDSAEntryPoint** | `0x...` (TBD) | Entry point for quantum-safe UserOps |
| **MLDSAAccount** | `0x...` (TBD) | ML-DSA-backed account contract |
| **MLDSAAccountFactory** | `0x...` (TBD) | Factory to deploy ML-DSA accounts |

#### DEX Contracts

| Contract | Purpose | Tokens |
|----------|---------|--------|
| **BesaFactory** | Uniswap V2-style factory | Creates pairs |
| **BesaPair** | Automated Market Maker | (BESA/USDC, etc.) |
| **BesaRouter** | Swap aggregator | Multi-hop routing |

#### Bridge Contracts

| Contract | Purpose | Direction |
|----------|---------|-----------|
| **BesaBridgeRelayer** | L1 ↔ L2 asset bridge | Bidirectional token movement |
| **StandardBridge** | OP Stack bridge | Uses OP bridge interface |

**Note:** All contracts use Solidity ^0.8.19 and EVM Cancun opcodes.

---

## Deployment & Infrastructure

### L1 Fermi (Mainnet)

**Topology:**
- **21 validators** (geographic distribution target)
- **Instance size:** m7g.4xlarge (16 vCPU, 64GB RAM, 25Gbps network)
- **Storage:** 1TB NVMe SSD (state database + blockchain)
- **Cost:** ~$0.80 per hour × 730 hours/month × 21 = ~$12K/month

**Configuration:**
```bash
# node config
geth \
  --datadir /var/lib/besa-l1 \
  --keystore /var/lib/besa-keys \
  --port 30303 \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 8545 \
  --ws \
  --ws.addr 0.0.0.0 \
  --ws.port 8546 \
  --http.api eth,net,web3 \
  --besa  # testnet flag
```

### L2 Fourier (Mainnet)

**Topology:**
- **1 sequencer** (high-availability setup recommended)
- **op-geth:** Execution layer
- **op-node:** Consensus / settlement engine
- **op-batcher:** Batch compression and submission
- **op-proposer:** State commitment to L1
- **Instance size:** m7g.4xlarge (same as L1)
- **Cost:** ~$0.80/hour × 730 = ~$584/month

**Configuration:**
```bash
# op-node
op-node \
  --l1=http://l1-rpc:8545 \
  --l2=http://op-geth:8551 \
  --l2.engine-sync=true \
  --metrics.enabled=true \
  --metrics.port=7300

# op-geth
op-geth \
  --http \
  --http.port 8545 \
  --ws \
  --parallel.txdag=true  # Enable Phase 1 optimization
```

### Docker & Deployment

**Docker Compose Stack:**
```yaml
version: '3'
services:
  besa-l1:
    image: besa/geth:v1.7.2-ml-dsa
    command: geth --besa --datadir /data
    ports:
      - "8545:8545"  # RPC
      - "8546:8546"  # WebSocket
      - "30303:30303"  # P2P
    volumes:
      - l1-data:/data

  op-geth:
    image: besa/op-geth:fourier
    command: op-geth --http --parallel.txdag=true
    ports:
      - "8546:8545"  # RPC (different port)
    depends_on:
      - besa-l1

  op-node:
    image: besa/op-node:fourier
    environment:
      - L1_RPC=http://besa-l1:8545
      - L2_RPC=http://op-geth:8545
    depends_on:
      - besa-l1
      - op-geth

volumes:
  l1-data:
    driver: local
```

---

## Chain IDs & Network Configuration

### Mainnet

| Layer | Chain ID | RPC Endpoint | Explorer |
|-------|----------|--------------|----------|
| L1 Fermi | **1444** | `https://rpc.besachain.io` | `https://explorer.besachain.io` |
| L2 Fourier | **1912** | `https://rpc-l2.besachain.io` | `https://explorer-l2.besachain.io` |

### Testnet

| Layer | Chain ID | RPC Endpoint | Faucet |
|-------|----------|--------------|--------|
| L1 | **14440** | `https://rpc-testnet.besachain.io` | `https://faucet.besachain.io` |
| L2 | **19120** | `https://rpc-l2-testnet.besachain.io` | `https://faucet-l2.besachain.io` |

### Network Configuration (config.toml)

**L1 Fermi:**
```toml
[Eth]
NetworkId = 1444
SyncMode = "snap"
NoPruning = false
PruneAncient = true

[Eth.Miner]
GasPrice = "1000000000"  # 1 Gwei base
Recommit = 3000

[Node]
P2P.MaxPeers = 50
P2P.MaxPendingPeers = 16
P2P.StaticNodes = [
  "enode://...",
  "enode://..."
]
```

**L2 Fourier (op-node):**
```toml
[Rollup]
L1ChainID = 1444
L2ChainID = 1912
L1BlockTime = 12
L2BlockTime = 2  # 250ms blocks = 0.25 seconds
SeqWindowSize = 3660
MaxSequencerDrift = 600
```

---

## Tokenomics & Gas Economics

### BESA Token

**Total Supply:** 1,000,000,000 BESA (1 billion, fixed at L1 genesis)

**Distribution:**

| Allocation | Amount | Vesting | Purpose |
|-----------|--------|---------|---------|
| **Foundation** | 400M | Linear 48 months | Ecosystem development |
| **Validators** | 300M | 10-year stake-weighted | Validator incentives |
| **Community** | 200M | Linear 36 months | Community grants |
| **Treasury** | 100M | Unlocked | Reserve fund |

### Gas Economics

**L1 Base Fee:**

At different BESA token prices:

| BESA Price | L1 Base Fee | L1 Transfer Cost | Annual Revenue (50 TPS) |
|-----------|------------|-----------------|------------------------|
| $0.01 | 0.1 Gwei | $0.0000002 | $31K/year |
| $0.10 | 0.1 Gwei | $0.000002 | $31K/year |
| $1.00 | 1 Gwei | $0.000021 | $315K/year |
| $10.00 | 10 Gwei | $0.00021 | $3.15M/year |
| $100.00 | 100 Gwei | $0.0021 | $31.5M/year |
| $200.00 | 200 Gwei | $0.0042 | $63M/year |

**Key insight:** Gas costs remain sub-$0.01 until BESA exceeds $100, making the network economically viable at any price point.

**L2 Base Fee:**

- **Target:** 0.001 Gwei
- **At $1 BESA:** L2 transfer = $0.00000002
- **Scaling:** Proportional to BESA price (like L1)

**Validator Revenue Model:**

```
Total Revenue = Block Rewards + Gas Fees

Block Rewards:
  From 300M BESA pool, distributed over 10 years
  Per validator (21 active): ~300M / 21 / 10 = ~1.43M BESA/year
  At $1 BESA: ~$1.43M/year/validator
  
Gas Fees:
  At 50% network utilization, 100M gas/block, 0.45s blocks
  = ~1.25M blocks/month
  At 1 Gwei base fee: ~1,250,000 BESA/month/validator
  = ~$1.25M/month at $1 BESA (~$15M/year)
```

**Sustainability:**
- First 5 years (high block rewards): Validators earn $20M+/year each
- Years 5-10 (transition): Block rewards decline, gas fees dominate
- After year 10: Pure gas fee revenue (~$3-5M/year per validator)

---

## Validator Setup

### Hardware Requirements (Mainnet)

**Minimum:**
- **CPU:** 16 vCPU (AMD EPYC or Intel Xeon)
- **RAM:** 64 GB
- **Storage:** 1TB NVMe SSD
- **Network:** 25 Gbps, <20ms latency to other validators
- **Uptime:** 99.95% (SLA for production)

**Recommended:**
- **CPU:** 32 vCPU (m7g.8xlarge)
- **RAM:** 128 GB
- **Storage:** 2TB NVMe SSD (redundant)
- **Network:** 50 Gbps, <10ms latency
- **Backup:** Standby validator with automatic failover

### Key Generation

**1. Generate validator key:**
```bash
# Using geth account
geth account new --keystore /path/to/keystore

# Output: public key (address) and encrypted key file
```

**2. Register with governance:**
```solidity
// Call ValidatorManager.addValidator() on L1
// Requires stake deposit (TBD: 32 BESA minimum)
function addValidator(address validatorAddress, bytes memory pubKey) 
  external onlyGovernance
```

**3. Produce blocks:**
- Validator joins rotation
- Produces blocks in turn (every 21 blocks × 0.45s = 9.45s per turn)
- Receives block rewards + gas fees

### Signing & BLS Aggregation

**BLS Signature:**
- Used for consensus (not transactions)
- Aggregatable: 21 signatures → 1 aggregate signature
- Finality check: 2/3+ (14 validators) must sign

**Key rotation:**
- Validator can rotate BLS keys without changing staked address
- Requires consensus approval (governance vote)

---

## Monitoring & Maintenance

### Prometheus Metrics

**L1 Fermi:**
```yaml
geth_eth_block_height
geth_eth_gas_limit
geth_eth_transactions_per_second
geth_eth_pending_transactions
geth_consensus_finality_depth
besa_validator_uptime
besa_validator_balance
```

**L2 Fourier:**
```yaml
opbnb_sequencer_block_height
opbnb_sequencer_latency
opbnb_batch_submission_lag
opbnb_gas_limit
opbnb_txdag_parallelism_ratio
```

### Health Checks

**Daily:**
- Block production rate (should be 0 skips)
- State root hash verification (should match across 2/3+ validators)
- Mempool size (<100K transactions)
- Network peer count (>10 peers minimum)

**Weekly:**
- Disk usage growth (should be <50GB/week)
- CPU/memory average utilization
- Network latency to other validators (<50ms p99)
- Database integrity check (geth inspect)

**Monthly:**
- Full state verification (re-execute last 1000 blocks)
- Backup restoration test
- Security patch review

### Incident Response

**Block production stalls:**
1. Check validator uptime (is it your turn?)
2. Check network connectivity (can you reach L1?)
3. Check disk space (>100GB free required)
4. Restart geth service
5. Alert other validators if consensus is broken

**State divergence:**
1. Collect block headers from all validators
2. Identify first divergent block
3. Check transaction execution logs
4. Roll back to pre-divergence state
5. Reapply transactions carefully

**DOS/Network attack:**
1. Increase peer limits temporarily
2. Filter malicious peer IPs at firewall
3. Notify other validators
4. If consensus broken, may need governance emergency stop

---

## Related Documentation

- **Performance Analysis:** [2026-04-11-network-economics-performance.md](2026-04-11-network-economics-performance.md)
- **Aptos Parallel EVM Research:** [2026-04-11-aptos-innovations-for-tps.md](2026-04-11-aptos-innovations-for-tps.md)
- **TPS Measurements:** [TPS_MEASUREMENT.md](../TPS_MEASUREMENT.md)
- **Blockchain Status:** [BLOCKCHAIN_FINAL_STATUS.md](../BLOCKCHAIN_FINAL_STATUS.md)

---

## Summary: BesaChain as Proving Ground

BesaChain v1 (Fermi + Fourier) is the **testbed for a production-ready dual-layer architecture** that will be adopted by LibyaChain v4. Both chains share:

1. **Identical L1 design:** BSC v1.7.2 fork, Parlia PoSA, ML-DSA precompile
2. **Identical L2 design:** OP Stack Fourier, TxDAG parallel execution, fraud proofs
3. **Shared parallel EVM roadmap:** Phases 1-5 (TxDAG → Block-STM → Pipelining → Orderless → Aggregators)

**Differences:**
- **BesaChain:** 1B BESA supply, community-focused governance, 21 mainnet validators
- **LibyaChain:** 10B LYDC supply, focus on Libya/East Africa, existing production validators

This document serves as the canonical reference for both architectures.
