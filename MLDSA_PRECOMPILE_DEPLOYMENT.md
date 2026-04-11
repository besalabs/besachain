# ML-DSA Native Precompile - Deployment Complete ✅

## Summary

The ML-DSA (Dilithium) post-quantum signature verification precompile has been **successfully built and deployed** on the BesaChain Testnet L1.

## Binary Information

| Field | Value |
|-------|-------|
| **Binary Path** | `/data/bsc-geth` (server) |
| **Binary Size** | 109 MB |
| **Architecture** | ELF 64-bit LSB executable, x86-64 |
| **Go Version** | go1.25.8 |
| **Build Date** | April 9, 2026 |
| **ML-DSA Symbols** | 30+ functions |

## Precompile Addresses

| Address | Purpose | Gas Cost |
|---------|---------|----------|
| `0x0000000000000000000000000000000000000120` | ML-DSA-65 Single Verification | 20,000 |
| `0x0000000000000000000000000000000000000121` | ML-DSA-65 Batch Verification | 15,000 per sig |

## Technical Implementation

### Library
- **CIRCL** (Cloudflare Interoperable Reusable Cryptographic Library) v1.6.3
- NIST FIPS 204 compliant ML-DSA-65 implementation
- Pure Go with assembly optimizations

### Constants (FIPS 204)
| Parameter | Value |
|-----------|-------|
| Public Key Size | 1,952 bytes |
| Signature Size | 3,309 bytes |
| Security Level | NIST Level 3 (AES-192 equivalent) |

### Source Files
```
besachain/op-geth/core/vm/
├── mldsa.go           # ML-DSA precompile implementation
├── contracts.go       # Precompile registry (updated)
└── contracts_test.go  # Tests (5/5 passing)
```

## Network Status

- **Chain ID**: 14440 (0x3868)
- **RPC Endpoint**: `http://54.235.85.175:18445`
- **Status**: Active

## Usage Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MLDSAVerifierExample {
    address constant MLDSA_PRECOMPILE = address(0x0120);
    
    function verifySignature(
        bytes memory publicKey,    // 1952 bytes
        bytes memory signature,    // 3309 bytes  
        bytes memory message
    ) public view returns (bool) {
        require(publicKey.length == 1952, "Invalid PK size");
        require(signature.length == 3309, "Invalid sig size");
        
        // Concatenate input: PK || Sig || Message
        bytes memory input = abi.encodePacked(publicKey, signature, message);
        
        // Call precompile
        (bool success, bytes memory result) = MLDSA_PRECOMPILE.staticcall(input);
        
        if (!success || result.length == 0) {
            return false;
        }
        
        // Result is 32 bytes: 0x00..01 for valid, 0x00..00 for invalid
        return uint256(bytes32(result)) == 1;
    }
}
```

## Deployment History

1. **Initial Implementation**: ML-DSA code written and tested locally
2. **Cross-Compilation Attempt**: Failed due to CGO/BLS library dependencies
3. **Server Build**: Source synced to EC2, built natively on Linux
4. **Binary Deployment**: New binary installed and service restarted
5. **Verification**: Precompiles registered and responding

## Alternative: Solidity Contract

A Solidity-based ML-DSA verifier is also deployed at:
- **Address**: `0x6388258d6161c46f8efa39eb803949624056932b`
- **Gas Cost**: ~871,720 gas (vs 20,000 for native precompile)

## Testing

Local tests pass (5/5):
- ✅ Basic signature verification
- ✅ Invalid signature rejection
- ✅ Wrong message detection
- ✅ Constants validation
- ✅ Batch verification

Run tests:
```bash
cd besachain/op-geth
go test -v ./core/vm -run TestMLDSA
```

## References

- [FIPS 204](https://csrc.nist.gov/projects/post-quantum-cryptography) - NIST Post-Quantum Cryptography Standard
- [CIRCL](https://github.com/cloudflare/circl) - Cloudflare Cryptographic Library
- [ML-DSA Specification](https://csrc.nist.gov/pubs/fips/204/final) - NIST FIPS 204 Final

---

**Deployed**: April 9, 2026  
**Status**: ✅ ACTIVE  
**Security Level**: Post-Quantum (NIST Level 3)
