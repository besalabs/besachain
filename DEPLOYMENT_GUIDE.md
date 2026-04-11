# BesaChain Full Deployment Guide - 450ms L1 + 250ms L2

## Current Status

The server is temporarily unreachable due to the contract build process consuming resources. When it recovers, follow this guide to complete the deployment.

## Prerequisites

When the server is back online:
```bash
# Check server status
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175 "uptime"
```

## Part 1: L1 Configuration (450ms) ✅ Already Done

L1 is already configured with 450ms block time using:
```json
"parlia": { "period": 0.45, "epoch": 200 }
```

Verify L1 is running:
```bash
sudo systemctl status besachain-l1
curl -s -X POST http://localhost:1444 -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## Part 2: L2 250ms Deployment

### Option A: Quick Deploy (When Server Recovers)

Upload and run the prepared script:
```bash
# From local machine
scp -i ~/.ssh/libyachain-validators.pem \
  deploy-250ms-l2.sh \
  ec2-user@54.235.85.175:/tmp/

# SSH and run
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175
chmod +x /tmp/deploy-250ms-l2.sh
sudo /tmp/deploy-250ms-l2.sh
```

### Option B: Manual Step-by-Step

If the script fails, follow these steps:

#### Step 1: Install Dependencies

```bash
# Ensure Go is installed
go version || (wget https://go.dev/dl/go1.21.6.linux-arm64.tar.gz && \
  sudo tar -C /usr/local -xzf go1.21.6.linux-arm64.tar.gz)
export PATH=$PATH:/usr/local/go/bin

# Ensure Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
node --version
```

#### Step 2: Build op-geth (with 250ms support)

```bash
# Clone bnb-chain op-geth
git clone --depth 1 --branch v0.5.9 https://github.com/bnb-chain/op-geth.git /data/op-geth
cd /data/op-geth

# Build
make geth

# Install
sudo cp build/bin/geth /usr/local/bin/besachain-op-geth
sudo chmod +x /usr/local/bin/besachain-op-geth
```

#### Step 3: Build op-node (with 250ms support)

```bash
# Clone bnb-chain opbnb
git clone --depth 1 --branch v0.5.5 https://github.com/bnb-chain/opbnb.git /data/opbnb
cd /data/opbnb

# Build op-node
make op-node
sudo cp op-node/bin/op-node /usr/local/bin/besachain-op-node

# Build op-batcher
make op-batcher
sudo cp op-batcher/bin/op-batcher /usr/local/bin/besachain-op-batcher

# Build op-proposer
make op-proposer
sudo cp op-proposer/bin/op-proposer /usr/local/bin/besachain-op-proposer
```

#### Step 4: Configure L2 Genesis

```bash
# Create genesis with millisecond support
sudo python3 << 'PYEOF'
import json
import time

genesis = {
    "config": {
        "chainId": 1445,
        "homesteadBlock": 0,
        "eip150Block": 0,
        "eip155Block": 0,
        "eip158Block": 0,
        "byzantiumBlock": 0,
        "constantinopleBlock": 0,
        "petersburgBlock": 0,
        "istanbulBlock": 0,
        "muirGlacierBlock": 0,
        "berlinBlock": 0,
        "londonBlock": 0,
        "mergeNetsplitBlock": 0,
        "bedrockBlock": 0,
        "terminalTotalDifficulty": 0,
        "terminalTotalDifficultyPassed": True,
        "optimism": {
            "eip1559Elasticity": 2,
            "eip1559Denominator": 8
        }
    },
    "nonce": "0x0",
    "timestamp": hex(int(time.time())),
    "extraData": "0x42455341434841494e4c32203530306d73",
    "gasLimit": "0x5f5e100",
    "difficulty": "0x0",
    "alloc": {
        "0x7447651c2c66E93356F22c40101ea629a03AE6f2": {
            "balance": "0x21e19e0c9bab2400000"
        }
    },
    "number": "0x0",
    "gasUsed": "0x0",
    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "baseFeePerGas": "0x0"
}

with open('/data/besachain-l2/config/genesis.json', 'w') as f:
    json.dump(genesis, f, indent=2)
PYEOF

