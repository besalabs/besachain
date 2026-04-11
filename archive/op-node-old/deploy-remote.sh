#!/bin/bash
# Deploy BesaChain OP Node to remote validator server

set -e

INSTANCE_IP="${1:-54.235.85.175}"
AWS_KEY="${2:-$HOME/.ssh/libyachain-validators.pem}"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=30"

echo "=============================================="
echo "BesaChain OP Node Remote Deployment"
echo "=============================================="
echo "Instance: $INSTANCE_IP"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check SSH key
if [ ! -f "$AWS_KEY" ]; then
    echo -e "${RED}Error: SSH key not found at $AWS_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}[1/5] Preparing local files...${NC}"

# Create a temporary directory with all necessary files
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Copy configuration files
mkdir -p "$TEMP_DIR/op-node/config"
cp besachain/op-node/config/rollup.json "$TEMP_DIR/op-node/config/" 2>/dev/null || echo "rollup.json not found locally"
cp besachain/op-node/config/jwt-secret.txt "$TEMP_DIR/op-node/config/" 2>/dev/null || echo "jwt-secret.txt not found locally"
cp besachain/op-node/install-op-node.sh "$TEMP_DIR/op-node/"
cp besachain/op-node/besachain-op-node.service "$TEMP_DIR/op-node/"

# Create remote deployment script
cat > "$TEMP_DIR/remote-install.sh" << 'REMOTESCRIPT'
#!/bin/bash
set -e

INSTALL_DIR="/data/besachain-op-node"
BINARY_DIR="/usr/local/bin"
USER="besachain"

# Create user if not exists
if ! id "$USER" &>/dev/null; then
    useradd -r -s /bin/false $USER
fi

# Create directories
mkdir -p "$INSTALL_DIR"/{config,data,logs}

# Generate JWT secret if not exists
if [ ! -f "$INSTALL_DIR/config/jwt-secret.txt" ]; then
    openssl rand -hex 32 > "$INSTALL_DIR/config/jwt-secret.txt"
    chmod 600 "$INSTALL_DIR/config/jwt-secret.txt"
fi

# Pull op-node Docker image
echo "Pulling op-node Docker image..."
docker pull us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3

# Extract op-node binary
echo "Extracting op-node binary..."
docker create --name temp-op-node us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3
docker cp temp-op-node:/usr/local/bin/op-node "$BINARY_DIR/op-node"
docker rm temp-op-node
chmod +x "$BINARY_DIR/op-node"

# Copy uploaded config files
if [ -f /tmp/op-node-config/rollup.json ]; then
    cp /tmp/op-node-config/rollup.json "$INSTALL_DIR/config/rollup.json"
fi

if [ -f /tmp/op-node-config/jwt-secret.txt ]; then
    cp /tmp/op-node-config/jwt-secret.txt "$INSTALL_DIR/config/jwt-secret.txt"
fi

# Set ownership
chown -R $USER:$USER "$INSTALL_DIR"
chmod 600 "$INSTALL_DIR/config/jwt-secret.txt"

# Install systemd service
cp /tmp/op-node-config/besachain-op-node.service /etc/systemd/system/
systemctl daemon-reload

echo "OP Node installation complete!"
REMOTESCRIPT

echo -e "${GREEN}[2/5] Uploading files to server...${NC}"

# Create remote directory and upload files
ssh -i "$AWS_KEY" $SSH_OPTS ec2-user@"$INSTANCE_IP" "mkdir -p /tmp/op-node-config"
scp -i "$AWS_KEY" $SSH_OPTS -r "$TEMP_DIR/op-node/config/"* ec2-user@"$INSTANCE_IP":/tmp/op-node-config/ 2>/dev/null || true
scp -i "$AWS_KEY" $SSH_OPTS "$TEMP_DIR/op-node/besachain-op-node.service" ec2-user@"$INSTANCE_IP":/tmp/op-node-config/
scp -i "$AWS_KEY" $SSH_OPTS "$TEMP_DIR/remote-install.sh" ec2-user@"$INSTANCE_IP":/tmp/

echo -e "${GREEN}[3/5] Running remote installation...${NC}"
ssh -i "$AWS_KEY" $SSH_OPTS ec2-user@"$INSTANCE_IP" "sudo bash /tmp/remote-install.sh"

echo -e "${GREEN}[4/5] Verifying installation...${NC}"
ssh -i "$AWS_KEY" $SSH_OPTS ec2-user@"$INSTANCE_IP" "sudo systemctl is-enabled besachain-op-node 2>/dev/null || echo 'Service installed but not enabled'"

echo -e "${GREEN}[5/5] Checking prerequisites...${NC}"
echo ""
echo "Checking L1 endpoint..."
ssh -i "$AWS_KEY" $SSH_OPTS ec2-user@"$INSTANCE_IP" "curl -s -X POST http://localhost:8545 -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_chainId\",\"params\":[],\"id\":1}' 2>/dev/null || echo 'L1 not responding'"

echo ""
echo "Checking L2 endpoint..."
ssh -i "$AWS_KEY" $SSH_OPTS ec2-user@"$INSTANCE_IP" "curl -s -X POST http://localhost:9551 -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_chainId\",\"params\":[],\"id\":1}' 2>/dev/null || echo 'L2 not responding'"

echo ""
echo "=============================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=============================================="
echo ""
echo "To start the op-node:"
echo "  ssh -i $AWS_KEY ec2-user@$INSTANCE_IP"
echo "  sudo systemctl start besachain-op-node"
echo ""
echo "To check status:"
echo "  sudo systemctl status besachain-op-node"
echo "  sudo journalctl -u besachain-op-node -f"
echo ""
echo "RPC Endpoints:"
echo "  L2 HTTP: http://$INSTANCE_IP:9545"
echo "  Admin:   http://$INSTANCE_IP:9645"
echo ""
