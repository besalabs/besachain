# ML-DSA Implementation Verification Report
## BesaChain Post-Quantum Cryptography Audit

**Auditor:** Cryptography & Blockchain Security Engineer  
**Date:** April 9, 2026  
**Repository:** `/Users/senton/besachain/`  
**Scope:** ML-DSA (FIPS 204) implementation verification

---

## Executive Summary

| Category | Finding |
|----------|---------|
| **Overall Status** | ❌ **NOT IMPLEMENTED** |
| **Precompile at 0x0120** | Does not exist |
| **Transaction Signing** | ECDSA (secp256k1) only |
| **FIPS 204 Compliance** | No evidence found |
| **Documentation Accuracy** | Misleading claims in whitepaper |

---

## 1. Precompile Contract Verification

### Claim
The BesaChain whitepaper (v1.0-draft) claims:
> "Besa implements ML-DSA-65 at precompile address `0x0120`, providing NIST Level 3 security with practical signature sizes."

### Evidence

**File Examined:** `/Users/senton/besachain/op-geth/core/vm/contracts.go`

This file contains all precompiled contracts for the EVM. The precompiles defined are:

| Address | Precompile | Description |
|---------|------------|-------------|
| 0x01 | `ecrecover` | ECDSA recovery |
| 0x02 | `sha256hash` | SHA-256 hash |
| 0x03 | `ripemd160hash` | RIPEMD-160 hash |
| 0x04 | `dataCopy` | Identity/data copy |
| 0x05 | `bigModExp` | Modular exponentiation |
| 0x06 | `bn256AddIstanbul` | BN256 elliptic curve addition |
| 0x07 | `bn256ScalarMulIstanbul` | BN256 scalar multiplication |
| 0x08 | `bn256PairingIstanbul` | BN256 pairing check |
| 0x09 | `blake2F` | BLAKE2b compression |
| 0x0a | `kzgPointEvaluation` | EIP-4844 KZG verification |
| 0x0100 | `p256Verify` | secp256r1 signature verification |
| 0x66 (102) | `blsSignatureVerify` | BLS signature verification |
| 0x67 (103) | `cometBFTLightBlockValidate` | CometBFT light client |

**CRITICAL FINDING:** There is **NO precompile at address 0x0120**. The address 0x0120 (288 in decimal) is completely unassigned in the precompile registry.

### Code Reference
```go
// From contracts.go - PrecompiledContractsFjord (latest fork)
var PrecompiledContractsFjord = map[common.Address]PrecompiledContract{
    common.BytesToAddress([]byte{1}):          &ecrecover{},
    common.BytesToAddress([]byte{2}):          &sha256hash{},
    common.BytesToAddress([]byte{3}):          &ripemd160hash{},
    common.BytesToAddress([]byte{4}):          &dataCopy{},
    common.BytesToAddress([]byte{5}):          &bigModExp{eip2565: true},
    common.BytesToAddress([]byte{6}):          &bn256AddIstanbul{},
    common.BytesToAddress([]byte{7}):          &bn256ScalarMulIstanbul{},
    common.BytesToAddress([]byte{8}):          &bn256PairingIstanbul{},
    common.BytesToAddress([]byte{9}):          &blake2F{},
    common.BytesToAddress([]byte{0x0a}):       &kzgPointEvaluation{},
    common.BytesToAddress([]byte{0x01, 0x00}): &p256Verify{},  // 0x0100 = 256
    
    // BSC-specific precompiles
    common.BytesToAddress([]byte{102}): &blsSignatureVerify{},        // 0x66
    common.BytesToAddress([]byte{103}): &cometBFTLightBlockValidate{}, // 0x67
}
```

**No ML-DSA precompile exists at 0x0120 (288).**

---

## 2. Transaction Signing Verification

### Claim
The whitepaper claims:
> "Besa supports dual-signature transactions: users may sign with either ECDSA (legacy) or ML-DSA (quantum-safe)."

### Evidence

