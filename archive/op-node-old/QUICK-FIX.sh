#!/bin/bash
# One-line fix for op-node L1 connection issue
# Run this on validator 1 (54.235.85.175) as root or with sudo

echo "=== BesaChain OP Node L1 Connection Fix ==="
echo ""

# Step 1: Fix L1 BSC node to accept all hosts
if [ -f /etc/systemd/system/besachain-l1.service ]; then
    echo "[1/4] Updating L1 BSC node configuration..."
    sed -i 's/--http.vhosts=[^[:space:]]*/--http.vhosts="*"/g' /etc/systemd/system/besachain-l1.service
    sed -i 's/--http.addr=localhost/--http.addr=0.0.0.0/g' /etc/systemd/system/besachain-l1.service
    sed -i 's/--http.addr=127.0.0.1/--http.addr=0.0.0.0/g' /etc/systemd/system/besachain-l1.service
    systemctl daemon-reload
    systemctl restart besachain-l1
    sleep 5
    echo "✓ L1 BSC node updated and restarted"
fi

# Step 2: Create fixed docker-compose
echo "[2/4] Creating fixed docker-compose.yml..."
mkdir -p /data/besachain-op-node/{config,data}

cat > /data/besachain-op-node/docker-compose.yml << 'EOF'
version: '3.8'
services:
  op-node:
    image: us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
    container_name: besachain-op-node
    restart: unless-stopped
    environment:
      - OP_NODE_L1_ETH_RPC=http://172.17.0.1:8545
      - OP_NODE_L2_ENGINE_RPC=http://172.17.0.1:9551
      - OP_NODE_ROLLUP_CONFIG=/config/rollup.json
      - OP_NODE_JWT_SECRET=/config/jwt-secret.txt
    volumes:
      - /data/besachain-op-node/config:/config:ro
      - /data/besachain-op-node/data:/data
    ports:
      - "9545:9545"
      - "9645:9645"
      - "7300:7300"
    extra_hosts:
      - "host.docker.internal:172.17.0.1"
    command: >
      op-node
      --l1=http://172.17.0.1:8545
      --l2=http://172.17.0.1:9551
      --rollup.config=/config/rollup.json
      --rpc.addr=0.0.0.0
      --rpc.port=9545
      --rpc.admin=true
      --sequencer.enabled
      --p2p.disabled
      --metrics.enabled
      --authrpc.jwt-secret=/config/jwt-secret.txt
      --l1-trust-rpc
      --l1.rpckind=basic
    networks:
      - besachain-network

networks:
  besachain-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

echo "✓ docker-compose.yml created"

# Step 3: Stop and remove old container
echo "[3/4] Stopping old container..."
docker stop besachain-op-node 2>/dev/null || true
docker rm besachain-op-node 2>/dev/null || true
systemctl stop besachain-op-node 2>/dev/null || true
echo "✓ Old container stopped"

# Step 4: Start with fixed configuration
echo "[4/4] Starting op-node with fixed configuration..."
cd /data/besachain-op-node
docker-compose up -d
echo "✓ op-node started"

echo ""
echo "=== Fix Applied ==="
echo "Checking logs (Ctrl+C to exit):"
docker logs -f besachain-op-node
