#!/bin/bash
##############################################################################
# deploy-testnet.sh
# Production deployment script for BesaChain L1 (3 validators) + L2 (V1 only)
# Handles cross-compilation, binary upload, service installation, and startup
##############################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SSH_KEY="${HOME}/.ssh/libyachain-validators.pem"
SSH_USER="ec2-user"
REMOTE_DATA_DIR="/data"
REMOTE_BINARY_DIR="/usr/local/bin"
BUILD_TIMEOUT=1800  # 30 minutes

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Validator configuration
declare -A VALIDATORS=(
    [v1]="54.235.85.175"
    [v2]="44.223.91.64"
    [v3]="3.84.251.178"
)

declare -A ROLES=(
    [v1]="L1_VALIDATOR|L2_SEQUENCER"
    [v2]="L1_VALIDATOR"
    [v3]="L1_VALIDATOR"
)

# Validator addresses (to be substituted from config or arguments)
declare -A VALIDATOR_ADDRESSES=()

##############################################################################
# Utility Functions
##############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*"
}

die() {
    log_error "$@"
    exit 1
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check SSH key
    [[ -f "$SSH_KEY" ]] || die "SSH key not found: $SSH_KEY"
    chmod 600 "$SSH_KEY"

    # Check required source directories
    [[ -d "$PROJECT_ROOT/bsc" ]] || die "BSC source not found: $PROJECT_ROOT/bsc"
    [[ -d "$PROJECT_ROOT/opbnb-geth" ]] || die "op-geth source not found: $PROJECT_ROOT/opbnb-geth"
    [[ -d "$PROJECT_ROOT/opbnb" ]] || die "op-node source not found: $PROJECT_ROOT/opbnb"
    [[ -d "$PROJECT_ROOT/genesis" ]] || die "genesis directory not found: $PROJECT_ROOT/genesis"
    [[ -f "$PROJECT_ROOT/genesis/testnet-l1-14440.json" ]] || die "L1 genesis not found"

    # Check for required tools
    command -v go >/dev/null 2>&1 || die "Go not installed"
    command -v ssh >/dev/null 2>&1 || die "SSH not available"

    log_success "Prerequisites check passed"
}

