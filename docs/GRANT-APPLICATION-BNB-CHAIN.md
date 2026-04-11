# BNB Chain Builder Grant Application

## Besa Chain: Post-Quantum EVM Infrastructure for the AI Era

---

**Applicant:** Besa Labs  
**Grant Amount Requested:** $200,000 USD  
**Project Category:** Infrastructure & Public Goods  
**Application Date:** April 7, 2026  

---

## Executive Summary

Besa Chain is building open-source, post-quantum EVM infrastructure that strengthens the entire BNB Chain ecosystem. Our flagship contribution is a production-ready **ML-DSA (NIST FIPS 204) precompile** at address `0x0120`, enabling any BSC dApp to add quantum-resistant signatures with a single contract call.

This grant will fund:
1. **Open-source ML-DSA precompile** — available to all BSC chains
2. **High-throughput L2 research** — optimizations benefiting opBNB and BSC L2s
3. **Developer tooling & documentation** — SDKs, migration guides, example contracts
4. **Security audits** — ensuring production-ready code for ecosystem use

**Key Differentiator:** Unlike proprietary chains seeking to compete with BSC, Besa is explicitly designed as a **BSC ecosystem extension** — our success drives value to BNB Chain through quantum-safe tooling and high-performance infrastructure.

---

## 1. Project Overview

### 1.1 Problem Statement

The blockchain industry faces two existential infrastructure gaps:

**A. Quantum Vulnerability**
- ECDSA (secp256k1) will be broken by quantum computers using Shor's algorithm
- NIST finalized post-quantum standards (FIPS 204, 205, 206) in August 2024
- No production EVM chain has implemented these standards
- BSC/BNB Chain users have zero quantum-safe options

**B. AI Agent Infrastructure**
- Autonomous AI agents will generate billions of daily transactions
- Current EVM chains max out at ~1,000-4,000 TPS
- No chain is optimized for programmatic, high-frequency agent transactions
- Account abstraction is fragmented (ERC-4337 complexity)

### 1.2 Solution: Besa Chain

Besa Chain addresses both gaps through open-source infrastructure:

| Component | Innovation | BNB Ecosystem Benefit |
|-----------|-----------|----------------------|
| **ML-DSA Precompile** | First production PQC on EVM | BSC dApps can add quantum safety |
| **EIP-7702 Native AA** | Protocol-level account abstraction | Simpler agent onboarding |
| **Dual-Layer Architecture** | L1 (consensus) + L2 (execution) | Research applicable to opBNB |
| **200K+ TPS L2** | Optimized OP Stack Fourier | Scaling insights for BSC L2s |

### 1.3 Relationship to BNB Chain

**Besa is NOT a BSC competitor.** Positioning:

- **Technological descendant:** Built on BSC Geth fork, Parlia consensus
- **Ecosystem contributor:** All core innovations (ML-DSA, AA) are open-source
- **Specialized extension:** Focuses on quantum-safe, agent-scale use cases
- **Value flow:** Projects that outgrow BSC throughput can expand to Besa while maintaining BNB Chain ecosystem ties

**Analogy:** If BSC is Ethereum, Besa aims to be Arbitrum — an L2 that strengthens the L1.

---

## 2. Technical Details

### 2.1 ML-DSA Precompile (Primary Deliverable)

**Standard:** NIST FIPS 204 (Module-Lattice-Based Digital Signature Algorithm)  
**Implementation:** Go-based precompile at address `0x0120`  
**Parameters:** ML-DSA-65 (NIST Security Level 3)  
**Status:** Implemented on testnet, pending audit

**Solidity Interface:**
```solidity
interface IMLDSA {
    function ml_dsa_keygen() external view returns (bytes32 public_key_hash, bytes memory secret_key);
    function ml_dsa_sign(bytes32 message_hash, bytes memory secret_key) external view returns (bytes memory signature);
    function ml_dsa_verify(bytes32 message_hash, bytes memory signature, bytes32 public_key_hash) external view returns (bool);
}
```

**Gas Costs:**
- Key generation: ~50,000 gas
- Signing: ~30,000 gas  
- Verification: ~20,000 gas

