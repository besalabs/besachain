# BesaChain Deployment Guide

This directory contains systemd service files and deployment scripts for BesaChain L1 (3-validator Parlia) and L2 (OP Stack with single sequencer on V1).

## Architecture Overview

- **L1 (Chain 14440):** 3 validators using Parlia consensus
  - V1: 54.235.85.175 (t3.2xlarge, 8 vCPU, 32GB) - Validator + L2 Sequencer
  - V2: 44.223.91.64 (t3.xlarge, 4 vCPU, 16GB) - Validator
  - V3: 3.84.251.178 (t3.large, 2 vCPU, 8GB) - Validator

- **L2 (Chain 19120):** OP Stack rollup with single sequencer on V1
  - Execution: op-geth (besachain-l2-geth)
  - Consensus: op-node (besachain-op-node)

## Prerequisites

1. **Local environment:**
   - Go 1.21+ installed
   - SSH access configured: `~/.ssh/libyachain-validators.pem`
   - SSH user: `ec2-user`

2. **Source directories:**
   - `/Users/senton/besachain/bsc` - BSC source
   - `/Users/senton/besachain/opbnb-geth` - op-geth source
   - `/Users/senton/besachain/opbnb` - op-node source
   - `/Users/senton/besachain/genesis/testnet-l1-14440.json` - L1 genesis
   - `/Users/senton/besachain/genesis/testnet-l2-19120.json` - L2 genesis (optional)
   - `/Users/senton/besachain/genesis/rollup.json` - L2 rollup config (optional)

3. **Validator addresses:**
   - Copy `validators.conf.template` to `validators.conf`
   - Fill in validator addresses that match your genesis file

## Quick Start

### 1. Configure Validators

```bash
cp deploy/validators.conf.template deploy/validators.conf
# Edit deploy/validators.conf with actual validator addresses
```

### 2. Deploy to Testnet

```bash
cd /Users/senton/besachain
chmod +x deploy/deploy-testnet.sh deploy/health-check.sh
./deploy/deploy-testnet.sh
```

The script will:
- Cross-compile binaries for linux/amd64
- Stop old services on all validators
- Upload binaries, genesis, and service files
- Initialize the blockchain on each validator
- Start services and verify deployment

**Expected runtime:** ~30-40 minutes (includes cross-compilation)

### 3. Monitor Deployment

In a separate terminal:

```bash
./deploy/health-check.sh 60
```

This checks health every 60 seconds. Options:
- RPC endpoint responsiveness
- Block production (advancing)
- Peer connectivity
- System resources (memory, disk)
- Service status

## Service Files

### besachain-l1.service
- **Deployed to:** All validators (V1, V2, V3)
- **Port:** 1444 (HTTP RPC)
- **Consensus:** Parlia
- **Network ID:** 14440
- **Features:** Mining enabled with validator address (requires unlock at startup)

### besachain-l2-geth.service
- **Deployed to:** V1 only
- **Port:** 1912 (HTTP RPC)
- **Network ID:** 19120
- **Data dir:** `/data/besachain-l2`
- **Dependency:** Starts after besachain-l1.service

### besachain-l2-node.service
- **Deployed to:** V1 only
- **Port:** 19122 (RPC)
- **Role:** OP Stack consensus layer (op-node)
- **Sequencer:** Enabled, listening to L1 via localhost:1444
- **Dependency:** Starts after besachain-l2-geth.service

## File Structure

```
deploy/
├── deploy-testnet.sh          # Main deployment script
├── health-check.sh            # Health monitoring script
├── validators.conf.template   # Validator address template
├── README.md                  # This file
└── systemd/
    ├── besachain-l1.service       # L1 validator service
    ├── besachain-l2-geth.service  # L2 execution (V1 only)
    └── besachain-l2-node.service  # L2 consensus (V1 only)
```

## Manual Operations

### View Logs

```bash
# SSH to validator
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<validator-ip>

# View L1 logs
sudo journalctl -u besachain-l1.service -f

# View L2 logs (V1 only)
sudo journalctl -u besachain-l2-geth.service -f
sudo journalctl -u besachain-l2-node.service -f
```

