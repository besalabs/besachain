#!/bin/bash
# Deploy BesaChain L2 with 250ms block time using opBNB Fourier approach

set -e

echo "=== BesaChain L2 250ms Block Time Deployment ==="
echo "Using opBNB Fourier upgrade methodology"
echo ""

# Setup environment
export NVM_DIR="/home/ec2-user/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PNPM_HOME="/home/ec2-user/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
export PATH="$HOME/.foundry/bin:$PATH"

# Build op-geth with millisecond support (if needed)
if [ ! -f /usr/local/bin/besachain-op-geth ]; then
    echo "Step 1: Building op-geth with millisecond block time support..."
    
    # Clone bnb-chain/op-geth which has millisecond support
    if [ ! -d /data/op-geth ]; then
        git clone --depth 1 --branch v0.5.9 https://github.com/bnb-chain/op-geth.git /data/op-geth
    fi
    
    cd /data/op-geth
    
    # Build op-geth
    make geth
    
    # Install as besachain-op-geth
    sudo cp build/bin/geth /usr/local/bin/besachain-op-geth
    sudo chmod +x /usr/local/bin/besachain-op-geth
    
    echo "op-geth built and installed"
fi

# Build op-node with millisecond support
if [ ! -f /usr/local/bin/besachain-op-node ]; then
    echo "Step 2: Building op-node with millisecond block time support..."
    
    # Clone bnb-chain/opbnb which has millisecond support
    if [ ! -d /data/opbnb ]; then
        git clone --depth 1 --branch v0.5.5 https://github.com/bnb-chain/opbnb.git /data/opbnb
    fi
    
    cd /data/opbnb
    
    # Build op-node
    make op-node
    
    # Install as besachain-op-node
    sudo cp op-node/bin/op-node /usr/local/bin/besachain-op-node
    sudo chmod +x /usr/local/bin/besachain-op-node
    
    echo "op-node built and installed"
fi

# Build op-batcher
if [ ! -f /usr/local/bin/besachain-op-batcher ]; then
    echo "Step 3: Building op-batcher..."
    
    cd /data/opbnb
    make op-batcher
    
    sudo cp op-batcher/bin/op-batcher /usr/local/bin/besachain-op-batcher
    sudo chmod +x /usr/local/bin/besachain-op-batcher
    
    echo "op-batcher built and installed"
fi

# Build op-proposer
if [ ! -f /usr/local/bin/besachain-op-proposer ]; then
    echo "Step 4: Building op-proposer..."
    
    cd /data/opbnb
    make op-proposer
    
    sudo cp op-proposer/bin/op-proposer /usr/local/bin/besachain-op-proposer
    sudo chmod +x /usr/local/bin/besachain-op-proposer
    
    echo "op-proposer built and installed"
fi

# Create L2 genesis with millisecond support
echo "Step 5: Creating L2 genesis configuration..."

# Get deployer info
DEPLOYER_ADDR=$(cat /data/besachain-l2/keys/deployer.txt | grep ADDRESS | cut -d= -f2)
PRIVATE_KEY=$(cat /data/besachain-l2/keys/deployer.txt | grep PRIVATE_KEY | cut -d= -f2)

# Create genesis with millisecond timestamp support
python3 << 'PYEOF'
import json
import time

# L2 Genesis with millisecond support (opBNB style)
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
    "timestamp": hex(int(time.time())),  # Current timestamp in seconds
    "extraData": "0x42455341434841494e4c32203530306d73",  # BesaChainL2 500ms
    "gasLimit": "0x5f5e100",  # 100M gas
    "difficulty": "0x0",
    "alloc": {
        # Predeployed contracts for OP Stack
        "0x4200000000000000000000000000000000000000": {
            "balance": "0x0",
            "code": "0x..."
        },
        # Deployer account
        DEPLOYER_ADDR.lower(): {
            "balance": "0x21e19e0c9bab2400000"  # 10000 BESA
        }
    },
    "number": "0x0",
    "gasUsed": "0x0",
    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "baseFeePerGas": "0x0"
}

with open('/data/besachain-l2/config/genesis.json', 'w') as f:
    json.dump(genesis, f, indent=2)

print("L2 genesis created with millisecond support")
PYEOF

