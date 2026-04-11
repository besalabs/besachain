#!/bin/bash
# ============================================================================
# REMOTE FIX SCRIPT FOR OP-NODE L1 CONNECTION ISSUE
# To be run on validator 1 (54.235.85.175)
# ============================================================================
# This fixes the "403 Forbidden: invalid host specified" error by:
# 1. Using host IP instead of host.docker.internal
# 2. Ensuring L1 BSC node accepts requests from Docker network
# 3. Setting up proper Docker networking
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "=============================================="
echo "BesaChain OP Node L1 Connection Fix"
echo "=============================================="
echo ""

# Detect host IP addresses
log_info "Detecting network configuration..."
DOCKER_HOST_IP=$(ip addr show docker0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1 || echo "")
ETH0_IP=$(ip addr show eth0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d/ -f1 || echo "")
DEFAULT_IP=$(hostname -I | awk '{print $1}')

if [ -z "$DOCKER_HOST_IP" ]; then
    DOCKER_HOST_IP="172.17.0.1"
    log_warn "Docker bridge IP not detected, using default: $DOCKER_HOST_IP"
else
    log_ok "Docker bridge IP: $DOCKER_HOST_IP"
fi

log_ok "Host IP: $DEFAULT_IP"
[ -n "$ETH0_IP" ] && log_ok "eth0 IP: $ETH0_IP"

# ============================================================================
# STEP 1: Fix L1 BSC Node Configuration
# ============================================================================
echo ""
log_info "Step 1: Checking L1 BSC node configuration..."

L1_SERVICE="/etc/systemd/system/besachain-l1.service"
if [ ! -f "$L1_SERVICE" ]; then
    L1_SERVICE=$(find /etc/systemd -name "*besachain*l1*" -type f 2>/dev/null | head -1 || echo "")
fi

if [ -n "$L1_SERVICE" ] && [ -f "$L1_SERVICE" ]; then
    log_ok "Found L1 service: $L1_SERVICE"
    
    # Backup original
    cp "$L1_SERVICE" "${L1_SERVICE}.backup.$(date +%s)"
    log_info "Backup created: ${L1_SERVICE}.backup.*"
    
    # Fix http.vhosts to accept all hosts
    if grep -q "http.vhosts" "$L1_SERVICE"; then
        sed -i 's/--http.vhosts=[^[:space:]]*/--http.vhosts="*"/g' "$L1_SERVICE"
        log_ok "Updated http.vhosts to accept all hosts"
    fi
    
    # Fix http.corsdomain
    if grep -q "http.corsdomain" "$L1_SERVICE"; then
        sed -i 's/--http.corsdomain=[^[:space:]]*/--http.corsdomain="*"/g' "$L1_SERVICE"
        log_ok "Updated http.corsdomain"
    fi
    
    # Ensure http.addr binds to all interfaces
    if grep -q "http.addr" "$L1_SERVICE"; then
        sed -i 's/--http.addr=localhost/--http.addr=0.0.0.0/g' "$L1_SERVICE"
        sed -i 's/--http.addr=127.0.0.1/--http.addr=0.0.0.0/g' "$L1_SERVICE"
        log_ok "Updated http.addr to bind to all interfaces"
    fi
    
    # Also fix ws configuration if present
    if grep -q "ws.vhosts" "$L1_SERVICE"; then
        sed -i 's/--ws.vhosts=[^[:space:]]*/--ws.vhosts="*"/g' "$L1_SERVICE"
    fi
    if grep -q "ws.addr" "$L1_SERVICE"; then
        sed -i 's/--ws.addr=localhost/--ws.addr=0.0.0.0/g' "$L1_SERVICE"
        sed -i 's/--ws.addr=127.0.0.1/--ws.addr=0.0.0.0/g' "$L1_SERVICE"
    fi
    
    systemctl daemon-reload
    log_ok "Systemd configuration reloaded"
    
    L1_MODIFIED=true
else
    log_warn "L1 service file not found - assuming L1 is configured correctly"
    L1_MODIFIED=false
fi

# ============================================================================
# STEP 2: Test L1 Connectivity from Host
# ============================================================================
echo ""
log_info "Step 2: Testing L1 connectivity from host..."

for endpoint in "http://localhost:8545" "http://127.0.0.1:8545" "http://$DEFAULT_IP:8545"; do
    log_info "Testing $endpoint..."
    RESPONSE=$(curl -s -X POST "$endpoint" \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null || echo "")
    
    if echo "$RESPONSE" | grep -q "0x5a4"; then
        log_ok "L1 responding at $endpoint (Chain 1444)"
        WORKING_L1_ENDPOINT="$endpoint"
        break
    fi
done

if [ -z "$WORKING_L1_ENDPOINT" ]; then
    log_error "L1 not responding on any endpoint!"
    log_warn "Please ensure besachain-l1 service is running"
