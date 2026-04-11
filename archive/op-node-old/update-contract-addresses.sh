#!/bin/bash
# Update rollup.json with deployed contract addresses
# Run this after contract deployment is complete

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROLLUP_CONFIG="${1:-$SCRIPT_DIR/config/rollup.json}"
DEPLOYMENT_STATE="${2:-}"

echo "=============================================="
echo "Update Rollup Contract Addresses"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f "$ROLLUP_CONFIG" ]; then
    echo -e "${RED}Error: Rollup config not found at $ROLLUP_CONFIG${NC}"
    exit 1
fi

# Backup original config
cp "$ROLLUP_CONFIG" "$ROLLUP_CONFIG.backup.$(date +%Y%m%d-%H%M%S)"

# Function to update address in rollup.json
update_address() {
    local key="$1"
    local address="$2"
    local file="$3"
    
    if [ -n "$address" ] && [ "$address" != "0x0000000000000000000000000000000000000000" ]; then
        python3 << PYTHON
import json
import re

with open('$file', 'r') as f:
    content = f.read()

# Update the specific address field
pattern = f'"$key": "0x[0-9a-fA-F]{{40}}"'
replacement = f'"$key": "$address"'
content = re.sub(pattern, replacement, content)

with open('$file', 'w') as f:
    f.write(content)

print(f"  Updated $key: $address")
PYTHON
    fi
}

# Check for deployment state file
if [ -n "$DEPLOYMENT_STATE" ] && [ -f "$DEPLOYMENT_STATE" ]; then
    echo -e "${GREEN}Reading contract addresses from deployment state...${NC}"
    
    # Extract addresses from state.json (op-deployer format)
    DEPOSIT_CONTRACT=$(python3 -c "import json; d=json.load(open('$DEPLOYMENT_STATE')); print(d.get('DepositContract', '0x0'))" 2>/dev/null || echo "0x0")
    SYSTEM_CONFIG=$(python3 -c "import json; d=json.load(open('$DEPLOYMENT_STATE')); print(d.get('SystemConfigProxy', d.get('SystemConfig', '0x0')))" 2>/dev/null || echo "0x0")
    BATCH_INBOX=$(python3 -c "import json; d=json.load(open('$DEPLOYMENT_STATE')); print(d.get('BatchInbox', '0xff00000000000000000000000000000000001445'))" 2>/dev/null || echo "0xff00000000000000000000000000000000001445")
    
else
    echo -e "${YELLOW}No deployment state file provided. Enter addresses manually:${NC}"
    echo ""
    
    read -p "Deposit Contract Address: " DEPOSIT_CONTRACT
    read -p "L1 System Config Address: " SYSTEM_CONFIG
    read -p "Protocol Versions Address (optional): " PROTOCOL_VERSIONS
    read -p "Batch Inbox Address [default: 0xff00000000000000000000000000000000001445]: " BATCH_INBOX
fi

# Set defaults
DEPOSIT_CONTRACT="${DEPOSIT_CONTRACT:-0x0000000000000000000000000000000000000000}"
SYSTEM_CONFIG="${SYSTEM_CONFIG:-0x0000000000000000000000000000000000000000}"
PROTOCOL_VERSIONS="${PROTOCOL_VERSIONS:-0x0000000000000000000000000000000000000000}"
BATCH_INBOX="${BATCH_INBOX:-0xff00000000000000000000000000000000001445}"

echo ""
echo -e "${GREEN}Updating rollup.json with addresses...${NC}"

# Update addresses using Python for proper JSON handling
python3 << PYTHON
import json

with open('$ROLLUP_CONFIG', 'r') as f:
    config = json.load(f)

# Update contract addresses
config['deposit_contract_address'] = '$DEPOSIT_CONTRACT'
config['l1_system_config_address'] = '$SYSTEM_CONFIG'
config['protocol_versions_address'] = '$PROTOCOL_VERSIONS'
config['batch_inbox_address'] = '$BATCH_INBOX'

# Ensure L1 genesis block is set
if 'genesis' in config and 'l1' in config['genesis']:
    config['genesis']['l1']['hash'] = '0x0000000000000000000000000000000000000000000000000000000000000000'
    config['genesis']['l1']['number'] = 0

with open('$ROLLUP_CONFIG', 'w') as f:
    json.dump(config, f, indent=2)

print("✓ Contract addresses updated")
print(f"  deposit_contract_address: {config['deposit_contract_address']}")
print(f"  l1_system_config_address: {config['l1_system_config_address']}")
print(f"  protocol_versions_address: {config['protocol_versions_address']}")
print(f"  batch_inbox_address: {config['batch_inbox_address']}")
PYTHON

echo ""

# Verify configuration
echo -e "${GREEN}Verifying rollup.json...${NC}"
python3 << PYTHON
import json

with open('$ROLLUP_CONFIG', 'r') as f:
    config = json.load(f)

errors = []

# Check required fields
required = ['l1_chain_id', 'l2_chain_id', 'block_time', 'batch_inbox_address', 
            'deposit_contract_address', 'l1_system_config_address']
for field in required:
    if field not in config:
        errors.append(f"Missing required field: {field}")

# Check chain IDs
if config.get('l1_chain_id') != 1444:
    errors.append(f"L1 chain ID should be 1444, got {config.get('l1_chain_id')}")
if config.get('l2_chain_id') != 1445:
    errors.append(f"L2 chain ID should be 1445, got {config.get('l2_chain_id')}")

# Check for placeholder addresses
placeholders = []
if config.get('deposit_contract_address') == '0x0000000000000000000000000000000000000000':
    placeholders.append('deposit_contract_address')
if config.get('l1_system_config_address') == '0x0000000000000000000000000000000000000000':
    placeholders.append('l1_system_config_address')

if errors:
    print("✗ Validation failed:")
    for e in errors:
        print(f"  - {e}")
else:
    print("✓ Rollup config validation passed")

if placeholders:
    print(f"⚠ Warning: Placeholder addresses still present in: {', '.join(placeholders)}")
PYTHON

echo ""
echo "=============================================="
echo -e "${GREEN}Update Complete!${NC}"
echo "=============================================="
echo ""
echo "Next Steps:"
echo "  1. Copy updated config to server"
echo "  2. Restart besachain-op-node service"
echo "  3. Verify L2 block production"
echo ""
