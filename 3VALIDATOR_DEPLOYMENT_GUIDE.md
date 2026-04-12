# 3-Validator Parlia Deployment Guide

**Status:** Ready to deploy when V2 and V3 instances are available

---

## Prerequisites

- V1: 54.235.85.175 (already running)
- V2: 44.223.91.64 (respun, needs setup)
- V3: 3.84.251.178 (respun, needs setup)
- Genesis file: `/Users/senton/besachain/genesis/testnet-l1-14440-3validators.json`
- Binary: `/tmp/besachain-geth-optimized-v2` (or latest with Parlia support)

---

## Step 1: Prepare V1 for 3-Validator Mode

On V1 (54.235.85.175):

```bash
# Stop the current instance
systemctl stop besachain-l1

# Backup current data
mv /data/besachain-l1 /data/besachain-l1-backup-$(date +%s)

# Create fresh datadir
mkdir -p /data/besachain-l1/keystore
mkdir -p /data/besachain-l1/geth

# Copy the 3-validator genesis
scp /Users/senton/besachain/genesis/testnet-l1-14440-3validators.json \
    ec2-user@54.235.85.175:/tmp/genesis.json

# Initialize V1 with 3-validator genesis
ssh ec2-user@54.235.85.175 << 'EOF'
/tmp/besachain-geth-optimized-v2 \
  --datadir /data/besachain-l1 \
  init /tmp/genesis.json

# Import validator key (V1)
# Ensure password.txt exists
echo "password" > /data/besachain-l1/password.txt
chmod 600 /data/besachain-l1/password.txt

# Copy keystore (if you have the key)
# For now, V1 will generate its own key on first start
EOF

# Start V1 WITHOUT mining first (let it build blocks)
# Edit /etc/systemd/system/besachain-l1.service:
# Remove or comment out: --mine flag

systemctl daemon-reload
systemctl start besachain-l1

# Wait for it to build blocks 1-10
sleep 30

# Get the current block number
curl -s http://localhost:1444 -X POST \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  | jq '.result' | xargs -I {} printf '%d\n' {}

# Once V1 is stable at block 10+, enable mining
# Edit service file and add: --mine flag
# Then restart
systemctl restart besachain-l1
```

---

## Step 2: Prepare V2 and V3

For both V2 (44.223.91.64) and V3 (3.84.251.178):

```bash
# On each validator node:

# 1. Create directories
mkdir -p /data/besachain-l1/keystore
mkdir -p /data/besachain-l1/geth

# 2. Copy genesis and initialize
scp /Users/senton/besachain/genesis/testnet-l1-14440-3validators.json \
    ec2-user@<IP>:/tmp/genesis.json

ssh ec2-user@<IP> << 'EOF'
/tmp/besachain-geth-optimized-v2 \
  --datadir /data/besachain-l1 \
  init /tmp/genesis.json

# Create password file
echo "password" > /data/besachain-l1/password.txt
chmod 600 /data/besachain-l1/password.txt
EOF

# 3. Create config.toml with static peers pointing to V1
cat > config.toml << 'EOF'
[Node]
DataDir = "/data/besachain-l1"
NoUseDNS = false
StaticNodes = ["enode://V1_PUBKEY@54.235.85.175:31444"]

[Eth]
NetworkId = 14440
SyncMode = "full"
NoPruning = false
EOF

scp config.toml ec2-user@<IP>:/data/besachain-l1/config.toml

# 4. Start V2/V3 WITHOUT --mine flag (sync first)
ssh ec2-user@<IP> << 'EOF'
/tmp/besachain-geth-optimized-v2 \
  --datadir /data/besachain-l1 \
  --networkid 14440 \
  --port 31444 \
  --http --http.addr 0.0.0.0 --http.port 1444 \
  --http.api eth,net,web3,txpool,parlia,debug,admin,miner \
  --unlock 0x<VALIDATOR_ADDRESS> \
  --password /data/besachain-l1/password.txt \
  --allow-insecure-unlock \
  --miner.gaslimit 300000000 \
  --cache 8192 \
  --verbosity 3 \
  &
EOF

# 5. Monitor sync progress
# Should sync from V1 within 10-30 seconds
# Check: curl -s http://localhost:1444 -X POST \
#   -H 'Content-Type: application/json' \
#   -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
#   | jq '.result'

# 6. Once synced, restart with --mine flag
pkill -f "geth.*besachain"
sleep 2

/tmp/besachain-geth-optimized-v2 \
  --datadir /data/besachain-l1 \
  --networkid 14440 \
  --port 31444 \
  --http --http.addr 0.0.0.0 --http.port 1444 \
  --http.api eth,net,web3,txpool,parlia,debug,admin,miner \
  --mine \
  --miner.etherbase 0x<VALIDATOR_ADDRESS> \
  --unlock 0x<VALIDATOR_ADDRESS> \
  --password /data/besachain-l1/password.txt \
  --allow-insecure-unlock \
  --miner.gaslimit 300000000 \
  --cache 8192 \
  --verbosity 3 &
EOF
```