### Stop Services

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<validator-ip>
sudo systemctl stop besachain-l2-node.service  # L2 node first (V1)
sudo systemctl stop besachain-l2-geth.service  # L2 geth (V1)
sudo systemctl stop besachain-l1.service       # L1 last
```

### Start Services

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<validator-ip>
sudo systemctl start besachain-l1.service
sleep 5
sudo systemctl start besachain-l2-geth.service   # V1 only
sleep 5
sudo systemctl start besachain-l2-node.service   # V1 only
```

### Check Service Status

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<validator-ip>
sudo systemctl status besachain-l1.service
sudo systemctl status besachain-l2-geth.service  # V1 only
sudo systemctl status besachain-l2-node.service  # V1 only
```

### RPC Calls

```bash
# Check block number
curl -X POST http://54.235.85.175:1444 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Get peer count
curl -X POST http://54.235.85.175:1444 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}'

# Get gas price
curl -X POST http://54.235.85.175:1444 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_gasPrice","params":[],"id":1}'
```

## Troubleshooting

### Services fail to start

1. Check service status:
   ```bash
   sudo systemctl status besachain-l1.service
   sudo journalctl -u besachain-l1.service -n 50
   ```

2. Verify binary exists:
   ```bash
   ls -la /usr/local/bin/besachain-geth
   ```

3. Check data directory:
   ```bash
   ls -la /data/besachain-l1/
   ```

### RPC not responding

1. Verify service is running:
   ```bash
   sudo systemctl is-active besachain-l1.service
   ```

2. Check if listening on port:
   ```bash
   netstat -an | grep 1444
   ```

3. Test locally:
   ```bash
   curl http://localhost:1444 -X POST \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

### Block production stalled

1. Check logs for errors:
   ```bash
   sudo journalctl -u besachain-l1.service -f
   ```

2. Verify validator has sufficient gas:
   ```bash
   curl http://localhost:1444 -X POST \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["VALIDATOR_ADDRESS","latest"],"id":1}'
   ```

3. Check peer connectivity:
   ```bash
   curl http://localhost:1444 -X POST \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}'
   ```

### Disk space issues

```bash
# Check disk usage
df -h /data

# If needed, clean old database
sudo systemctl stop besachain-l1.service
sudo rm -rf /data/besachain-l1/geth/chaindata/ancient
sudo systemctl start besachain-l1.service
```

## RPC Endpoints

After successful deployment:

- **L1 V1:** `http://54.235.85.175:1444`
- **L1 V2:** `http://44.223.91.64:1444`
- **L1 V3:** `http://3.84.251.178:1444`
- **L2 (Sequencer, V1 only):** `http://54.235.85.175:1912`
- **L2 OP-Node RPC (V1 only):** `http://54.235.85.175:19122`

## Environment Details

- **Chain ID (L1):** 14440
- **Chain ID (L2):** 19120
- **Consensus (L1):** Parlia PoSA
- **Consensus (L2):** OP Stack (Bedrock)
- **Execution (L2):** op-geth (EVM-compatible)
- **Data directory:** `/data/besachain-l1`, `/data/besachain-l2`
- **Service dir:** `/etc/systemd/system/`
- **Binary dir:** `/usr/local/bin/`

## Security Notes

1. **Validator keys:** Keep private keys secure. The password file is created empty for testing — populate with actual passwords in production.

2. **SSH access:** Limit SSH to authorized IPs only.

3. **RPC exposure:** The HTTP RPC is exposed to `0.0.0.0` for testing. Restrict to trusted networks in production.

4. **Metrics:** Prometheus endpoints are available on ports 14440, 19121, 19123. Secure these in production.

## Support

For issues or questions:
1. Check logs: `sudo journalctl -u besachain-l1.service -f`
2. Verify network connectivity: `ping` the other validators
3. Check RPC availability: Use curl to test endpoints
4. Review health-check output for systemic issues

---

**Last updated:** 2026-04-11
