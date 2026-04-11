#!/bin/bash

# BesaChain Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="besachain"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
ENV_FILE="$SCRIPT_DIR/.env"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warn ".env file not found. Creating from template..."
        if [ -f "$SCRIPT_DIR/.env.template" ]; then
            cp "$SCRIPT_DIR/.env.template" "$ENV_FILE"
            log_warn "Please edit $ENV_FILE with your configuration before deploying."
            exit 1
        else
            log_error ".env.template not found!"
            exit 1
        fi
    fi
    
    # Check website directories
    local websites=("com" "dex" "docs" "faucet" "bridge" "org")
    for site in "${websites[@]}"; do
        if [ ! -d "$SCRIPT_DIR/../websites/$site" ]; then
            log_warn "Website directory not found: websites/$site"
        fi
    done
    
    log_success "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p "$SCRIPT_DIR/ssl/certbot/conf"
    mkdir -p "$SCRIPT_DIR/ssl/certbot/www"
    mkdir -p "$SCRIPT_DIR/logs"
    mkdir -p "$SCRIPT_DIR/backups"
    
    log_success "Directories created"
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    local domains=("besachain.com" "www.besachain.com" "dex.besachain.com" "docs.besachain.com" "faucet.besachain.com" "bridge.besachain.com" "besachain.org" "www.besachain.org")
    local email=$(grep LETSENCRYPT_EMAIL "$ENV_FILE" | cut -d '=' -f2)
    
    if [ -z "$email" ]; then
        email="admin@besachain.com"
    fi
    
    # Check if certificates already exist
    if [ -d "$SCRIPT_DIR/ssl/certbot/conf/live/besachain.com" ]; then
        log_info "SSL certificates already exist. Skipping initial certificate request."
        return 0
    fi
    
    log_info "Requesting SSL certificates from Let's Encrypt..."
    
    # Start nginx temporarily for certificate validation
    docker-compose -f "$COMPOSE_FILE" up -d nginx
    sleep 5
    
    # Request certificates
    local domain_args=""
    for domain in "${domains[@]}"; do
        domain_args="$domain_args -d $domain"
    done
    
    docker run -it --rm \
        -v "$SCRIPT_DIR/ssl/certbot/conf:/etc/letsencrypt" \
        -v "$SCRIPT_DIR/ssl/certbot/www:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        $domain_args \
        --email "$email" \
        --agree-tos \
        --no-eff-email \
        --force-renewal
    
    # Restart nginx to pick up new certificates
    docker-compose -f "$COMPOSE_FILE" restart nginx
    
    log_success "SSL certificates configured"
}

# Build and deploy services
deploy_services() {
    log_info "Building and deploying services for environment: $ENVIRONMENT"
    
    # Pull latest images
    log_info "Pulling latest base images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build services
    log_info "Building services..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Stop existing services
    log_info "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    local services=("nginx" "besachain-com" "besachain-dex" "besachain-docs" "besachain-faucet" "besachain-bridge" "besachain-org")
    for service in "${services[@]}"; do
        local retries=0
        local max_retries=30
        
        while [ $retries -lt $max_retries ]; do
            if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "healthy"; then
                log_success "Service $service is healthy"
                break
            fi
            
            retries=$((retries + 1))
            if [ $retries -eq $max_retries ]; then
                log_error "Service $service failed to become healthy"
                docker-compose -f "$COMPOSE_FILE" logs "$service"
                exit 1
            fi
            
            sleep 2
        done
    done
    
    log_success "All services deployed successfully"
}

# Display status
show_status() {
    log_info "Deployment Status:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    
    log_info "Website URLs:"
    echo "  - https://besachain.com (Main Site)"
    echo "  - https://dex.besachain.com (DEX)"
    echo "  - https://docs.besachain.com (Documentation)"
    echo "  - https://faucet.besachain.com (Faucet)"
    echo "  - https://bridge.besachain.com (Bridge)"
    echo "  - https://besachain.org (Foundation)"
    echo ""
    
    log_info "Useful commands:"
    echo "  View logs:        docker-compose -f $COMPOSE_FILE logs -f"
    echo "  Restart service:  docker-compose -f $COMPOSE_FILE restart <service>"
    echo "  Stop all:         docker-compose -f $COMPOSE_FILE down"
    echo "  Update images:    docker-compose -f $COMPOSE_FILE pull && docker-compose -f $COMPOSE_FILE up -d"
}

# Rollback function
rollback() {
    log_warn "Rolling back deployment..."
    docker-compose -f "$COMPOSE_FILE" down
    log_info "Rollback complete. Services stopped."
}

# Backup function
backup() {
    log_info "Creating backup..."
    local backup_dir="$SCRIPT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup SSL certificates
    if [ -d "$SCRIPT_DIR/ssl" ]; then
        cp -r "$SCRIPT_DIR/ssl" "$backup_dir/"
    fi
    
    # Backup configuration
    cp "$COMPOSE_FILE" "$backup_dir/"
    cp "$ENV_FILE" "$backup_dir/"
    
    log_success "Backup created at: $backup_dir"
}

# Main execution
main() {
    echo "========================================"
    echo "  BesaChain Deployment Script"
    echo "  Environment: $ENVIRONMENT"
    echo "========================================"
    echo ""
    
    case "${2:-}" in
        "backup")
            backup
            exit 0
            ;;
        "rollback")
            rollback
            exit 0
            ;;
        "status")
            show_status
            exit 0
            ;;
        "ssl")
            setup_ssl
            exit 0
            ;;
    esac
    
    check_prerequisites
    create_directories
    backup
    setup_ssl
    deploy_services
    show_status
    
    echo ""
    log_success "Deployment completed successfully!"
}

# Handle signals
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
