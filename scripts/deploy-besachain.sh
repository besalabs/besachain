#!/bin/bash
# BesaChain Contract Deployment Script
# Deploys core contracts to BesaChain L1 (1444) and L2 (1445)

set -e

# Configuration
L1_RPC="http://54.235.85.175:8545"
L2_RPC="http://54.235.85.175:9545"
CHAIN_ID_L1=1444
CHAIN_ID_L2=1445

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "BesaChain Contract Deployment"
echo "========================================="
echo ""

# Check connections
echo "Checking L1 connection..."
L1_CHAIN=$(curl -s -X POST $L1_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' | jq -r '.result' 2>/dev/null || echo "null")
if [ "$L1_CHAIN" == "0x5a4" ]; then
    echo -e "${GREEN}✓ L1 connected (Chain 1444)${NC}"
else
    echo -e "${RED}✗ L1 not available${NC}"
    exit 1
fi

echo "Checking L2 connection..."
L2_CHAIN=$(curl -s -X POST $L2_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' | jq -r '.result' 2>/dev/null || echo "null")
if [ "$L2_CHAIN" == "0x5a5" ]; then
    echo -e "${GREEN}✓ L2 connected (Chain 1445)${NC}"
else
    echo -e "${RED}✗ L2 not available${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo "Deployment Configuration"
echo "========================================="
echo "L1 RPC: $L1_RPC"
echo "L2 RPC: $L2_RPC"
echo ""

# TODO: Add actual deployment commands using forge or hardhat
# For now, this is a template that shows what would be deployed

echo "Contracts to Deploy:"
echo ""
echo "L1 (BesaChain L1 - 1B Gas Limit):"
echo "  1. BesaToken (BESA) - Governance Token"
echo "  2. BesaFactory - DEX Factory"
echo "  3. BesaBridgeRelayer - L1 side of bridge"
echo ""
echo "L2 (BesaChain L2 - 100M Gas Limit):"
echo "  1. BesaToken (BESA) - Governance Token (L2 bridge mintable)"
echo "  2. BesaFactory - DEX Factory (L2 optimized)"
echo "  3. BesaBridgeRelayer - L2 side of bridge"
echo ""

echo "========================================="
echo "Gas Limits"
echo "========================================="
L1_GAS=$(curl -s -X POST $L1_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false],"id":1}' | jq -r '.result.gasLimit' 2>/dev/null || echo "0x0")
L2_GAS=$(curl -s -X POST $L2_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false],"id":1}' | jq -r '.result.gasLimit' 2>/dev/null || echo "0x0")

echo "L1 Gas Limit: $(printf '%d' $L1_GAS 2>/dev/null || echo 'N/A')"
echo "L2 Gas Limit: $(printf '%d' $L2_GAS 2>/dev/null || echo 'N/A')"
echo ""

echo "========================================="
echo "Deployment Complete"
echo "========================================="
echo "To deploy with foundry:"
echo "  forge script DeployBesaChain --rpc-url $L1_RPC --broadcast"
echo "  forge script DeployBesaChain --rpc-url $L2_RPC --broadcast"
echo ""