**File Examined:** `/Users/senton/besachain/op-geth/core/types/transaction_signing.go`

The transaction signing implementation shows:

```go
// Line 99-106: SignTx uses ECDSA only
func SignTx(tx *Transaction, s Signer, prv *ecdsa.PrivateKey) (*Transaction, error) {
    h := s.Hash(tx)
    sig, err := crypto.Sign(h[:], prv)
    if err != nil {
        return nil, err
    }
    return tx.WithSignature(s, sig)
}
```

**Key Findings:**
1. The `SignTx` function accepts only `*ecdsa.PrivateKey` - no ML-DSA key support
2. The `crypto.Sign` function produces 65-byte ECDSA signatures (secp256k1)
3. All signer implementations (`CancunSigner`, `LondonSigner`, `EIP155Signer`, etc.) use ECDSA recovery via `recoverPlain()`

**File Examined:** `/Users/senton/besachain/op-geth/crypto/crypto.go`

```go
// Line 40: Signature length is 65 bytes (ECDSA)
const SignatureLength = 64 + 1 // 64 bytes ECDSA signature + 1 byte recovery id
```

**CRITICAL FINDING:** ML-DSA-65 signatures are **3,293 bytes** according to FIPS 204. The codebase only supports **65-byte ECDSA signatures**. There is no mechanism to handle ML-DSA signatures in transactions.

---

## 3. Cryptographic Dependencies

### Evidence

**File Examined:** `/Users/senton/besachain/op-geth/go.mod`

