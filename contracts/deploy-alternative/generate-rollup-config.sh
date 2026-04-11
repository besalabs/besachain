#!/bin/bash
# Generate rollup.json from op-deployer state
# This creates the configuration needed by op-node

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKDIR="$SCRIPT_DIR/.deployer"
BIN_DIR="$SCRIPT_DIR/bin"
OP_DEPLOYER="$BIN_DIR/op-deployer"

# L1 and L2 configuration
L1_RPC_URL="${L1_RPC_URL:-http://localhost:1444}"
L2_RPC_URL="${L2_RPC_URL:-http://localhost:1445}"

echo "=== Generating Rollup Configuration ==="
echo ""

# Check state exists
if [ ! -f "$WORKDIR/state.json" ]; then
    echo "Error: state.json not found. Run deploy.sh first."
    exit 1
fi

# Check op-deployer
if [ ! -f "$OP_DEPLOYER" ]; then
    echo "Error: op-deployer not found. Run setup-op-deployer.sh first."
    exit 1
fi

# Generate rollup.json
echo "Generating rollup.json..."
"$OP_DEPLOYER" inspect rollup "$WORKDIR" "$WORKDIR/rollup.json"

# Generate genesis.json
echo "Generating genesis.json..."
"$OP_DEPLOYER" inspect genesis "$WORKDIR" "$WORKDIR/genesis.json"

# Generate additional configs
echo "Generating additional configuration files..."

# Try to get L1 block info
L1_BLOCK_HASH=$(curl -s -X POST "$L1_RPC_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x0",false],"id":1}' 2>/dev/null | \
    python3 -c 'import json,sys; d=json.load(sys.stdin); print(d["result"]["hash"])' 2>/dev/null || echo "0x0")

L1_BLOCK_TIME=$(curl -s -X POST "$L1_RPC_URL" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x0",false],"id":1}' 2>/dev/null | \
    python3 -c 'import json,sys; d=json.load(sys.stdin); print(int(d["result"]["timestamp"], 16))' 2>/dev/null || echo "0")

echo ""
echo "=== Generated Files ==="
echo ""
echo "rollup.json:  $WORKDIR/rollup.json"
echo "genesis.json: $WORKDIR/genesis.json"
echo ""

if [ -f "$WORKDIR/rollup.json" ]; then
    echo "Rollup config preview:"
    head -50 "$WORKDIR/rollup.json"
    echo "..."
    echo ""
    
    # Copy to standard locations
    echo "Copying configs to standard locations..."
    
    # Create config directories
    mkdir -p "$SCRIPT_DIR/config"
    mkdir -p "/data/besachain-l2/config" 2>/dev/null || true
    
    cp "$WORKDIR/rollup.json" "$SCRIPT_DIR/config/rollup.json"
    cp "$WORKDIR/genesis.json" "$SCRIPT_DIR/config/genesis.json" 2>/dev/null || true
    
    if [ -d "/data/besachain-l2/config" ]; then
        cp "$WORKDIR/rollup.json" "/data/besachain-l2/config/rollup.json"
        cp "$WORKDIR/genesis.json" "/data/besachain-l2/config/genesis.json" 2>/dev/null || true
        echo "✓ Configs copied to /data/besachain-l2/config/"
    fi
    
    echo "✓ Configs copied to $SCRIPT_DIR/config/"
fi

echo ""
echo "=== Manual rollup.json format for reference ==="
cat << 'EOF'
{
  "genesis": {
    "l1": {
      "hash": "0x...",
      "number": 0
    },
    "l2": {
      "hash": "0x...",
      "number": 0
    },
    "l2_time": 0,
    "system_config": {
      "batcherAddr": "0x...",
      "overhead": "0x0",
      "scalar": "0x...",
      "gasLimit": 100000000,
      "baseFeeScalar": 0,
      "blobBaseFeeScalar": 0
    }
  },
  "block_time": 1,
  "max_sequencer_drift": 600,
  "seq_window_size": 3600,
  "channel_timeout": 300,
  "l1_chain_id": 1444,
  "l2_chain_id": 1445,
  "regolith_time": 0,
  "canyon_time": 0,
  "delta_time": 0,
  "ecotone_time": 0,
  "fjord_time": 0,
  "batch_inbox_address": "0xff00000000000000000000000000000000001445",
  "deposit_contract_address": "0x...",
  "l1_system_config_address": "0x...",
  "protocol_versions_address": "0x..."
}
EOF

echo ""
echo "Done! Use these configs to start your L2 node."
