// Copyright 2026 BesaChain Authors
// ML-DSA (Dilithium) Post-Quantum Signature Precompile
// Implements FIPS 204 ML-DSA-65 for quantum-resistant signatures

package vm

import (
	"encoding/binary"
	"errors"
	"fmt"

	"github.com/cloudflare/circl/sign/mldsa/mldsa65"
	"github.com/ethereum/go-ethereum/common"
)

// ML-DSA-65 constants per FIPS 204
const (
	MLDSAPublicKeySize  = mldsa65.PublicKeySize  // 1952 bytes
	MLDSASignatureSize  = mldsa65.SignatureSize  // 3309 bytes (CIRCL implementation)
	MLDSAMessageSize    = 32                     // Typical message hash size
	MLDSAPrecompileAddr = 0x0120                 // Precompile address for ML-DSA verification
)

var (
	ErrInvalidMLDSAPublicKey   = errors.New("invalid ML-DSA public key size")
	ErrInvalidMLDSASignature   = errors.New("invalid ML-DSA signature size")
	ErrMLDSAVerificationFailed = errors.New("ML-DSA signature verification failed")
)

// mldsaVerify implements the ML-DSA-65 signature verification precompile
type mldsaVerify struct{}

// RequiredGas returns the gas required to execute the ML-DSA verification precompile
// ML-DSA verification is computationally expensive due to lattice operations
func (c *mldsaVerify) RequiredGas(input []byte) uint64 {
	// Base gas cost for ML-DSA verification
	// This is significantly higher than ECDSA due to complexity
	baseGas := uint64(20000)

	// Add per-byte cost for large inputs
	inputLen := uint64(len(input))
	if inputLen > MLDSAPublicKeySize+MLDSASignatureSize {
		baseGas += (inputLen - MLDSAPublicKeySize - MLDSASignatureSize) * 10
	}

	return baseGas
}

// Run executes the ML-DSA signature verification
// Input format:
// - Bytes 0-31:   Message hash (32 bytes)
// - Bytes 32-3244: Signature (3293 bytes, ML-DSA-65)
// - Bytes 3245-5196: Public key (1952 bytes, ML-DSA-65)
// Total: 5277 bytes minimum
// Returns: 32 bytes - 0x00..01 for success, 0x00..00 for failure
func (c *mldsaVerify) Run(input []byte) ([]byte, error) {
	// Minimum input size: message (32) + signature (3293) + public key (1952) = 5277 bytes
	const minInputSize = 32 + MLDSASignatureSize + MLDSAPublicKeySize

	if len(input) < minInputSize {
		return nil, fmt.Errorf("input too short: got %d bytes, need at least %d", len(input), minInputSize)
	}

	// Extract message hash (first 32 bytes)
	message := input[0:32]

	// Extract signature (next 3293 bytes)
	signature := input[32 : 32+MLDSASignatureSize]

	// Extract public key (next 1952 bytes)
	publicKeyBytes := input[32+MLDSASignatureSize : 32+MLDSASignatureSize+MLDSAPublicKeySize]

	// Verify the signature using CIRCL ML-DSA-65
	success := verifyMLDSA(message, signature, publicKeyBytes)

	// Return 32-byte result (Ethereum convention for boolean returns)
	result := make([]byte, 32)
	if success {
		result[31] = 1
	}

	return result, nil
}

// verifyMLDSA performs actual ML-DSA-65 signature verification using CIRCL
func verifyMLDSA(message, signature, publicKeyBytes []byte) bool {
	// Validate sizes
	if len(publicKeyBytes) != MLDSAPublicKeySize {
		return false
	}
	if len(signature) != MLDSASignatureSize {
		return false
	}
	if len(message) != 32 {
		return false
	}

	// Load the public key
	var pk mldsa65.PublicKey
	if err := pk.UnmarshalBinary(publicKeyBytes); err != nil {
		return false
	}

	// Verify the signature using CIRCL
	// ctx is nil for standard verification (empty context)
	return mldsa65.Verify(&pk, message, nil, signature)
}

// mldsaBatchVerify implements batch verification for multiple ML-DSA signatures
type mldsaBatchVerify struct{}

// RequiredGas returns gas for batch verification (more efficient per-signature)
func (c *mldsaBatchVerify) RequiredGas(input []byte) uint64 {
	// Parse number of signatures from first 4 bytes
	if len(input) < 4 {
		return 20000
	}

	numSigs := binary.BigEndian.Uint32(input[0:4])
	if numSigs == 0 || numSigs > 100 {
		return 20000
	}

	// Batch verification is more efficient: 15K per signature instead of 20K
	return uint64(numSigs) * 15000
}

// Run executes batch ML-DSA verification
// Input format:
// - Bytes 0-3: Number of signatures (uint32, big-endian)
// - For each signature:
//   - 32 bytes: Message hash
//   - 3293 bytes: Signature
//   - 1952 bytes: Public key
// Returns: Array of 32-byte results
func (c *mldsaBatchVerify) Run(input []byte) ([]byte, error) {
	if len(input) < 4 {
		return nil, errors.New("input too short for batch count")
	}

	numSigs := binary.BigEndian.Uint32(input[0:4])
	if numSigs == 0 {
		return make([]byte, 32), nil // Empty batch returns success
	}
	if numSigs > 100 {
		return nil, errors.New("batch size too large (max 100)")
	}

	const entrySize = 32 + MLDSASignatureSize + MLDSAPublicKeySize // 5277 bytes per entry
	expectedLen := 4 + int(numSigs)*entrySize

	if len(input) < expectedLen {
		return nil, fmt.Errorf("input too short for %d signatures: got %d, need %d", numSigs, len(input), expectedLen)
	}

	// Result: one 32-byte word per signature
	results := make([]byte, numSigs*32)

	for i := uint32(0); i < numSigs; i++ {
		offset := 4 + int(i)*entrySize
		message := input[offset : offset+32]
		signature := input[offset+32 : offset+32+MLDSASignatureSize]
		publicKeyBytes := input[offset+32+MLDSASignatureSize : offset+32+MLDSASignatureSize+MLDSAPublicKeySize]

		success := verifyMLDSA(message, signature, publicKeyBytes)
		if success {
			results[i*32+31] = 1
		}
	}

	return results, nil
}

// Helper function to check if ML-DSA precompiles are registered
func init() {
	// ML-DSA precompiles are registered in contracts.go
	// This init function ensures the package is loaded
}

// GetMLDSAPrecompileAddress returns the precompile address for ML-DSA verification
func GetMLDSAPrecompileAddress() common.Address {
	return common.BytesToAddress([]byte{0x01, 0x20}) // 0x0120
}

// GetMLDSABatchPrecompileAddress returns the precompile address for batch verification
func GetMLDSABatchPrecompileAddress() common.Address {
	return common.BytesToAddress([]byte{0x01, 0x21}) // 0x0121
}
