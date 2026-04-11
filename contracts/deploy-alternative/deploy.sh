#!/bin/bash
# Main deployment script for OP Stack L1 contracts
# Uses op-deployer with pre-built artifacts (NO COMPILATION REQUIRED)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$SCRIPT_DIR/bin"
OP_DEPLOYER="$BIN_DIR/op-deployer"
WORKDIR="$SCRIPT_DIR/.deployer"

# Configuration
L1_RPC_URL="${L1_RPC_URL:-http://localhost:1444}"
PRIVATE_KEY="${PRIVATE_KEY:-}"
DEPLOYMENT_TARGET="${DEPLOYMENT_TARGET:-live}"  # live, genesis, calldata

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== BesaChain L1 Contract Deployment ==="
echo "Using PRE-BUILT ARTIFACTS (no compilation needed)"
echo ""

# Check op-deployer
if [ ! -f "$OP_DEPLOYER" ]; then
    echo -e "${RED}op-deployer not found. Running setup...${NC}"
    "$SCRIPT_DIR/setup-op-deployer.sh"
fi

# Check intent.toml exists
if [ ! -f "$SCRIPT_DIR/intent.toml" ]; then
    echo -e "${RED}intent.toml not found!${NC}"
    echo "Please copy intent.example.toml to intent.toml and customize it:"
    echo "  cp intent.example.toml intent.toml"
    exit 1
fi

# Check private key
if [ -z "$PRIVATE_KEY" ]; then
    echo -e "${YELLOW}Warning: PRIVATE_KEY not set${NC}"
    echo "Please set your private key:"
    echo "  export PRIVATE_KEY=0x..."
    
    # Try to load from secrets if available
    if [ -f "/data/besachain-l2/keys/deployer.txt" ]; then
        echo "Loading from /data/besachain-l2/keys/deployer.txt..."
        PRIVATE_KEY=$(grep PRIVATE_KEY /data/besachain-l2/keys/deployer.txt | cut -d= -f2)
        export PRIVATE_KEY
        echo -e "${GREEN}Private key loaded successfully${NC}"
    else
        exit 1
    fi
fi

# Verify L1 connection
echo "Verifying L1 connection..."
CHAIN_ID=$(curl -s -X POST "$L1_RPC_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' | \
    python3 -c 'import json,sys; print(int(json.load(sys.stdin)["result"], 16))' 2>/dev/null || echo "0")

if [ "$CHAIN_ID" != "1444" ]; then
    echo -e "${YELLOW}Warning: L1 chain ID is $CHAIN_ID, expected 1444${NC}"
    echo "Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ L1 connection verified (Chain ID: $CHAIN_ID)${NC}"

# Create workdir
mkdir -p "$WORKDIR"

# Step 1: Initialize intent
echo ""
echo "Step 1: Initializing deployment intent..."
if [ ! -f "$WORKDIR/intent.toml" ]; then
    cp "$SCRIPT_DIR/intent.toml" "$WORKDIR/intent.toml"
    echo -e "${GREEN}✓ Intent file created${NC}"
else
    echo -e "${YELLOW}Intent file already exists, using existing${NC}"
fi

# Step 2: Apply deployment
echo ""
echo "Step 2: Deploying L1 contracts..."
echo "This will download pre-built artifacts and deploy contracts to L1"
echo "Target: $DEPLOYMENT_TARGET"
echo ""

deploy_args=(
    "apply"
    "--workdir" "$WORKDIR"
    "--deployment-target" "$DEPLOYMENT_TARGET"
)

if [ "$DEPLOYMENT_TARGET" = "live" ]; then
    deploy_args+=(
        "--l1-rpc-url" "$L1_RPC_URL"
        "--private-key" "$PRIVATE_KEY"
    )
fi

echo "Running: $OP_DEPLOYER ${deploy_args[*]}"
echo ""

if ! "$OP_DEPLOYER" "${deploy_args[@]}"; then
    echo -e "${RED}Deployment failed!${NC}"
    echo ""
    echo "Common issues:"
    echo "  1. Insufficient funds on deployer account"
    echo "  2. L1 RPC not accessible"
    echo "  3. Invalid private key"
    echo "  4. Unsupported tag (try using file:// artifacts)"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"

# Step 3: Inspect results
echo ""
echo "Step 3: Inspecting deployment state..."

if [ -f "$WORKDIR/state.json" ]; then
    echo -e "${GREEN}✓ State file created: $WORKDIR/state.json${NC}"
    
    # Extract key addresses
    echo ""
    echo "=== Deployed Contract Addresses ==="
    
    # Try to parse and display key addresses
    if command -v jq &> /dev/null; then
        echo ""
        echo "Superchain Config:"
        jq -r '.superchainDeployment // empty' "$WORKDIR/state.json" 2>/dev/null || true
        
        echo ""
        echo "Chain Deployments:"
        jq -r '.opChainDeployments // empty' "$WORKDIR/state.json" 2>/dev/null || true
    else
        echo "Install jq to see formatted output"
        echo "Raw state saved to: $WORKDIR/state.json"
    fi
fi

# Step 4: Generate genesis and rollup configs
echo ""
echo "Step 4: Generating genesis and rollup configurations..."

if [ "$DEPLOYMENT_TARGET" = "live" ]; then
    # Generate configs using inspect
    "$OP_DEPLOYER" inspect genesis "$WORKDIR" "$WORKDIR/genesis.json" || true
    "$OP_DEPLOYER" inspect rollup "$WORKDIR" "$WORKDIR/rollup.json" || true
    
    if [ -f "$WORKDIR/rollup.json" ]; then
        echo -e "${GREEN}✓ Rollup config generated: $WORKDIR/rollup.json${NC}"
    fi
    
    if [ -f "$WORKDIR/genesis.json" ]; then
        echo -e "${GREEN}✓ Genesis config generated: $WORKDIR/genesis.json${NC}"
    fi
fi

echo ""
echo "=== Deployment Summary ==="
echo ""
echo "Working directory: $WORKDIR"
echo "Intent file: $WORKDIR/intent.toml"
echo "State file: $WORKDIR/state.json"
echo ""
echo "Next steps:"
echo "  1. Review deployed addresses in state.json"
echo "  2. Copy rollup.json to your L2 node config"
echo "  3. Start your L2 node with the new configuration"
echo ""
echo "To upgrade or modify:"
echo "  1. Edit $WORKDIR/intent.toml"
echo "  2. Run deploy.sh again"
echo ""
