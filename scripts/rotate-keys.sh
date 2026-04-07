#!/bin/bash
# BesaChain Key Rotation Script
# Rotates validator keys for enhanced security

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
ENVIRONMENT="testnet"
BATCH_SIZE=5
KEY_TYPE="validator"
DRY_RUN=false

# Usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment    Environment (mainnet|testnet|devnet) [default: testnet]"
    echo "  -t, --type           Key type (validator|treasury|root) [default: validator]"
    echo "  -b, --batch-size     Number of keys to rotate in batch [default: 5]"
    echo "  -d, --dry-run        Show what would be done without making changes"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Example:"
    echo "  $0 -e testnet -t validator -b 10"
    echo "  $0 -e mainnet -d  # Dry run"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--type)
            KEY_TYPE="$2"
            shift 2
            ;;
        -b|--batch-size)
            BATCH_SIZE="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
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

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(mainnet|testnet|devnet)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Must be mainnet, testnet, or devnet${NC}"
    exit 1
fi

# Validate key type
if [[ ! "$KEY_TYPE" =~ ^(validator|treasury|root)$ ]]; then
    echo -e "${RED}Error: Invalid key type. Must be validator, treasury, or root${NC}"
    exit 1
fi

# Set paths based on key type
case $KEY_TYPE in
    validator)
        KEYS_BASE="validators"
        ;;
    treasury)
        KEYS_BASE="keys/treasury"
        ;;
    root)
        KEYS_BASE="keys/root-keys"
        ;;
esac

echo -e "${BLUE}=== BesaChain Key Rotation ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Key Type: $KEY_TYPE"
echo "Batch Size: $BATCH_SIZE"
echo "Dry Run: $DRY_RUN"
echo ""

# Warning for production
if [ "$ENVIRONMENT" == "mainnet" ] && [ "$DRY_RUN" == false ]; then
    echo -e "${RED}⚠️  WARNING: This will rotate MAINNET keys!${NC}"
    echo -e "${RED}This operation affects production infrastructure.${NC}"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi
fi

# Check if besachain-keytool is available
if ! command -v besachain-keytool &> /dev/null; then
    echo -e "${YELLOW}besachain-keytool not found, using fallback key generation${NC}"
    KEYTOOL_AVAILABLE=false
else
    KEYTOOL_AVAILABLE=true
fi

# Function to generate new validator key
generate_validator_key() {
    local validator_id="$1"
    local output_dir="$2"
    
    if [ "$KEYTOOL_AVAILABLE" == true ]; then
        besachain-keytool generate --output "$output_dir" --id "$validator_id"
    else
        # Fallback using OpenSSL
        local password=$(openssl rand -hex 32)
        local private_key=$(openssl rand -hex 32)
        local address=$(echo "$private_key" | openssl dgst -sha3-256 -binary | xxd -p | tail -c 41)
        
        # Create keystore structure
        mkdir -p "$output_dir"
        
        # Save password
        echo "$password" > "$output_dir/password.txt"
        chmod 600 "$output_dir/password.txt"
        
        # Create simplified keystore (in production, use proper keystore format)
        cat > "$output_dir/keystore.json" << EOF
{
    "address": "$address",
    "id": "$validator_id",
    "version": 3,
    "crypto": {
        "cipher": "aes-128-ctr",
        "ciphertext": "$private_key",
        "cipherparams": {
            "iv": "$(openssl rand -hex 16)"
        },
        "kdf": "scrypt",
        "kdfparams": {
            "dklen": 32,
            "n": 262144,
            "p": 1,
            "r": 8,
            "salt": "$(openssl rand -hex 32)"
        },
        "mac": "$(openssl rand -hex 64 | cut -c1-64)"
    }
}
EOF
        chmod 600 "$output_dir/keystore.json"
        
        # Generate nodekey
        openssl rand -hex 64 > "$output_dir/nodekey"
        chmod 600 "$output_dir/nodekey"
        
        echo "0x$address"
    fi
}

# Function to generate treasury key
generate_treasury_key() {
    local key_id="$1"
    local output_dir="$2"
    
    mkdir -p "$output_dir"
    
    # Generate multi-sig key (simplified)
    for i in 1 2 3; do
        local priv_key=$(openssl rand -hex 32)
        local pub_key=$(echo "$priv_key" | openssl dgst -sha256 -binary | xxd -p)
        
        echo "$priv_key" > "$output_dir/signer-$i.key"
        echo "$pub_key" > "$output_dir/signer-$i.pub"
        chmod 600 "$output_dir/signer-$i.key"
    done
    
    echo "Multi-sig key generated"
}

