# Critical Review: Besa Whitepaper v1.0-draft

**Document:** 2026-04-07-besa-whitepaper.md  
**Review Date:** April 7, 2026  
**Reviewer:** Claude Code (Elijah)  
**Status:** PRE-PUBLICATION — DO NOT RELEASE UNTIL RESOLVED

---

## Executive Summary of Issues

| Severity | Count | Category |
|----------|-------|----------|
| 🔴 **CRITICAL** | 4 | Factual errors, unverified claims, legal risk |
| 🟡 **HIGH** | 7 | Missing data, weak arguments, credibility gaps |
| 🟢 **MEDIUM** | 12 | Clarification needed, tone issues, structure |
| 🔵 **LOW** | 6 | Style, formatting, minor improvements |

**Verdict:** NOT READY FOR PUBLICATION. Requires significant revision before arXiv/ethresear.ch submission.

---

## 🔴 CRITICAL ISSUES (Must Fix Before Publication)

### C1: Unverified TPS Claims — "Sustained 200,000+ TPS"

**Location:** Abstract, Section 2, Section 5

**Issue:** The paper claims 200,000+ TPS sustained on L2. This number has NOT been independently verified. The benchmark was likely run on isolated infrastructure, not a production-like network with network latency, gossip overhead, and real validator diversity.

**Risk:** Academic reviewers and Hacker News will immediately challenge this. If pressed for reproducibility and the number doesn't hold, credibility is destroyed.

**Fix Required:**
- Add detailed benchmark methodology including network topology
- Disclose exact hardware, geographic distribution of nodes
- Distinguish "sustained" (1+ hour) vs "peak" (burst)
- Add disclaimer: "Preliminary benchmarks on test infrastructure; mainnet performance may vary"
- Consider conservative claim: "Target 100,000+ TPS sustained" until fully validated

**Priority:** CRITICAL — This is your headline claim.

---

### C2: ML-DSA Precompile Implementation Status

**Location:** Section 3.3, Abstract

**Issue:** The paper describes ML-DSA precompile at `0x0120` with specific gas costs as if it's implemented and live. Verify: Is this ACTUALLY implemented in the current codebase and working? Or is it planned?

**Risk:** Publishing a paper describing working features that don't exist is academic fraud. ethresear.ch reviewers will test the precompile.

**Fix Required:**
- Verify precompile is actually deployed on testnet
- If not deployed: Change to "proposed implementation" or "in development"
- If deployed: Add testnet contract address, verification link
- Add footnote: "Currently on testnet; mainnet deployment pending audit"

**Priority:** CRITICAL — Cannot claim working features that don't exist.

---

### C3: EIP-7702 "Native Implementation" Claim

**Location:** Section 4.2, Abstract, Comparison Table

**Issue:** EIP-7702 is a PROPOSAL (status: Review). It is NOT finalized. Claiming "native EIP-7702" implementation implies a finalized spec, but the spec may change before finalization.

**Risk:** Technical inaccuracy. If EIP-7702 changes, your implementation becomes non-compliant.

**Fix Required:**
- Change "EIP-7702 native implementation" to "EIP-7702 candidate implementation" or "account abstraction inspired by EIP-7702"
- Add footnote: "EIP-7702 is currently in Review status; implementation may be adjusted to match final specification"
- Clarify: Is it ACTUALLY EIP-7702 or your own AA mechanism?

**Priority:** CRITICAL — Specification status is verifiable.

---

### C4: Tokenomics — "Genesis Access" Legal Framing

**Location:** Section 7, Token Table

**Issue:** Describing a presale/ICO structure in a whitepaper carries securities law implications. The 10% "Genesis Access" allocation with pricing ($0.01/BESA) and vesting looks like an investment contract.

**Risk:** SEC or other regulators could view this as an unregistered securities offering. The Howey Test is triggered by: (1) investment of money, (2) common enterprise, (3) expectation of profit, (4) from efforts of others.

**Fix Required:**
- Remove specific pricing ($0.01) from whitepaper
- Remove presale details from tokenomics table
- Frame as "community distribution" not "presale"
- Move all fundraising details to a separate legal document (SAFT, Token Purchase Agreement)
- Add disclaimer: "This whitepaper is for informational purposes only and does not constitute an offer to sell or solicitation of an offer to buy any securities"
- Consult securities counsel before publication

**Priority:** CRITICAL — Legal exposure.

---

## 🟡 HIGH PRIORITY ISSUES

### H1: Missing BLS12-381 Precompile Evidence

**Location:** Appendix B

**Issue:** You list BLS12-381 at `0x0110` but don't discuss it in the paper. Is this implemented? If so, why include it without explanation? If not, why list it?

**Fix:** Either add a section on BLS fast finality or remove from appendix.

---

### H2: Comparison Table Data Sources

**Location:** Section 6.1, 6.2

**Issue:** Comparative numbers for Solana, Monad, Sei, Arbitrum are stated as fact without sources. These numbers are contentious and vary by methodology.

**Fix Required:**
- Add citations for every competitor number
- Or add disclaimer: "Figures represent commonly cited estimates; actual performance varies by conditions"
- Better: Remove specific numbers and use qualitative comparisons ("10x faster than BSC")

