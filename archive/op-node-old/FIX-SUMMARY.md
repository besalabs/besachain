# BesaChain OP Node L1 Connection Fix Summary

## Problem

The op-node is restarting with error:
```
failed to get L1 chain ID: 403 Forbidden: invalid host specified
```

## Root Cause

The op-node Docker container uses `http://host.docker.internal:8545` to connect to the L1 BSC node. This causes issues because:

1. `host.docker.internal` is not supported on Linux Docker by default
2. Even when enabled, the L1 BSC node rejects requests with `Host: host.docker.internal` header
3. The L1 BSC node needs to accept requests from Docker network IPs

## Solution

### Option 1: Use Host IP Address (Recommended)

Instead of `host.docker.internal`, use the Docker bridge IP (`172.17.0.1`) or the host's actual IP address.

### Option 2: Fix L1 BSC Node vhosts Configuration

Ensure the L1 BSC node has:
```
--http.vhosts="*"
--http.corsdomain="*"
--http.addr=0.0.0.0
```

## Files Created

1. `REMOTE-FIX-APPLY.sh` - Complete fix script to run on the server
2. `fix-l1-connection.sh` - Docker-based fix
3. `fix-l1-systemd.sh` - Systemd-based fix

## Quick Fix Commands

Once SSH access is restored, run:

```bash
# Upload and run the fix script
scp -i ~/.ssh/libyachain-validators.pem REMOTE-FIX-APPLY.sh ec2-user@54.235.85.175:/tmp/
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 'sudo bash /tmp/REMOTE-FIX-APPLY.sh'
```

Or manually on the server:

```bash
# 1. Fix L1 BSC node service
sudo sed -i 's/--http.vhosts=[^[:space:]]*/--http.vhosts="*"/g' /etc/systemd/system/besachain-l1.service
sudo sed -i 's/--http.addr=localhost/--http.addr=0.0.0.0/g' /etc/systemd/system/besachain-l1.service
sudo systemctl daemon-reload
sudo systemctl restart besachain-l1

# 2. Get Docker host IP
DOCKER_IP=$(ip addr show docker0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
echo "Docker host IP: $DOCKER_IP"  # Usually 172.17.0.1

# 3. Update op-node docker-compose
cd /data/besachain-op-node
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  op-node:
    image: us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
    container_name: besachain-op-node
    restart: unless-stopped
    environment:
      - OP_NODE_L1_ETH_RPC=http://172.17.0.1:8545
      - OP_NODE_L2_ENGINE_RPC=http://172.17.0.1:9551
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

# 4. Restart op-node
docker stop besachain-op-node 2>/dev/null || true
docker rm besachain-op-node 2>/dev/null || true
docker-compose up -d

# 5. Verify
docker logs -f besachain-op-node
```

## Configuration Changes

### L1 BSC Node (besachain-l1.service)

**Before:**
```
ExecStart=/usr/local/bin/geth \
    --http \
    --http.addr=localhost \
    --http.port=8545 \
    --http.vhosts='*' \
    --http.corsdomain='*'
```

**After:**
```
ExecStart=/usr/local/bin/geth \
    --http \
    --http.addr=0.0.0.0 \
    --http.port=8545 \
    --http.vhosts="*" \
    --http.corsdomain="*"
```

Key change: `--http.addr=0.0.0.0` (binds to all interfaces, not just localhost)

### OP Node (docker-compose.yml)

**Before:**
```yaml
environment:
  - OP_NODE_L1_ETH_RPC=http://host.docker.internal:8545
command: >
  op-node
  --l1=http://host.docker.internal:8545
```

**After:**
```yaml
environment:
  - OP_NODE_L1_ETH_RPC=http://172.17.0.1:8545
command: >
  op-node
  --l1=http://172.17.0.1:8545
```

Key change: `172.17.0.1` (Docker bridge IP) instead of `host.docker.internal`

## Alternative: Use Systemd Instead of Docker

If Docker networking continues to cause issues, run op-node as a systemd service directly:

```bash
# Create service
sudo tee /etc/systemd/system/besachain-op-node.service << 'EOF'
[Unit]
Description=BesaChain OP Node Sequencer
After=network.target besachain-l1.service besachain-l2.service
Requires=besachain-l2.service

[Service]
Type=simple
User=besachain
Group=besachain
ExecStart=/usr/local/bin/op-node \
    --l1=http://localhost:8545 \
    --l2=http://localhost:9551 \
    --rollup.config=/data/besachain-op-node/config/rollup.json \
    --authrpc.jwt-secret=/data/besachain-op-node/config/jwt-secret.txt \
    --sequencer.enabled \
    --p2p.disabled \
    --rpc.addr=0.0.0.0 \
    --rpc.port=9545
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start besachain-op-node
```

## Verification

After applying the fix:

```bash
# Check container is running
docker ps | grep op-node

# Check logs (should show successful L1 connection)
docker logs --tail 50 besachain-op-node

# Test L2 RPC
curl -X POST http://localhost:9545 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expected: {"jsonrpc":"2.0","id":1,"result":"0x5a5"} (Chain 1445)

# Check sync status
curl -X POST http://localhost:9545 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"optimism_syncStatus","params":[],"id":1}'
```

## Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Validator 1 (54.235.85.175)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Docker Network (172.20.0.0/16)                      │  │
│  │  ┌─────────────────────┐  ┌─────────────────────┐   │  │
│  │  │   op-node           │  │   besachain-l2      │   │  │
│  │  │   (172.20.0.2)      │──│   (op-geth)         │   │  │
│  │  │                     │  │   (172.20.0.3)      │   │  │
│  │  │   L1: 172.17.0.1    │  │                     │   │  │
│  │  │   L2: 172.17.0.1    │  │   RPC: 9551         │   │  │
│  │  └─────────────────────┘  └─────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            │ (Docker bridge)                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Host Network (172.17.0.1 = docker0)                 │  │
│  │  ┌─────────────────────┐  ┌─────────────────────┐   │  │
│  │  │   besachain-l1      │  │   Other services    │   │  │
│  │  │   (BSC geth)        │  │                     │   │  │
│  │  │   RPC: 0.0.0.0:8545 │  │                     │   │  │
│  │  └─────────────────────┘  └─────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Still getting 403 Forbidden?

1. Verify L1 is binding to 0.0.0.0:
   ```bash
   sudo netstat -tlnp | grep 8545
   # Should show: 0.0.0.0:8545, not 127.0.0.1:8545
   ```

2. Test from within Docker:
   ```bash
   docker run --rm alpine/curl -v http://172.17.0.1:8545 \
     -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
   ```

3. Check L1 logs for rejected requests:
   ```bash
   sudo journalctl -u besachain-l1 -f
   ```

### Connection refused?

1. Ensure L1 is running:
   ```bash
   sudo systemctl status besachain-l1
   ```

2. Check firewall rules:
   ```bash
   sudo iptables -L | grep 8545
   ```

### JWT authentication failed?

Ensure the JWT secret is identical in:
- `/data/besachain-op-node/config/jwt-secret.txt`
- L2 geth configuration (`--authrpc.jwt-secret`)
