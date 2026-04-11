#!/bin/bash
##############################################################################
# health-check.sh
# Health monitoring for BesaChain L1 (3 validators) + L2 (V1 only)
# Checks RPC endpoints, block production, and system resources
##############################################################################

set -euo pipefail

# Configuration
SSH_KEY="${HOME}/.ssh/libyachain-validators.pem"
SSH_USER="ec2-user"
CHECK_INTERVAL="${1:-60}"  # Default: check every 60 seconds

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

# State tracking for block changes
declare -A LAST_BLOCK_L1=()
declare -A LAST_BLOCK_L2=()

##############################################################################
# Utility Functions
##############################################################################

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $*"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $*"
}

log_error() {
    echo -e "${RED}[✗]${NC} $*"
}

format_bytes() {
    local bytes=$1
    if (( bytes >= 1073741824 )); then
        echo "$(( bytes / 1073741824 ))GB"
    elif (( bytes >= 1048576 )); then
        echo "$(( bytes / 1048576 ))MB"
    elif (( bytes >= 1024 )); then
        echo "$(( bytes / 1024 ))KB"
    else
        echo "${bytes}B"
    fi
}

check_rpc_endpoint() {
    local validator_name="$1"
    local validator_ip="$2"
    local port="$3"
    local chain_name="$4"

    local response=$(curl -s "http://${validator_ip}:${port}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        2>/dev/null)

    if echo "$response" | grep -q '"result"'; then
        local block_num=$(echo "$response" | grep -o '"result":"0x[^"]*"' | head -1 | sed 's/"result":"\|"//g')
        local block_decimal=$((16#${block_num:2}))
        echo "$block_decimal"
        return 0
    else
        return 1
    fi
}

get_peer_count() {
    local validator_ip="$1"
    local port="$2"

    local response=$(curl -s "http://${validator_ip}:${port}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
        2>/dev/null)

    if echo "$response" | grep -q '"result"'; then
        local peer_hex=$(echo "$response" | grep -o '"result":"0x[^"]*"' | head -1 | sed 's/"result":"\|"//g')
        echo $((16#${peer_hex:2}))
        return 0
    else
        return 1
    fi
}

get_system_stats() {
    local validator_ip="$1"

    local stats=$(ssh -i "$SSH_KEY" "$SSH_USER@${validator_ip}" bash -c '
        # Memory stats
        mem_info=$(free -b | awk "NR==2 {print \$2, \$3, \$7}")
        # Disk stats for /data
        disk_info=$(df -B1 /data | awk "NR==2 {print \$2, \$3, \$4}")
        echo "$mem_info $disk_info"
    ' 2>/dev/null)

    echo "$stats"
}

check_systemd_services() {
    local validator_ip="$1"
    local validator_name="$2"

    local services="besachain-l1.service"
    if [[ "$validator_name" == "v1" ]]; then
        services="besachain-l1.service besachain-l2-geth.service besachain-l2-node.service"
    fi

    local all_running=true
    for service in $services; do
        local status=$(ssh -i "$SSH_KEY" "$SSH_USER@${validator_ip}" \
            "sudo systemctl is-active $service" 2>/dev/null || echo "FAIL")

        if [[ "$status" == "active" ]]; then
            log_success "  $service: active"
        else
            log_error "  $service: INACTIVE"
            all_running=false
        fi
    done

    return $([ "$all_running" = true ] && echo 0 || echo 1)
}

##############################################################################
# Main Monitoring Loop
##############################################################################

main() {
    log_info "=== BesaChain Health Monitor ==="
    log_info "Check interval: ${CHECK_INTERVAL}s"
    log_info ""

    local iteration=0

    while true; do
        iteration=$((iteration + 1))
        log_info "=== Health Check #$iteration ==="

        for validator_name in v1 v2 v3; do
            local validator_ip="${VALIDATORS[$validator_name]}"

            log_info ""
            log_info "--- $validator_name ($validator_ip) ---"

            # Check systemd services
            log_info "Services:"
            if ! check_systemd_services "$validator_ip" "$validator_name"; then
                log_warn "One or more services not active"
            fi

            # Check L1 RPC
            log_info "L1 RPC (port 1444):"
            if block_num=$(check_rpc_endpoint "$validator_name" "$validator_ip" "1444" "L1"); then
                log_success "  Block: $block_num"

                # Check if block is advancing
                if [[ -n "${LAST_BLOCK_L1[$validator_name]:-}" ]]; then
                    if (( block_num > LAST_BLOCK_L1[$validator_name] )); then
                        log_success "  Advancing: +$((block_num - LAST_BLOCK_L1[$validator_name])) blocks"
                    else
                        log_warn "  Not advancing (may be syncing or stalled)"
                    fi
                fi
                LAST_BLOCK_L1[$validator_name]=$block_num

                # Get peer count
                if peer_count=$(get_peer_count "$validator_ip" "1444"); then
                    if (( peer_count > 0 )); then
                        log_success "  Peers: $peer_count"
                    else
                        log_warn "  Peers: 0 (not fully connected)"
                    fi
                fi
            else
                log_error "  RPC not responding"
            fi

            # Check L2 RPC on V1 only
            if [[ "$validator_name" == "v1" ]]; then
                log_info "L2 RPC (port 1912):"
                if block_num=$(check_rpc_endpoint "$validator_name" "$validator_ip" "1912" "L2"); then
                    log_success "  Block: $block_num"

                    if [[ -n "${LAST_BLOCK_L2[$validator_name]:-}" ]]; then
                        if (( block_num > LAST_BLOCK_L2[$validator_name] )); then
                            log_success "  Advancing: +$((block_num - LAST_BLOCK_L2[$validator_name])) blocks"
                        else
                            log_warn "  Not advancing"
                        fi
                    fi
                    LAST_BLOCK_L2[$validator_name]=$block_num
                else
                    log_error "  RPC not responding"
                fi
            fi

            # Check system resources
            log_info "System Resources:"
            if read -r mem_total mem_used mem_avail disk_total disk_used disk_avail < <(get_system_stats "$validator_ip"); then
                local mem_used_pct=$((mem_used * 100 / mem_total))
                local disk_used_pct=$((disk_used * 100 / disk_total))

                log_success "  Memory: $(format_bytes "$mem_used")/$(format_bytes "$mem_total") ($mem_used_pct%)"
                log_success "  Disk: $(format_bytes "$disk_used")/$(format_bytes "$disk_total") ($disk_used_pct%)"

                if (( mem_used_pct > 90 )); then
                    log_warn "  Memory usage CRITICAL"
                elif (( mem_used_pct > 80 )); then
                    log_warn "  Memory usage HIGH"
                fi

                if (( disk_used_pct > 90 )); then
                    log_error "  Disk usage CRITICAL"
                elif (( disk_used_pct > 80 )); then
                    log_warn "  Disk usage HIGH"
                fi
            else
                log_error "  Could not retrieve system stats"
            fi
        done

        log_info ""
        log_info "=== Check Complete ==="
        log_info "Next check in ${CHECK_INTERVAL}s (press Ctrl+C to stop)"
        echo ""

        sleep "$CHECK_INTERVAL"
    done
}

# Handle interrupt
trap 'log_info "Health monitor stopped"; exit 0' SIGINT SIGTERM

main "$@"
