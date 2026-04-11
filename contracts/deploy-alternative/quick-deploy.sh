#!/bin/bash
# Quick deployment script for BesaChain L1 contracts
# One-command deployment using pre-built artifacts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKDIR="$SCRIPT_DIR/.deployer"

echo "═══════════════════════════════════════════════════════════"
echo "     BesaChain L1 Contract Quick Deployment"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "This script will:"
echo "  1. Download op-deployer (if needed)"
echo "  2. Create deployment configuration"
echo "  3. Deploy L1 contracts using pre-built artifacts"
echo "  4. Generate rollup.json"
echo ""

# Check if running on macOS or Linux
OS=$(uname -s)
if [ "$OS" = "Darwin" ]; then
    PLATFORM="macOS"
else
    PLATFORM="Linux"
fi

echo "Platform: $PLATFORM"
echo ""

# Configuration prompts
if [ -z "$L1_RPC_URL" ]; then
    read -p "L1 RPC URL [http://localhost:1444]: " L1_RPC_URL
    L1_RPC_URL=${L1_RPC_URL:-http://localhost:1444}
fi

if [ -z "$PRIVATE_KEY" ]; then
    read -p "Deployer Private Key (0x...): " PRIVATE_KEY
fi

if [ -z "$ADMIN_ADDRESS" ]; then
    read -p "Admin Address [0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604]: " ADMIN_ADDRESS
    ADMIN_ADDRESS=${ADMIN_ADDRESS:-0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604}
fi

echo ""
echo "Configuration:"
echo "  L1 RPC: $L1_RPC_URL"
echo "  Admin: $ADMIN_ADDRESS"
echo ""
read -p "Continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Step 1: Setting up op-deployer"
echo "═══════════════════════════════════════════════════════════"

if [ ! -f "$SCRIPT_DIR/bin/op-deployer" ]; then
    ./setup-op-deployer.sh
else
    echo "✓ op-deployer already installed"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Step 2: Creating deployment configuration"
echo "═══════════════════════════════════════════════════════════"

mkdir -p "$WORKDIR"

# Create intent.toml
cat > "$WORKDIR/intent.toml" << EOF
# BesaChain L1 Deployment Intent
l1_chain_id = 1444
custom_gas_token = false

# Use pre-built artifacts (NO COMPILATION REQUIRED!)
l1_contracts_locator = "tag://op-contracts/v6.0.0"
l2_contracts_locator = "tag://op-contracts/v6.0.0"

[[chains]]
chain_id = 1445
block_time = 1
finalization_period = 2
submission_interval = 10
gas_limit = 100000000
starting_block_number = 0
starting_timestamp = 0

# Admin addresses
l1_proxy_admin_owner = "$ADMIN_ADDRESS"
l2_proxy_admin_owner = "$ADMIN_ADDRESS"
system_config_owner = "$ADMIN_ADDRESS"
unsafe_block_signer = "$ADMIN_ADDRESS"
batcher = "$ADMIN_ADDRESS"
proposer = "$ADMIN_ADDRESS"
challenger = "$ADMIN_ADDRESS"

# Fee recipients
base_fee_vault_recipient = "$ADMIN_ADDRESS"
l1_fee_vault_recipient = "$ADMIN_ADDRESS"
sequencer_fee_vault_recipient = "$ADMIN_ADDRESS"

# EIP-1559
base_fee_scalar = 0
blob_base_fee_scalar = 0
EOF

echo "✓ Configuration created at: $WORKDIR/intent.toml"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Step 3: Deploying L1 contracts"
echo "═══════════════════════════════════════════════════════════"

export L1_RPC_URL
export PRIVATE_KEY

if ! ./deploy.sh; then
    echo ""
    echo "⚠ Deployment failed. Common issues:"
    echo "  - Ensure L1 is running at $L1_RPC_URL"
    echo "  - Ensure deployer has ETH for gas"
    echo "  - Check that private key is correct"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Step 4: Generating rollup configuration"
echo "═══════════════════════════════════════════════════════════"

./generate-rollup-config.sh

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✓ Deployment Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Files generated:"
echo "  - $WORKDIR/state.json (deployment state)"
echo "  - $WORKDIR/rollup.json (L2 node config)"
echo "  - $WORKDIR/genesis.json (L2 genesis)"
echo ""
echo "Next steps:"
echo "  1. Review contract addresses in $WORKDIR/state.json"
echo "  2. Copy rollup.json to your L2 node config"
echo "  3. Start L2 services"
echo ""

# Display contract addresses if jq is available
if command -v jq &> /dev/null; then
    echo "Deployed contracts:"
    jq -r '.opChainDeployments // empty | .[] | to_entries[] | "  \(.key): \(.value)"' "$WORKDIR/state.json" 2>/dev/null || true
    echo ""
fi

echo "To start L2 node:"
echo "  sudo systemctl start besachain-l2-node"
echo ""