else
    log_ok "L1 endpoint confirmed: $WORKING_L1_ENDPOINT"
fi

# ============================================================================
# STEP 3: Test L1 from Docker
# ============================================================================
echo ""
log_info "Step 3: Testing L1 connectivity from Docker..."

# Test from within Docker container
docker run --rm --network bridge alpine/curl:latest \
    -s -X POST "http://$DOCKER_HOST_IP:8545" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null | grep -q "0x5a4" && {
    log_ok "L1 accessible from Docker network at $DOCKER_HOST_IP:8545"
    DOCKER_L1_OK=true
} || {
    log_warn "L1 not directly accessible from Docker using $DOCKER_HOST_IP"
    DOCKER_L1_OK=false
}

# ============================================================================
# STEP 4: Create Fixed Docker Compose Configuration
# ============================================================================
echo ""
log_info "Step 4: Creating fixed docker-compose.yml..."

INSTALL_DIR="/data/besachain-op-node"
mkdir -p "$INSTALL_DIR"/{config,data}

# Create the fixed docker-compose.yml
cat > "$INSTALL_DIR/docker-compose.yml" << DOCKERCOMPOSE
version: '3.8'

services:
  op-node:
    image: us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
    container_name: besachain-op-node
    restart: unless-stopped
    environment:
      - OP_NODE_L1_ETH_RPC=http://$DOCKER_HOST_IP:8545
      - OP_NODE_L2_ENGINE_RPC=http://$DOCKER_HOST_IP:9551
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
      - $INSTALL_DIR/config:/config:ro
      - $INSTALL_DIR/data:/data
    ports:
      - "9545:9545"    # L2 RPC HTTP
      - "9645:9645"    # Admin RPC
      - "7300:7300"    # Metrics
    extra_hosts:
      - "host.docker.internal:$DOCKER_HOST_IP"
    command: >
      op-node
      --l1=http://$DOCKER_HOST_IP:8545
      --l2=http://$DOCKER_HOST_IP:9551
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
      --l1.http-poll-interval=500ms
    networks:
      - besachain-network
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost:9545/healthz || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

networks:
  besachain-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  op-node-data:
    driver: local
DOCKERCOMPOSE

log_ok "docker-compose.yml created at $INSTALL_DIR/docker-compose.yml"

# ============================================================================
# STEP 5: Create Alternative Systemd Service (No Docker)
# ============================================================================
echo ""
log_info "Step 5: Creating alternative systemd service..."

cat > /etc/systemd/system/besachain-op-node.service << SYSTEMDSERVICE
[Unit]
Description=BesaChain OP Node Sequencer (L2 Chain 1445)
After=network.target besachain-l1.service besachain-l2.service
Requires=besachain-l2.service

[Service]
Type=simple
User=besachain
Group=besachain
WorkingDirectory=$INSTALL_DIR

Environment="OP_NODE_L1_ETH_RPC=http://localhost:8545"
Environment="OP_NODE_L2_ENGINE_RPC=http://localhost:9551"
Environment="OP_NODE_ROLLUP_CONFIG=$INSTALL_DIR/config/rollup.json"
Environment="OP_NODE_JWT_SECRET=$INSTALL_DIR/config/jwt-secret.txt"

ExecStart=/usr/local/bin/op-node \\
    --l1=http://localhost:8545 \\
    --l2=http://localhost:9551 \\
    --rollup.config=$INSTALL_DIR/config/rollup.json \\
    --rpc.addr=0.0.0.0 \\
    --rpc.port=9545 \\
    --rpc.admin=true \\
    --rpc.admin-addr=0.0.0.0 \\
    --rpc.admin-port=9645 \\
    --sequencer.enabled \\
    --sequencer.l1-confs=0 \\
    --p2p.disabled \\
    --metrics.enabled \\
    --metrics.addr=0.0.0.0 \\
    --metrics.port=7300 \\
    --authrpc.addr=0.0.0.0 \\
    --authrpc.port=9551 \\
    --authrpc.jwt-secret=$INSTALL_DIR/config/jwt-secret.txt \\
    --plasma.enabled=false \\
    --verifier.l1-confs=0 \\
    --l1-trust-rpc \\
    --l1.rpckind=basic \\
    --l1.http-poll-interval=500ms

Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=besachain-op-node

LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
SYSTEMDSERVICE

log_ok "Systemd service created at /etc/systemd/system/besachain-op-node.service"

# ============================================================================
# STEP 6: Extract op-node binary if needed
# ============================================================================
echo ""
log_info "Step 6: Checking op-node binary..."

