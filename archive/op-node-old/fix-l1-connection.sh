#!/bin/bash
# Fix L1 connection issue for op-node on validator 1
# Run this on the validator server (54.235.85.175)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=============================================="
echo "BesaChain OP Node L1 Connection Fix"
echo "=============================================="
echo ""

# Get the docker0 bridge IP (host IP from container perspective)
DOCKER_HOST_IP=$(ip addr show docker0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1 || echo "172.17.0.1")
echo -e "${GREEN}Docker host IP detected: $DOCKER_HOST_IP${NC}"

# Alternative: Get the default route IP
DEFAULT_IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}Host default IP: $DEFAULT_IP${NC}"

echo ""
echo -e "${YELLOW}[1/5] Checking L1 BSC node configuration...${NC}"

# Check if L1 service exists and is running
if systemctl is-active --quiet besachain-l1 2>/dev/null; then
    echo -e "${GREEN}✓ besachain-l1 service is running${NC}"
    
    # Get L1 service file
    L1_SERVICE=$(systemctl show besachain-l1 -p FragmentPath | cut -d= -f2)
    echo "L1 service file: $L1_SERVICE"
    
    # Check current http.vhosts setting
    if grep -q "http.vhosts" "$L1_SERVICE" 2>/dev/null; then
        echo "Current http.vhosts setting:"
        grep "http.vhosts" "$L1_SERVICE" | head -1
    else
        echo -e "${YELLOW}Warning: http.vhosts not explicitly set in service file${NC}"
    fi
else
    echo -e "${RED}✗ besachain-l1 service is not running${NC}"
fi

echo ""
echo -e "${YELLOW}[2/5] Testing L1 connectivity from host...${NC}"