**Use Cases for BSC Ecosystem:**
- High-value custody solutions (quantum-safe multisig)
- Long-term document signing (proofs that survive quantum era)
- Government/enterprise applications requiring NIST compliance
- Cross-chain bridges (quantum-safe threshold signatures)

### 2.2 High-Throughput L2 Research

**Technical Approach:**
- OP Stack Fourier implementation
- Parallel transaction execution (16-32 threads)
- BLS signature batching
- Optimized state caching

**Benefits for BNB Chain:**
- Research findings applicable to opBNB optimization
- Benchmarking methodology for BSC L2 comparison
- Open-source performance tooling

### 2.3 EIP-7702 Account Abstraction

**Implementation:** Native protocol-level AA (not ERC-4337 overlay)

**Features:**
- Delegated execution (EOA → smart contract code)
- Batch transactions (up to 100 per inclusion)
- Custom signature schemes (including ML-DSA)
- Gasless transactions via paymasters

**Benefits:**
- Simpler than ERC-4337 for developers
- 20-40% lower gas costs
- Native protocol support (no bundler infrastructure)

---

## 3. Grant Budget Breakdown

| Category | Amount | % of Total | Purpose |
|----------|--------|------------|---------|
| **Security Audits** | $60,000 | 30% | ML-DSA precompile, core contracts, AA implementation |
| **Infrastructure** | $40,000 | 20% | 12-month AWS costs for testnet, benchmarks, CI/CD |
| **Developer Tooling** | $35,000 | 17.5% | SDKs (Go, JS, Python), documentation, example dApps |
| **Research & Engineering** | $40,000 | 20% | L2 optimization research, parallel execution |
| **Community & Ecosystem** | $15,000 | 7.5% | Hackathons, grants to developers, educational content |
| **Legal & Compliance** | $10,000 | 5% | Entity setup, regulatory guidance, IP protection |
| **Total** | **$200,000** | **100%** | |

### 3.1 Budget Justification

**Security Audits ($60K):**
- ML-DSA precompile: $25K (specialized cryptography audit)
- Core node software: $20K (consensus, networking)
- Account abstraction: $15K (smart contract security)

*Why it matters:* Audited code is required for any BSC project to consider integration. This makes the precompile production-ready for ecosystem use.

**Infrastructure ($40K):**
- Testnet operation: $15K (4× c7i.4xlarge for 12 months)
- Benchmarking environment: $15K (dedicated high-performance instances)
- CI/CD and tooling: $10K (GitHub Actions, monitoring, logging)

*Why it matters:* Public, stable testnet demonstrates working code. Benchmarks prove performance claims.

**Developer Tooling ($35K):**
- SDK development: $20K (3 SDKs × ~$6.5K each)
- Documentation portal: $8K (professional docs site)
- Example dApps: $7K (3 reference implementations)

*Why it matters:* Easy integration drives adoption. BSC developers need clear documentation to use ML-DSA.

---

## 4. Milestones & Deliverables

### Phase 1: Foundation (Months 1-3) — $60,000

| Deliverable | Timeline | Acceptance Criteria |
|-------------|----------|---------------------|
| ML-DSA precompile testnet | Month 1 | Working implementation on public testnet, verification scripts |
| Security audit initiated | Month 2 | Contract signed with Tier-1 auditor (CertiK/Hacken/PeckShield) |
| Developer SDK (Go) | Month 3 | Published on GitHub with documentation, unit tests |
| Technical whitepaper | Month 3 | Published on arXiv and ethresear.ch |

**Payment:** 30% ($60K) upon milestone approval

### Phase 2: Production Readiness (Months 4-6) — $80,000

| Deliverable | Timeline | Acceptance Criteria |
|-------------|----------|---------------------|
| Security audit completion | Month 4 | Published audit report, all critical issues resolved |
| ML-DSA mainnet deployment | Month 5 | Precompile live on Besa mainnet, verified on block explorer |
| JS & Python SDKs | Month 5 | Published with npm/pip packages, integration examples |
| EIP-7702 implementation | Month 6 | Protocol-level AA live on testnet |
| Benchmarking suite | Month 6 | Open-source benchmark tools, reproducible results |

