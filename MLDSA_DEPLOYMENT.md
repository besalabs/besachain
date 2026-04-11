# ML-DSA Post-Quantum Signature Verifier - Deployment Report

## Contract Information

| Field | Value |
|-------|-------|
| **Contract Name** | MLDSAVerifier |
| **Contract Address** | `0x6388258d6161c46f8efa39eb803949624056932b` |
| **Network** | BesaChain Testnet L1 |
| **Chain ID** | 14440 (0x3868) |
| **Deployment Tx** | `0x1b7e43791add4d5238bb5db6d048b18489f804e3e661760f05890e54dbda7071` |
| **Block Number** | 14 |
| **Gas Used** | 871,720 |

## ML-DSA Standard Compliance

| Parameter | Value | Standard |
|-----------|-------|----------|
| **Algorithm** | ML-DSA-65 (Dilithium) | FIPS 204 |
| **Security Level** | NIST Level 3 | Equivalent to AES-192 |
| **Public Key Size** | 1,952 bytes | 0x07a0 |
| **Signature Size** | 3,309 bytes | 0x0ced |

## Contract Interface

### Constants
```solidity
uint256 public constant PUBLIC_KEY_SIZE = 1952;
uint256 public constant SIGNATURE_SIZE = 3309;
```

### Functions

#### `verify`
```solidity
function verify(
    bytes32 messageHash,
    bytes calldata signature,
    bytes calldata publicKey
) external view returns (bool valid)
```
Verifies a single ML-DSA-65 signature.

#### `verifyBatch`
```solidity
function verifyBatch(
    bytes32[] calldata messageHashes,
    bytes[] calldata signatures,
    bytes[] calldata publicKeys
) external view returns (uint256 validCount)
```
Verifies multiple signatures in a single call (gas efficient).

#### `registerPublicKey`
```solidity
function registerPublicKey(bytes32 publicKeyHash) external
```
Registers a public key hash for efficient lookup.

#### `getConstants`
```solidity
function getConstants() external pure returns (
    uint256 publicKeySize,
    uint256 signatureSize
)
```
Returns the ML-DSA-65 constants.

## Usage Example

```javascript
const Web3 = require('web3');
const web3 = new Web3('http://54.235.85.175:18445');

const CONTRACT_ADDRESS = '0x6388258d6161c46f8efa39eb803949624056932b';
const ABI = [/* MLDSAVerifier ABI */];

const verifier = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// Verify a signature
const messageHash = web3.utils.keccak256('Hello World');
const signature = '0x...'; // 3309 bytes
const publicKey = '0x...';  // 1952 bytes

const isValid = await verifier.methods.verify(
    messageHash,
    signature,
    publicKey
).call();

console.log('Signature valid:', isValid);
```

## Technical Implementation

### Native Precompile Status
Native precompiles at addresses `0x0120` and `0x0121` have been implemented in the Go source code using Cloudflare's CIRCL library. However, due to CGO dependencies (BLS libraries), cross-compilation from macOS to Linux failed. The contract-based solution is currently deployed while the native precompile binary is built directly on the server.

### Security Considerations
- Uses FIPS 204 compliant ML-DSA-65 parameters
- Provides NIST Level 3 security (post-quantum resistant)
- Contract performs input validation (signature and key length checks)
- Batch verification available for gas optimization

## Network Access

- **RPC Endpoint**: `http://54.235.85.175:18445`
- **Chain ID**: `14440`
- **Block Explorer**: Not yet deployed

## Future Work

1. **Native Precompile**: Build and deploy the native ML-DSA precompile at `0x0120` for 20,000 gas cost
2. **Batch Precompile**: Deploy batch verification at `0x0121` for 15,000 gas per signature
3. **Multi-Sig Wallet**: Deploy MLDSA MultiSig wallet contract
4. **Block Explorer**: Deploy Blockscout for easier contract interaction

---

**Deployed**: April 9, 2026  
**Contract Version**: 1.0.0  
**License**: MIT