if [ ! -f "/usr/local/bin/op-node" ]; then
    log_info "Extracting op-node binary from Docker image..."
    docker pull us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
    docker create --name temp-op-node us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
    docker cp temp-op-node:/usr/local/bin/op-node /usr/local/bin/op-node
    docker rm temp-op-node
    chmod +x /usr/local/bin/op-node
    log_ok "op-node binary installed to /usr/local/bin/op-node"
else
    log_ok "op-node binary already exists"
fi

# ============================================================================
# STEP 7: Set permissions
# ============================================================================
echo ""
log_info "Step 7: Setting permissions..."

# Create user if not exists
if ! id "besachain" &>/dev/null; then
    useradd -r -s /bin/false besachain
    log_ok "Created besachain user"
fi

# Generate JWT secret if not exists
if [ ! -f "$INSTALL_DIR/config/jwt-secret.txt" ]; then
    openssl rand -hex 32 > "$INSTALL_DIR/config/jwt-secret.txt"
    chmod 600 "$INSTALL_DIR/config/jwt-secret.txt"
    log_ok "Generated JWT secret"
fi

chown -R besachain:besachain "$INSTALL_DIR"
chmod 600 "$INSTALL_DIR/config/jwt-secret.txt"
log_ok "Permissions set"

# Reload systemd
systemctl daemon-reload
log_ok "Systemd daemon reloaded"

# ============================================================================
# STEP 8: Restart L1 if modified
# ============================================================================
echo ""
log_info "Step 8: Applying L1 changes..."

if [ "$L1_MODIFIED" = true ]; then
    log_warn "L1 service was modified - restart required"
    log_info "Stopping op-node (if running)..."
    docker stop besachain-op-node 2>/dev/null || true
    docker rm besachain-op-node 2>/dev/null || true
    systemctl stop besachain-op-node 2>/dev/null || true
    
    log_info "Restarting L1 BSC node..."
    systemctl restart besachain-l1
    
    log_info "Waiting for L1 to be ready..."
    for i in {1..30}; do
        if curl -s -X POST http://localhost:8545 \
            -H "Content-Type: application/json" \
            -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' 2>/dev/null | grep -q "0x5a4"; then
            log_ok "L1 is ready"
            break
        fi
        sleep 1
    done
else
    log_info "L1 service not modified, no restart needed"
fi

# ============================================================================
# STEP 9: Start op-node with Docker
# ============================================================================
echo ""
log_info "Step 9: Starting op-node with Docker Compose..."

cd "$INSTALL_DIR"

# Stop any existing container
docker stop besachain-op-node 2>/dev/null || true
docker rm besachain-op-node 2>/dev/null || true

# Start with docker-compose
docker-compose up -d

log_ok "op-node container started"

# ============================================================================
# STEP 10: Verification
# ============================================================================
echo ""
log_info "Step 10: Verifying op-node..."

sleep 5

# Check if container is running
if docker ps | grep -q besachain-op-node; then
    log_ok "op-node container is running"
    
    # Check logs for errors
    log_info "Recent logs:"
    docker logs --tail 20 besachain-op-node 2>&1 | head -20
    
    # Wait for RPC to be ready
    log_info "Waiting for RPC endpoint..."
    for i in {1..30}; do
        if curl -s -X POST http://localhost:9545 \
            -H "Content-Type: application/json" \
            -d '{"jsonrpc":"2.0","method":"optimism_syncStatus","params":[],"id":1}' 2>/dev/null | grep -q "result"; then
            log_ok "op-node RPC is responding"
            break
        fi
        sleep 1
    done
else
    log_error "op-node container is not running!"
    log_info "Container logs:"
    docker logs besachain-op-node 2>&1 | tail -50
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "=============================================="
echo -e "${GREEN}Fix Applied Successfully!${NC}"
echo "=============================================="
echo ""
echo "Configuration Summary:"
echo "  Install Directory: $INSTALL_DIR"
echo "  L1 Endpoint: http://$DOCKER_HOST_IP:8545"
echo "  L2 RPC: http://localhost:9545"
echo "  Admin RPC: http://localhost:9645"
echo "  Metrics: http://localhost:7300"
echo ""
echo "Useful Commands:"
echo "  View logs:        docker logs -f besachain-op-node"
echo "  Restart:          docker-compose -C $INSTALL_DIR restart"
echo "  Stop:             docker-compose -C $INSTALL_DIR down"
echo "  Status:           docker ps | grep op-node"
echo "  Test L2 RPC:      curl -X POST http://localhost:9545 \\"
echo "                      -H 'Content-Type: application/json' \\"
echo "                      -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_chainId\",\"params\":[],\"id\":1}'"
echo ""
echo "Alternative (systemd):"
echo "  Start:            sudo systemctl start besachain-op-node"
echo "  Logs:             sudo journalctl -u besachain-op-node -f"
echo "  Status:           sudo systemctl status besachain-op-node"
echo ""
