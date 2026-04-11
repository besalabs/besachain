# BesaChain L1 Genesis Deployment Instructions

## Overview
The system contracts have been fixed and the genesis file is ready for deployment to all 3 validators (V1, V2, V3).

## Genesis File
- **Location:** `/Users/senton/besachain/genesis/testnet-l1-14440.json`
- **Status:** ✓ Ready for deployment
- **Size:** 386 KB
- **Chain ID:** 14440
- **Validated:** All 17 system contracts present and callable

## Pre-Deployment Checklist

### V1 (54.235.85.175)
- [x] Genesis initialized and tested
- [x] Block 1 sealed successfully
- [x] eth_getCode(ValidatorSet) returns bytecode
- [x] No system contract errors in logs

### V2 (eu-central-1) - Ready
- [ ] Backup current datadir
- [ ] Copy new genesis
- [ ] Stop validator
- [ ] Re-init: `geth init --datadir /data/besachain-l1 <new-genesis>`
- [ ] Preserve nodekey and keystore
- [ ] Restart validator
- [ ] Verify block generation

### V3 (us-east-1) - Ready
- [ ] Backup current datadir
- [ ] Copy new genesis
- [ ] Stop validator
- [ ] Re-init: `geth init --datadir /data/besachain-l1 <new-genesis>`
- [ ] Preserve nodekey and keystore
- [ ] Restart validator
- [ ] Verify block generation

## Deployment Procedure for V2 and V3

### Step 1: Copy Genesis File
```bash
# From local machine
scp -i ~/.ssh/libyachain-validators.pem \
  /Users/senton/besachain/genesis/testnet-l1-14440.json \
  ec2-user@<V2-IP>:/tmp/genesis-new.json
```

### Step 2: Backup Data
```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<V2-IP> << 'SSHEOF'
mkdir -p /data/besachain-backup-$(date +%s)
cp -r /data/besachain-l1 /data/besachain-backup-$(date +%s)/
ls -la /data/besachain-backup-*
SSHEOF
```

### Step 3: Stop Validator
```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<V2-IP> << 'SSHEOF'
sudo killall besachain-geth
sleep 2
ps aux | grep besachain-geth | grep -v grep || echo "✓ Validator stopped"
SSHEOF
```

### Step 4: Preserve Critical Files
```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<V2-IP> << 'SSHEOF'
# Save nodekey and keystore
mkdir -p /tmp/besachain-preserve
cp -r /data/besachain-l1/geth/nodekey /tmp/besachain-preserve/ 2>/dev/null || true
cp -r /data/besachain-l1/keystore /tmp/besachain-preserve/ 2>/dev/null || true
SSHEOF
```

### Step 5: Re-initialize with New Genesis
```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<V2-IP> << 'SSHEOF'
# Remove old chaindata
rm -rf /data/besachain-l1/geth/chaindata
rm -rf /data/besachain-l1/geth/triedb

# Initialize with new genesis
/usr/local/bin/besachain-geth init --datadir /data/besachain-l1 /tmp/genesis-new.json

# Verify
tail -10 /data/besachain-l1/geth.log
SSHEOF
```

### Step 6: Restore Critical Files
```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<V2-IP> << 'SSHEOF'
# Restore nodekey
mkdir -p /data/besachain-l1/geth
cp /tmp/besachain-preserve/nodekey /data/besachain-l1/geth/ 2>/dev/null || true

# Restore keystore
cp -r /tmp/besachain-preserve/keystore /data/besachain-l1/ 2>/dev/null || true

ls -la /data/besachain-l1/geth/nodekey
ls -la /data/besachain-l1/keystore/ | head -3
SSHEOF
```

### Step 7: Restart Validator
```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<V2-IP> << 'SSHEOF'
nohup /usr/local/bin/besachain-geth \
  --datadir /data/besachain-l1 \
  --networkid 14440 \
  --port 31444 \
  --nodiscover \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 1444 \
  --http.api eth,net,web3,txpool,parlia,debug,admin,miner \
  --mine \
  --miner.etherbase <VALIDATOR-ADDRESS> \
  --unlock <VALIDATOR-ADDRESS> \
  --password /data/besachain-l1/password.txt \
  --allow-insecure-unlock \
  --nat extip:<EXTERNAL-IP> \
  --verbosity 3 > /data/besachain-l1/geth.log 2>&1 &

sleep 3
curl -s http://localhost:1444 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
SSHEOF
```

### Step 8: Monitor Logs
```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<V2-IP> << 'SSHEOF'
tail -f /data/besachain-l1/geth.log | grep -E "Successfully seal|ERROR|unauthorized"
SSHEOF
```

## Epoch Boundary Testing

### What to Watch For
After deployment, monitor the logs as the chain approaches block 200 (first epoch boundary):

```bash
# Monitor block progress
watch 'curl -s http://localhost:1444 -X POST -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}" | jq .result'

# Monitor for errors at epoch 200
tail -f /data/besachain-l1/geth.log | grep -E "200|unauthorized|ERROR|ABI"
```

### Success Criteria
At block 200:
- [ ] No "unauthorized validator" errors
- [ ] No "ABI" errors
- [ ] No panics or crashes
- [ ] Block 200 seals successfully
- [ ] Chain continues to block 201+
- [ ] Repeat at block 400 (epoch 2)

## Rollback Procedure
If issues occur:

```bash
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@<V2-IP> << 'SSHEOF'
# Stop validator
sudo killall besachain-geth

# Restore from backup
BACKUP=$(ls -t /data/besachain-backup-* | head -1)
rm -rf /data/besachain-l1
cp -r $BACKUP/besachain-l1 /data/

# Restart
nohup /usr/local/bin/besachain-geth [ORIGINAL FLAGS] > /data/besachain-l1/geth.log 2>&1 &
SSHEOF
```

## Validation Commands

### Check Genesis Hash
```bash
python3 -c "
import json
with open('/Users/senton/besachain/genesis/testnet-l1-14440.json') as f:
    g = json.load(f)
print('Chain ID:', g['config']['chainId'])
print('Gas Limit:', int(g['gasLimit'], 16))
print('Alloc entries:', len(g['alloc']))
print('System contracts:', sum(1 for a in g['alloc'] if a.startswith('0x0000')))
"
```

### Check Contract Deployment
```bash
curl -s http://localhost:1444 -X POST -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getCode",
    "params": ["0x0000000000000000000000000000000000001000", "latest"],
    "id": 1
  }' | jq '.result | length'
# Should return a large number (28780 bytes = hex string of ~57560 chars)
```

### Call ValidatorSet
```bash
curl -s http://localhost:1444 -X POST -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_call",
    "params": [{
      "to": "0x0000000000000000000000000000000000001000",
      "data": "0x6e47b482"
    }, "latest"],
    "id": 1
  }' | jq '.result'
# Should return validator addresses encoded in response
```

## Files
- **Genesis:** `/Users/senton/besachain/genesis/testnet-l1-14440.json`
- **Backup:** `/Users/senton/besachain/genesis/testnet-l1-14440-with-systems.json`
- **Docs:** `/Users/senton/besachain/SYSTEM_CONTRACTS_FIX.md`
- **Script:** `/tmp/generate_besachain_genesis.py` (for regeneration if needed)

## Support
System contracts extracted from official BSC testnet genesis.
All bytecode identical to production BSC deployments.
No custom modifications.
