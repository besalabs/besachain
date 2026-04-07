#!/bin/bash
# BesaChain AWS Deployment Script
# Deploys BesaChain infrastructure using existing LibyaChain instances

set -e

# Configuration
AWS_REGION="us-east-1"
INSTANCE_ID="i-0c0d1218308b3506d"
TF_DIR="/Users/senton/besachain/terraform"
KEYS_DIR="/Users/senton/besachain/keys"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== BesaChain AWS Deployment ===${NC}"
echo ""

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &>/dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS credentials valid (Account: $ACCOUNT_ID)${NC}"

# Check if instance exists
echo -e "${YELLOW}Checking LibyaChain instance...${NC}"
if ! aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$AWS_REGION" &>/dev/null; then
    echo -e "${RED}Error: Instance $INSTANCE_ID not found${NC}"
    exit 1
fi
INSTANCE_IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --region "$AWS_REGION" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo -e "${GREEN}✓ Instance found (IP: $INSTANCE_IP)${NC}"

# Create S3 bucket for Terraform state if not exists
echo -e "${YELLOW}Setting up Terraform state bucket...${NC}"
if ! aws s3api head-bucket --bucket "besachain-terraform-state" --region "$AWS_REGION" 2>/dev/null; then
    aws s3api create-bucket \
        --bucket "besachain-terraform-state" \
        --region "$AWS_REGION"
    aws s3api put-bucket-versioning \
        --bucket "besachain-terraform-state" \
        --versioning-configuration Status=Enabled
    echo -e "${GREEN}✓ Created Terraform state bucket${NC}"
else
    echo -e "${GREEN}✓ Terraform state bucket exists${NC}"
fi

# Create DynamoDB table for state locking if not exists
echo -e "${YELLOW}Setting up DynamoDB lock table...${NC}"
if ! aws dynamodb describe-table --table-name "besachain-terraform-locks" --region "$AWS_REGION" &>/dev/null; then
    aws dynamodb create-table \
        --table-name "besachain-terraform-locks" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$AWS_REGION"
    echo -e "${GREEN}✓ Created DynamoDB lock table${NC}"
else
    echo -e "${GREEN}✓ DynamoDB lock table exists${NC}"
fi

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
cd "$TF_DIR"
terraform init -backend-config="bucket=besachain-terraform-state" \
               -backend-config="key=production/terraform.tfstate" \
               -backend-config="region=$AWS_REGION" \
               -backend-config="dynamodb_table=besachain-terraform-locks" || {
    echo -e "${YELLOW}Initializing without backend first...${NC}"
    terraform init -reconfigure
}
echo -e "${GREEN}✓ Terraform initialized${NC}"

# Plan deployment
echo -e "${YELLOW}Planning Terraform deployment...${NC}"
terraform plan -var="aws_account_id=$ACCOUNT_ID" -out=tfplan
echo -e "${GREEN}✓ Terraform plan complete${NC}"

# Apply deployment
echo -e "${YELLOW}Applying Terraform deployment...${NC}"
read -p "Continue with deployment? (yes/no): " confirm
if [[ $confirm == "yes" ]]; then
    terraform apply tfplan
    echo -e "${GREEN}✓ Terraform deployment complete${NC}"
else
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Output deployment info
echo ""
echo -e "${BLUE}=== Deployment Outputs ===${NC}"
terraform output

# Setup BesaChain on the instance
echo ""
echo -e "${YELLOW}Setting up BesaChain on instance...${NC}"
./setup-parallel-validators.sh "$INSTANCE_IP"

echo ""
echo -e "${GREEN}=== BesaChain Deployment Complete ===${NC}"
echo ""
echo "BesaChain is now running parallel to LibyaChain on the same instance!"
echo ""
echo "RPC Endpoint: http://$INSTANCE_IP:8645"
echo "WS Endpoint:  ws://$INSTANCE_IP:8646"
echo "P2P Port:     30403"
echo ""
echo "Cost savings: ~$150-300/month by sharing the EC2 instance"