**Payment:** 40% ($80K) upon milestone approval

### Phase 3: Ecosystem Growth (Months 7-9) — $40,000

| Deliverable | Timeline | Acceptance Criteria |
|-------------|----------|---------------------|
| Developer documentation portal | Month 7 | Professional docs site with guides, API reference |
| 3 example dApps | Month 8 | Open-source reference implementations (multisig, AA wallet, bridge) |
| BSC integration guide | Month 8 | Documentation for BSC projects to use ML-DSA precompile |
| First 5 ecosystem projects | Month 9 | External teams building on Besa testnet |

**Payment:** 20% ($40K) upon milestone approval

### Phase 4: Sustainability (Months 10-12) — $20,000

| Deliverable | Timeline | Acceptance Criteria |
|-------------|----------|---------------------|
| EIP-7702 mainnet | Month 10 | AA live on Besa mainnet |
| Community grants program | Month 11 | $5K distributed to 5+ community projects |
| Conference presentation | Month 12 | Presented at ETHGlobal, BNB Chain event, or academic conference |
| Sustainability plan | Month 12 | Document outlining path to self-sustaining ecosystem |

**Payment:** 10% ($20K) upon milestone approval

---

## 5. Impact on BNB Chain Ecosystem

### 5.1 Direct Contributions

| Contribution | Timeline | Benefit |
|--------------|----------|---------|
| ML-DSA precompile spec | Month 3 | BSC can adopt same precompile address (0x0120) |
| Audit reports | Month 4 | Shared security knowledge for BSC upgrades |
| Performance benchmarks | Month 6 | Data for opBNB optimization |
| AA implementation | Month 10 | Reference design for BSC native AA |

### 5.2 Ecosystem Growth

**Developer Adoption:**
- Target: 100+ developers using Besa tooling by Month 12
- Mechanism: SDKs, documentation, hackathon sponsorship

**Project Migration:**
- Target: 10+ projects deployed on Besa by Month 12
- Types: AI agent frameworks, quantum-safe custody, high-frequency DeFi

**Value to BNB:**
- Quantum-safe tooling strengthens BSC's enterprise positioning
- High-throughput research improves opBNB
- Successful Besa → validation of BSC technology stack

### 5.3 Competitive Positioning

| Competitor | Quantum Precompile | Native AA | EVM Compatible |
|------------|-------------------|-----------|----------------|
| **Besa** | ✅ ML-DSA | ✅ EIP-7702 | ✅ BSC fork |
| Ethereum | ❌ Research phase | ❌ ERC-4337 only | ✅ Native |
| Solana | ❌ | ❌ | ❌ |
| Monad | ❌ | ❌ | ✅ |
| Sei | ❌ | ❌ | ✅ |

**Unique Position:** Only chain with working ML-DSA + native AA + full EVM compatibility.

---

## 6. Team & Background

### 6.1 Core Team

**Founder/Lead Developer:** [Name withheld for privacy]
- 20+ years software engineering experience
- Telecom infrastructure background (high-throughput systems)
- Blockchain development since 2018
- Albanian heritage (Besa = cultural concept of unbreakable promise)

**Contributors:**
- Claude Code (AI pair programmer) — architecture, documentation, testing
- Network of contractor developers for SDKs, audits

### 6.2 Why This Team

- **Technical depth:** Built and operated production blockchain infrastructure
- **Cultural alignment:** Long-term commitment (4-year vesting, no VC pressure)
- **Ecosystem mindset:** Building public goods, not proprietary moats

### 6.3 Advisors (Planned)

- Cryptography researcher (PQC specialist)
- BNB Chain ecosystem veteran
- Security audit expert

---

## 7. Open Source Commitment

### 7.1 License Strategy

| Component | License | Rationale |
|-----------|---------|-----------|
| Node client (geth fork) | GPL-3.0 | BSC ecosystem standard |
| ML-DSA precompile | MIT | Maximum adoption |
| Smart contracts | MIT | Developer friendly |
| SDKs | MIT/Apache-2.0 | Industry standard |
| Documentation | CC-BY-4.0 | Free distribution |

### 7.2 Repository Structure

