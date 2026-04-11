# OP Stack L1 Deployment Options Comparison

## Problem

Building `optimism/contracts-bedrock` from source requires **16GB+ RAM** and crashes with SIGSEGV on systems with 10GB RAM.

## Solutions Overview

| Option | Method | Memory | Time | Complexity | Best For |
|--------|--------|--------|------|------------|----------|
| **A** | op-deployer + tagged artifacts | <500MB | 5-10 min | Low | ⭐ **Production** |
| **B** | Hardhat + npm artifacts | <2GB | 10-15 min | Medium | Developers |
| **C** | Docker + official image | <1GB | 5-10 min | Low | Containerized envs |
| **D** | Manual bytecode | <500MB | 30+ min | High | Advanced users |

---

## Option A: op-deployer with Tagged Artifacts (Recommended)

### How It Works
```
┌─────────────────────────────────────────────────────────────┐
│  1. Download op-deployer binary (~20MB)                     │
│  2. Configure intent.toml                                   │
│  3. op-deployer downloads artifacts from GCS (~30MB)        │
│  4. Deploy contracts (no compilation!)                      │
└─────────────────────────────────────────────────────────────┘
```

### Commands
```bash
./setup-op-deployer.sh    # Download tool
./deploy.sh               # Deploy contracts
./generate-rollup-config.sh  # Generate configs
```

### Pros
- ✅ No compilation required
- ✅ Minimal memory (<500MB)
- ✅ Official Optimism tool
- ✅ Uses audited, tagged releases
- ✅ Generates standard configs

### Cons
- ⚠️ Requires understanding of intent.toml format
- ⚠️ Limited customization of deployment order

---

## Option B: Hardhat with NPM Artifacts

### How It Works
```
┌─────────────────────────────────────────────────────────────┐
│  1. npm install @eth-optimism/contracts-bedrock             │
│  2. Load pre-built artifacts from node_modules              │
│  3. Hardhat deploys without compilation                     │
└─────────────────────────────────────────────────────────────┘
```

### Commands
```bash
cd hardhat-alternative
npm install
npm run deploy
```

### Pros
- ✅ Familiar Hardhat environment
- ✅ Easy to customize deployment logic
- ✅ Good for developers already using Hardhat

### Cons
- ⚠️ Requires Node.js/npm
- ⚠️ More memory than op-deployer (~2GB)
- ⚠️ Simpler deployment logic (may need enhancement for production)

---

## Option C: Docker with Official Image

### How It Works
```
┌─────────────────────────────────────────────────────────────┐
│  1. Pull official op-deployer Docker image                  │
│  2. Mount configuration volume                              │
│  3. Run deployment in container                             │
└─────────────────────────────────────────────────────────────┘
```

### Commands
```bash
docker-compose up deploy-official
```

### Pros
- ✅ No local dependencies
- ✅ Consistent environment
- ✅ Official Optimism image

### Cons
- ⚠️ Requires Docker
- ⚠️ Network configuration for L1 access

---

## Option D: Manual Bytecode Deployment

### How It Works
```
┌─────────────────────────────────────────────────────────────┐
│  1. Download artifacts tarball from GCS                     │
│  2. Extract bytecode for each contract                      │
│  3. Deploy using cast send --create                         │
│  4. Initialize contracts manually                           │
└─────────────────────────────────────────────────────────────┘
```

### Commands
```bash
# Download artifacts
curl -L -o artifacts.tar.gz \
  "https://storage.googleapis.com/oplabs-contract-artifacts/artifacts-v1.8.0.tar.gz"
tar -xzf artifacts.tar.gz

# Deploy individual contracts
BYTECODE=$(cat forge-artifacts/OptimismPortal.sol/OptimismPortal.json | jq -r '.bytecode.object')
cast send --create --rpc-url $L1_RPC_URL --private-key $KEY 0x$BYTECODE
```

### Pros
- ✅ Maximum control
- ✅ No dependencies beyond cast/curl/jq

### Cons
- ⚠️ Complex deployment order
- ⚠️ Must manually handle proxy initialization
- ⚠️ Error-prone

---

## Artifact Sources

### GCS Buckets (Official)
```
https://storage.googleapis.com/oplabs-contract-artifacts/
├── artifacts-v1.8.0.tar.gz
├── artifacts-v2.0.0.tar.gz
├── artifacts-v6.0.0.tar.gz
└── ...
```

### NPM Packages
```json
{
  "@eth-optimism/contracts-bedrock": "0.17.3",
  "@eth-optimism/contracts-ts": "0.17.2"
}
```

### GitHub Releases
```
https://github.com/ethereum-optimism/optimism/releases
├── op-deployer/v0.6.0
├── op-contracts/v6.0.0
└── ...
```

---

## Recommended Approach by Use Case

### Production Deployment
**Option A: op-deployer**
- Uses official, audited artifacts
- Standard deployment process
- Easy to reproduce
- Future Superchain compatibility

### Development/Testing
**Option B: Hardhat** or **Option C: Docker**
- Faster iteration
- Easier customization
- Familiar tooling

### CI/CD Pipeline
**Option C: Docker**
- Consistent environment
- No dependency management
- Easy integration

### Custom Modifications
**Option B: Hardhat** with custom contracts
- Modify deployment logic
- Add custom contracts
- Full control

---

## Memory Usage Comparison

```
┌──────────────────────────────────────────────────────────────┐
│ Memory Usage by Method                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Forge Build (Standard)   ████████████████████████████████ 16GB+│
│  Docker (10GB limit)      ████████████████ SIGSEGV          │
│  Hardhat + npm            ██ 2GB                             │
│  Docker op-deployer       █ 1GB                              │
│  op-deployer native       █ 500MB                            │
│  Manual bytecode          █ 500MB                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Deployment Time Comparison

| Method | Download | Deploy | Total |
|--------|----------|--------|-------|
| Forge Build | 5-10 min | 5 min | 15-20 min |
| op-deployer | 1 min | 3-5 min | 5-10 min |
| Hardhat | 2 min | 5-10 min | 10-15 min |
| Docker | 2 min | 3-5 min | 5-10 min |

---

## Troubleshooting Matrix

| Issue | Option A | Option B | Option C |
|-------|----------|----------|----------|
| "unsupported tag" | Use file:// or download manually | N/A | Use specific version |
| "insufficient funds" | Fund deployer on L1 | Fund deployer on L1 | Fund deployer on L1 |
| Connection refused | Check L1 RPC URL | Check network config | Check docker network |
| "compilation failed" | N/A (no compile) | N/A (pre-built) | N/A (pre-built) |
| Out of memory | Should not happen | Close other apps | Increase Docker memory |

---

## Quick Decision Tree

```
Do you want the simplest solution?
  └── YES → Option A: op-deployer

Do you need to customize deployment logic?
  └── YES → Option B: Hardhat

Are you running in CI/CD or containerized environment?
  └── YES → Option C: Docker

Do you need maximum control and understand OP Stack internals?
  └── YES → Option D: Manual
```