load_validator_addresses() {
    local config_file="$PROJECT_ROOT/deploy/validators.conf"

    if [[ -f "$config_file" ]]; then
        log_info "Loading validator addresses from $config_file"
        while IFS='=' read -r key value; do
            [[ "$key" =~ ^[[:space:]]*# ]] && continue
            [[ -z "$key" ]] && continue
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs)
            VALIDATOR_ADDRESSES[$key]="$value"
        done < "$config_file"
    else
        log_warn "Validator config not found at $config_file"
        log_warn "Create the file with format: v1_address=0x... v2_address=0x... v3_address=0x..."
        log_warn "Continuing with VALIDATOR_ADDRESS_PLACEHOLDER in service files"
    fi
}

cross_compile_binary() {
    local source_dir="$1"
    local binary_name="$2"
    local output_file="$3"
    local make_target="${4:-geth}"

    log_info "Cross-compiling $binary_name from $source_dir..."

    cd "$source_dir" || die "Cannot cd to $source_dir"

    # Clean build artifacts
    make clean >/dev/null 2>&1 || true

    # Cross-compile for linux/amd64
    GOOS=linux GOARCH=amd64 make "$make_target" \
        2>&1 | tail -20 || die "Build failed for $binary_name"

    # Copy binary to output location
    if [[ -f "build/bin/$binary_name" ]]; then
        cp "build/bin/$binary_name" "$output_file"
    elif [[ -f "cmd/$binary_name/bin/$binary_name" ]]; then
        cp "cmd/$binary_name/bin/$binary_name" "$output_file"
    else
        die "Binary output not found for $binary_name"
    fi

    chmod +x "$output_file"
    log_success "$binary_name compiled: $output_file"
}

build_all_binaries() {
    log_info "Building all binaries for linux/amd64..."

    local build_dir="$PROJECT_ROOT/build/linux-amd64"
    mkdir -p "$build_dir"

    # Build BSC geth
    cross_compile_binary \
        "$PROJECT_ROOT/bsc" \
        "geth" \
        "$build_dir/besachain-geth" \
        "geth"

    # Build op-geth
    cross_compile_binary \
        "$PROJECT_ROOT/opbnb-geth" \
        "geth" \
        "$build_dir/besachain-l2-geth" \
        "geth"

    # Build op-node
    cross_compile_binary \
        "$PROJECT_ROOT/opbnb" \
        "op-node" \
        "$build_dir/besachain-op-node" \
        "op-node"

    log_success "All binaries built successfully in $build_dir"
    echo "$build_dir"
}

stop_remote_services() {
    local validator_name="$1"
    local validator_ip="${VALIDATORS[$validator_name]}"

    log_info "Stopping remote services on $validator_name ($validator_ip)..."

    ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" bash -c '
        set -e
        systemctl stop besachain-l2-node.service 2>/dev/null || true
        systemctl stop besachain-l2-geth.service 2>/dev/null || true
        systemctl stop besachain-l1.service 2>/dev/null || true
        echo "Services stopped"
    ' || log_warn "Service stop returned error (may be expected if services do not exist)"
}

upload_binaries() {
    local validator_name="$1"
    local validator_ip="${VALIDATORS[$validator_name]}"
    local build_dir="$2"

    log_info "Uploading binaries to $validator_name ($validator_ip)..."

    # Create remote directory
    ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" "sudo mkdir -p $REMOTE_BINARY_DIR && sudo chown $SSH_USER $REMOTE_BINARY_DIR"

    # Copy binaries
    scp -i "$SSH_KEY" "$build_dir/besachain-geth" "$SSH_USER@$validator_ip:$REMOTE_BINARY_DIR/"
    chmod +x "$REMOTE_BINARY_DIR/besachain-geth" || true

    if [[ "$validator_name" == "v1" ]]; then
        scp -i "$SSH_KEY" "$build_dir/besachain-l2-geth" "$SSH_USER@$validator_ip:$REMOTE_BINARY_DIR/"
        scp -i "$SSH_KEY" "$build_dir/besachain-op-node" "$SSH_USER@$validator_ip:$REMOTE_BINARY_DIR/"
        ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" "chmod +x $REMOTE_BINARY_DIR/besachain-l2-geth $REMOTE_BINARY_DIR/besachain-op-node"
    fi

    log_success "Binaries uploaded to $validator_name"
}

upload_genesis_and_configs() {
    local validator_name="$1"
    local validator_ip="${VALIDATORS[$validator_name]}"

    log_info "Uploading genesis and config files to $validator_name ($validator_ip)..."

    ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" "sudo mkdir -p $REMOTE_DATA_DIR/besachain-l1 && sudo chown -R $SSH_USER $REMOTE_DATA_DIR"

    # Upload L1 genesis
    scp -i "$SSH_KEY" "$PROJECT_ROOT/genesis/testnet-l1-14440.json" \
        "$SSH_USER@$validator_ip:$REMOTE_DATA_DIR/besachain-l1/genesis.json"

    # Create password file (empty for testing)
    echo "" | ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" \
        "tee $REMOTE_DATA_DIR/besachain-l1/password.txt" >/dev/null

    # For V1, upload L2 genesis if available
    if [[ "$validator_name" == "v1" ]]; then
        ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" "sudo mkdir -p $REMOTE_DATA_DIR/besachain-l2 && sudo chown -R $SSH_USER $REMOTE_DATA_DIR/besachain-l2"

        if [[ -f "$PROJECT_ROOT/genesis/testnet-l2-19120.json" ]]; then
            scp -i "$SSH_KEY" "$PROJECT_ROOT/genesis/testnet-l2-19120.json" \
                "$SSH_USER@$validator_ip:$REMOTE_DATA_DIR/besachain-l2/genesis.json"
        fi

        if [[ -f "$PROJECT_ROOT/genesis/rollup.json" ]]; then
            scp -i "$SSH_KEY" "$PROJECT_ROOT/genesis/rollup.json" \
                "$SSH_USER@$validator_ip:$REMOTE_DATA_DIR/besachain-l2/rollup.json"
        fi
    fi

    log_success "Genesis and config files uploaded to $validator_name"
}

upload_service_files() {
    local validator_name="$1"
    local validator_ip="${VALIDATORS[$validator_name]}"

    log_info "Uploading systemd service files to $validator_name ($validator_ip)..."

    # Create temporary directory for service files
    local temp_dir=$(mktemp -d)
    trap "rm -rf $temp_dir" EXIT

    # Copy L1 service
    cp "$SCRIPT_DIR/systemd/besachain-l1.service" "$temp_dir/"

    # Substitute validator address if available
    if [[ -n "${VALIDATOR_ADDRESSES[${validator_name}]:-}" ]]; then
        sed -i.bak "s/VALIDATOR_ADDRESS_PLACEHOLDER/${VALIDATOR_ADDRESSES[$validator_name]}/g" \
            "$temp_dir/besachain-l1.service"
    fi

    # For V1, also copy L2 services
    if [[ "$validator_name" == "v1" ]]; then
        cp "$SCRIPT_DIR/systemd/besachain-l2-geth.service" "$temp_dir/"
        cp "$SCRIPT_DIR/systemd/besachain-l2-node.service" "$temp_dir/"
    fi

    # Upload and install service files
    scp -i "$SSH_KEY" "$temp_dir"/*.service "$SSH_USER@$validator_ip:/tmp/"

    ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" bash -c '
        for file in /tmp/besachain-*.service; do
            sudo mv "$file" /etc/systemd/system/
        done
        sudo systemctl daemon-reload
        echo "Service files installed"
    '

    log_success "Service files uploaded and installed on $validator_name"
}

initialize_chain() {
    local validator_name="$1"
    local validator_ip="${VALIDATORS[$validator_name]}"

    log_info "Initializing chain on $validator_name ($validator_ip)..."

    ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" bash -c "
        set -e
        # Initialize L1 only if not already initialized
        if [[ ! -d $REMOTE_DATA_DIR/besachain-l1/geth ]]; then
            echo 'Initializing L1 genesis...'
            $REMOTE_BINARY_DIR/besachain-geth init --datadir $REMOTE_DATA_DIR/besachain-l1 $REMOTE_DATA_DIR/besachain-l1/genesis.json
        fi

        # For V1, initialize L2
        if [[ '${validator_name}' == 'v1' ]]; then
            if [[ ! -d $REMOTE_DATA_DIR/besachain-l2/geth ]]; then
                echo 'Initializing L2 genesis...'
                $REMOTE_BINARY_DIR/besachain-l2-geth init --datadir $REMOTE_DATA_DIR/besachain-l2 $REMOTE_DATA_DIR/besachain-l2/genesis.json
            fi
        fi

        echo 'Chain initialization complete'
    "

    log_success "Chain initialized on $validator_name"
}

start_services() {
    local validator_name="$1"
    local validator_ip="${VALIDATORS[$validator_name]}"

    log_info "Starting services on $validator_name ($validator_ip)..."

    if [[ "$validator_name" == "v1" ]]; then
        ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" bash -c '
            set -e
            sudo systemctl start besachain-l1.service
            sudo systemctl enable besachain-l1.service
            sleep 5
            sudo systemctl start besachain-l2-geth.service
            sudo systemctl enable besachain-l2-geth.service
            sleep 5
            sudo systemctl start besachain-l2-node.service
            sudo systemctl enable besachain-l2-node.service
            echo "V1 services started (L1, L2-geth, L2-node)"
        '
    else
        ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" bash -c '
            set -e
            sudo systemctl start besachain-l1.service
            sudo systemctl enable besachain-l1.service
            echo "Services started (L1 only)"
        '
    fi

    log_success "Services started on $validator_name"
}

verify_deployment() {
    local validator_name="$1"
    local validator_ip="${VALIDATORS[$validator_name]}"

    log_info "Verifying deployment on $validator_name ($validator_ip)..."

    # Check L1 RPC
    local l1_rpc_check=$(ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" bash -c '
        sleep 3
        curl -s http://localhost:1444 -X POST \
            -H "Content-Type: application/json" \
            -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" \
            2>/dev/null | grep -q "result" && echo "OK" || echo "FAIL"
    ' 2>/dev/null || echo "FAIL")

    if [[ "$l1_rpc_check" == "OK" ]]; then
        log_success "L1 RPC responding on $validator_name"
    else
        log_warn "L1 RPC not responding yet on $validator_name (may need more time)"
    fi

    # Check L2 RPC on V1
    if [[ "$validator_name" == "v1" ]]; then
        local l2_rpc_check=$(ssh -i "$SSH_KEY" "$SSH_USER@$validator_ip" bash -c '
            sleep 3
            curl -s http://localhost:1912 -X POST \
                -H "Content-Type: application/json" \
                -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" \
                2>/dev/null | grep -q "result" && echo "OK" || echo "FAIL"
        ' 2>/dev/null || echo "FAIL")

        if [[ "$l2_rpc_check" == "OK" ]]; then
            log_success "L2 RPC responding on $validator_name"
        else
            log_warn "L2 RPC not responding yet on $validator_name (may need more time)"
        fi
    fi

    log_success "Verification complete for $validator_name"
}

##############################################################################
# Main Deployment Flow
##############################################################################

main() {
    log_info "=== BesaChain Testnet Deployment ==="
    log_info "L1: 3 validators (V1, V2, V3)"
    log_info "L2: 1 sequencer on V1"

    check_prerequisites
    load_validator_addresses

    # Build all binaries
    BUILD_DIR=$(build_all_binaries)

    # Deploy to each validator
    for validator in v1 v2 v3; do
        log_info ""
        log_info "=== Deploying $validator (${VALIDATORS[$validator]}) ==="
        log_info "Role: ${ROLES[$validator]}"

        stop_remote_services "$validator"
        sleep 2
        upload_binaries "$validator" "$BUILD_DIR"
        upload_genesis_and_configs "$validator"
        upload_service_files "$validator"
        initialize_chain "$validator"
        sleep 5
        start_services "$validator"
        sleep 10
        verify_deployment "$validator"
    done

    log_success ""
    log_success "=== Deployment Complete ==="
    log_success "L1 RPC endpoints:"
    log_success "  V1 (54.235.85.175:1444)"
    log_success "  V2 (44.223.91.64:1444)"
    log_success "  V3 (3.84.251.178:1444)"
    log_success "L2 RPC endpoint (V1 only):"
    log_success "  V1 (54.235.85.175:1912)"
    log_success ""
    log_success "View logs with:"
    log_success "  ssh -i $SSH_KEY $SSH_USER@<validator_ip>"
    log_success "  sudo journalctl -u besachain-l1.service -f"
    log_success "  sudo journalctl -u besachain-l2-geth.service -f  (V1 only)"
    log_success "  sudo journalctl -u besachain-l2-node.service -f  (V1 only)"
}

main "$@"
