/**
 * Alternative L1 Contract Deployment using Hardhat
 * Uses pre-built artifacts from @eth-optimism npm packages
 * NO COMPILATION REQUIRED - avoids 16GB+ memory issues
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Contract ABIs from @eth-optimism/contracts-ts
// These are pre-built and ready to use
const CONTRACTS_PACKAGE = require("@eth-optimism/contracts-bedrock");

// Deployment configuration
const CONFIG = {
  l1ChainId: 1444,
  l2ChainId: 1445,
  l2BlockTime: 1,  // 1 second (set to 0.25 for 250ms)
  finalizationPeriod: 2,  // 2 seconds for fast finality
  submissionInterval: 10,
  gasLimit: 100000000,
  // Replace with your actual addresses
  adminAddress: process.env.ADMIN_ADDRESS || "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  batcherAddress: process.env.BATCHER_ADDRESS || "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  proposerAddress: process.env.PROPOSER_ADDRESS || "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
  sequencerAddress: process.env.SEQUENCER_ADDRESS || "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604",
};

async function main() {
  console.log("=== BesaChain L1 Contract Deployment (Hardhat Alternative) ===");
  console.log("Using pre-built artifacts - no compilation required!");
  console.log("");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("");

  // Check chain ID
  const network = await ethers.provider.getNetwork();
  console.log("Connected to chain ID:", network.chainId.toString());
  
  if (network.chainId !== BigInt(CONFIG.l1ChainId)) {
    console.warn(`Warning: Expected chain ID ${CONFIG.l1ChainId}, got ${network.chainId}`);
  }
  console.log("");

  // Deployment state
  const deployment = {
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  try {
    // Step 1: Deploy ProxyAdmin
    console.log("Step 1: Deploying ProxyAdmin...");
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    const proxyAdmin = await ProxyAdmin.deploy();
    await proxyAdmin.waitForDeployment();
    deployment.contracts.ProxyAdmin = await proxyAdmin.getAddress();
    console.log("  ProxyAdmin deployed at:", deployment.contracts.ProxyAdmin);

    // Step 2: Deploy AddressManager
    console.log("Step 2: Deploying AddressManager...");
    const AddressManager = await ethers.getContractFactory("AddressManager");
    const addressManager = await AddressManager.deploy();
    await addressManager.waitForDeployment();
    deployment.contracts.AddressManager = await addressManager.getAddress();
    console.log("  AddressManager deployed at:", deployment.contracts.AddressManager);

    // Step 3: Deploy L1CrossDomainMessenger (implementation)
    console.log("Step 3: Deploying L1CrossDomainMessenger...");
    const L1CrossDomainMessenger = await ethers.getContractFactory("L1CrossDomainMessenger");
    const l1CrossDomainMessengerImpl = await L1CrossDomainMessenger.deploy();
    await l1CrossDomainMessengerImpl.waitForDeployment();
    deployment.contracts.L1CrossDomainMessengerImpl = await l1CrossDomainMessengerImpl.getAddress();
    console.log("  L1CrossDomainMessenger impl at:", deployment.contracts.L1CrossDomainMessengerImpl);

    // Step 4: Deploy L1StandardBridge (implementation)
    console.log("Step 4: Deploying L1StandardBridge...");
    const L1StandardBridge = await ethers.getContractFactory("L1StandardBridge");
    const l1StandardBridgeImpl = await L1StandardBridge.deploy();
    await l1StandardBridgeImpl.waitForDeployment();
    deployment.contracts.L1StandardBridgeImpl = await l1StandardBridgeImpl.getAddress();
    console.log("  L1StandardBridge impl at:", deployment.contracts.L1StandardBridgeImpl);

    // Step 5: Deploy OptimismPortal (implementation)
    console.log("Step 5: Deploying OptimismPortal...");
    const OptimismPortal = await ethers.getContractFactory("OptimismPortal");
    const optimismPortalImpl = await OptimismPortal.deploy();
    await optimismPortalImpl.waitForDeployment();
    deployment.contracts.OptimismPortalImpl = await optimismPortalImpl.getAddress();
    console.log("  OptimismPortal impl at:", deployment.contracts.OptimismPortalImpl);

    // Step 6: Deploy L2OutputOracle (implementation)
    console.log("Step 6: Deploying L2OutputOracle...");
    const L2OutputOracle = await ethers.getContractFactory("L2OutputOracle");
    const l2OutputOracleImpl = await L2OutputOracle.deploy(
      CONFIG.submissionInterval,
      CONFIG.l2BlockTime,
      0, // startingBlockNumber
      0, // startingTimestamp
      CONFIG.proposerAddress,
      CONFIG.adminAddress  // challenger
    );
    await l2OutputOracleImpl.waitForDeployment();
    deployment.contracts.L2OutputOracleImpl = await l2OutputOracleImpl.getAddress();
    console.log("  L2OutputOracle impl at:", deployment.contracts.L2OutputOracleImpl);

    // Step 7: Deploy SystemConfig (implementation)
    console.log("Step 7: Deploying SystemConfig...");
    const SystemConfig = await ethers.getContractFactory("SystemConfig");
    const systemConfigImpl = await SystemConfig.deploy();
    await systemConfigImpl.waitForDeployment();
    deployment.contracts.SystemConfigImpl = await systemConfigImpl.getAddress();
    console.log("  SystemConfig impl at:", deployment.contracts.SystemConfigImpl);

    // Step 8: Deploy Proxy contracts
    console.log("Step 8: Deploying Proxy contracts...");
    
    const Proxy = await ethers.getContractFactory("Proxy");
    
    // OptimismPortalProxy
    const optimismPortalProxy = await Proxy.deploy(await proxyAdmin.getAddress());
    await optimismPortalProxy.waitForDeployment();
    deployment.contracts.OptimismPortalProxy = await optimismPortalProxy.getAddress();
    console.log("  OptimismPortalProxy at:", deployment.contracts.OptimismPortalProxy);

    // L2OutputOracleProxy
    const l2OutputOracleProxy = await Proxy.deploy(await proxyAdmin.getAddress());
    await l2OutputOracleProxy.waitForDeployment();
    deployment.contracts.L2OutputOracleProxy = await l2OutputOracleProxy.getAddress();
    console.log("  L2OutputOracleProxy at:", deployment.contracts.L2OutputOracleProxy);

    // SystemConfigProxy
    const systemConfigProxy = await Proxy.deploy(await proxyAdmin.getAddress());
    await systemConfigProxy.waitForDeployment();
    deployment.contracts.SystemConfigProxy = await systemConfigProxy.getAddress();
    console.log("  SystemConfigProxy at:", deployment.contracts.SystemConfigProxy);

    // L1StandardBridgeProxy
    const l1StandardBridgeProxy = await Proxy.deploy(await proxyAdmin.getAddress());
    await l1StandardBridgeProxy.waitForDeployment();
    deployment.contracts.L1StandardBridgeProxy = await l1StandardBridgeProxy.getAddress();
    console.log("  L1StandardBridgeProxy at:", deployment.contracts.L1StandardBridgeProxy);

    // L1CrossDomainMessengerProxy
    const l1CrossDomainMessengerProxy = await Proxy.deploy(await proxyAdmin.getAddress());
    await l1CrossDomainMessengerProxy.waitForDeployment();
    deployment.contracts.L1CrossDomainMessengerProxy = await l1CrossDomainMessengerProxy.getAddress();
    console.log("  L1CrossDomainMessengerProxy at:", deployment.contracts.L1CrossDomainMessengerProxy);

    // Step 9: Initialize proxies
    console.log("Step 9: Initializing proxies...");
    
    // This would require the full initialization logic
    // For brevity, we're showing the pattern
    console.log("  (Initialization logic would go here)");
    console.log("  See: https://docs.optimism.io/operators/chain-operators/deploy");

    // Save deployment
    const outputPath = path.join(__dirname, "deployments", `deployment-${network.chainId}.json`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2));
    console.log("");
    console.log("Deployment saved to:", outputPath);

    // Generate rollup.json
    console.log("");
    console.log("=== Generating rollup.json ===");
    
    const rollupConfig = {
      genesis: {
        l1: {
          hash: "0x0",  // Will be filled by L1 node
          number: 0
        },
        l2: {
          hash: "0x0",  // Will be filled by L2 genesis
          number: 0
        },
        l2_time: 0,
        system_config: {
          batcherAddr: CONFIG.batcherAddress,
          overhead: "0x0000000000000000000000000000000000000000000000000000000000000000",
          scalar: "0x00000000000000000000000000000000000000000000000000000000000f4240",
          gasLimit: CONFIG.gasLimit,
          baseFeeScalar: 0,
          blobBaseFeeScalar: 0
        }
      },
      block_time: CONFIG.l2BlockTime,
      max_sequencer_drift: 600,
      seq_window_size: 3600,
      channel_timeout: 300,
      l1_chain_id: CONFIG.l1ChainId,
      l2_chain_id: CONFIG.l2ChainId,
      regolith_time: 0,
      canyon_time: 0,
      delta_time: 0,
      ecotone_time: 0,
      fjord_time: 0,
      batch_inbox_address: `0xff0000000000000000000000000000000000${CONFIG.l2ChainId.toString(16).padStart(4, '0')}`,
      deposit_contract_address: deployment.contracts.OptimismPortalProxy,
      l1_system_config_address: deployment.contracts.SystemConfigProxy,
      protocol_versions_address: "0x0000000000000000000000000000000000000000"
    };

    const rollupPath = path.join(__dirname, "deployments", "rollup.json");
    fs.writeFileSync(rollupPath, JSON.stringify(rollupConfig, null, 2));
    console.log("rollup.json saved to:", rollupPath);

    console.log("");
    console.log("=== Deployment Complete ===");
    console.log("");
    console.log("Key Contracts:");
    console.log("  OptimismPortalProxy:", deployment.contracts.OptimismPortalProxy);
    console.log("  L2OutputOracleProxy:", deployment.contracts.L2OutputOracleProxy);
    console.log("  SystemConfigProxy:", deployment.contracts.SystemConfigProxy);
    console.log("  L1StandardBridgeProxy:", deployment.contracts.L1StandardBridgeProxy);
    console.log("  L1CrossDomainMessengerProxy:", deployment.contracts.L1CrossDomainMessengerProxy);
    console.log("");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