The Go module dependencies include:
- Standard Go crypto libraries (`crypto/ecdsa`, `crypto/elliptic`)
- `golang.org/x/crypto` (standard extensions)
- `github.com/ethereum/go-ethereum/crypto/secp256k1` (Bitcoin's secp256k1)
- `github.com/ethereum/go-ethereum/crypto/bls12381` (BLS12-381)
- `github.com/ethereum/go-ethereum/crypto/bn256` (BN256 curve)

**CRITICAL FINDING:** There are **NO dependencies** on any ML-DSA or Dilithium libraries. No packages such as:
- `github.com/cloudflare/circl` (CIRCL PQC library)
- `golang.org/x/crypto/cryptobyte` (no ML-DSA usage)
- Any NIST PQC reference implementations

---

## 4. Smart Contract Analysis

### Evidence

**Files Examined:** 
- `/Users/senton/besachain/contracts/token/BesaToken.sol`
- `/Users/senton/besachain/contracts/dex/*.sol`

**Findings:**
- No smart contracts call address `0x0120`
- No ML-DSA verifier contracts exist
- All contracts use standard ECDSA signatures via OpenZeppelin's ERC20Permit

---

## 5. Documentation Review

### Critical Review Document

An internal critical review document exists at:
`/Users/senton/besachain/docs/2026-04-07-besa-whitepaper-CRITICAL-REVIEW.md`

This document explicitly flags the ML-DSA claim as a **CRITICAL ISSUE (C2)**:

> **C2: ML-DSA Precompile Implementation Status**
> 
> **Issue:** The paper describes ML-DSA precompile at `0x0120` with specific gas costs as if it's implemented and live. Verify: Is this ACTUALLY implemented in the current codebase and working? Or is it planned?
> 
> **Risk:** Publishing a paper describing working features that don't exist is academic fraud. ethresear.ch reviewers will test the precompile.
> 
> **Fix Required:**
> - Verify precompile is actually deployed on testnet
> - If not deployed: Change to "proposed implementation" or "in development"
> - If deployed: Add testnet contract address, verification link

**The document confirms the implementation status was already flagged as questionable.**

---

## 6. Gap Analysis

To properly implement ML-DSA in BesaChain, the following components would be required:

### Required Implementation Components

| Component | Status | Effort Estimate |
|-----------|--------|-----------------|
| ML-DSA Library Integration | ❌ Missing | 2-4 weeks |
| Precompile at 0x0120 | ❌ Missing | 1-2 weeks |
| Transaction Type for ML-DSA | ❌ Missing | 2-3 weeks |
| Wallet/Key Management | ❌ Missing | 2-4 weeks |
| FIPS 204 Compliance Testing | ❌ Missing | 2-3 weeks |
| NIST Test Vector Validation | ❌ Missing | 1-2 weeks |

### Required Code Changes

1. **Add ML-DSA library dependency** (e.g., CIRCL or NIST reference implementation)
2. **Create precompile implementation** in `core/vm/contracts.go`:
   ```go
   type mlDsaVerify struct{}
   func (c *mlDsaVerify) RequiredGas(input []byte) uint64 { return 20000 }
   func (c *mlDsaVerify) Run(input []byte) ([]byte, error) { /* ML-DSA verify */ }
   ```
3. **Add precompile to all fork configurations** at address 0x0120
4. **Create new transaction type** supporting ML-DSA signatures (3,293 bytes)
5. **Modify `transaction_signing.go`** to support ML-DSA key types
6. **Add gas pricing** for large signature overhead
7. **Implement constant-time operations** to prevent side-channel attacks

---

## 7. Recommendations

### Immediate Actions

1. **Correct Documentation:** Update the whitepaper to accurately reflect that ML-DSA is **planned but not implemented**
2. **Remove False Claims:** Do not claim FIPS 204 compliance or "quantum-resistant" status until implementation is complete
3. **Implement Precompile:** If ML-DSA is a priority, begin actual implementation following the gap analysis above

### Testing Requirements

Before claiming ML-DSA implementation:

1. **NIST Test Vectors:** Validate against NIST FIPS 204 test vectors
2. **Performance Benchmarks:** Measure actual gas costs (likely much higher than claimed 20K)
3. **Security Audit:** Third-party audit of the implementation
4. **Testnet Deployment:** Deploy to public testnet with verifiable transaction hashes

### Compliance Considerations

**Legal Risk:** The current whitepaper claims could be considered securities fraud if:
- The project solicits investment based on false technical claims
- The "post-quantum" claim is a material factor in investment decisions
- The grant application to BNB Chain contains false implementation claims

---

## 8. Conclusion

### Summary

| Claim | Evidence | Verdict |
|-------|----------|---------|
| ML-DSA precompile at 0x0120 | Not found in contracts.go | ❌ **FALSE** |
| FIPS 204 compliance | No implementation found | ❌ **FALSE** |
| Dual-signature transactions | Only ECDSA supported | ❌ **FALSE** |
| Quantum-resistant blockchain | No PQC primitives | ❌ **FALSE** |

### Final Assessment

**ML-DSA is NOT implemented in BesaChain.** The whitepaper contains misleading claims about post-quantum cryptography that are not supported by the codebase. The critical review document dated April 7, 2026 already identified this as a critical issue requiring correction before publication.

The BesaChain codebase is a standard EVM-compatible blockchain (BSC/OP Stack fork) using conventional ECDSA (secp256k1) signatures with no post-quantum cryptography.

---

## Appendix: Evidence Locations

### Files Examined

1. `/Users/senton/besachain/op-geth/core/vm/contracts.go` - Precompile registry
2. `/Users/senton/besachain/op-geth/core/types/transaction_signing.go` - Transaction signing
3. `/Users/senton/besachain/op-geth/crypto/crypto.go` - Cryptographic primitives
4. `/Users/senton/besachain/op-geth/go.mod` - Dependencies
5. `/Users/senton/besachain/WHITEPAPER.md` - Claims documentation
6. `/Users/senton/besachain/docs/2026-04-07-besa-whitepaper-CRITICAL-REVIEW.md` - Internal review

### Git Information

```
Repository: /Users/senton/besachain/op-geth
Latest commit: April 9, 2026
Branch: main
```

---

**Report Prepared By:** Cryptography & Blockchain Security Engineer  
**Date:** April 9, 2026  
**Classification:** Technical Verification Report
