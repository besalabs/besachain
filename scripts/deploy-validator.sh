#!/bin/bash
# BesaChain Validator Deployment Script
# Deploys a validator to the specified network

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default values
ENVIRONMENT="testnet"
VALIDATOR_ID=""
AWS_REGION="us-east-1"

# Usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment    Environment (mainnet|testnet|devnet) [default: testnet]"
    echo "  -i, --validator-id   Validator ID (e.g., validator-001)"
    echo "  -r, --region         AWS Region [default: us-east-1]"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -e testnet -i validator-001"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -i|--validator-id)
            VALIDATOR_ID="$2"
            shift 2
            ;;
        -r|--region)
            AWS_REGION="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate arguments
if [ -z "$VALIDATOR_ID" ]; then
    echo -e "${RED}Error: Validator ID is required${NC}"
    usage
    exit 1
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(mainnet|testnet|devnet)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Must be mainnet, testnet, or devnet${NC}"
    exit 1
fi

# Set paths
VALIDATOR_DIR="validators/$ENVIRONMENT/$VALIDATOR_ID"
KEYS_DIR="keys/validator-keys"
S3_BUCKET="besachain-$ENVIRONMENT-secrets"

echo -e "${GREEN}=== BesaChain Validator Deployment ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Validator ID: $VALIDATOR_ID"
echo "AWS Region: $AWS_REGION"
echo ""

# Check if validator files exist
if [ ! -d "$VALIDATOR_DIR" ]; then
    echo -e "${RED}Error: Validator directory not found: $VALIDATOR_DIR${NC}"
    exit 1
fi

# Check required files
required_files=("keystore.json" "password.txt" "nodekey" "config.toml")
for file in "${required_files[@]}"; do
    if [ ! -f "$VALIDATOR_DIR/$file" ]; then
        echo -e "${RED}Error: Missing required file: $file${NC}"
        exit 1
    fi
done

echo -e "${YELLOW}Step 1: Validating validator configuration...${NC}"

# Validate keystore JSON
if ! jq empty "$VALIDATOR_DIR/keystore.json" 2>/dev/null; then
    echo -e "${RED}Error: Invalid keystore JSON${NC}"
    exit 1
fi

# Extract address from keystore
ADDRESS=$(jq -r '.address' "$VALIDATOR_DIR/keystore.json")
echo "  Validator Address: 0x$ADDRESS"

echo -e "${GREEN}✓ Configuration valid${NC}"

echo ""
echo -e "${YELLOW}Step 2: Uploading to secure storage...${NC}"

# Upload to S3 with encryption
aws s3 sync "$VALIDATOR_DIR/" "s3://$S3_BUCKET/validators/$VALIDATOR_ID/" \
    --region "$AWS_REGION" \
    --sse aws:kms \
    --sse-kms-key-id "alias/besachain-$ENVIRONMENT-key" \
    --delete

echo -e "${GREEN}✓ Files uploaded to S3${NC}"

echo ""
echo -e "${YELLOW}Step 3: Deploying validator node...${NC}"

# Get EC2 instance ID for this validator
INSTANCE_ID=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --filters "Name=tag:ValidatorId,Values=$VALIDATOR_ID" "Name=tag:Environment,Values=$ENVIRONMENT" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text)

if [ "$INSTANCE_ID" == "None" ] || [ -z "$INSTANCE_ID" ]; then
    echo -e "${YELLOW}Warning: No existing EC2 instance found for this validator${NC}"
    echo "Creating new instance..."
    
    # Launch new EC2 instance
    INSTANCE_ID=$(aws ec2 run-instances \
        --region "$AWS_REGION" \
        --launch-template LaunchTemplateName=besachain-validator-$ENVIRONMENT \
        --tag-specifications "ResourceType=instance,Tags=[{Key=ValidatorId,Value=$VALIDATOR_ID},{Key=Environment,Value=$ENVIRONMENT}]" \
        --query 'Instances[0].InstanceId' \
        --output text)
    
    echo "  New Instance ID: $INSTANCE_ID"
    
    # Wait for instance to be running
    echo "  Waiting for instance to be ready..."
    aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$INSTANCE_ID"
else
    echo "  Existing Instance ID: $INSTANCE_ID"
fi

echo -e "${GREEN}✓ Validator node ready${NC}"

echo ""
echo -e "${YELLOW}Step 4: Configuring validator software...${NC}"