---

### H3: "10 Billion Daily Transactions" Source

**Location:** Section 1

**Issue:** "By conservative estimates, autonomous agents will generate billions of daily transactions within this decade." No source provided.

**Fix:** Cite a specific report or remove the claim. This feels like invented FUD.

---

### H4: Google Willow Quantum Threat Overstated

**Location:** Section 3.1

**Issue:** Google Willow (Dec 2024) is cited as evidence of near-term quantum threat. Willow has 105 qubits. Breaking ECDSA requires ~20 MILLION physical qubits (or ~4,000 logical qubits). Willow is not a threat to current cryptography.

**Fix Required:**
- Clarify that Willow represents progress but does not threaten current cryptography
- Cite actual quantum computing roadmaps (IBM: 1,000 qubits by 2026, 100,000 by 2033)
- Be precise: "Cryptographically-relevant quantum computers may arrive within 10-15 years" — cite source

---

### H5: "10x Faster Than BSC+opBNB Combined"

**Location:** Section 2.2

**Issue:** Mathematical claim without showing work. BSC ~160 TPS + opBNB ~4,000 TPS = 4,160 TPS. Besa L1+L2 = 210,500 TPS. 210,500 / 4,160 = 50.6x, not 10x.

**Fix:** Either correct the math (50x) or remove the claim entirely. Inaccurate math destroys credibility.

---

### H6: Empty Appendices

**Location:** Appendix A, B

**Issue:** "TBD at genesis" and "TBD" placeholders look unprofessional. Either fill them or remove appendices until data is available.

**Fix:** Remove appendices A and B until chain IDs and contract addresses are finalized.

---

### H7: Audit Status Unclear

**Location:** Appendix C

**Issue:** "Audited by [TBD: CertiK/Hacken/PeckShield]" — this suggests no audit has occurred.

**Fix:** If no audit yet, state: "Security audits scheduled for [date]; results will be published prior to mainnet launch." Do not imply audits are complete.

---

## 🟢 MEDIUM PRIORITY ISSUES

### M1: "Albanian Concept of Besa" — Cultural Sensitivity

**Location:** Section 9 (Conclusion)

**Issue:** Using Albanian cultural concept for commercial blockchain branding could be seen as appropriation, especially given your background. Some Albanians may view this positively (representation), others may view it as commodification.

**Fix:** Consider adding a personal note: "The author, of Albanian heritage, invokes besa as both cultural inheritance and technical principle." This frames it as authentic, not appropriative.

---

### M2: Solo Founder Implication

**Location:** Throughout (implied)

**Issue:** The paper doesn't disclose that this is primarily a solo founder project. Academic reviewers and investors will research the team. Lack of transparency about team size creates trust issues.

**Fix:** Add an "Authors and Affiliations" section acknowledging solo development with AI assistance (Claude Code). Honesty about constraints builds trust.

---

### M3: L2 Gas Cost Claim — "~0.001 Gwei"

**Location:** Comparison tables

**Issue:** This is a target, not a measured value. On a live network with congestion, gas costs fluctuate.

**Fix:** Change to "Target: 0.001 Gwei base fee" or "Estimated average under normal load."

---

### M4: "NIST Level 3 Security" Oversimplification

**Location:** Section 3.2

**Issue:** ML-DSA-65 provides NIST Level 3 security, but this is NOT equivalent to "AES-192" in a practical sense. The comparison is misleading.

**Fix:** Remove the AES comparison. Simply state: "ML-DSA-65 provides NIST PQC Security Level 3, suitable for high-security applications."

---

### M5: Missing Discussion on Signature Size Overhead

**Location:** Section 3

**Issue:** ML-DSA signatures are ~10x larger than ECDSA (3,293 bytes vs 64 bytes). This has significant storage and bandwidth implications not discussed.

**Fix:** Add a paragraph on trade-offs: "ML-DSA signatures require ~50x more storage than ECDSA, increasing chain storage requirements. Besa addresses this through [compression/mechanism]."

---

### M6: No Discussion of Quantum-Resistant Hash Functions

**Location:** Section 3

