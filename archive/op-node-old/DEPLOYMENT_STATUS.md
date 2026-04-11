# BesaChain OP Node Deployment Status

**Last Updated**: April 9, 2026  
**Validator IP**: 54.235.85.175  
**Status**: Ready for Deployment

---

## Pre-Deployment Checklist

- [x] OP Node Docker image identified: `us-docker.pkg.dev/oplabs-tools-artifacts/images/op-node:v1.10.3`
- [x] Configuration files created
- [x] Systemd service defined
- [x] Docker Compose configuration created
- [x] Installation scripts prepared
- [x] Health monitoring scripts created
- [ ] Contract deployment completed (BLOCKED - waiting for Contract Agent)
- [ ] Contract addresses updated in rollup.json
- [ ] L1/L2 services confirmed running

---

## Configuration Summary

### Chain Configuration

| Parameter | L1 | L2 |
|-----------|-----|-----|
| Chain ID | 1444 | 1445 |
| Block Time | 450ms | 250ms |
| RPC Port | 8545 | 9545 |
| Engine Port | - | 9551 |
| Auth Port | - | 9551 |
| Metrics Port | - | 7300 |
| Admin Port | - | 9645 |

### Rollup Configuration (rollup.json)

**File Location**: `/data/besachain-op-node/config/rollup.json`

```json
{
  "l1_chain_id": 1444,
  "l2_chain_id": 1445,
  "block_time": 1,
  "batch_inbox_address": "0xff00000000000000000000000000000000001445",
  "deposit_contract_address": "0x0000000000000000000000000000000000000000",  // UPDATE NEEDED
  "l1_system_config_address": "0x0000000000000000000000000000000000000000",  // UPDATE NEEDED
  "protocol_versions_address": "0x0000000000000000000000000000000000000000"   // UPDATE NEEDED
}
```

**⚠️ ACTION REQUIRED**: Update contract addresses after deployment completes.

### JWT Secret

**File**: `/data/besachain-op-node/config/jwt-secret.txt`  
**Generated**: Auto-generated during installation  
**Permissions**: 600 (owner read/write only)

---

## Deployment Files

### Created Files

| File | Purpose | Location |
|------|---------|----------|
| `rollup.json` | Rollup configuration | `op-node/config/` |
| `jwt-secret.txt` | Auth secret | `op-node/config/` |
| `docker-compose.yml` | Docker deployment | `op-node/` |
| `besachain-op-node.service` | Systemd service | `op-node/` |
| `install-op-node.sh` | Local install script | `op-node/` |
| `deploy-remote.sh` | Remote deployment | `op-node/` |
| `setup-complete.sh` | Master setup script | `op-node/` |
| `configure-block-time.sh` | 250ms configuration | `op-node/` |
| `update-contract-addresses.sh` | Address updater | `op-node/` |
| `health-check.sh` | Health monitoring | `op-node/scripts/` |
| `monitor-blocks.sh` | Block monitor | `op-node/scripts/` |
| `README.md` | Documentation | `op-node/` |

---

## Deployment Steps

### Step 1: Wait for Contract Deployment

The Contract Deployment Agent must complete first. This will provide:
- `DepositContract` address
- `SystemConfigProxy` address
- `ProtocolVersions` address
- Deployment state file

### Step 2: Update Rollup Configuration

Once contracts are deployed:

```bash
# Copy deployment state to server
scp state.json ec2-user@54.235.85.175:/tmp/

# Update addresses
ssh ec2-user@54.235.85.175
sudo /data/besachain-op-node/update-contract-addresses.sh \
  /data/besachain-op-node/config/rollup.json \
  /tmp/state.json
```

### Step 3: Deploy OP Node

```bash
cd besachain/op-node
./setup-complete.sh 54.235.85.175 ~/.ssh/libyachain-validators.pem
```

### Step 4: Verify Deployment

