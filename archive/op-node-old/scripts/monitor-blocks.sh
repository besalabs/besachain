#!/bin/bash
# Monitor L2 block production in real-time

L2_RPC="${L2_RPC:-http://localhost:9545}"
INTERVAL="${INTERVAL:-1}"

echo "=============================================="
echo "BesaChain L2 Block Monitor"
echo "=============================================="
echo "L2 RPC: $L2_RPC"
echo "Refresh: ${INTERVAL}s"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PREV_BLOCK=0
PREV_TIME=0

while true; do
    # Get current block
    RESPONSE=$(curl -s -X POST "$L2_RPC" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false],"id":1}' 2>/dev/null)
    
    if [ -n "$RESPONSE" ]; then
        BLOCK_NUM=$(echo "$RESPONSE" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(int(d.get("result",{}).get("number","0x0"), 16))')
        BLOCK_TIME=$(echo "$RESPONSE" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(int(d.get("result",{}).get("timestamp","0x0"), 16))')
        BLOCK_HASH=$(echo "$RESPONSE" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("result",{}).get("hash","0x0")[:18])')
        GAS_USED=$(echo "$RESPONSE" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(int(d.get("result",{}).get("gasUsed","0x0"), 16))')
        TX_COUNT=$(echo "$RESPONSE" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(len(d.get("result",{}).get("transactions",[])))')
        
        if [ "$BLOCK_NUM" != "$PREV_BLOCK" ]; then
            NOW=$(date +%s)
            
            if [ $PREV_TIME -gt 0 ]; then
                DELTA=$((BLOCK_TIME - PREV_TIME))
                RATE="$(echo "scale=2; 1 / $DELTA * 1000" | bc 2>/dev/null || echo "N/A")"
            else
                DELTA="-"
                RATE="-"
            fi
            
            TIMESTAMP=$(date '+%H:%M:%S')
            printf "${BLUE}[%s]${NC} Block ${GREEN}#%-8s${NC} | Hash: %s | Time: ${YELLOW}%3ss${NC} | TPS: %6s | Gas: %9s | TXs: %3s\n" \
                "$TIMESTAMP" "$BLOCK_NUM" "$BLOCK_HASH..." "$DELTA" "$RATE" "$GAS_USED" "$TX_COUNT"
            
            PREV_BLOCK=$BLOCK_NUM
            PREV_TIME=$BLOCK_TIME
        fi
    fi
    
    sleep $INTERVAL
done