# Test L1 from host
L1_RESPONSE=$(curl -s -X POST http://localhost:8545 \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null || echo "")

if echo "$L1_RESPONSE" | grep -q "0x5a4"; then
    echo -e "${GREEN}✓ L1 responding on localhost:8545 (Chain 1444)${NC}"
else
    echo -e "${RED}✗ L1 not responding on localhost:8545${NC}"
    echo "Response: $L1_RESPONSE"
fi

echo ""
echo -e "${YELLOW}[3/5] Testing L1 from Docker container perspective...${NC}"

# Run a test container to check connectivity from within Docker
docker run --rm --network bridge alpine/curl:latest \
    -s -X POST http://$DOCKER_HOST_IP:8545 \
    -H "Content-Type: application/json" \
    -H "Host: localhost" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null || true

echo ""
echo -e "${YELLOW}[4/5] Creating fixed docker-compose.yml...${NC}"

# Create fixed docker-compose.yml with proper L1 endpoint
cat > /data/besachain-op-node/docker-compose.yml << EOF
version: '3.8'

services:
  op-node:
    image: us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
    container_name: besachain-op-node
    restart: unless-stopped
    environment:
      # Use host network mode for direct localhost access
      - OP_NODE_L1_ETH_RPC=http://$DOCKER_HOST_IP:8545
      - OP_NODE_L2_ENGINE_RPC=http://besachain-l2:9551
      - OP_NODE_RPC_ADDR=0.0.0.0
      - OP_NODE_RPC_PORT=9545
      - OP_NODE_ROLLUP_CONFIG=/config/rollup.json
      - OP_NODE_JWT_SECRET=/config/jwt-secret.txt
      - OP_NODE_SEQUENCER_ENABLED=true
      - OP_NODE_SEQUENCER_L1_CONFS=0
      - OP_NODE_P2P_DISABLED=true
      - OP_NODE_METRICS_ENABLED=true
      - OP_NODE_METRICS_ADDR=0.0.0.0
      - OP_NODE_METRICS_PORT=7300
      - OP_NODE_RPC_ADMIN_ENABLED=true
      - OP_NODE_RPC_ADMIN_ADDR=0.0.0.0
      - OP_NODE_RPC_ADMIN_PORT=9645
      - OP_NODE_VERIFIER_L1_CONFS=0
      - OP_NODE_PLASMA_ENABLED=false
    volumes:
      - /data/besachain-op-node/config:/config:ro
      - /data/besachain-op-node/data:/data
    ports:
      - "9545:9545"    # L2 RPC HTTP
      - "9645:9645"    # Admin RPC
      - "7300:7300"    # Metrics
    command: >
      op-node
      --l1=http://$DOCKER_HOST_IP:8545
      --l2=http://$DEFAULT_IP:9551
      --rollup.config=/config/rollup.json
      --rpc.addr=0.0.0.0
      --rpc.port=9545
      --rpc.admin=true
      --rpc.admin-addr=0.0.0.0
      --rpc.admin-port=9645
      --sequencer.enabled
      --sequencer.l1-confs=0
      --p2p.disabled
      --metrics.enabled
      --metrics.addr=0.0.0.0
      --metrics.port=7300
      --authrpc.addr=0.0.0.0
      --authrpc.port=9551
      --authrpc.jwt-secret=/config/jwt-secret.txt
      --plasma.enabled=false
      --verifier.l1-confs=0
      --l1-trust-rpc
      --l1.rpckind=basic
    networks:
      - besachain-network
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:9545/healthz || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # L2 Geth (op-geth) - if not running as separate systemd service
  besachain-l2:
    image: ghcr.io/bnb-chain/op-geth:latest
    container_name: besachain-l2
    restart: unless-stopped
    environment:
      - GETH_DATADIR=/data
      - GETH_NETWORKID=1445
      - GETH_AUTHRPC_ADDR=0.0.0.0
      - GETH_AUTHRPC_PORT=9551
      - GETH_AUTHRPC_JWTSECRET=/config/jwt-secret.txt
      - GETH_HTTP_ADDR=0.0.0.0
      - GETH_HTTP_PORT=9551
      - GETH_HTTP_API=eth,net,web3,engine
      - GETH_HTTP_VHOSTS=*
      - GETH_HTTP_CORSDOMAIN=*
      - GETH_WS_ADDR=0.0.0.0
      - GETH_WS_PORT=9552
      - GETH_WS_API=eth,net,web3
    volumes:
      - /data/besachain-op-node/config:/config:ro
      - /data/besachain-l2:/data
    ports:
      - "9551:9551"
      - "9552:9552"
    command: >
      --datadir=/data
      --networkid=1445
      --authrpc.addr=0.0.0.0
      --authrpc.port=9551
      --authrpc.jwt-secret=/config/jwt-secret.txt
      --http
      --http.addr=0.0.0.0
      --http.port=9551
      --http.api=eth,net,web3,engine
      --http.vhosts=*
      --http.corsdomain=*
      --ws
      --ws.addr=0.0.0.0
      --ws.port=9552
      --ws.api=eth,net,web3
      --rollup.sequencerhttp=
    networks:
      - besachain-network

networks:
  besachain-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  op-node-data:
    driver: local
EOF

echo -e "${GREEN}✓ Fixed docker-compose.yml created${NC}"

echo ""
echo -e "${YELLOW}[5/5] Checking L1 BSC node http.vhosts configuration...${NC}"

# Create a script to fix L1 vhosts if needed
cat > /tmp/fix-l1-vhosts.sh << 'L1SCRIPT'
#!/bin/bash
# Fix L1 BSC node to accept requests from Docker network

L1_SERVICE="/etc/systemd/system/besachain-l1.service"

if [ ! -f "$L1_SERVICE" ]; then
    echo "L1 service file not found at $L1_SERVICE"
    # Try to find it
    L1_SERVICE=$(find /etc/systemd -name "*besachain*l1*" -type f 2>/dev/null | head -1)
    if [ -z "$L1_SERVICE" ]; then
        echo "Could not find L1 service file"
        exit 1
    fi
    echo "Found L1 service at: $L1_SERVICE"
fi

# Check if we need to update vhosts
if grep -q "http.vhosts" "$L1_SERVICE"; then
    # Update existing vhosts to include all hosts
    sed -i 's/--http.vhosts=[^[:space:]]*/--http.vhosts="*"/g' "$L1_SERVICE"
    echo "Updated http.vhosts to accept all hosts"
else
    echo "http.vhosts not found in service file - may need manual configuration"
fi

# Also check for --http.addr - it should be 0.0.0.0 or not set to localhost only
if grep -q "http.addr" "$L1_SERVICE"; then
    sed -i 's/--http.addr=localhost/--http.addr=0.0.0.0/g' "$L1_SERVICE"
    sed -i 's/--http.addr=127.0.0.1/--http.addr=0.0.0.0/g' "$L1_SERVICE"
    echo "Updated http.addr to bind to all interfaces"
fi

systemctl daemon-reload

echo "L1 service configuration updated."
echo "To apply changes, run: sudo systemctl restart besachain-l1"
L1SCRIPT

chmod +x /tmp/fix-l1-vhosts.sh
bash /tmp/fix-l1-vhosts.sh

echo ""
echo "=============================================="
echo -e "${GREEN}Fix Applied!${NC}"
echo "=============================================="
echo ""
echo "Summary:"
echo "  - Docker host IP: $DOCKER_HOST_IP"
echo "  - L1 endpoint configured: http://$DOCKER_HOST_IP:8545"
echo "  - L2 endpoint configured: http://$DEFAULT_IP:9551"
echo ""
echo "Next steps:"
echo "  1. If L1 BSC node was modified, restart it:"
echo "     sudo systemctl restart besachain-l1"
echo ""
echo "  2. Start op-node with Docker Compose:"
echo "     cd /data/besachain-op-node"
echo "     docker-compose up -d"
echo ""
echo "  3. Check logs:"
echo "     docker logs -f besachain-op-node"
echo ""
echo "  4. Verify L1 connection:"
echo "     curl -X POST http://localhost:9545 \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"jsonrpc\":\"2.0\",\"method\":\"optimism_syncStatus\",\"params\":[],\"id\":1}'"
echo ""
