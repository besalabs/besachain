#!/bin/bash
# Deploy BesaChain L1 (chain 1444) and L2 (chain 1445) on same instance as LibyaChain

set -e

INSTANCE_IP="${1:-54.235.85.175}"
AWS_KEY="${2:-$HOME/.ssh/libyachain-validators.pem}"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=30"

echo "=== Deploying BesaChain L1 (1444) and L2 (1445) ==="
echo "Instance: $INSTANCE_IP"
echo ""

# Create remote deployment script
REMOTE_SCRIPT=$(cat << 'REMOTESCRIPT'
#!/bin/bash
set -e

BESA_L1_DIR="/data/besachain-l1"
BESA_L2_DIR="/data/besachain-l2"
BESA_USER="besachain"

echo "[1/6] Creating directories..."
useradd -r -s /bin/false $BESA_USER 2>/dev/null || true
mkdir -p $BESA_L1_DIR/{data,config,keystore,logs}
mkdir -p $BESA_L2_DIR/{data,config,keystore,logs}
chown -R $BESA_USER:$BESA_USER $BESA_L1_DIR $BESA_L2_DIR

echo "[2/6] Copying geth binary..."
if [ ! -f "/usr/local/bin/besachain-geth" ]; then
    cp /usr/local/bin/opbnb-geth /usr/local/bin/besachain-geth
    chmod +x /usr/local/bin/besachain-geth
fi

echo "[3/6] Creating L1 genesis (Chain ID 1444)..."
cat > $BESA_L1_DIR/config/genesis.json << 'GENESIS1'
{
  "config": {
    "chainId": 1444,
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
    "terminalTotalDifficulty": 0,
    "terminalTotalDifficultyPassed": true,
    "parlia": { "period": 3, "epoch": 200 }
  },
  "nonce": "0x0",
  "timestamp": "0x0",
  "extraData": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "gasLimit": "0x2625a00",
  "difficulty": "0x1",
  "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "alloc": {
    "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604": { "balance": "0x21e19e0c9bab2400000" },
    "0x092348669317c86bDF553314AD703a36686f0e3f": { "balance": "0x3635c9adc5dea00000" },
    "0x9308a7d9Ee8FE1DF6031E011C1Ec9f6A63eD5bdA": { "balance": "0x3635c9adc5dea00000" },
    "0xB1d5575B0C4062CAD0A2bD7D522e78CB40d960Cb": { "balance": "0x3635c9adc5dea00000" },
    "0x45Fb504aB558E2DAe87E548Cd5CF58D0804735A5": { "balance": "0x3635c9adc5dea00000" },
    "0x3698691CD29E98882CEca20e8Db5C6c7Eff5f2B5": { "balance": "0x3635c9adc5dea00000" },
    "0x38D853c7F90c795348E14034370d00EEeaABf23a": { "balance": "0x10f0cf064dd59200000" },
    "0xd65B4C4C0F917669453FDA6c2d7f9C8DBAc6E21b": { "balance": "0xa968163f0a57b400000" },
    "0x70b1753FA12Fd5CBbbd56BeedEE93D03c11fDB02": { "balance": "0x6c6b935b8bbd400000" },
    "0x6F7F100D827c77C0bDefd96BddBd8d796501cCFe": { "balance": "0x3635c9adc5dea00000" },
    "0xbFB15d27Ad32D68B4370A8f8fAD8886bC999eb77": { "balance": "0x21e19e0c9bab2400000" },
    "0xc9CDFb63Ed486459d6316Ef8210C5Cb1AaB5a905": { "balance": "0x21e19e0c9bab2400000" },
    "0xd69b880498Ce44B959E0e33680027F99f2F31798": { "balance": "0x21e19e0c9bab2400000" }
  },
  "number": "0x0",
  "gasUsed": "0x0",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
GENESIS1

echo "[4/6] Creating L2 genesis (Chain ID 1445)..."
cat > $BESA_L2_DIR/config/genesis.json << 'GENESIS2'
{
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
    "terminalTotalDifficultyPassed": true,
    "optimism": { "eip1559Elasticity": 6, "eip1559Denominator": 50 }
  },
  "nonce": "0x0",
  "timestamp": "0x0",
  "extraData": "0x42455341434841494e4c32",
  "gasLimit": "0x5f5e100",
  "difficulty": "0x0",
  "alloc": {
    "0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604": { "balance": "0x21e19e0c9bab2400000" },
    "0x092348669317c86bDF553314AD703a36686f0e3f": { "balance": "0x3635c9adc5dea00000" },
    "0x9308a7d9Ee8FE1DF6031E011C1Ec9f6A63eD5bdA": { "balance": "0x3635c9adc5dea00000" },
    "0xB1d5575B0C4062CAD0A2bD7D522e78CB40d960Cb": { "balance": "0x3635c9adc5dea00000" },
    "0x45Fb504aB558E2DAe87E548Cd5CF58D0804735A5": { "balance": "0x3635c9adc5dea00000" },
    "0x3698691CD29E98882CEca20e8Db5C6c7Eff5f2B5": { "balance": "0x3635c9adc5dea00000" },
    "0x38D853c7F90c795348E14034370d00EEeaABf23a": { "balance": "0x10f0cf064dd59200000" },
    "0xd65B4C4C0F917669453FDA6c2d7f9C8DBAc6E21b": { "balance": "0xa968163f0a57b400000" },
    "0x70b1753FA12Fd5CBbbd56BeedEE93D03c11fDB02": { "balance": "0x6c6b935b8bbd400000" },
    "0x6F7F100D827c77C0bDefd96BddBd8d796501cCFe": { "balance": "0x3635c9adc5dea00000" },
    "0xbFB15d27Ad32D68B4370A8f8fAD8886bC999eb77": { "balance": "0x21e19e0c9bab2400000" },
    "0xc9CDFb63Ed486459d6316Ef8210C5Cb1AaB5a905": { "balance": "0x21e19e0c9bab2400000" },
    "0xd69b880498Ce44B959E0e33680027F99f2F31798": { "balance": "0x21e19e0c9bab2400000" }
  },
  "number": "0x0",
  "gasUsed": "0x0",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "baseFeePerGas": "0x0"
}
GENESIS2

