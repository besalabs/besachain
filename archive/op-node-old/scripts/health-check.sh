#!/bin/bash
# Health check script for BesaChain OP Node

L1_RPC="${L1_RPC:-http://localhost:8545}"
L2_RPC="${L2_RPC:-http://localhost:9545}"
L2_ENGINE="${L2_ENGINE:-http://localhost:9551}"
ADMIN_RPC="${ADMIN_RPC:-http://localhost:9645}"

echo "=============================================="
echo "BesaChain OP Node Health Check"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check L1 endpoint
echo -n "L1 Endpoint ($L1_RPC): "
L1_RESPONSE=$(curl -s -X POST "$L1_RPC" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null)
if echo "$L1_RESPONSE" | grep -q "0x5a4"; then
    L1_BLOCK=$(curl -s -X POST "$L1_RPC" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null | \
        python3 -c 'import json,sys; d=json.load(sys.stdin); print(int(d.get("result","0x0"), 16))')
    echo -e "${GREEN}✓ OK${NC} (Chain 1444, Block $L1_BLOCK)"
else
    echo -e "${RED}✗ Failed${NC}"
fi

# Check L2 Engine endpoint
echo -n "L2 Engine ($L2_ENGINE): "
L2_ENGINE_RESPONSE=$(curl -s -X POST "$L2_ENGINE" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null)
if echo "$L2_ENGINE_RESPONSE" | grep -q "0x5a5"; then
    echo -e "${GREEN}✓ OK${NC} (Chain 1445)"
else
    echo -e "${RED}✗ Failed${NC}"
fi

# Check OP Node RPC
echo -n "OP Node RPC ($L2_RPC): "
OP_RESPONSE=$(curl -s -X POST "$L2_RPC" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"optimism_syncStatus","params":[],"id":1}' 2>/dev/null)
if [ -n "$OP_RESPONSE" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    # Try standard eth_chainId
    OP_CHAIN=$(curl -s -X POST "$L2_RPC" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null | \
        python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("result","0x0"))')
    if [ "$OP_CHAIN" = "0x5a5" ]; then
        echo -e "${GREEN}✓ OK${NC} (Chain 1445)"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
fi

# Check Admin RPC
echo -n "Admin RPC ($ADMIN_RPC): "
ADMIN_RESPONSE=$(curl -s -X POST "$ADMIN_RPC" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"admin_sequencerActive","params":[],"id":1}' 2>/dev/null)
if [ -n "$ADMIN_RESPONSE" ]; then
    if echo "$ADMIN_RESPONSE" | grep -q "true"; then
        echo -e "${GREEN}✓ OK${NC} (Sequencer Active)"
    else
        echo -e "${YELLOW}⚠ Warning${NC} (Sequencer Inactive)"
    fi
else
    echo -e "${RED}✗ Failed${NC}"
fi

# Check block production
echo ""
echo "Block Production Status:"
echo "------------------------"

# Get current L2 block
L2_BLOCK=$(curl -s -X POST "$L2_RPC" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null | \
    python3 -c 'import json,sys; d=json.load(sys.stdin); print(int(d.get("result","0x0"), 16))')

if [ -n "$L2_BLOCK" ] && [ "$L2_BLOCK" -gt 0 ]; then
    echo -e "  Current L2 Block: ${GREEN}$L2_BLOCK${NC}"
    
    # Get block timestamp
    L2_TIMESTAMP=$(curl -s -X POST "$L2_RPC" \
        -H "Content-Type: application/json" \
        -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBlockByNumber\",\"params\":[\"$L2_BLOCK\",false],\"id\":1}" 2>/dev/null | \
        python3 -c 'import json,sys; d=json.load(sys.stdin); result=d.get("result",{}); ts=result.get("timestamp","0x0"); print(int(ts, 16) if ts.startswith("0x") else 0)')
    
    if [ -n "$L2_TIMESTAMP" ]; then
        NOW=$(date +%s)
        AGE=$((NOW - L2_TIMESTAMP))
        echo "  Block Age: ${AGE}s"
        
        if [ $AGE -lt 5 ]; then
            echo -e "  Status: ${GREEN}Active${NC}"
        elif [ $AGE -lt 30 ]; then
            echo -e "  Status: ${YELLOW}Slow${NC}"
        else
            echo -e "  Status: ${RED}Stalled${NC}"
        fi
    fi
else
    echo -e "  ${RED}✗ Cannot retrieve L2 block number${NC}"
fi

# Check sync status
echo ""
echo "Sync Status:"
echo "------------"
SYNC_STATUS=$(curl -s -X POST "$L2_RPC" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"optimism_syncStatus","params":[],"id":1}' 2>/dev/null)

if [ -n "$SYNC_STATUS" ]; then
    echo "  $SYNC_STATUS" | python3 -m json.tool 2>/dev/null || echo "  $SYNC_STATUS"
else
    echo "  syncStatus not available via RPC"
fi

# Check metrics
echo ""
echo "Metrics (http://localhost:7300):"
echo "---------------------------------"
METRICS=$(curl -s http://localhost:7300/metrics 2>/dev/null | head -20)
if [ -n "$METRICS" ]; then
    echo "$METRICS" | grep -E "(head|safe|finalized|sequencer)" || echo "  No relevant metrics found"
else
    echo -e "  ${RED}✗ Metrics endpoint not responding${NC}"
fi

echo ""
echo "=============================================="
