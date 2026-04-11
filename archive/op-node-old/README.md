# BesaChain OP Node Sequencer

OP Stack node for BesaChain L2 with 250ms block time capability.

## Overview

This directory contains the configuration and deployment scripts for the BesaChain OP Node, which serves as the sequencer for the L2 chain (Chain ID 1445).

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   BesaChain L1  │────▶│   OP Node       │────▶│   BesaChain L2  │
│   (Chain 1444)  │     │   (Sequencer)   │     │   (Chain 1445)  │
│   Port: 8545    │     │                 │     │   Port: 9551    │
│   Block: 450ms  │     │   Port: 9545    │     │   Block: 250ms  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Admin RPC     │
                       │   Port: 9645    │
                       └─────────────────┘
```

## Configuration

### Block Time Targets

| Chain | Target | Configuration |
|-------|--------|---------------|
| L1    | 450ms  | BSC miner.recommit |
| L2    | 250ms  | OP Node + Geth config |

### RPC Endpoints

| Endpoint | Port | Purpose |
|----------|------|---------|
| L1 RPC   | 8545 | L1 Communication |
| L2 Engine| 9551 | L2 Geth Auth RPC |
| L2 RPC   | 9545 | OP Node HTTP RPC |
| Admin RPC| 9645 | OP Node Admin API |
| Metrics  | 7300 | Prometheus Metrics |

## Quick Start

### 1. Install OP Node

```bash
# Local installation
sudo ./install-op-node.sh

# Remote deployment to validator
./deploy-remote.sh 54.235.85.175 ~/.ssh/libyachain-validators.pem
```

### 2. Update Contract Addresses

After contract deployment is complete:

```bash
# Update with deployment state file
./update-contract-addresses.sh /data/besachain-op-node/config/rollup.json /path/to/state.json

# Or update manually
./update-contract-addresses.sh
```

### 3. Configure Block Time

```bash
# Setup 250ms block time coordination
./configure-block-time.sh
```

### 4. Start Services

```bash
# Start L1 (if not running)
sudo systemctl start besachain-l1

# Start L2 with 250ms recommit
sudo systemctl start besachain-l2

# Start OP Node sequencer
sudo systemctl start besachain-op-node

# Enable auto-start
sudo systemctl enable besachain-op-node
```

## Service Management

```bash
# Check status
sudo systemctl status besachain-op-node

# View logs
sudo journalctl -u besachain-op-node -f

# Restart
sudo systemctl restart besachain-op-node

# Stop
sudo systemctl stop besachain-op-node
```

## Health Monitoring

```bash
# Run health check
./scripts/health-check.sh

# Monitor block production
./scripts/monitor-blocks.sh

# View metrics
curl http://localhost:7300/metrics
```

## Configuration Files

### rollup.json

Located at `/data/besachain-op-node/config/rollup.json`, this file contains:
- Chain IDs (L1: 1444, L2: 1445)
- Contract addresses
- Block time settings
- Genesis configuration

**Important**: Update contract addresses after deployment.

### jwt-secret.txt

Authentication secret shared between op-node and op-geth. Auto-generated during installation.

**Security**: Keep this file secure (chmod 600).

## Docker Deployment

```bash
cd op-node
docker-compose up -d
```

## Troubleshooting

### Issue: OP Node fails to start

**Check L1 connectivity:**
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

**Check L2 engine:**
```bash
curl -X POST http://localhost:9551 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### Issue: No block production

1. Verify sequencer is enabled:
```bash
curl -X POST http://localhost:9645 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"admin_sequencerActive","params":[],"id":1}'
```

2. Check rollup.json has valid contract addresses.

3. Verify JWT secret is correctly shared with L2.

### Issue: Slow block production

1. Check system resources:
```bash
top -p $(pgrep op-node)
```

2. Verify 250ms configuration is applied to both op-node and L2 geth.

3. Check network latency between L1 and sequencer.

## Admin RPC Methods

The admin RPC (port 9645) provides additional control:

```bash
# Check sequencer status
curl -X POST http://localhost:9645 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"admin_sequencerActive","params":[],"id":1}'

# Start sequencer (if stopped)
curl -X POST http://localhost:9645 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"admin_startSequencer","params":[],"id":1}'

# Stop sequencer
curl -X POST http://localhost:9645 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"admin_stopSequencer","params":[],"id":1}'
```

## File Structure

```
op-node/
├── config/
│   ├── rollup.json          # Rollup configuration
│   └── jwt-secret.txt       # Auth secret
├── data/                    # Node data (created on install)
├── scripts/
│   ├── health-check.sh      # Health monitoring
│   └── monitor-blocks.sh    # Block production monitor
├── docker-compose.yml       # Docker deployment
├── besachain-op-node.service # Systemd service
├── install-op-node.sh       # Local installation
├── deploy-remote.sh         # Remote deployment
├── configure-block-time.sh  # 250ms configuration
├── update-contract-addresses.sh # Address updater
└── README.md                # This file
```

## Security Considerations

1. **JWT Secret**: Never commit `jwt-secret.txt` to version control.
2. **Admin RPC**: Bind to localhost only in production.
3. **Firewall**: Only expose necessary ports (9545 for L2 RPC).
4. **Updates**: Keep op-node image updated for security patches.

## References

- [OP Stack Documentation](https://stack.optimism.io/)
- [OP Node Configuration](https://docs.optimism.io/builders/node-operators/configuration)
- [BesaChain Architecture](../../docs/ARCHITECTURE.md)

## Support

For issues or questions:
1. Check logs: `sudo journalctl -u besachain-op-node -f`
2. Run health check: `./scripts/health-check.sh`
3. Review configuration: `cat /data/besachain-op-node/config/rollup.json`
