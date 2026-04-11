#!/bin/bash
# Alternative fix: Run op-node as systemd service instead of Docker
# This avoids Docker networking issues entirely

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=============================================="
echo "BesaChain OP Node Systemd Fix"
echo "=============================================="
echo ""

echo -e "${YELLOW}[1/4] Checking prerequisites...${NC}"

# Check if op-node binary exists
if [ ! -f "/usr/local/bin/op-node" ]; then
    echo -e "${YELLOW}op-node binary not found. Extracting from Docker...${NC}"
    docker pull us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
    docker create --name temp-op-node us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
    docker cp temp-op-node:/usr/local/bin/op-node /usr/local/bin/op-node
    docker rm temp-op-node
    chmod +x /usr/local/bin/op-node
    echo -e "${GREEN}✓ op-node binary installed${NC}"
else
    echo -e "${GREEN}✓ op-node binary exists${NC}"
fi

# Check directories
mkdir -p /data/besachain-op-node/{config,data,logs}

# Ensure JWT secret exists
if [ ! -f "/data/besachain-op-node/config/jwt-secret.txt" ]; then
    openssl rand -hex 32 > /data/besachain-op-node/config/jwt-secret.txt
    chmod 600 /data/besachain-op-node/config/jwt-secret.txt
    echo -e "${GREEN}✓ JWT secret generated${NC}"
fi

# Create besachain user if not exists
if ! id "besachain" &>/dev/null; then
    useradd -r -s /bin/false besachain
    echo -e "${GREEN}✓ besachain user created${NC}"
fi

chown -R besachain:besachain /data/besachain-op-node

echo ""
echo -e "${YELLOW}[2/4] Creating fixed systemd service...${NC}"

# Create the fixed systemd service file
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

# Environment variables
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
    --l1.rpckind=basic \
    --l1.http-poll-interval=500ms \
    --l1.epoch-poll-interval=500ms

Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=besachain-op-node

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✓ Systemd service created${NC}"

echo ""
echo -e "${YELLOW}[3/4] Reloading systemd...${NC}"
systemctl daemon-reload

echo -e "${GREEN}✓ Systemd reloaded${NC}"

echo ""
echo -e "${YELLOW}[4/4] Checking L1/L2 endpoints...${NC}"

# Check L1
L1_READY=false
for i in {1..3}; do
    if curl -s -X POST http://localhost:8545 \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null | grep -q "0x5a4"; then
        echo -e "${GREEN}✓ L1 endpoint ready (Chain 1444)${NC}"
        L1_READY=true
        break
    fi
    sleep 1
done

if [ "$L1_READY" = false ]; then
    echo -e "${RED}✗ L1 endpoint not responding${NC}"
fi

# Check L2
L2_READY=false
for i in {1..3}; do
    if curl -s -X POST http://localhost:9551 \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null | grep -q "0x5a5"; then
        echo -e "${GREEN}✓ L2 endpoint ready (Chain 1445)${NC}"
        L2_READY=true
        break
    fi
    sleep 1
done

if [ "$L2_READY" = false ]; then
    echo -e "${RED}✗ L2 endpoint not responding${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "To start the op-node:"
echo "  sudo systemctl start besachain-op-node"
echo ""
echo "To check status:"
echo "  sudo systemctl status besachain-op-node"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u besachain-op-node -f"
echo ""
echo "To enable auto-start:"
echo "  sudo systemctl enable besachain-op-node"
echo ""
echo "RPC Endpoints:"
echo "  L2 HTTP: http://54.235.85.175:9545"
echo "  Admin:   http://54.235.85.175:9645"
echo "  Metrics: http://54.235.85.175:7300"
echo ""
