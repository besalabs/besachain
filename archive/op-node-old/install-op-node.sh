#!/bin/bash
# Install BesaChain OP Node Sequencer on the validator server
# This script sets up the op-node as a systemd service

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="/data/besachain-op-node"
BINARY_DIR="/usr/local/bin"
USER="besachain"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=============================================="
echo "BesaChain OP Node Sequencer Installation"
echo "=============================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Please run as root (use sudo)${NC}"
    exit 1
fi

# Check for besachain user
if ! id "$USER" &>/dev/null; then
    echo -e "${YELLOW}Creating $USER user...${NC}"
    useradd -r -s /bin/false $USER
fi

# Create directories
echo -e "${GREEN}[1/7] Creating directories...${NC}"
mkdir -p "$INSTALL_DIR"/{config,data,logs}
chown -R $USER:$USER "$INSTALL_DIR"

# Check and pull op-node Docker image
echo -e "${GREEN}[2/7] Pulling op-node Docker image...${NC}"
docker pull us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3

# Check if binary exists locally, otherwise extract from Docker
if [ ! -f "$BINARY_DIR/op-node" ]; then
    echo -e "${YELLOW}Extracting op-node binary from Docker image...${NC}"
    docker create --name temp-op-node us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
    docker cp temp-op-node:/usr/local/bin/op-node "$BINARY_DIR/op-node"
    docker rm temp-op-node
    chmod +x "$BINARY_DIR/op-node"
    chown root:root "$BINARY_DIR/op-node"
    echo -e "${GREEN}✓ op-node binary installed${NC}"
else
    echo -e "${GREEN}✓ op-node binary already exists${NC}"
fi

# Copy configuration files
echo -e "${GREEN}[3/7] Copying configuration files...${NC}"

# Check if JWT secret exists, create if not
if [ ! -f "$INSTALL_DIR/config/jwt-secret.txt" ]; then
    if [ -f "$SCRIPT_DIR/config/jwt-secret.txt" ]; then
        cp "$SCRIPT_DIR/config/jwt-secret.txt" "$INSTALL_DIR/config/jwt-secret.txt"
    else
        openssl rand -hex 32 > "$INSTALL_DIR/config/jwt-secret.txt"
    fi
    chown $USER:$USER "$INSTALL_DIR/config/jwt-secret.txt"
    chmod 600 "$INSTALL_DIR/config/jwt-secret.txt"
fi

# Copy or create rollup.json
if [ -f "$SCRIPT_DIR/config/rollup.json" ]; then
    cp "$SCRIPT_DIR/config/rollup.json" "$INSTALL_DIR/config/rollup.json"
else
    echo -e "${YELLOW}Warning: rollup.json not found in script directory${NC}"
    echo "Please ensure rollup.json is created with correct contract addresses"
fi

chown -R $USER:$USER "$INSTALL_DIR/config"

# Install systemd service
echo -e "${GREEN}[4/7] Installing systemd service...${NC}"
if [ -f "$SCRIPT_DIR/besachain-op-node.service" ]; then
    cp "$SCRIPT_DIR/besachain-op-node.service" /etc/systemd/system/
else
    cat > /etc/systemd/system/besachain-op-node.service << 'EOF'
[Unit]
Description=BesaChain OP Node Sequencer (L2 Chain 1445)
After=network.target besachain-l1.service besachain-l2.service
Requires=besachain-l2.service

[Service]
Type=simple
User=besachain
Group=besachain
WorkingDirectory=/data/besachain-op-node

Environment="OP_NODE_L1_ETH_RPC=http://localhost:8545"
Environment="OP_NODE_L2_ENGINE_RPC=http://localhost:9551"
Environment="OP_NODE_ROLLUP_CONFIG=/data/besachain-op-node/config/rollup.json"
Environment="OP_NODE_JWT_SECRET=/data/besachain-op-node/config/jwt-secret.txt"

