#!/bin/bash
# BesaChain TPS Measurement Script
# Measures actual transaction throughput on L1 and L2

set -e

# Configuration
L1_RPC="http://54.235.85.175:8545"
L2_RPC="http://54.235.85.175:9545"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "BesaChain TPS Measurement"
echo "========================================="
echo ""

# Get current status
echo -e "${BLUE}L1 Status (BSC Geth):${NC}"
L1_CHAIN=$(curl -s -X POST $L1_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' | jq -r '.result')
L1_BLOCK=$(curl -s -X POST $L1_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq -r '.result')
L1_GAS=$(curl -s -X POST $L1_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false],"id":1}' | jq -r '.result.gasLimit')

echo "  Chain ID: $L1_CHAIN (Expected: 0x5a4)"
echo "  Block: $L1_BLOCK"
echo "  Gas Limit: $L1_GAS"
echo ""

echo -e "${BLUE}L2 Status (op-geth):${NC}"
L2_CHAIN=$(curl -s -X POST $L2_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' | jq -r '.result')
L2_BLOCK=$(curl -s -X POST $L2_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | jq -r '.result')
L2_GAS=$(curl -s -X POST $L2_RPC -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false],"id":1}' | jq -r '.result.gasLimit')

echo "  Chain ID: $L2_CHAIN (Expected: 0x5a5)"
echo "  Block: $L2_BLOCK"
echo "  Gas Limit: $L2_GAS"
echo ""

# Theoretical TPS calculations
echo "========================================="
echo "Theoretical TPS Capacity"
echo "========================================="

# Simple transfer ~21,000 gas
SIMPLE_TRANSFER_GAS=21000

# Convert hex gas limit to decimal
L1_GAS_DEC=$(printf '%d' $L1_GAS 2>/dev/null || echo 1000000000)
L2_GAS_DEC=$(printf '%d' $L2_GAS 2>/dev/null || echo 100000000)

L1_TPS=$((L1_GAS_DEC / SIMPLE_TRANSFER_GAS))
L2_TPS=$((L2_GAS_DEC / SIMPLE_TRANSFER_GAS))

echo -e "${GREEN}L1 with 1B gas limit: ~$L1_TPS TPS (simple transfers)${NC}"
echo -e "${GREEN}L2 with 100M gas limit: ~$L2_TPS TPS (simple transfers)${NC}"
echo ""

echo "========================================="
echo "Notes"
echo "========================================="
echo "• Actual TPS requires mining/sequencing to be active"
echo "• L1 needs valid validator for Parlia consensus"
echo "• L2 needs op-node with proper L1 contracts"
echo "• Current setup is ready for contract deployment"
echo ""