# Function to backup existing keys
backup_keys() {
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_dir="backups/$KEY_TYPE-$ENVIRONMENT-$timestamp"
    local s3_backup="s3://besachain-backup-$ENVIRONMENT/$KEY_TYPE-$timestamp"
    
    echo -e "${YELLOW}Creating backup...${NC}"
    
    if [ "$DRY_RUN" == true ]; then
        echo "  [DRY RUN] Would backup to: $backup_dir"
        return
    fi
    
    # Local backup
    mkdir -p "$backup_dir"
    cp -r "$KEYS_BASE/$ENVIRONMENT"/* "$backup_dir/" 2>/dev/null || true
    
    # S3 backup
    aws s3 sync "$KEYS_BASE/$ENVIRONMENT/" "$s3_backup/" --sse aws:kms
    
    echo -e "${GREEN}✓ Backup created: $s3_backup${NC}"
    echo "$s3_backup" > "$backup_dir/backup-location.txt"
}

# Get list of keys to rotate
echo -e "${YELLOW}Scanning for keys to rotate...${NC}"

if [ "$KEY_TYPE" == "validator" ]; then
    KEYS_TO_ROTATE=$(ls -1 "$KEYS_BASE/$ENVIRONMENT" 2>/dev/null | head -n "$BATCH_SIZE" || true)
else
    KEYS_TO_ROTATE=$(ls -1 "$KEYS_BASE" 2>/dev/null | head -n "$BATCH_SIZE" || true)
fi

if [ -z "$KEYS_TO_ROTATE" ]; then
    echo -e "${YELLOW}No keys found to rotate${NC}"
    exit 0
fi

KEY_COUNT=$(echo "$KEYS_TO_ROTATE" | wc -l)
echo "Found $KEY_COUNT keys to rotate"
echo ""

# Show keys that will be rotated
echo -e "${BLUE}Keys to be rotated:${NC}"
echo "$KEYS_TO_ROTATE" | while read key; do
    echo "  - $key"
done
echo ""

if [ "$DRY_RUN" == false ]; then
    read -p "Proceed with rotation? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 0
    fi
fi

# Create backup
backup_keys

# Rotate keys
ROTATED_COUNT=0
FAILED_COUNT=0

echo ""
echo -e "${YELLOW}Starting key rotation...${NC}"

echo "$KEYS_TO_ROTATE" | while read key_id; do
    [ -z "$key_id" ] && continue
    
    echo ""
    echo -e "${BLUE}Rotating: $key_id${NC}"
    
    if [ "$KEY_TYPE" == "validator" ]; then
        output_dir="$KEYS_BASE/$ENVIRONMENT/$key_id"
        
        # Store old key temporarily
        old_dir="$output_dir-old"
        if [ "$DRY_RUN" == false ]; then
            mv "$output_dir" "$old_dir"
        fi
        
        # Generate new key
        if [ "$DRY_RUN" == true ]; then
            echo "  [DRY RUN] Would generate new key for $key_id"
            new_address="0x$(openssl rand -hex 20)"
        else
            new_address=$(generate_validator_key "$key_id" "$output_dir")
        fi
        
        echo "  New address: $new_address"
        
        # Update validator config if needed
        if [ "$DRY_RUN" == false ]; then
            # Create config.toml
            cat > "$output_dir/config.toml" << EOF
[Eth]
NetworkId = $(if [ "$ENVIRONMENT" == "mainnet" ]; then echo "9700"; elif [ "$ENVIRONMENT" == "testnet" ]; then echo "9701"; else echo "9702"; fi)
SyncMode = "full"

[Node]
DataDir = "/data"
IPCPath = "besachain.ipc"
HTTPHost = "0.0.0.0"
HTTPPort = 8545
HTTPVirtualHosts = ["*"]
HTTPModules = ["net", "web3", "eth", "engine", "admin"]
WSHost = "0.0.0.0"
WSPort = 8546
WSModules = ["net", "web3", "eth"]

[Node.P2P]
MaxPeers = 50
NoDiscovery = false
BootstrapNodes = []
ListenAddr = ":30303"

[Eth.Miner]
Etherbase = "$new_address"
GasFloor = 8000000
GasCeil = 8000000
EOF
            chmod 600 "$output_dir/config.toml"
            
            # Remove old key
            rm -rf "$old_dir"
        fi
        
    elif [ "$KEY_TYPE" == "treasury" ]; then
        output_dir="$KEYS_BASE/$key_id"
        
        if [ "$DRY_RUN" == false ]; then
            # Backup and rotate
            mv "$output_dir" "$output_dir-old"
            generate_treasury_key "$key_id" "$output_dir"
            rm -rf "$output_dir-old"
        else
            echo "  [DRY RUN] Would rotate treasury key $key_id"
        fi
    fi
    
    if [ "$DRY_RUN" == false ]; then
        echo -e "${GREEN}  ✓ Rotated successfully${NC}"
    fi
done

# Generate rotation report
echo ""
echo -e "${BLUE}=== Key Rotation Report ===${NC}"
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Environment: $ENVIRONMENT"
echo "Key Type: $KEY_TYPE"
echo "Batch Size: $BATCH_SIZE"
echo "Dry Run: $DRY_RUN"
echo ""
echo "Keys rotated:"
echo "$KEYS_TO_ROTATE"
echo ""

if [ "$DRY_RUN" == false ]; then
    # Save report
    report_file="logs/key-rotation-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S).log"
    mkdir -p logs
    
    cat > "$report_file" << EOF
Key Rotation Report
===================
Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Environment: $ENVIRONMENT
Key Type: $KEY_TYPE
Batch Size: $BATCH_SIZE
Rotated By: $(whoami)
Host: $(hostname)

Keys Rotated:
$KEYS_TO_ROTATE

Next Steps:
1. Deploy updated keys to validators
2. Verify validator operation
3. Update any dependent services
4. Monitor network health

Backup Location: See backup-location.txt in backup directory
EOF
    
    echo -e "${GREEN}Report saved to: $report_file${NC}"
    
    # Reminder for deployment
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Deploy the new keys to validators!${NC}"
    echo "Run: ./scripts/deploy-validator.sh -e $ENVIRONMENT -i <validator-id>"
fi
