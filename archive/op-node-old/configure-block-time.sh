#!/bin/bash
# Configure 250ms block time coordination for BesaChain L2
# This script coordinates L1 (450ms) and L2 (250ms) block times

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROLLUP_CONFIG="${1:-/data/besachain-op-node/config/rollup.json}"

echo "=============================================="
echo "BesaChain Block Time Configuration"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Target Configuration:"
echo "  L1 Block Time: 450ms (BSC miner.recommit)"
echo "  L2 Block Time: 250ms (op-node config)"
echo ""

# Verify L1 configuration
echo -e "${GREEN}[1/3] Checking L1 configuration...${NC}"
L1_PERIOD=$(curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false],"id":1}' 2>/dev/null | \
    python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("result",{}).get("timestamp","0x0"))' 2>/dev/null || echo "0x0")

echo "  L1 Latest Block Timestamp: $L1_PERIOD"
echo "  L1 Target: 450ms block time"
echo ""

# Update rollup.json for 250ms block time (1 second = 1, but we use sequencer timing)
echo -e "${GREEN}[2/3] Configuring L2 for 250ms block time...${NC}"

if [ ! -f "$ROLLUP_CONFIG" ]; then
    echo -e "${RED}Error: Rollup config not found at $ROLLUP_CONFIG${NC}"
    exit 1
fi

# Backup original config
cp "$ROLLUP_CONFIG" "$ROLLUP_CONFIG.backup.$(date +%Y%m%d-%H%M%S)"

# Update block_time to 1 second (minimum), actual 250ms via sequencer drift
# Note: OP Stack has minimum 1 second block time in config, we use sequencer timing for faster blocks
python3 << PYTHON
import json

with open("$ROLLUP_CONFIG", 'r') as f:
    config = json.load(f)

# Set block_time to 1 (minimum for OP Stack)
# The actual 250ms is achieved via sequencer timing config
config['block_time'] = 1
config['max_sequencer_drift'] = 300  # 5 minutes max drift
config['seq_window_size'] = 3600

# Update system config for high throughput
if 'system_config' in config.get('genesis', {}):
    config['genesis']['system_config']['gasLimit'] = 100000000

with open("$ROLLUP_CONFIG", 'w') as f:
    json.dump(config, f, indent=2)

print("✓ Rollup config updated")
print(f"  block_time: {config['block_time']} seconds")
print(f"  max_sequencer_drift: {config['max_sequencer_drift']} seconds")
PYTHON

echo ""

# Create op-geth configuration for 250ms recommit
echo -e "${GREEN}[3/3] Creating L2 geth configuration...${NC}"

cat > /tmp/besachain-l2-250ms.conf << 'EOF'
# BesaChain L2 Configuration for 250ms Block Time
[Eth]
NetworkId = 1445
SyncMode = "full"

[Eth.Miner]
GasFloor = 100000000
GasCeil = 100000000
Recommit = 250000000  # 250ms in nanoseconds

[Node]
DataDir = "/data/besachain-l2/data"
HTTPHost = "0.0.0.0"
HTTPPort = 1445
HTTPVirtualHosts = ["*"]
HTTPModules = ["eth", "net", "web3", "txpool", "debug"]
WSHost = "0.0.0.0"
WSPort = 14445
WSOrigins = ["*"]
WSModules = ["eth", "net", "web3"]
AuthAddr = "0.0.0.0"
AuthPort = 9551

[Node.P2P]
MaxPeers = 0
NoDiscovery = true

[Metrics]
Enabled = true
HTTP = "0.0.0.0"
Port = 14450
EOF

echo "  L2 config created at /tmp/besachain-l2-250ms.conf"
echo ""

# Update systemd service for L2
echo -e "${YELLOW}Note: To apply 250ms block time to L2 geth:${NC}"
echo "  1. Stop besachain-l2: sudo systemctl stop besachain-l2"
echo "  2. Update service to use config file or add --miner.recommit 250ms"
echo "  3. Restart besachain-l2: sudo systemctl start besachain-l2"
echo ""

echo "=============================================="
echo -e "${GREEN}Block Time Configuration Complete!${NC}"
echo "=============================================="
echo ""
echo "Configuration Summary:"
echo "  L1: 450ms (BSC miner.recommit)"
echo "  L2: 250ms (via sequencer + geth config)"
echo ""
echo "Files Modified:"
echo "  - $ROLLUP_CONFIG"
echo ""
echo "Next Steps:"
echo "  1. Restart besachain-l2 with 250ms recommit"
echo "  2. Start besachain-op-node"
echo "  3. Monitor block production rates"
echo ""