**Issue:** You focus on ML-DSA for signatures, but SHA-256 (used throughout blockchain) is also vulnerable to quantum attacks (Grover's algorithm). A post-quantum chain should address this.

**Fix:** Either acknowledge this limitation or discuss plans for SHA-3/SHAKE migration.

---

### M7: BLS Fast Finality — Not Explained

**Location:** Tables, specs

**Issue:** "BLS fast finality (~3s)" appears in tables but is never explained in the text.

**Fix:** Add a paragraph explaining BLS signature aggregation and how it enables fast finality in Parlia consensus.

---

### M8: "Target: US/West Developers" — Exclusionary Language

**Location:** Abstract, Section 2.1

**Issue:** Explicitly targeting "US/West" developers while having a separate "LibyaChain" for MENA could be viewed as creating a two-tier system.

**Fix:** Soften to: "Primary focus on global developers seeking high-throughput, quantum-safe infrastructure." Let the product speak for itself without geographic signaling.

---

### M9: EIP-7702 Gas Savings Claim — "~30%"

**Location:** Section 4.2

**Issue:** The 30% gas savings vs ERC-4337 is an estimate, not measured.

**Fix:** Add citation or change to "estimated 20-40% reduction."

---

### M10: Roadmap Phase 4: "Binance Listing Consideration"

**Location:** Section 8

**Issue:** Listing Binance as a roadmap milestone implies coordination or expectation that doesn't exist. Binance doesn't pre-commit to listings.

**Fix:** Change to: "Evaluate Tier-1 exchange readiness based on community and volume metrics."

---

### M11: No Discussion of Validator Centralization Risk

**Location:** Throughout

**Issue:** Parlia PoSA with only 8 validators at launch is highly centralized. This is a major critique of BSC and applies equally to Besa.

**Fix:** Add a "Decentralization Roadmap" subsection acknowledging initial centralization and plans for validator expansion (target: 21 validators within 6 months, permissionless within 12 months).

---

### M12: Missing Reproducibility Details

**Location:** Section 5.3

**Issue:** The GitHub link and command are placeholders. The repo doesn't exist yet.

**Fix:** Either create the repo with actual benchmark code BEFORE publishing, or remove this section until ready.

---

## 🔵 LOW PRIORITY ISSUES

### L1: Abstract Length

**Location:** Abstract

**Issue:** Abstract is ~180 words. Most CS papers target 150 words max.

**Fix:** Trim to 150 words or fewer.

---

### L2: "Besa Labs Research Team"

**Location:** Document Information

**Issue:** There is no "Besa Labs Research Team" yet. It's you and Claude.

**Fix:** Change to "Besa Labs" or use your name.

---

### L3: License Choice

**Location:** Document Information

**Issue:** CC BY-SA 4.0 is unusual for technical whitepapers. Most use less restrictive licenses (CC BY 4.0) or copyright with permission grants.

**Fix:** Consider CC BY 4.0 (removes ShareAlike requirement) or standard copyright.

---

### L4: Hacker News Tone

**Location:** Throughout

**Issue:** Some claims ("peak HN engagement," "bait") suggest the paper is optimized for HN virality rather than academic rigor.

**Fix:** Remove marketing language. Focus on technical substance. HN upvotes quality, not hype.

---

### L5: Missing Related Work Section

**Location:** Structure

**Issue:** No dedicated "Related Work" section discussing prior quantum-resistant blockchain efforts (Ethereum's quantum roadmap, QANplatform, etc.).

**Fix:** Add Section 2.5 or integrate into Section 6. Acknowledge prior work and differentiate.

---

### L6: Figure/Table Placement

**Location:** Throughout

**Issue:** No figures, diagrams, or architecture charts. Pure text is harder to follow.

**Fix:** Add:
- Architecture diagram (L1/L2 relationship)
- Signature size comparison chart
- TPS benchmark graph
- Tokenomics pie chart

---

## Recommended Revision Priority

### Phase 1: Blockers (Do Not Publish)
1. Fix C1 (TPS verification)
2. Fix C2 (ML-DSA status)
3. Fix C3 (EIP-7702 status)
4. Fix C4 (tokenomics legal framing)

### Phase 2: Credibility (Publish But Weak)
5. Fix H1-H7 (missing data, sources)
6. Fix M11 (centralization acknowledgment)

### Phase 3: Polish
7. Fix M1-M10, L1-L6 (clarity, tone, formatting)

---

## Alternative Publication Strategy

Given the issues, consider publishing in stages:

**Stage 1 (Now):** Publish as "Technical Draft" on Mirror.xyz with prominent "DRAFT — UNDER REVIEW" banner. Get community feedback before formal submission.

**Stage 2 (After Fixes):** Submit to arXiv (cs.CR or cs.DC) as preprint.

**Stage 3 (After Audit + Testnet Live):** Submit to ethresear.ch with working code links.

**Stage 4 (After Mainnet):** Submit to academic conference (IEEE, ACM) for peer review.

---

## Questions for Author

1. **TPS Benchmarks:** Have you actually measured 200K sustained TPS on L2? Under what conditions? Can you reproduce it right now?

2. **ML-DSA Precompile:** Is `0x0120` actually deployed on testnet? Can you provide a testnet transaction hash verifying it works?

3. **EIP-7702:** Have you implemented the EIP-7702 spec exactly as written, or your own variation? If the spec changes, will you update?

4. **Team:** Should we add an "Authors" section acknowledging solo development?

5. **Funding:** Should we remove ALL token sale details and move to separate legal doc?

6. **LibyaChain Connection:** Should we mention LibyaChain at all? The dual-chain strategy might confuse readers focused on Besa alone.

---

**Recommendation:** Do not publish this whitepaper to arXiv, ethresear.ch, or Hacker News until at least C1-C4 are resolved. Publishing prematurely with unverified claims or legal exposure could cause irreversible credibility damage.

**Estimated Fix Time:** 3-5 hours for critical issues, 1-2 days for all issues.

---

*Review completed: April 7, 2026*
*Next review scheduled: After critical fixes*