---

## Step 3: Verify Consensus

Once all three are running with `--mine`:

```bash
# On V1
curl -s http://localhost:1444 -X POST \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"parlia_getValidators","params":["latest"],"id":1}' \
  | jq '.result'

# Expected output:
# [
#   "0x07ea646728edbfaf665d1884894f53c2be2dd609",
#   "0x3e3084b8577bec36b6d85233b4bb7e507449b6b3",
#   "0x91b14de6832ecc6dc6e0506f89e0d3f6de6605c0"
# ]

# Check block production on all three
# Should see block height increasing at ~1 block per 3-4 seconds (3 validators taking turns)
for ip in 54.235.85.175 44.223.91.64 3.84.251.178; do
  echo "V$i:"
  curl -s http://$ip:1444 -X POST \
    -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
    | jq '.result' | xargs -I {} printf '%d\n' {}
done
```

---

## Step 4: Load Test

Once consensus is working:

```bash
# Copy the improved flood tool to V1
scp /tmp/flood-batch ec2-user@54.235.85.175:/tmp/flood-batch

# Run a load test
ssh ec2-user@54.235.85.175 /tmp/flood-batch \
  http://localhost:1444 500 100 14440 300 50
```

Expected results with 3 validators:
- Submit rate: 2,400-2,500 TX/s (same as single validator)
- On-chain TPS: 1,200-2,000 (higher due to 3× validators producing blocks)
- Block time: ~250-350ms per validator
- No consensus failures (blocks match across all 3 nodes)

---

## Troubleshooting

### V2/V3 not syncing from V1
- Check StaticNodes config points to correct V1 enode URL
- Ensure V1 P2P port 31444 is open to V2/V3
- Check firewall rules on each instance

### Validators not producing blocks
- Verify `parlia_getValidators` returns all 3
- Check that `--mine --unlock --miner.etherbase` are set
- Look for "sealed new block" logs in Geth output

### Different block heights across validators
- Normal during sync phase
- Once synced, should converge within 1 block
- If divergence persists, restart consensus: stop all, re-init, restart V1 first, then V2/V3

### RPC request failures
- Ensure `--http.api parlia,debug,admin` are in flags
- Check that `--http` is enabled
- Verify port 1444 is accessible

---

## Validator Addresses

Replace `<VALIDATOR_ADDRESS>` with:
- V1: `0x07eA646728edbFaf665d1884894F53C2bE2dD609`
- V2: `0x3e3084b8577bec36B6d85233b4bB7e507449B6B3`
- V3: `0x91b14DE6832Ecc6dc6e0506F89e0d3f6DE6605C0`

---

## Files Reference

- Genesis: `/Users/senton/besachain/genesis/testnet-l1-14440-3validators.json`
- Binary: `/tmp/besachain-geth-optimized-v2` (or fetch from S3)
- Load test tool: `/tmp/flood-batch`

---

**End of Guide**