```
github.com/besachain/
├── besa-geth/           # Node client (GPL-3.0)
├── ml-dsa-precompile/   # Precompile (MIT)
├── contracts/           # Smart contracts (MIT)
├── sdks/
│   ├── go-sdk/          # Go SDK (MIT)
│   ├── js-sdk/          # JavaScript SDK (MIT)
│   └── python-sdk/      # Python SDK (MIT)
├── docs/                # Documentation (CC-BY)
└── benchmarks/          # Performance tools (MIT)
```

### 7.3 Contribution Guidelines

- All code reviewed before merge
- Comprehensive test coverage (>80%)
- Documentation for all public APIs
- Regular security audits
- Community contributor program

---

## 8. Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Audit findings delay launch** | Medium | High | Build in 4-week buffer; start audit early |
| **ML-DSA performance issues** | Low | High | Fallback to ML-DSA-44 (faster, lower security) |
| **Low developer adoption** | Medium | Medium | Strong documentation; SDK quality; grants program |
| **BNB Chain changes spec** | Low | Medium | Stay in close contact with BNB dev team |
| **Funding shortfall** | Low | High | Conservative budgeting; milestone-based payments |
| **Team capacity constraints** | Medium | Medium | Clear contractor budget; modular development |

---

## 9. Long-Term Vision (Post-Grant)

### 9.1 Sustainability Plan

**Year 1 (Grant-funded):** Build core infrastructure, establish testnet, prove technology  
**Year 2:** Mainnet launch, exchange listings, ecosystem grants  
**Year 3+:** Self-sustaining through:
- Transaction fees (BESA token)
- Ecosystem grants program (Treasury-funded)
- Enterprise consulting (quantum-safe implementations)
- Partnership revenue

### 9.2 Ecosystem Integration

**With BNB Chain:**
- Regular technical syncs with BNB dev team
- Contribute optimizations back to BSC upstream
- Co-marketing for quantum-safe features
- Potential bridge for BNB → Besa L2

**Cross-Chain:**
- IBC integration for Cosmos ecosystem
- Optimism Superchain participation (OP Stack base)
- Ethereum L2 research collaboration

---

## 10. Conclusion

Besa Chain represents a unique opportunity for BNB Chain to lead in two critical infrastructure areas:

1. **Post-quantum cryptography** — First production ML-DSA implementation
2. **AI agent infrastructure** — Purpose-built for the autonomous economy

The $200,000 grant will deliver:
- ✅ Production-ready, audited ML-DSA precompile
- ✅ Open-source SDKs and documentation
- ✅ High-throughput L2 research applicable to opBNB
- ✅ Thriving developer ecosystem

**This is not a competitor seeking to siphon value from BNB Chain. This is a specialized extension that strengthens the entire ecosystem through open-source public goods.**

---

## Appendices

### Appendix A: Chain Specifications

| Parameter | Besa L1 | Besa L2 |
|-----------|---------|---------|
| Chain ID | 1444 | 1445 |
| Consensus | Parlia PoSA | OP Stack (Fourier) |
| Block Time | 1s (target 450ms) | 250ms |
| Gas Limit | 100,000,000 | 100,000,000 |
| EVM Version | Prague | Prague |
| Native AA | EIP-7702-based | EIP-7702-based |
| PQC Precompile | 0x0120 (ML-DSA) | Inherited |

### Appendix B: Technical References

- NIST FIPS 204: https://csrc.nist.gov/projects/post-quantum-cryptography
- EIP-7702: https://eips.ethereum.org/EIPS/eip-7702
- OP Stack: https://docs.optimism.io/stack/getting-started
- BNB Chain Tech Roadmap: https://www.bnbchain.org/en/blog/tech-roadmap-2026

### Appendix C: Contact Information

- **Website:** besachain.com
- **Foundation:** besachain.org  
- **X/Twitter:** @BesaLabs
- **Email:** besachain.team@gmail.com
- **GitHub:** github.com/besachain (planned)

---

**Application Submitted By:**

Besa Labs  
April 7, 2026

**Declaration:** All information provided in this application is accurate to the best of our knowledge. We agree to provide regular milestone updates and participate in BNB Chain ecosystem activities.
