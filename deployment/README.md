# BesaChain Deployment

Docker, nginx, and deployment configurations for all BesaChain websites.

## Overview

This directory contains the complete deployment infrastructure for the BesaChain ecosystem websites:

| Website | Port | Description |
|---------|------|-------------|
| besachain.com | 3000 | Main blockchain site |
| dex.besachain.com | 3001 | Decentralized exchange |
| docs.besachain.com | 3002 | Documentation site |
| faucet.besachain.com | 3003 | Testnet faucet |
| bridge.besachain.com | 3004 | L1/L2 bridge |
| besachain.org | 3005 | Foundation site |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Nginx Reverse Proxy (80/443)                   │
│         SSL termination, rate limiting, routing             │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────┬───────┴───────┬───────────┐
        │           │               │           │
   ┌────▼────┐ ┌───▼────┐     ┌────▼────┐ ┌───▼────┐
   │ :3000   │ │ :3001  │ ... │ :3004   │ │ :3005  │
   │ Main    │ │ DEX    │     │ Bridge  │ │ Foundation
   └─────────┘ └────────┘     └─────────┘ └────────┘
```

## Directory Structure

```
deployment/
├── docker-compose.yml          # Main orchestration file
├── nginx.conf                  # Reverse proxy configuration
├── deploy.sh                   # Automated deployment script
├── .env.template               # Environment variables template
├── dockerfiles/                # Individual Dockerfiles
│   ├── Dockerfile.com
│   ├── Dockerfile.dex
│   ├── Dockerfile.docs
│   ├── Dockerfile.faucet
│   ├── Dockerfile.bridge
│   ├── Dockerfile.org
│   ├── nginx.com.conf
│   ├── nginx.dex.conf
│   ├── nginx.docs.conf
│   ├── nginx.faucet.conf
│   ├── nginx.bridge.conf
│   └── nginx.org.conf
├── ssl/                        # SSL certificates (generated)
├── logs/                       # Nginx logs
└── backups/                    # Deployment backups
```

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Domain names configured with DNS pointing to server
- Ports 80 and 443 open

## Quick Start

### 1. Configure Environment

```bash
cd deployment
cp .env.template .env
# Edit .env with your configuration
nano .env
```

### 2. Run Deployment

```bash
./deploy.sh production
```

This will:
- Check prerequisites
- Create necessary directories
- Setup SSL certificates with Let's Encrypt
- Build and start all services
- Verify health checks

### 3. Verify Deployment

```bash
# Check service status
./deploy.sh status

# View logs
docker-compose logs -f

# Check specific service
docker-compose logs -f besachain-com
```

## Configuration

### Environment Variables

Edit `.env` file with your specific configuration:

```bash
# Blockchain
CHAIN_ID=25000
RPC_URL=https://rpc.besachain.com

# Faucet (keep secure!)
FAUCET_PRIVATE_KEY=your_private_key
RECAPTCHA_SECRET_KEY=your_recaptcha_key

# Bridge
L1_RPC_URL=https://ethereum-rpc.example.com
BRIDGE_CONTRACT_L1=0x...
BRIDGE_CONTRACT_L2=0x...

# SSL
LETSENCRYPT_EMAIL=admin@besachain.com
```

### Nginx Configuration

The main `nginx.conf` handles:
- HTTP → HTTPS redirect
- SSL/TLS termination
- Subdomain routing
- Rate limiting
- WebSocket proxying
- Static asset caching

### Individual Site Configs

Each site has its own nginx config in `dockerfiles/nginx.*.conf`:
- Gzip compression
- Security headers
- Health check endpoints
- Static file caching

## SSL Certificates

SSL certificates are automatically managed by Certbot:

```bash
# Force certificate renewal
docker-compose run --rm certbot renew --force-renewal

# View certificates
docker-compose run --rm certbot certificates
```

## Management Commands

```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart besachain-dex

# Scale a service (if supported)
docker-compose up -d --scale besachain-com=2

# Stop all services
docker-compose down

# Update and restart
./deploy.sh

# Create backup
./deploy.sh backup

# Rollback
./deploy.sh rollback
```

## Health Checks

Each service exposes a health endpoint:

```bash
curl http://localhost:3000/health  # Main site
curl http://localhost:3001/health  # DEX
curl http://localhost:3002/health  # Docs
curl http://localhost:3003/health  # Faucet
curl http://localhost:3004/health  # Bridge
curl http://localhost:3005/health  # Foundation
```

## Security Features

- **SSL/TLS**: Let's Encrypt certificates with auto-renewal
- **Security Headers**: HSTS, CSP, X-Frame-Options, etc.
- **Rate Limiting**: Configurable per endpoint
- **DDoS Protection**: Connection and request limiting
- **Content Security Policy**: XSS protection

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs <service-name>

# Check for port conflicts
netstat -tlnp | grep 3000

# Verify environment variables
docker-compose config
```

### SSL Certificate Issues

```bash
# Test certificate renewal
docker-compose run --rm certbot renew --dry-run

# Force renew
docker-compose run --rm certbot renew --force-renewal

# Check certificate status
docker-compose run --rm certbot certificates
```

### 502 Bad Gateway

```bash
# Check if backend is healthy
docker-compose ps

# Restart specific service
docker-compose restart <service-name>

# Check nginx error logs
docker-compose exec nginx cat /var/log/nginx/error.log
```

## Monitoring

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Log Aggregation

Logs are stored in:
- Nginx: `logs/nginx/`
- Docker: `docker-compose logs`

For production, consider integrating with:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Grafana Loki
- Datadog
- New Relic

## Backup and Recovery

### Automated Backups

Backups are created automatically on each deployment:

```bash
# List backups
ls -la backups/

# Manual backup
./deploy.sh backup
```

### Recovery

```bash
# Stop services
docker-compose down

# Restore SSL certificates
cp -r backups/YYYYMMDD_HHMMSS/ssl ./

# Restore configuration
cp backups/YYYYMMDD_HHMMSS/.env ./

# Restart
docker-compose up -d
```

## Updating

### Update Services

```bash
# Pull latest code
cd ../websites/com && git pull
cd ../dex && git pull
# ... repeat for each site

# Rebuild and deploy
cd deployment
./deploy.sh
```

### Update SSL Certificates

```bash
# Certificates auto-renew, but to force:
docker-compose run --rm certbot renew --force-renewal
docker-compose restart nginx
```

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review configuration: `docker-compose config`
- Test health endpoints: `curl http://localhost:PORT/health`

## License

Copyright (c) 2024 BesaChain. All rights reserved.