# Get instance IP
INSTANCE_IP=$(aws ec2 describe-instances \
    --region "$AWS_REGION" \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

# Create remote setup script
cat > /tmp/setup-validator.sh << 'REMOTESCRIPT'
#!/bin/bash
set -e

VALIDATOR_ID="$1"
ENVIRONMENT="$2"
S3_BUCKET="$3"

# Create besachain directory
mkdir -p /opt/besachain/validator

# Download validator files from S3
aws s3 sync "s3://$S3_BUCKET/validators/$VALIDATOR_ID/" /opt/besachain/validator/ \
    --sse aws:kms

# Set permissions
chmod 600 /opt/besachain/validator/*

# Pull latest besachain binary
docker pull besachain/node:latest

# Create docker-compose for validator
cat > /opt/besachain/docker-compose.yml << EOF
version: '3.8'
services:
  validator:
    image: besachain/node:latest
    container_name: besachain-validator
    restart: unless-stopped
    ports:
      - "30303:30303"
      - "30303:30303/udp"
      - "8545:8545"
      - "8546:8546"
    volumes:
      - /opt/besachain/validator:/data
      - /opt/besachain/genesis:/genesis
    command: >
      --datadir /data
      --networkid $(if [ "$ENVIRONMENT" == "mainnet" ]; then echo "9700"; elif [ "$ENVIRONMENT" == "testnet" ]; then echo "9701"; else echo "9702"; fi)
      --syncmode full
      --gcmode archive
      --mine
      --miner.etherbase 0x$(cat /data/keystore.json | jq -r '.address')
      --unlock 0x$(cat /data/keystore.json | jq -r '.address')
      --password /data/password.txt
      --http
      --http.addr 0.0.0.0
      --http.port 8545
      --http.api eth,net,web3,engine,admin
      --http.corsdomain "*"
      --ws
      --ws.addr 0.0.0.0
      --ws.port 8546
      --ws.api eth,net,web3
      --metrics
      --metrics.addr 0.0.0.0
      --metrics.port 6060
      --bootnodes $(aws s3 cp s3://$S3_BUCKET/bootnodes.txt - 2>/dev/null || echo "")
EOF

# Start validator
cd /opt/besachain && docker-compose up -d

echo "Validator $VALIDATOR_ID started successfully"
REMOTESCRIPT

# Copy and execute setup script on remote instance
scp -o StrictHostKeyChecking=no -i ~/.ssh/besachain-validator.pem \
    /tmp/setup-validator.sh "ec2-user@$INSTANCE_IP:/tmp/"

ssh -o StrictHostKeyChecking=no -i ~/.ssh/besachain-validator.pem \
    "ec2-user@$INSTANCE_IP" \
    "chmod +x /tmp/setup-validator.sh && sudo /tmp/setup-validator.sh $VALIDATOR_ID $ENVIRONMENT $S3_BUCKET"

echo -e "${GREEN}✓ Validator software configured${NC}"

echo ""
echo -e "${YELLOW}Step 5: Verifying deployment...${NC}"

# Wait for node to start
sleep 10

# Check if node is responding
if ssh -o StrictHostKeyChecking=no -i ~/.ssh/besachain-validator.pem \
    "ec2-user@$INSTANCE_IP" \
    "curl -s -X POST -H 'Content-Type: application/json' \
     --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}' \
     http://localhost:8545 | grep -q 'result'"; then
    echo -e "${GREEN}✓ Validator is running and responding${NC}"
else
    echo -e "${RED}✗ Validator is not responding${NC}"
    echo "Check logs with: ssh -i ~/.ssh/besachain-validator.pem ec2-user@$INSTANCE_IP 'docker logs besachain-validator'"
    exit 1
fi

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Validator Details:"
echo "  ID: $VALIDATOR_ID"
echo "  Address: 0x$ADDRESS"
echo "  Instance: $INSTANCE_ID"
echo "  IP: $INSTANCE_IP"
echo "  Environment: $ENVIRONMENT"
echo ""
echo "Useful commands:"
echo "  View logs: ssh -i ~/.ssh/besachain-validator.pem ec2-user@$INSTANCE_IP 'docker logs -f besachain-validator'"
echo "  Restart:   ssh -i ~/.ssh/besachain-validator.pem ec2-user@$INSTANCE_IP 'cd /opt/besachain && docker-compose restart'"
echo "  Status:    ssh -i ~/.ssh/besachain-validator.pem ec2-user@$INSTANCE_IP 'docker ps'"