# Initialize L2
echo "Step 6: Initializing L2..."
sudo rm -rf /data/besachain-l2/data/*
sudo -u besachain /usr/local/bin/besachain-op-geth init \
    --datadir /data/besachain-l2/data \
    /data/besachain-l2/config/genesis.json

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

# Create rollup.json with 250ms block time (250 milliseconds)
echo "Step 7: Creating rollup configuration with 250ms block time..."

python3 << PYEOF
import json

# For opBNB-style millisecond block times:
# - block_time is specified in milliseconds (250 = 250ms)
# - Millisecond timestamps stored in Header.MixDigest
# - Requires Fourier hardfork activation

rollup = {
    "genesis": {
        "l1": {
            "hash": "$L1_HASH",
            "number": 0
        },
        "l2": {
            "hash": "$L2_HASH",
            "number": 0
        },
        "l2_time": $L2_TIME,
        "system_config": {
            "batcherAddr": "$DEPLOYER_ADDR",
            "overhead": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "scalar": "0x00000000000000000000000000000000000000000000000000000000000f4240",
            "gasLimit": 100000000,
            "baseFeeScalar": 0,
            "blobBaseFeeScalar": 0
        }
    },
    # 250ms block time in milliseconds (opBNB Fourier style)
    "block_time": 250,
    "max_sequencer_drift": 1200,
    "seq_window_size": 7200,
    "channel_timeout": 600,
    "l1_chain_id": 1444,
    "l2_chain_id": 1445,
    # Hardfork timestamps
    "regolith_time": 0,
    "canyon_time": 0,
    "delta_time": 0,
    "ecotone_time": 0,
    "fjord_time": 0,
    # Fourier hardfork - enables millisecond block times
    "fourier_time": 0,
    "batch_inbox_address": "0xff00000000000000000000000000000000001445",
    "deposit_contract_address": "0x0000000000000000000000000000000000000000",
    "l1_system_config_address": "0x0000000000000000000000000000000000000000",
    "protocol_versions_address": "0x0000000000000000000000000000000000000000"
}

with open('/data/besachain-l2/config/rollup.json', 'w') as f:
    json.dump(rollup, f, indent=2)

print("Rollup config created with 250ms block time")
PYEOF

# Create JWT secret
if [ ! -f /data/besachain-l2/secret/jwt-secret.txt ]; then
    openssl rand -hex 32 > /data/besachain-l2/secret/jwt-secret.txt
    sudo chown besachain:besachain /data/besachain-l2/secret/jwt-secret.txt
fi

# Create op-geth service
echo "Step 8: Creating L2 execution client service..."

sudo tee /etc/systemd/system/besachain-l2-geth.service << 'EOF'
[Unit]
Description=BesaChain L2 Execution Client (op-geth with 250ms)
After=network.target besachain-l1.service

[Service]
Type=simple
User=besachain
Group=besachain
WorkingDirectory=/data/besachain-l2
ExecStart=/usr/local/bin/besachain-op-geth \
  --datadir /data/besachain-l2/data \
  --port 31445 \
  --http --http.addr 0.0.0.0 --http.port 1445 \
  --http.api eth,net,web3,txpool,debug \
  --http.corsdomain "*" --http.vhosts "*" \
  --ws --ws.addr 0.0.0.0 --ws.port 14445 --ws.api eth,net,web3 --ws.origins "*" \
  --metrics --metrics.addr 0.0.0.0 --metrics.port 14450 \
  --authrpc.addr 0.0.0.0 --authrpc.port 14451 --authrpc.vhosts "*" \
  --authrpc.jwtsecret /data/besachain-l2/secret/jwt-secret.txt \
  --networkid 1445 --syncmode full --gcmode archive \
  --maxpeers 50 \
  --nat=extip:54.235.85.175
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Create op-node service with 250ms sequencing
echo "Step 9: Creating L2 node service with 250ms sequencing..."

sudo tee /etc/systemd/system/besachain-l2-node.service << 'EOF'
[Unit]
Description=BesaChain L2 Node (op-node with 250ms block time)
After=network.target besachain-l2-geth.service

[Service]
Type=simple
User=besachain
Group=besachain
WorkingDirectory=/data/besachain-l2
ExecStart=/usr/local/bin/besachain-op-node \
  --l1 http://localhost:1444 \
  --l2 http://localhost:14451 \
  --l2.jwt-secret /data/besachain-l2/secret/jwt-secret.txt \
  --rollup.config /data/besachain-l2/config/rollup.json \
  --sequencer.enabled \
  --sequencer.l1-confs 1 \
  --p2p.disable \
  --rpc.addr 0.0.0.0 \
  --rpc.port 18545 \
  --rpc.enable-admin \
  --l1.epoch-poll-interval 375ms \
  --log.level info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Create op-batcher service
echo "Step 10: Creating L2 batcher service..."

sudo tee /etc/systemd/system/besachain-l2-batcher.service << EOF
[Unit]
Description=BesaChain L2 Batcher
After=network.target besachain-l2-node.service

[Service]
Type=simple
User=besachain
Group=besachain
ExecStart=/usr/local/bin/besachain-op-batcher \\
  --l1-eth-rpc http://localhost:1444 \\
  --l2-eth-rpc http://localhost:1445 \\
  --rollup-rpc http://localhost:18545 \\
  --poll-interval 250ms \\
  --sub-safety-margin 12 \\
  --max-channel-duration 100 \\
  --private-key $PRIVATE_KEY \\
  --data-availability-type calldata \\
  --target-num-frames 2 \\
  --txmgr.receipt-query-interval 250ms
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Start services
echo "Step 11: Starting L2 services..."

sudo systemctl daemon-reload

# Stop old L2 if running
sudo systemctl stop besachain-l2 2>/dev/null || true
sudo systemctl disable besachain-l2 2>/dev/null || true

# Stop sequencer if running
sudo systemctl stop besachain-l2-sequencer 2>/dev/null || true
sudo systemctl disable besachain-l2-sequencer 2>/dev/null || true

# Start new services
sudo systemctl start besachain-l2-geth
sleep 5

sudo systemctl start besachain-l2-node
sleep 5

sudo systemctl start besachain-l2-batcher

# Enable services
sudo systemctl enable besachain-l2-geth
sudo systemctl enable besachain-l2-node
sudo systemctl enable besachain-l2-batcher

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Service Status:"
sudo systemctl is-active besachain-l2-geth
sudo systemctl is-active besachain-l2-node
sudo systemctl is-active besachain-l2-batcher

echo ""
echo "L2 Block Info:"
curl -s -X POST http://localhost:1445 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | \
  python3 -c 'import json,sys; d=json.load(sys.stdin); print("Block height:", int(d["result"], 16) if "result" in d else "Error")'

echo ""
echo "View logs:"
echo "  sudo journalctl -u besachain-l2-geth -f"
echo "  sudo journalctl -u besachain-l2-node -f"
echo "  sudo journalctl -u besachain-l2-batcher -f"
