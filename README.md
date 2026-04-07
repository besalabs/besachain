# Besa Chain

**Post-quantum EVM for the AI era.**

[![X](https://img.shields.io/badge/X-@BesaLabs-black)](https://x.com/BesaLabs)
[![Website](https://img.shields.io/badge/Website-besachain.com-blue)](https://besachain.com)

---

## Overview

Besa Chain is a dual-layer EVM blockchain optimized for autonomous AI agent transactions:

- **200,000+ TPS sustained** (L1+L2 combined)
- **ML-DSA quantum precompile** (NIST FIPS 204)
- **EIP-7702-based account abstraction** for agent-native onboarding
- **Full EVM compatibility** — deploy existing Solidity contracts without modification

**Besa** (Albanian): The sacred promise that cannot be broken.

---

## Why Besa?

The autonomous agent economy requires infrastructure that doesn't exist:

1. **Throughput:** Billions of daily agent transactions need 100,000+ TPS
2. **Quantum Security:** ECDSA will be broken by quantum computers; ML-DSA is NIST-standardized post-quantum cryptography
3. **Agent Onboarding:** AI agents need programmatic key management and gas abstraction

---

## Architecture

| Layer | Throughput | Block Time | Key Features |
|-------|-----------|------------|--------------|
| **Besa L1** | ~10,500 TPS | 0.45s | Parlia PoSA, ML-DSA precompile (0x0120), BLS finality |
| **Besa L2** | ~200,000+ TPS | 0.25s | OP Stack Fourier, near-zero gas (~0.001 Gwei) |

---

## Documentation

- [Whitepaper](./WHITEPAPER.md) — Technical architecture and research
- [Launch Strategy](./docs/2026-04-06-besa-chain-launch-strategy-design.md) — Community building and exchange roadmap
- [Critical Review](./docs/2026-04-07-besa-whitepaper-CRITICAL-REVIEW.md) — Self-assessment and improvement areas

---

## Quick Links

- **Website:** [besachain.com](https://besachain.com)
- **Foundation:** [besachain.org](https://besachain.org)
- **X/Twitter:** [@BesaLabs](https://x.com/BesaLabs)
- **Contact:** besachain.team@gmail.com

---

## Status

- **Testnet:** In development
- **Mainnet:** Planned
- **Whitepaper:** Draft — under review

---

## License

This project is licensed under the MIT License — see individual repositories for details.

---

**Note:** Besa Chain is an independent project. While it shares technological heritage with research in high-throughput EVM chains, it operates as a separate entity with its own genesis, validator set, and governance.