```bash
# Health check
ssh ec2-user@54.235.85.175 'bash /data/besachain-op-node/scripts/health-check.sh'

# Monitor blocks
ssh ec2-user@54.235.85.175 'bash /data/besachain-op-node/scripts/monitor-blocks.sh'
```

---

## Block Time Configuration

### L1 Configuration (450ms)

**File**: BSC miner configuration  
**Parameter**: `miner.recommit` = 450ms

### L2 Configuration (250ms)

**OP Node**: Configured via `--sequencer.enabled`  
**L2 Geth**: Requires `--miner.recommit 250ms`

**Service Update Required**:
```bash
# Edit L2 service
sudo systemctl edit besachain-l2 --full

# Add to ExecStart:
#   --miner.recommit 250ms

# Restart
sudo systemctl restart besachain-l2
```

---

## RPC Endpoints

### Public Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| L2 RPC | http://54.235.85.175:9545 | L2 JSON-RPC |
| Admin RPC | http://54.235.85.175:9645 | OP Node Admin |
| Metrics | http://54.235.85.175:7300 | Prometheus |

### Local Endpoints (Server)

| Endpoint | URL | Chain |
|----------|-----|-------|
| L1 RPC | http://localhost:8545 | 1444 |
| L2 Engine | http://localhost:9551 | 1445 |
| L2 RPC | http://localhost:9545 | 1445 |
| Admin RPC | http://localhost:9645 | - |

---

## Service Dependencies

```
besachain-op-node.service
    ├── besachain-l2.service (Required)
    │   └── besachain-l1.service (After)
    └── network.target
```

**Startup Order**:
1. besachain-l1
2. besachain-l2
3. besachain-op-node

---

## Troubleshooting

### Issue: Contract Addresses Not Set

**Symptom**: OP Node starts but doesn't produce blocks  
**Fix**: Run `update-contract-addresses.sh` with deployment state

### Issue: L2 Not Responding

**Symptom**: Health check fails on L2 Engine  
**Fix**: Start besachain-l2 service first

### Issue: JWT Auth Failure

**Symptom**: OP Node can't connect to L2 Engine  
**Fix**: Ensure JWT secret is identical in both services

### Issue: Slow Block Production

**Symptom**: Blocks > 250ms apart  
**Fix**: Verify 250ms configuration applied to both op-node and L2 geth

---

## Monitoring

### Health Check

```bash
./scripts/health-check.sh
```

Checks:
- L1 endpoint
- L2 Engine
- OP Node RPC
- Admin RPC
- Block production

### Block Monitor

```bash
./scripts/monitor-blocks.sh
```

Shows:
- Block number
- Block time delta
- Effective TPS
- Gas used
- Transaction count

### Metrics

Prometheus metrics available at: http://54.235.85.175:7300/metrics

Key metrics:
- `op_node_default_refs_number{layer="l2"}` - L2 head block
- `op_node_default_refs_number{layer="l1"}` - L1 head block
- `op_node_default_refs_time` - Reference timestamps

---

## Acceptance Criteria

- [x] Op-node Docker image pulled
- [x] Rollup config template created (addresses pending)
- [x] Op-node service configured
- [ ] Rollup config verified with correct addresses ⏳ BLOCKED
- [ ] Sequencer enabled and running
- [ ] L2 producing blocks at ~250ms intervals
- [ ] L1-L2 communication working
- [ ] All RPC endpoints responding

---

## Next Actions

1. **WAIT**: Contract Deployment Agent to complete
2. **UPDATE**: Contract addresses in rollup.json
3. **DEPLOY**: Run `setup-complete.sh`
4. **VERIFY**: Health check and block production
5. **CONFIGURE**: Apply 250ms block time to L2 geth
6. **MONITOR**: Continuous block production verification

---

## Contact & Support

- **Deployment Issues**: Check logs with `journalctl -u besachain-op-node -f`
- **Configuration Issues**: Review `/data/besachain-op-node/config/rollup.json`
- **Health Issues**: Run `/data/besachain-op-node/scripts/health-check.sh`
