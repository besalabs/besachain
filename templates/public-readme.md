# BesaChain ⚡🔐

[![CI](https://github.com/skacaniku/besachain/actions/workflows/ci.yml/badge.svg)](https://github.com/skacaniku/besachain/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8.svg)](https://golang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19+-363636.svg)](https://soliditylang.org/)

> **Post-Quantum Secure Layer 1 Blockchain** powered by ML-DSA ( CRYSTALS-Dilithium ) cryptographic precompiles

BesaChain is a next-generation EVM-compatible blockchain that integrates NIST-standardized post-quantum cryptography directly at the protocol level. Built on a fork of BNB Smart Chain (BSC), BesaChain ensures your assets and transactions remain secure against quantum computing threats.

## 🌟 Key Features

- **🔐 Post-Quantum Security**: Native ML-DSA (Dilithium) signature verification precompile
- **⚡ EVM Compatible**: Full compatibility with existing Ethereum tooling and smart contracts
- **🚀 High Performance**: 3-second block times with high throughput
- **💰 Low Fees**: Optimized gas economics for cost-effective transactions
- **🛡️ Quantum-Resistant**: Protection against both classical and quantum attacks
- **🔧 Developer Friendly**: Comprehensive SDK and documentation

## 📁 Repository Structure

```
besachain/
├── node-client/          # BSC fork with ML-DSA precompile
│   ├── core/            # Core blockchain logic
│   ├── precompiles/     # ML-DSA and other precompiled contracts
│   ├── consensus/       # Consensus engine modifications
│   └── cmd/             # Node client binaries
├── contracts/           # Smart contracts
│   ├── token/           # Token standards (ERC20, ERC721, ERC1155)
│   ├── governance/      # On-chain governance
│   ├── staking/         # Staking and validator contracts
│   └── interfaces/      # Contract interfaces
├── docs/                # Documentation
│   ├── architecture/    # System architecture docs
│   ├── api/             # API reference
│   └── guides/          # Developer guides
├── scripts/             # Deployment and utility scripts
│   ├── deploy/          # Deployment scripts
│   ├── verify/          # Contract verification
│   └── utils/           # Utility scripts
├── sdk/                 # Developer SDK
│   ├── go/              # Go SDK
│   ├── js/              # JavaScript/TypeScript SDK
│   └── python/          # Python SDK
└── genesis-templates/   # Genesis configuration templates
    ├── mainnet/         # Mainnet genesis template
    └── testnet/         # Testnet genesis template
```

## 🚀 Quick Start

### Prerequisites

- Go 1.21 or later
- Node.js 18+ (for SDK and contract development)
- Foundry or Hardhat (for smart contract development)
- 8GB+ RAM, 100GB+ free disk space

### Build from Source

```bash
# Clone the repository
git clone https://github.com/skacaniku/besachain.git
cd besachain

# Build the node client
cd node-client
make build

# Run tests
make test
```

### Run a Local Node

```bash
# Initialize genesis
./build/bin/besachain --datadir ./data init genesis-templates/testnet/genesis.json

# Start the node
./build/bin/besachain --datadir ./data --networkid 9701 --http --http.addr 0.0.0.0
```

### Connect to BesaChain

```javascript
// Using the JavaScript SDK
import { BesaChain } from '@besachain/sdk';

const client = new BesaChain({
  network: 'testnet',
  rpcUrl: 'https://rpc.testnet.besachain.io'
});

// Send a transaction
const tx = await client.sendTransaction({
  to: '0x...',
  value: '1000000000000000000'
});
```

## 🔐 ML-DSA Precompile

BesaChain introduces a native precompiled contract for ML-DSA (CRYSTALS-Dilithium) signature verification:

```solidity
// ML-DSA Precompile address
address constant MLDSA_PRECOMPILE = 0x0000000000000000000000000000000000000100;

interface IMLDSA {
    function verify(
        bytes memory publicKey,
        bytes memory message,
        bytes memory signature
    ) external view returns (bool);
    
    function verifyBatch(
        bytes memory publicKeys,
        bytes memory messages,
        bytes memory signatures
    ) external view returns (bool[] memory);
}
```

### Usage Example

```solidity
contract QuantumSecureContract {
    address constant MLDSA = 0x0000000000000000000000000000000000000100;
    
    function verifyQuantumSignature(
        bytes calldata publicKey,
        bytes calldata message,
        bytes calldata signature
    ) public view returns (bool) {
        (bool success, bytes memory result) = MLDSA.staticcall(
            abi.encodeWithSignature(
                "verify(bytes,bytes,bytes)",
                publicKey, message, signature
            )
        );
        return success && abi.decode(result, (bool));
    }
}
```

## 📚 Documentation

- [Architecture Overview](docs/architecture/README.md)
- [API Reference](docs/api/README.md)
- [Developer Guides](docs/guides/README.md)
- [Running a Validator](docs/guides/validator.md)
- [Smart Contract Development](docs/guides/smart-contracts.md)

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific test suite
make test-precompiles
make test-consensus
make test-contracts

# Run with coverage
make coverage
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- 🐛 [Report bugs](https://github.com/skacaniku/besachain/issues)
- 💡 [Request features](https://github.com/skacaniku/besachain/issues)
- 🔧 [Submit pull requests](https://github.com/skacaniku/besachain/pulls)

## 🔗 Networks

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Mainnet | 9700 | `https://rpc.besachain.io` | [explorer.besachain.io](https://explorer.besachain.io) |
| Testnet | 9701 | `https://rpc.testnet.besachain.io` | [testnet-explorer.besachain.io](https://testnet-explorer.besachain.io) |
| Devnet | 9702 | `https://rpc.devnet.besachain.io` | [devnet-explorer.besachain.io](https://devnet-explorer.besachain.io) |

## 📦 SDKs

| Language | Package | Version |
|----------|---------|---------|
| JavaScript/TypeScript | `@besachain/sdk` | [![npm](https://img.shields.io/npm/v/@besachain/sdk)](https://www.npmjs.com/package/@besachain/sdk) |
| Go | `github.com/besachain/go-sdk` | [![Go Reference](https://pkg.go.dev/badge/github.com/besachain/go-sdk.svg)](https://pkg.go.dev/github.com/besachain/go-sdk) |
| Python | `besachain-sdk` | [![PyPI](https://img.shields.io/pypi/v/besachain-sdk)](https://pypi.org/project/besachain-sdk/) |

## 🛡️ Security

For security concerns, please email security@besachain.io or refer to our [Security Policy](SECURITY.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- BNB Smart Chain (BSC) - Base protocol
- CRYSTALS-Dilithium Team - Post-quantum cryptography
- Ethereum Foundation - EVM specification
- NIST - Post-quantum cryptography standardization

## 📞 Contact

- Website: [besachain.io](https://besachain.io)
- Twitter: [@BesaChain](https://twitter.com/BesaChain)
- Discord: [discord.gg/besachain](https://discord.gg/besachain)
- Email: dev@besachain.io

---

<p align="center">
  <strong>Building the future of quantum-resistant blockchain infrastructure</strong>
</p>
