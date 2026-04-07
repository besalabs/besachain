#!/bin/bash
# Setup BesaChain parallel validators on existing LibyaChain instance

INSTANCE_IP="${1:-54.235.85.175}"
AWS_KEY="/Users/senton/.ssh/libyachain-validators.pem"
KEYS_DIR="/Users/senton/besachain/keys"

echo "=== Setting up BesaChain on $INSTANCE_IP ==="

# Create remote setup script
REMOTE_SCRIPT=$(cat << 'EOF'
#!/bin/bash
set -e

BESA_DIR="/data/besachain"
LIBYA_DIR="/data/libyachain"
BESA_USER="besachain"

echo "Creating BesaChain user and directories..."
useradd -r -s /bin/false $BESA_USER 2>/dev/null || true
mkdir -p $BESA_DIR/{data,logs,config,keystore}
chown -R $BESA_USER:$BESA_USER $BESA_DIR

echo "Copying geth binary from LibyaChain..."
if [ -f "/usr/local/bin/geth" ]; then
    cp /usr/local/bin/geth /usr/local/bin/besachain-geth
    chmod +x /usr/local/bin/besachain-geth
elif [ -f "$LIBYA_DIR/geth" ]; then
    cp $LIBYA_DIR/geth /usr/local/bin/besachain-geth
    chmod +x /usr/local/bin/besachain-geth
fi

echo "Creating BesaChain systemd service..."
cat > /etc/systemd/system/besachaind.service << 'SERVICEFILE'
[Unit]
Description=BesaChain Node - Parallel to LibyaChain
After=network.target

[Service]
Type=simple
User=besachain
Group=besachain
WorkingDirectory=/data/besachain
ExecStart=/usr/local/bin/besachain-geth \
    --datadir /data/besachain/data \
    --port 30403 \
    --http \
    --http.addr 0.0.0.0 \
    --http.port 8645 \
    --http.api eth,net,web3,txpool,parlia \
    --http.corsdomain "*" \
    --http.vhosts "*" \
    --ws \
    --ws.addr 0.0.0.0 \
    --ws.port 8646 \
    --ws.api eth,net,web3 \
    --ws.origins "*" \
    --metrics \
    --metrics.addr 0.0.0.0 \
    --metrics.port 6070 \
    --bootnodes "" \
    --networkid 31901 \
    --syncmode snap \
    --gcmode archive \
    --cache 4096 \
    --maxpeers 50 \
    --allow-insecure-unlock \
    --unlock "0x0000000000000000000000000000000000000000"
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICEFILE

systemctl daemon-reload
echo "BesaChain service created (not started - needs genesis)"

echo "Creating firewall rules for BesaChain..."
if command -v ufw &>/dev/null; then
    ufw allow 30403/tcp comment 'BesaChain P2P'
    ufw allow 8645/tcp comment 'BesaChain RPC'
    ufw allow 8646/tcp comment 'BesaChain WS'
    ufw allow 6070/tcp comment 'BesaChain Metrics'
    echo "UFW rules added"
fi

# Add iptables rules as backup
iptables -I INPUT -p tcp --dport 30403 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 8645 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 8646 -j ACCEPT 2>/dev/null || true
iptables -I INPUT -p tcp --dport 6070 -j ACCEPT 2>/dev/null || true

echo "BesaChain setup complete on instance!"
echo ""
echo "Next steps:"
echo "1. Upload genesis file to /data/besachain/config/genesis.json"
echo "2. Upload validator keys to /data/besachain/keystore/"
echo "3. Run: sudo systemctl start besachaind"
EOF
)

echo "Copying setup script to instance..."
echo "$REMOTE_SCRIPT" | ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ec2-user@"$INSTANCE_IP" "cat > /tmp/setup_besachain.sh && chmod +x /tmp/setup_besachain.sh"

echo "Running setup on remote instance..."
ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ec2-user@"$INSTANCE_IP" "sudo bash /tmp/setup_besachain.sh"

echo "Creating genesis file locally..."
cat > /tmp/besachain-genesis.json << 'GENESIS'
{
  "config": {
    "chainId": 31901,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "parlia": {
      "period": 3,
      "epoch": 200
    }
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
GENESIS

echo "Uploading genesis file..."
scp -i "$AWS_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null /tmp/besachain-genesis.json ec2-user@"$INSTANCE_IP":/tmp/
ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ec2-user@"$INSTANCE_IP" "sudo mv /tmp/besachain-genesis.json /data/besachain/config/genesis.json && sudo chown besachain:besachain /data/besachain/config/genesis.json"

echo "Initializing BesaChain with genesis..."
ssh -i "$AWS_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ec2-user@"$INSTANCE_IP" "sudo -u besachain /usr/local/bin/besachain-geth --datadir /data/besachain/data init /data/besachain/config/genesis.json"

echo ""
echo "=== BesaChain Setup Complete ==="
echo ""
echo "Instance: $INSTANCE_IP"
echo "Data Directory: /data/besachain"
echo "Config: /data/besachain/config/"
echo ""
echo "To start BesaChain:"
echo "  ssh -i ~/.ssh/libyachain-key.pem ubuntu@$INSTANCE_IP"
echo "  sudo systemctl start besachaind"
echo "  sudo systemctl status besachaind"
echo ""
echo "Logs:"
echo "  sudo journalctl -u besachaind -f"