ExecStart=/usr/local/bin/op-node \
    --l1=http://localhost:8545 \
    --l2=http://localhost:9551 \
    --rollup.config=/data/besachain-op-node/config/rollup.json \
    --rpc.addr=0.0.0.0 \
    --rpc.port=9545 \
    --rpc.admin=true \
    --rpc.admin-addr=0.0.0.0 \
    --rpc.admin-port=9645 \
    --sequencer.enabled \
    --sequencer.l1-confs=0 \
    --p2p.disabled \
    --metrics.enabled \
    --metrics.addr=0.0.0.0 \
    --metrics.port=7300 \
    --authrpc.addr=0.0.0.0 \
    --authrpc.port=9551 \
    --authrpc.jwt-secret=/data/besachain-op-node/config/jwt-secret.txt \
    --plasma.enabled=false \
    --verifier.l1-confs=0 \
    --l1-trust-rpc \
    --l1.rpckind=basic

Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=besachain-op-node

LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF
fi

# Reload systemd
echo -e "${GREEN}[5/7] Reloading systemd...${NC}"
systemctl daemon-reload

# Verify L1 and L2 are running
echo -e "${GREEN}[6/7] Verifying L1 and L2 endpoints...${NC}"
L1_READY=false
L2_READY=false

# Check L1
echo "Checking L1 endpoint (http://localhost:8545)..."
for i in {1..5}; do
    if curl -s -X POST http://localhost:8545 \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null | grep -q "0x5a4"; then
        echo -e "${GREEN}✓ L1 endpoint ready (Chain 1444)${NC}"
        L1_READY=true
        break
    fi
    echo "  Attempt $i/5..."
    sleep 2
done

if [ "$L1_READY" = false ]; then
    echo -e "${YELLOW}Warning: L1 endpoint not responding. Start besachain-l1 first.${NC}"
fi

# Check L2
echo "Checking L2 endpoint (http://localhost:9551)..."
for i in {1..5}; do
    if curl -s -X POST http://localhost:9551 \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null | grep -q "0x5a5"; then
        echo -e "${GREEN}✓ L2 endpoint ready (Chain 1445)${NC}"
        L2_READY=true
        break
    fi
    echo "  Attempt $i/5..."
    sleep 2
done

if [ "$L2_READY" = false ]; then
    echo -e "${YELLOW}Warning: L2 endpoint not responding. Start besachain-l2 first.${NC}"
fi

# Verify configuration
echo -e "${GREEN}[7/7] Verifying configuration...${NC}"
echo ""
echo "Configuration Summary:"
echo "  Install Directory: $INSTALL_DIR"
echo "  Config File:       $INSTALL_DIR/config/rollup.json"
echo "  JWT Secret:        $INSTALL_DIR/config/jwt-secret.txt"
echo "  Binary:            $BINARY_DIR/op-node"
echo "  Service:           besachain-op-node.service"
echo ""
echo "RPC Endpoints:"
echo "  L2 RPC HTTP:       http://localhost:9545"
echo "  Admin RPC:         http://localhost:9645"
echo "  Metrics:           http://localhost:7300"
echo ""

# Check rollup.json
if [ -f "$INSTALL_DIR/config/rollup.json" ]; then
    echo -e "${GREEN}✓ rollup.json exists${NC}"
    L1_CHAIN=$(grep -o '"l1_chain_id": [0-9]*' "$INSTALL_DIR/config/rollup.json" | head -1)
    L2_CHAIN=$(grep -o '"l2_chain_id": [0-9]*' "$INSTALL_DIR/config/rollup.json" | head -1)
    echo "  $L1_CHAIN"
    echo "  $L2_CHAIN"
    
    # Check for placeholder addresses
    if grep -q '"0x0000000000000000000000000000000000000000"' "$INSTALL_DIR/config/rollup.json"; then
        echo -e "${YELLOW}⚠ Warning: rollup.json contains placeholder addresses${NC}"
        echo "  Please update with actual contract addresses after deployment"
    fi
else
    echo -e "${RED}✗ rollup.json not found${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}Installation Complete!${NC}"
echo "=============================================="
echo ""
echo "To start the op-node:"
echo "  sudo systemctl start besachain-op-node"
echo ""
echo "To check status:"
echo "  sudo systemctl status besachain-op-node"
echo "  sudo journalctl -u besachain-op-node -f"
echo ""
echo "To enable auto-start on boot:"
echo "  sudo systemctl enable besachain-op-node"
echo ""
