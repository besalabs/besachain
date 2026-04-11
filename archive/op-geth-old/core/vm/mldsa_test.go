// Copyright 2026 BesaChain Authors
// ML-DSA Precompile Tests

package vm

import (
	"encoding/binary"
	"fmt"
	"testing"

	"github.com/cloudflare/circl/sign/mldsa/mldsa65"
)

func TestMLDSAPrecompile_BasicVerification(t *testing.T) {
	// Generate a test key pair
	pk, sk, err := mldsa65.GenerateKey(nil)
	if err != nil {
		t.Fatalf("Failed to generate key: %v", err)
	}

	// Create a test message (32 bytes)
	message := make([]byte, 32)
	copy(message, []byte("BesaChain ML-DSA Test Message"))

	// Sign the message
	signature := make([]byte, mldsa65.SignatureSize)
	err = mldsa65.SignTo(sk, message, nil, false, signature)
	if err != nil {
		t.Fatalf("Failed to sign: %v", err)
	}

	// Get public key bytes
	publicKeyBytes := pk.Bytes()

	// Build input for precompile
	input := make([]byte, 0, 32+mldsa65.SignatureSize+mldsa65.PublicKeySize)
	input = append(input, message...)
	input = append(input, signature...)
	input = append(input, publicKeyBytes...)

	// Run precompile
	precompile := &mldsaVerify{}
	gas := precompile.RequiredGas(input)
	t.Logf("Gas required: %d", gas)

	result, err := precompile.Run(input)
	if err != nil {
		t.Fatalf("Precompile failed: %v", err)
	}

	// Check result (last byte should be 0x01 for success)
	if len(result) != 32 {
		t.Fatalf("Expected 32-byte result, got %d bytes", len(result))
	}
	if result[31] != 1 {
		t.Fatalf("Expected success (0x01), got 0x%02x", result[31])
	}

	t.Log("ML-DSA verification successful!")
}

func TestMLDSAPrecompile_InvalidSignature(t *testing.T) {
	// Generate a test key pair
	pk, _, err := mldsa65.GenerateKey(nil)
	if err != nil {
		t.Fatalf("Failed to generate key: %v", err)
	}

	// Create a test message
	message := make([]byte, 32)
	copy(message, []byte("BesaChain ML-DSA Test Message"))

	// Create an invalid signature (all zeros)
	signature := make([]byte, mldsa65.SignatureSize)

	// Get public key bytes
	publicKeyBytes := pk.Bytes()

	// Build input
	input := make([]byte, 0, 32+mldsa65.SignatureSize+mldsa65.PublicKeySize)
	input = append(input, message...)
	input = append(input, signature...)
	input = append(input, publicKeyBytes...)

	// Run precompile
	precompile := &mldsaVerify{}
	result, err := precompile.Run(input)
	if err != nil {
		t.Fatalf("Precompile failed: %v", err)
	}

	// Check result (should be failure)
	if result[31] != 0 {
		t.Fatalf("Expected failure (0x00), got 0x%02x", result[31])
	}

	t.Log("Invalid signature correctly rejected!")
}

func TestMLDSAPrecompile_WrongMessage(t *testing.T) {
	// Generate a test key pair
	pk, sk, err := mldsa65.GenerateKey(nil)
	if err != nil {
		t.Fatalf("Failed to generate key: %v", err)
	}

	// Create original message
	message := make([]byte, 32)
	copy(message, []byte("BesaChain ML-DSA Test Message"))

	// Sign the message
	signature := make([]byte, mldsa65.SignatureSize)
	err = mldsa65.SignTo(sk, message, nil, false, signature)
	if err != nil {
		t.Fatalf("Failed to sign: %v", err)
	}

	// Create different message
	wrongMessage := make([]byte, 32)
	copy(wrongMessage, []byte("Different message for testing"))

	// Get public key bytes
	publicKeyBytes := pk.Bytes()

	// Build input with wrong message
	input := make([]byte, 0, 32+mldsa65.SignatureSize+mldsa65.PublicKeySize)
	input = append(input, wrongMessage...) // Use wrong message
	input = append(input, signature...)
	input = append(input, publicKeyBytes...)

	// Run precompile
	precompile := &mldsaVerify{}
	result, err := precompile.Run(input)
	if err != nil {
		t.Fatalf("Precompile failed: %v", err)
	}

	// Check result (should be failure)
	if result[31] != 0 {
		t.Fatalf("Expected failure (0x00), got 0x%02x", result[31])
	}

	t.Log("Wrong message correctly rejected!")
}

func TestMLDSAPrecompile_Constants(t *testing.T) {
	// Verify constants match CIRCL
	if MLDSAPublicKeySize != mldsa65.PublicKeySize {
		t.Errorf("PublicKeySize mismatch: expected %d, got %d", mldsa65.PublicKeySize, MLDSAPublicKeySize)
	}
	if MLDSASignatureSize != mldsa65.SignatureSize {
		t.Errorf("SignatureSize mismatch: expected %d, got %d", mldsa65.SignatureSize, MLDSASignatureSize)
	}

	t.Logf("ML-DSA-65 Constants:")
	 t.Logf("  Public Key Size: %d bytes", MLDSAPublicKeySize)
	t.Logf("  Signature Size: %d bytes", MLDSASignatureSize)
	t.Logf("  Total Input Size: %d bytes", 32+MLDSASignatureSize+MLDSAPublicKeySize)
}

func TestMLDSABatchVerification(t *testing.T) {
	// Generate test key pairs
	numSigs := 5
	publicKeys := make([][]byte, numSigs)
	privateKeys := make([]*mldsa65.PrivateKey, numSigs)

	for i := 0; i < numSigs; i++ {
		pk, sk, err := mldsa65.GenerateKey(nil)
		if err != nil {
			t.Fatalf("Failed to generate key %d: %v", i, err)
		}
		publicKeys[i] = pk.Bytes()
		privateKeys[i] = sk
	}

	// Create messages and signatures
	messages := make([][]byte, numSigs)
	signatures := make([][]byte, numSigs)

	for i := 0; i < numSigs; i++ {
		messages[i] = make([]byte, 32)
		copy(messages[i], []byte(fmt.Sprintf("Message %d", i)))

		signatures[i] = make([]byte, mldsa65.SignatureSize)
		err := mldsa65.SignTo(privateKeys[i], messages[i], nil, false, signatures[i])
		if err != nil {
			t.Fatalf("Failed to sign message %d: %v", i, err)
		}
	}

	// Build batch input
	input := make([]byte, 4) // First 4 bytes for count
	binary.BigEndian.PutUint32(input[0:4], uint32(numSigs))

	for i := 0; i < numSigs; i++ {
		input = append(input, messages[i]...)
		input = append(input, signatures[i]...)
		input = append(input, publicKeys[i]...)
	}

	// Run batch precompile
	precompile := &mldsaBatchVerify{}
	gas := precompile.RequiredGas(input)
	t.Logf("Batch gas required for %d signatures: %d", numSigs, gas)

	result, err := precompile.Run(input)
	if err != nil {
		t.Fatalf("Batch precompile failed: %v", err)
	}

	// Check all results
	for i := 0; i < numSigs; i++ {
		if result[i*32+31] != 1 {
			t.Fatalf("Signature %d failed verification", i)
		}
	}

	t.Logf("All %d signatures verified successfully!", numSigs)
}