echo "[5/6] Initializing chains..."
rm -rf $BESA_L1_DIR/data/* $BESA_L2_DIR/data/*
sudo -u $BESA_USER /usr/local/bin/besachain-geth --datadir $BESA_L1_DIR/data init $BESA_L1_DIR/config/genesis.json
sudo -u $BESA_USER /usr/local/bin/besachain-geth --datadir $BESA_L2_DIR/data init $BESA_L2_DIR/config/genesis.json

echo "[6/6] Creating systemd services..."

# L1 Service (Port 1444)
cat > /etc/systemd/system/besachain-l1.service << 'SERVICE1'
[Unit]
Description=BesaChain L1 (Chain 1444)
After=network.target

[Service]
Type=simple
User=besachain
Group=besachain
WorkingDirectory=/data/besachain-l1
ExecStart=/usr/local/bin/besachain-geth \
    --datadir /data/besachain-l1/data \
    --port 31444 \
    --http --http.addr 0.0.0.0 --http.port 1444 \
    --http.api eth,net,web3,txpool,parlia,admin \
    --http.corsdomain "*" --http.vhosts "*" \
    --ws --ws.addr 0.0.0.0 --ws.port 14444 \
    --ws.api eth,net,web3 --ws.origins "*" \
    --metrics --metrics.addr 0.0.0.0 --metrics.port 14440 \
    --authrpc.port 14441 \
    --networkid 1444 --syncmode full --maxpeers 50 \
    --mine --vote --miner.etherbase 0xbFB15d27Ad32D68B4370A8f8fAD8886bC999eb77 \
    --unlock 0xbFB15d27Ad32D68B4370A8f8fAD8886bC999eb77 \
    --password /data/besachain-l1/config/password.txt \
    --allow-insecure-unlock \
    --keystore /data/besachain-l1/keystore \
    --nat=extip:54.235.85.175
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE1

# L2 Service (Port 1445)
cat > /etc/systemd/system/besachain-l2.service << 'SERVICE2'
[Unit]
Description=BesaChain L2 (Chain 1445)
After=network.target besachain-l1.service

[Service]
Type=simple
User=besachain
Group=besachain
WorkingDirectory=/data/besachain-l2
ExecStart=/usr/local/bin/besachain-geth \
    --datadir /data/besachain-l2/data \
    --port 31445 \
    --http --http.addr 0.0.0.0 --http.port 1445 \
    --http.api eth,net,web3,txpool,debug \
    --http.corsdomain "*" --http.vhosts "*" \
    --ws --ws.addr 0.0.0.0 --ws.port 14445 \
    --ws.api eth,net,web3 --ws.origins "*" \
    --metrics --metrics.addr 0.0.0.0 --metrics.port 14450 \
    --authrpc.port 14451 \
    --networkid 1445 --syncmode full --gcmode archive \
    --nodiscover --maxpeers 0 \
    --rollup.sequencerhttp http://localhost:1444 \
    --nat=extip:54.235.85.175
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE2

# Create password file
echo "besachain123" > /data/besachain-l1/config/password.txt
chown besachain:besachain /data/besachain-l1/config/password.txt
chmod 600 /data/besachain-l1/config/password.txt

systemctl daemon-reload
echo "Services created. Ready to start."
REMOTESCRIPT
)

echo "Uploading deployment script..."
echo "$REMOTE_SCRIPT" | ssh -i "$AWS_KEY" $SSH_OPTS ec2-user@"$INSTANCE_IP" "cat > /tmp/deploy_besa.sh && chmod +x /tmp/deploy_besa.sh"

echo "Running deployment on instance..."
ssh -i "$AWS_KEY" $SSH_OPTS ec2-user@"$INSTANCE_IP" "sudo bash /tmp/deploy_besa.sh"

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "L1 Chain ID: 1444"
echo "L2 Chain ID: 1445"
echo ""
echo "To start services:"
echo "  ssh -i $AWS_KEY ec2-user@$INSTANCE_IP"
echo "  sudo systemctl start besachain-l1"
echo "  sudo systemctl start besachain-l2"
echo ""
echo "L1 RPC: http://$INSTANCE_IP:1444"
echo "L2 RPC: http://$INSTANCE_IP:1445"
