# Hardhat Alternative Deployment

This is an alternative deployment method using Hardhat instead of op-deployer. This approach:
- Uses pre-built contract artifacts from npm packages
- Requires less memory than Forge builds
- Works on systems with 4GB+ RAM

## Setup

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your private key and addresses

# Deploy
npm run deploy
```

## How It Works

1. **Pre-built Artifacts**: Uses `@eth-optimism/contracts-bedrock` npm package which includes compiled contract artifacts
2. **Hardhat Runtime**: Hardhat loads these artifacts without compilation
3. **Deployment**: JavaScript deployment script handles the deployment sequence

## Limitations

This is a simplified deployment. For production use, you should:
- Use the full initialization logic from OP Stack contracts
- Consider using op-deployer for standardized deployments
- Properly configure all proxy initializations

## Contract Deployment Order

1. ProxyAdmin
2. AddressManager
3. L1CrossDomainMessenger (implementation)
4. L1StandardBridge (implementation)
5. OptimismPortal (implementation)
6. L2OutputOracle (implementation)
7. SystemConfig (implementation)
8. Proxy contracts (for each implementation)
9. Initialize proxies
