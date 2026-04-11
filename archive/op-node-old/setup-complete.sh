#!/bin/bash
# Complete OP Node Setup Script
# This script orchestrates the full op-node deployment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTANCE_IP="${1:-54.235.85.175}"
AWS_KEY="${2:-$HOME/.ssh/libyachain-validators.pem}"

echo "=============================================="
echo "BesaChain OP Node - Complete Setup"
echo "=============================================="
echo "Instance: $INSTANCE_IP"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Pre-deployment checks
echo -e "${BLUE}[Step 1/5] Pre-deployment checks${NC}"
echo "-----------------------------------"

# Check SSH connectivity
echo -n "Checking SSH connectivity... "
if ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ec2-user@"$INSTANCE_IP" "echo 'OK'" 2>/dev/null | grep -q "OK"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
    echo "Cannot connect to $INSTANCE_IP"
    exit 1
fi

# Check if L1 and L2 are running
echo -n "Checking L1 service... "
if ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no ec2-user@"$INSTANCE_IP" "sudo systemctl is-active besachain-l1" 2>/dev/null | grep -q "active"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${YELLOW}⚠ Not running${NC}"
    echo "  Start with: sudo systemctl start besachain-l1"
fi

echo -n "Checking L2 service... "
if ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no ec2-user@"$INSTANCE_IP" "sudo systemctl is-active besachain-l2" 2>/dev/null | grep -q "active"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${YELLOW}⚠ Not running${NC}"
    echo "  Start with: sudo systemctl start besachain-l2"
fi

echo ""

# Step 2: Deploy OP Node
echo -e "${BLUE}[Step 2/5] Deploying OP Node${NC}"
echo "-----------------------------------"
"$SCRIPT_DIR/deploy-remote.sh" "$INSTANCE_IP" "$AWS_KEY"

echo ""

# Step 3: Configure block time
echo -e "${BLUE}[Step 3/5] Configuring 250ms block time${NC}"
echo "-----------------------------------"

# Run configuration on remote server
ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no ec2-user@"$INSTANCE_IP" "
    if [ -f /data/besachain-op-node/configure-block-time.sh ]; then
        sudo bash /data/besachain-op-node/configure-block-time.sh
    else
        echo 'Block time config script not found, skipping...'
    fi
" 2>/dev/null || echo "Block time configuration skipped"

echo ""

# Step 4: Start services
echo -e "${BLUE}[Step 4/5] Starting OP Node service${NC}"
echo "-----------------------------------"

# Start L2 with 250ms config if not running
ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no ec2-user@"$INSTANCE_IP" "
    # Check if L2 is running
    if ! sudo systemctl is-active besachain-l2 >/dev/null 2>&1; then
        echo 'Starting besachain-l2...'
        sudo systemctl start besachain-l2
        sleep 5
    fi
    
    # Start op-node
    echo 'Starting besachain-op-node...'
    sudo systemctl start besachain-op-node
    sleep 3
    
    # Enable auto-start
    sudo systemctl enable besachain-op-node 2>/dev/null || true
" 2>/dev/null

echo -e "${GREEN}✓ Services started${NC}"
echo ""

# Step 5: Verification
echo -e "${BLUE}[Step 5/5] Verification${NC}"
echo "-----------------------------------"

sleep 5

# Check op-node status
ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no ec2-user@"$INSTANCE_IP" "
    echo 'Service Status:'
    sudo systemctl is-active besachain-op-node && echo -e '${GREEN}  besachain-op-node: Active${NC}' || echo -e '${RED}  besachain-op-node: Inactive${NC}'
    
    echo ''
    echo 'Endpoint Checks:'
    
    # Check L2 RPC
    if curl -s -X POST http://localhost:9545 -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_chainId\",\"params\":[],\"id\":1}' 2>/dev/null | grep -q '0x5a5'; then
        echo -e '${GREEN}  ✓ L2 RPC (9545) responding${NC}'
    else
        echo -e '${RED}  ✗ L2 RPC (9545) not responding${NC}'
    fi
    
    # Check Admin RPC
    if curl -s -X POST http://localhost:9645 -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"admin_sequencerActive\",\"params\":[],\"id\":1}' 2>/dev/null | grep -q 'result'; then
        echo -e '${GREEN}  ✓ Admin RPC (9645) responding${NC}'
    else
        echo -e '${YELLOW}  ⚠ Admin RPC (9645) not yet responding${NC}'
    fi
    
    # Check metrics
    if curl -s http://localhost:7300/metrics 2>/dev/null | head -1 | grep -q 'op_node'; then
        echo -e '${GREEN}  ✓ Metrics (7300) responding${NC}'
    else
        echo -e '${YELLOW}  ⚠ Metrics (7300) not yet responding${NC}'
    fi
" 2>/dev/null

echo ""
echo "=============================================="
echo -e "${GREEN}OP Node Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "Public Endpoints:"
echo "  L2 RPC:   http://$INSTANCE_IP:9545"
echo "  Admin:    http://$INSTANCE_IP:9645"
echo "  Metrics:  http://$INSTANCE_IP:7300"
echo ""
echo "Local Endpoints (on server):"
echo "  L1 RPC:   http://localhost:8545  (Chain 1444)"
echo "  L2 RPC:   http://localhost:9545  (Chain 1445)"
echo "  L2 Engine: http://localhost:9551"
echo ""
echo "Useful Commands:"
echo "  # Check status"
echo "  ssh -i $AWS_KEY ec2-user@$INSTANCE_IP 'sudo systemctl status besachain-op-node'"
echo ""
echo "  # View logs"
echo "  ssh -i $AWS_KEY ec2-user@$INSTANCE_IP 'sudo journalctl -u besachain-op-node -f'"
echo ""
echo "  # Health check"
echo "  ssh -i $AWS_KEY ec2-user@$INSTANCE_IP 'bash /data/besachain-op-node/scripts/health-check.sh'"
echo ""
echo "  # Monitor blocks"
echo "  ssh -i $AWS_KEY ec2-user@$INSTANCE_IP 'bash /data/besachain-op-node/scripts/monitor-blocks.sh'"
echo ""
echo "=============================================="