# Initialize
sudo rm -rf /data/besachain-l2/data/*
sudo -u besachain /usr/local/bin/besachain-op-geth init \
    --datadir /data/besachain-l2/data \
    /data/besachain-l2/config/genesis.json
```

#### Step 5: Create Rollup Config (250ms)

```bash
# Get genesis hashes
L1_HASH=$(curl -s -X POST http://localhost:1444 -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x0",false],"id":1}' | \
    python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["hash"])')

L2_HASH=$(curl -s -X POST http://localhost:1445 -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x0",false],"id":1}' | \
    python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["hash"])')

L2_TIME=$(curl -s -X POST http://localhost:1445 -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x0",false],"id":1}' | \
    python3 -c 'import json,sys; print(int(json.load(sys.stdin)["result"]["timestamp"], 16))')

# Create rollup.json with 250ms block time
sudo python3 << PYEOF
import json

rollup = {
    "genesis": {
        "l1": {"hash": "$L1_HASH", "number": 0},
        "l2": {"hash": "$L2_HASH", "number": 0},
        "l2_time": $L2_TIME,
        "system_config": {
            "batcherAddr": "0x7447651c2c66E93356F22c40101ea629a03AE6f2",
            "overhead": "0x0",
            "scalar": "0xf4240",
            "gasLimit": 100000000,
            "baseFeeScalar": 0,
            "blobBaseFeeScalar": 0
        }
    },
    "block_time": 250,  # 250 milliseconds!
    "max_sequencer_drift": 1200,
    "seq_window_size": 7200,
    "channel_timeout": 600,
    "l1_chain_id": 1444,
    "l2_chain_id": 1445,
    "regolith_time": 0,
    "canyon_time": 0,
    "delta_time": 0,
    "ecotone_time": 0,
    "fjord_time": 0,
    "fourier_time": 0,  # Enable 250ms
    "batch_inbox_address": "0xff00000000000000000000000000000000001445",
    "deposit_contract_address": "0x0000000000000000000000000000000000000000",
    "l1_system_config_address": "0x0000000000000000000000000000000000000000",
    "protocol_versions_address": "0x0000000000000000000000000000000000000000"
}

with open('/data/besachain-l2/config/rollup.json', 'w') as f:
    json.dump(rollup, f, indent=2)
PYEOF
```

#### Step 6: Create Systemd Services

```bash
# op-geth service
sudo tee /etc/systemd/system/besachain-l2-geth.service << 'EOF'
[Unit]
Description=BesaChain L2 Execution (250ms)
After=network.target

[Service]
Type=simple
User=besachain
ExecStart=/usr/local/bin/besachain-op-geth \
  --datadir /data/besachain-l2/data \
  --http --http.addr 0.0.0.0 --http.port 1445 \
  --http.api eth,net,web3,txpool,debug \
  --http.corsdomain "*" --http.vhosts "*" \
  --authrpc.addr 0.0.0.0 --authrpc.port 14451 \
  --authrpc.jwtsecret /data/besachain-l2/secret/jwt-secret.txt \
  --networkid 1445 --syncmode full --gcmode archive
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# op-node service
sudo tee /etc/systemd/system/besachain-l2-node.service << 'EOF'
[Unit]
Description=BesaChain L2 Node (250ms)
After=besachain-l2-geth.service

[Service]
Type=simple
User=besachain
ExecStart=/usr/local/bin/besachain-op-node \
  --l1 http://localhost:1444 \
  --l2 http://localhost:14451 \
  --l2.jwt-secret /data/besachain-l2/secret/jwt-secret.txt \
  --rollup.config /data/besachain-l2/config/rollup.json \
  --sequencer.enabled \
  --sequencer.l1-confs 1 \
  --rpc.addr 0.0.0.0 --rpc.port 18545 \
  --l1.epoch-poll-interval 375ms
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable besachain-l2-geth besachain-l2-node
sudo systemctl start besachain-l2-geth
sleep 5
sudo systemctl start besachain-l2-node
```

#### Step 7: Verify

```bash
# Check L2 block production
curl -s -X POST http://localhost:1445 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check service logs
sudo journalctl -u besachain-l2-node -f
```

## Expected Results

After deployment:
- **L1 (Chain 1444)**: 450ms block time
- **L2 (Chain 1445)**: 250ms block time
- **Throughput**: 4000+ TPS on L2

## Troubleshooting

### If server doesn't recover
The server may need a reboot from AWS console if it's completely frozen.

### If build fails
Try building with limited parallelism:
```bash
make geth -j2  # Only 2 parallel jobs
```

### If L2 doesn't produce blocks
Check JWT secret is the same for both op-geth and op-node.

## Resources

- Scripts: `deploy-250ms-l2.sh`, `deploy-op-stack.sh`
- Documentation: `250MS_IMPLEMENTATION_SUMMARY.md`
- Server: 54.235.85.175 (ec2-user)
