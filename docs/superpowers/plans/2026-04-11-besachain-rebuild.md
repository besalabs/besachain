# BesaChain Full Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild BesaChain from genesis as a production-grade BSC fork with Parlia PoSA (L1), OP Stack single sequencer (L2), ML-DSA quantum-safe precompile, and three-phase parallel EVM achieving 20K+ realistic TPS.

**Architecture:** L1 (Fermi, chain 14440 testnet) uses `bnb-chain/bsc` with Parlia consensus on 3 validators. L2 (Fourier, chain 19120 testnet) uses `bnb-chain/op-geth` + `bnb-chain/opbnb` with single sequencer on V1. ML-DSA precompile grafted onto both layers. TxDAG parallel execution enabled from launch.

**Tech Stack:** Go 1.25, Solidity 0.8.33, Foundry, BSC v1.7.2, opBNB v0.5.5, Cloudflare CIRCL (ML-DSA), systemd

**Validators:**
- V1: 54.235.85.175 (t3.2xlarge, 8 vCPU, 32GB) — L1 validator + L2 sequencer
- V2: 44.223.91.64 (t3.xlarge, 4 vCPU, 16GB) — L1 validator
- V3: 3.84.251.178 (t3.large, 2 vCPU, 8GB) — L1 validator

**SSH:** `ssh -i ~/.ssh/libyachain-key.pem ubuntu@<IP>` (may need key fix — see Task 0)

**Chain IDs:**
- L1 Testnet: 14440 | L1 Mainnet: 1444
- L2 Testnet: 19120 | L2 Mainnet: 1912

---

## File Structure

### New files (created in this plan)

```
/Users/senton/besachain/
├── bsc/                           # L1 client (fork of bnb-chain/bsc v1.7.2)
│   ├── core/vm/mldsa.go          # ML-DSA precompile (grafted from existing)
│   ├── core/vm/mldsa_test.go     # ML-DSA precompile tests
│   ├── params/besachain_config.go # BesaChain L1 chain config (14440/1444)
│   └── go.mod                     # + circl dependency
│
├── opbnb/                         # L2 client (fork of bnb-chain/opbnb v0.5.5)
│   ├── op-geth/core/vm/mldsa.go  # ML-DSA precompile (grafted)
│   ├── op-geth/core/vm/mldsa_test.go
│   ├── op-geth/params/besachain_l2_config.go
│   └── op-node/                   # L2 consensus client
│
├── genesis/
│   ├── testnet-l1-14440.json     # L1 testnet genesis (Parlia, 150M gas)
│   ├── testnet-l2-19120.json     # L2 testnet genesis (1B gas)
│   └── generate-genesis.sh       # Genesis generation script
│
├── deploy/
│   ├── systemd/
│   │   ├── besachain-l1.service  # L1 geth systemd unit
│   │   ├── besachain-l2-geth.service  # L2 geth systemd unit
│   │   └── besachain-l2-node.service  # L2 op-node systemd unit
│   ├── deploy-testnet.sh         # Full testnet deploy to 3 validators
│   └── validator-keys/           # Generated validator keypairs (gitignored)
│
├── parallel-evm/
│   ├── phase1-txdag/
│   │   └── README.md             # TxDAG enablement notes (built into BSC)
│   ├── phase2-optimizations/
│   │   ├── lazy_beneficiary.go   # Lazy gas payment to block producer
│   │   ├── lazy_beneficiary_test.go
│   │   ├── sparse_trie.go        # In-memory trie cache
│   │   └── sparse_trie_test.go
│   └── phase3-blockstm/
│       ├── mvdata.go             # Multi-version data structure
│       ├── mvdata_test.go
│       ├── executor.go           # Parallel executor with Block-STM
│       ├── executor_test.go
│       ├── scheduler.go          # Task scheduler + conflict resolution
│       └── scheduler_test.go
│
├── benchmark/
│   ├── tps-bench.go              # TPS benchmark tool
│   ├── tps-bench_test.go
│   └── run-benchmark.sh          # Automated benchmark runner
│
└── contracts/                     # EXISTING — update chain IDs only
    ├── token/BesaToken.sol       # Fix L2_CHAIN_ID: 1445 → 1912
    └── precompiles/MLDSAVerifier.sol  # Unchanged
```

### Existing files modified

```
/Users/senton/besachain/
├── op-geth/    → ARCHIVED (replaced by bsc/ and opbnb/)
├── op-node/    → ARCHIVED (merged into opbnb/op-node/)
└── contracts/token/BesaToken.sol  # Chain ID fix
```

---

## Task 0: SSH Access & Validator Connectivity

**Files:**
- Check: `~/.ssh/libyachain-key.pem`, `~/.ssh/libyachain-validators.pem`

- [ ] **Step 1: Test SSH to all 3 validators**

```bash
# Try both key files
for key in ~/.ssh/libyachain-key.pem ~/.ssh/libyachain-validators.pem; do
  for ip in 54.235.85.175 44.223.91.64 3.84.251.178; do
    echo "Testing $key → $ip"
    ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$key" ubuntu@$ip "hostname && echo OK" 2>&1 | head -2
  done
done
```

- [ ] **Step 2: If SSH fails, use EC2 Instance Connect**

```bash
# Push temporary key via AWS CLI
aws ec2-instance-connect send-ssh-public-key \
  --instance-id i-0d805d5e25e8961b9 \
  --instance-os-user ubuntu \
  --ssh-public-key file://~/.ssh/id_ed25519.pub \
  --availability-zone us-east-1a
```

- [ ] **Step 3: Verify disk space and running services on each**

```bash
ssh ubuntu@<IP> "df -h / /data 2>/dev/null; free -h; systemctl list-units --type=service --state=running | grep -E 'besa|libya|geth'"
```

Expected: Enough disk (>20GB free), memory available, LibyaChain services may or may not be running.

---

## Task 1: Fork BSC v1.7.2 for L1 (Fermi)

**Files:**
- Create: `/Users/senton/besachain/bsc/` (full BSC clone)
- Preserve: `/Users/senton/besachain/op-geth/core/vm/mldsa.go` (source for graft)

- [ ] **Step 1: Clone BSC v1.7.2**

```bash
cd /Users/senton/besachain
git clone --depth 1 --branch v1.7.2 https://github.com/bnb-chain/bsc.git bsc
cd bsc
git log --oneline -1  # Verify v1.7.2
```

Expected: BSC v1.7.2 cloned, ~500MB

- [ ] **Step 2: Verify BSC builds**

```bash
cd /Users/senton/besachain/bsc
make geth
```

Expected: Binary at `build/bin/geth`

- [ ] **Step 3: Verify Parlia consensus exists**

```bash
ls -la /Users/senton/besachain/bsc/consensus/parlia/
grep -r "Parlia" /Users/senton/besachain/bsc/params/config.go | head -5
```

Expected: Parlia directory with consensus engine, ParliaConfig in chain config struct

- [ ] **Step 4: Commit baseline**

```bash
cd /Users/senton/besachain
git add bsc/
git commit -m "feat: add BSC v1.7.2 as L1 base (Parlia PoSA consensus)"
```

---

## Task 2: Graft ML-DSA Precompile onto BSC L1

**Files:**
- Copy from: `/Users/senton/besachain/op-geth/core/vm/mldsa.go`
- Copy to: `/Users/senton/besachain/bsc/core/vm/mldsa.go`
- Modify: `/Users/senton/besachain/bsc/core/vm/contracts.go` (register precompiles)
- Modify: `/Users/senton/besachain/bsc/go.mod` (add circl dependency)
- Create: `/Users/senton/besachain/bsc/core/vm/mldsa_test.go`

- [ ] **Step 1: Copy ML-DSA precompile source**

```bash
cp /Users/senton/besachain/op-geth/core/vm/mldsa.go /Users/senton/besachain/bsc/core/vm/mldsa.go
```

- [ ] **Step 2: Add CIRCL dependency to BSC go.mod**

```bash
cd /Users/senton/besachain/bsc
go get github.com/cloudflare/circl@v1.6.3
go mod tidy
```

- [ ] **Step 3: Register ML-DSA precompiles in contracts.go**

Find the precompile maps in `/Users/senton/besachain/bsc/core/vm/contracts.go`. BSC has multiple maps (e.g., `PrecompiledContractsByzantium`, `PrecompiledContractsIstanbul`, `PrecompiledContractsNano`, `PrecompiledContractsPlanck`, etc.).

Add to ALL active precompile maps:

```go
common.BytesToAddress([]byte{0x01, 0x20}): &mldsaVerify{},
common.BytesToAddress([]byte{0x01, 0x21}): &mldsaBatchVerify{},
```

- [ ] **Step 4: Write ML-DSA unit test**

Create `/Users/senton/besachain/bsc/core/vm/mldsa_test.go`:

```go
package vm

import (
	"testing"

	"github.com/cloudflare/circl/sign/mldsa/mldsa65"
	"crypto/rand"
)

func TestMLDSAVerifyPrecompile(t *testing.T) {
	// Generate a key pair
	pk, sk, err := mldsa65.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}

	// Sign a message
	message := make([]byte, 32)
	copy(message, []byte("test message hash 1234567890ab"))
	sig := mldsa65.Sign(sk, message, nil)

	// Pack input: message (32) + signature (3309) + pubkey (1952)
	pkBytes, _ := pk.MarshalBinary()
	input := make([]byte, 0, 32+len(sig)+len(pkBytes))
	input = append(input, message...)
	input = append(input, sig...)
	input = append(input, pkBytes...)

	// Run precompile
	p := &mldsaVerify{}
	result, err := p.Run(input)
	if err != nil {
		t.Fatalf("precompile failed: %v", err)
	}

	// Check success (last byte = 1)
	if result[31] != 1 {
		t.Fatal("expected verification success, got failure")
	}

	// Test with corrupted signature
	input[33] ^= 0xFF // flip a byte in the signature
	result, err = p.Run(input)
	if err != nil {
		t.Fatalf("precompile should not error on bad sig: %v", err)
	}
	if result[31] != 0 {
		t.Fatal("expected verification failure, got success")
	}
}

func TestMLDSAGasCost(t *testing.T) {
	p := &mldsaVerify{}
	input := make([]byte, 32+3309+1952) // Correct size
	gas := p.RequiredGas(input)
	if gas != 20000 {
		t.Fatalf("expected 20000 gas, got %d", gas)
	}
}

func TestMLDSABatchVerifyPrecompile(t *testing.T) {
	// Generate 3 key pairs and signatures
	count := 3
	input := make([]byte, 4) // count as uint32 big-endian
	input[3] = byte(count)

	for i := 0; i < count; i++ {
		pk, sk, _ := mldsa65.GenerateKey(rand.Reader)
		msg := make([]byte, 32)
		msg[0] = byte(i)
		sig := mldsa65.Sign(sk, msg, nil)
		pkBytes, _ := pk.MarshalBinary()

		input = append(input, msg...)
		input = append(input, sig...)
		input = append(input, pkBytes...)
	}

	p := &mldsaBatchVerify{}
	result, err := p.Run(input)
	if err != nil {
		t.Fatalf("batch verify failed: %v", err)
	}

	// Check all 3 succeeded (each 32 bytes, last byte = 1)
	for i := 0; i < count; i++ {
		if result[i*32+31] != 1 {
			t.Fatalf("signature %d failed verification", i)
		}
	}
}
```

- [ ] **Step 5: Run tests**

```bash
cd /Users/senton/besachain/bsc
go test ./core/vm/ -run TestMLDSA -v
```

Expected: 3 tests pass

- [ ] **Step 6: Verify full build**

```bash
cd /Users/senton/besachain/bsc
make geth
```

Expected: Compiles without errors

- [ ] **Step 7: Commit**

```bash
cd /Users/senton/besachain
git add bsc/core/vm/mldsa.go bsc/core/vm/mldsa_test.go bsc/core/vm/contracts.go bsc/go.mod bsc/go.sum
git commit -m "feat: graft ML-DSA quantum-safe precompile onto BSC L1 (0x0120, 0x0121)"
```

---

## Task 3: Create BesaChain L1 Chain Config

**Files:**
- Create: `/Users/senton/besachain/bsc/params/besachain_config.go`
- Modify: `/Users/senton/besachain/bsc/params/config.go` (add testnet/mainnet configs)

- [ ] **Step 1: Create BesaChain chain config**

Create `/Users/senton/besachain/bsc/params/besachain_config.go`:

```go
package params

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
)

var (
	// BesaChainTestnetChainConfig is the chain config for BesaChain L1 testnet
	BesaChainTestnetChainConfig = &ChainConfig{
		ChainID:             big.NewInt(14440),
		HomesteadBlock:      big.NewInt(0),
		EIP150Block:         big.NewInt(0),
		EIP155Block:         big.NewInt(0),
		EIP158Block:         big.NewInt(0),
		ByzantiumBlock:      big.NewInt(0),
		ConstantinopleBlock: big.NewInt(0),
		PetersburgBlock:     big.NewInt(0),
		IstanbulBlock:       big.NewInt(0),
		MuirGlacierBlock:    big.NewInt(0),
		RamanujanBlock:      big.NewInt(0),
		NielsBlock:          big.NewInt(0),
		MirrorSyncBlock:     big.NewInt(0),
		BrunoBlock:          big.NewInt(0),
		EulerBlock:          big.NewInt(0),
		LubanBlock:          big.NewInt(0),
		PlatoBlock:          big.NewInt(0),
		BerlinBlock:         big.NewInt(0),
		LondonBlock:         big.NewInt(0),
		HertzBlock:          big.NewInt(0),
		HertzfixBlock:       big.NewInt(0),
		ShanghaiTime:        newUint64(0),
		KeplerTime:          newUint64(0),
		FeynmanTime:         newUint64(0),
		FeynmanFixTime:      newUint64(0),
		CancunTime:          newUint64(0),
		HaberTime:           newUint64(0),
		HaberFixTime:        newUint64(0),
		BohrTime:            newUint64(0),
		Parlia: &ParliaConfig{
			Period: 0,     // On-demand blocks (targets 450ms with BLS fast finality)
			Epoch:  200,   // Validator set checkpoint every 200 blocks
		},
	}

	// BesaChainMainnetChainConfig is the chain config for BesaChain L1 mainnet
	BesaChainMainnetChainConfig = &ChainConfig{
		ChainID:             big.NewInt(1444),
		HomesteadBlock:      big.NewInt(0),
		EIP150Block:         big.NewInt(0),
		EIP155Block:         big.NewInt(0),
		EIP158Block:         big.NewInt(0),
		ByzantiumBlock:      big.NewInt(0),
		ConstantinopleBlock: big.NewInt(0),
		PetersburgBlock:     big.NewInt(0),
		IstanbulBlock:       big.NewInt(0),
		MuirGlacierBlock:    big.NewInt(0),
		RamanujanBlock:      big.NewInt(0),
		NielsBlock:          big.NewInt(0),
		MirrorSyncBlock:     big.NewInt(0),
		BrunoBlock:          big.NewInt(0),
		EulerBlock:          big.NewInt(0),
		LubanBlock:          big.NewInt(0),
		PlatoBlock:          big.NewInt(0),
		BerlinBlock:         big.NewInt(0),
		LondonBlock:         big.NewInt(0),
		HertzBlock:          big.NewInt(0),
		HertzfixBlock:       big.NewInt(0),
		ShanghaiTime:        newUint64(0),
		KeplerTime:          newUint64(0),
		FeynmanTime:         newUint64(0),
		FeynmanFixTime:      newUint64(0),
		CancunTime:          newUint64(0),
		HaberTime:           newUint64(0),
		HaberFixTime:        newUint64(0),
		BohrTime:            newUint64(0),
		Parlia: &ParliaConfig{
			Period: 0,
			Epoch:  200,
		},
	}
)

func newUint64(val uint64) *uint64 {
	return &val
}
```

Note: The exact fork fields depend on BSC v1.7.2's ChainConfig struct. Read `params/config.go` first and adjust field names to match. Some fields may not exist or may have different names.

- [ ] **Step 2: Register configs in params/config.go**

Add to the `NetworkNames` map or equivalent config registry so the chain configs are discoverable.

- [ ] **Step 3: Verify build**

```bash
cd /Users/senton/besachain/bsc && make geth
```

- [ ] **Step 4: Commit**

```bash
git add bsc/params/besachain_config.go bsc/params/config.go
git commit -m "feat: add BesaChain L1 chain configs (testnet 14440, mainnet 1444)"
```

---

## Task 4: Generate L1 Genesis & Validator Keys

**Files:**
- Create: `/Users/senton/besachain/genesis/testnet-l1-14440.json`
- Create: `/Users/senton/besachain/genesis/generate-genesis.sh`
- Create: `/Users/senton/besachain/deploy/validator-keys/` (gitignored)

- [ ] **Step 1: Generate 3 validator keypairs**

```bash
cd /Users/senton/besachain
mkdir -p deploy/validator-keys
cd bsc

# Generate 3 validator accounts
for i in 1 2 3; do
  ./build/bin/geth account new --datadir ../deploy/validator-keys/validator-$i --password <(echo "besachain-testnet")
  echo "Validator $i address above"
done
```

Record all 3 addresses for the genesis extraData field.

- [ ] **Step 2: Create genesis file**

Create `/Users/senton/besachain/genesis/testnet-l1-14440.json`:

```json
{
  "config": {
    "chainId": 14440,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "muirGlacierBlock": 0,
    "ramanujanBlock": 0,
    "nielsBlock": 0,
    "mirrorSyncBlock": 0,
    "brunoBlock": 0,
    "eulerBlock": 0,
    "lubanBlock": 0,
    "platoBlock": 0,
    "berlinBlock": 0,
    "londonBlock": 0,
    "hertzBlock": 0,
    "hertzfixBlock": 0,
    "shanghaiTime": 0,
    "keplerTime": 0,
    "feynmanTime": 0,
    "feynmanFixTime": 0,
    "cancunTime": 0,
    "haberTime": 0,
    "haberFixTime": 0,
    "bohrTime": 0,
    "parlia": {
      "period": 0,
      "epoch": 200
    }
  },
  "nonce": "0x0",
  "timestamp": "0x0",
  "extraData": "0x0000000000000000000000000000000000000000000000000000000000000000<VALIDATOR1><VALIDATOR2><VALIDATOR3>0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "gasLimit": "0x8F0D180",
  "difficulty": "0x1",
  "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "alloc": {
    "<DEPLOYER_ADDRESS>": {
      "balance": "0xD3C21BCECCEDA1000000"
    },
    "<FAUCET_ADDRESS>": {
      "balance": "0x152D02C7E14AF6800000"
    }
  },
  "number": "0x0",
  "gasUsed": "0x0",
  "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
}
```

Notes:
- `gasLimit: 0x8F0D180` = 150,000,000 (150M)
- `extraData` format: 32 bytes vanity + N×20-byte validator addresses + 65 bytes signature
- Replace `<VALIDATOR1>`, `<VALIDATOR2>`, `<VALIDATOR3>` with addresses from Step 1 (no 0x prefix, lowercase)
- Deployer gets 1M BESA (0xD3C21BCECCEDA1000000 = 1e24 wei = 1M tokens)
- Faucet gets 100K BESA

- [ ] **Step 3: Add validator-keys to gitignore**

```bash
echo "deploy/validator-keys/" >> /Users/senton/besachain/.gitignore
```

- [ ] **Step 4: Commit**

```bash
git add genesis/testnet-l1-14440.json genesis/generate-genesis.sh .gitignore
git commit -m "feat: L1 testnet genesis (chain 14440, Parlia, 150M gas, 3 validators)"
```

---

## Task 5: Create Systemd Services & Deploy Script

**Files:**
- Create: `/Users/senton/besachain/deploy/systemd/besachain-l1.service`
- Create: `/Users/senton/besachain/deploy/deploy-testnet.sh`

- [ ] **Step 1: Create L1 systemd service**

Create `/Users/senton/besachain/deploy/systemd/besachain-l1.service`:

```ini
[Unit]
Description=BesaChain L1 Validator (Fermi)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/local/bin/besachain-geth \
  --datadir /data/besachain-l1 \
  --networkid 14440 \
  --port 31444 \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 1444 \
  --http.api eth,net,web3,txpool,parlia,debug \
  --http.corsdomain "*" \
  --http.vhosts "*" \
  --ws \
  --ws.addr 0.0.0.0 \
  --ws.port 14444 \
  --ws.api eth,net,web3 \
  --metrics \
  --metrics.addr 0.0.0.0 \
  --metrics.port 14440 \
  --syncmode full \
  --gcmode archive \
  --mine \
  --unlock <VALIDATOR_ADDRESS> \
  --password /data/besachain-l1/password.txt \
  --allow-insecure-unlock \
  --verbosity 3
Restart=always
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

- [ ] **Step 2: Create deploy script**

Create `/Users/senton/besachain/deploy/deploy-testnet.sh`:

```bash
#!/bin/bash
set -euo pipefail

# BesaChain Testnet Deploy — All 3 Validators
SSH_KEY="$HOME/.ssh/libyachain-key.pem"
VALIDATORS=("54.235.85.175" "44.223.91.64" "3.84.251.178")
BINARY="./bsc/build/bin/geth"
GENESIS="./genesis/testnet-l1-14440.json"

echo "=== BesaChain Testnet Deploy ==="

# Step 1: Build binary
echo "[1/5] Building BSC geth with ML-DSA..."
cd bsc && make geth && cd ..

# Step 2: Cross-compile for Linux ARM64 (if needed) or AMD64
echo "[2/5] Cross-compiling for Linux..."
cd bsc
GOOS=linux GOARCH=amd64 go build -o ../build/besachain-geth ./cmd/geth
cd ..

for i in "${!VALIDATORS[@]}"; do
  IP="${VALIDATORS[$i]}"
  VAL_NUM=$((i+1))
  echo "[3/5] Deploying to V${VAL_NUM} ($IP)..."

  # Upload binary and genesis
  scp -i "$SSH_KEY" build/besachain-geth "ubuntu@$IP:/usr/local/bin/besachain-geth"
  scp -i "$SSH_KEY" "$GENESIS" "ubuntu@$IP:/tmp/besachain-genesis.json"
  scp -i "$SSH_KEY" deploy/systemd/besachain-l1.service "ubuntu@$IP:/tmp/besachain-l1.service"
  scp -i "$SSH_KEY" "deploy/validator-keys/validator-${VAL_NUM}/keystore/"* "ubuntu@$IP:/tmp/besachain-keystore/"

  # Initialize and start
  ssh -i "$SSH_KEY" "ubuntu@$IP" bash -s <<'REMOTE'
    sudo mkdir -p /data/besachain-l1
    sudo chown ubuntu:ubuntu /data/besachain-l1

    # Stop if running
    sudo systemctl stop besachain-l1 2>/dev/null || true

    # Initialize genesis
    /usr/local/bin/besachain-geth init --datadir /data/besachain-l1 /tmp/besachain-genesis.json

    # Copy keystore
    mkdir -p /data/besachain-l1/keystore
    cp /tmp/besachain-keystore/* /data/besachain-l1/keystore/

    # Password file
    echo "besachain-testnet" > /data/besachain-l1/password.txt
    chmod 600 /data/besachain-l1/password.txt

    # Install service
    sudo cp /tmp/besachain-l1.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable besachain-l1
    sudo systemctl start besachain-l1

    echo "V$((HOSTNAME)) started. Checking..."
    sleep 3
    sudo systemctl status besachain-l1 --no-pager | head -10
REMOTE

done

echo "[4/5] Adding static peers..."
# Each validator needs to know the others via admin.addPeer
# Use enode URLs from geth console

echo "[5/5] Verifying block production..."
sleep 10
for IP in "${VALIDATORS[@]}"; do
  echo "Checking $IP..."
  curl -s -X POST "http://$IP:1444" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
  echo
done

echo "=== Deploy Complete ==="
```

- [ ] **Step 3: Commit**

```bash
chmod +x deploy/deploy-testnet.sh
git add deploy/
git commit -m "feat: systemd services and deploy script for 3-validator testnet"
```

---

## Task 6: Fork opBNB v0.5.5 for L2 (Fourier)

**Files:**
- Create: `/Users/senton/besachain/opbnb/` (full opBNB clone)

- [ ] **Step 1: Clone opBNB v0.5.5**

```bash
cd /Users/senton/besachain
git clone --depth 1 --branch v0.5.5 https://github.com/bnb-chain/opbnb.git opbnb
```

- [ ] **Step 2: Clone op-geth v0.5.9** (opBNB's execution client)

```bash
cd /Users/senton/besachain
git clone --depth 1 --branch v0.5.9 https://github.com/bnb-chain/op-geth.git opbnb/op-geth-fresh
```

Note: opBNB's repo structure may have op-geth as a submodule or separate repo. Check the actual structure and adjust.

- [ ] **Step 3: Graft ML-DSA onto op-geth L2**

Same process as Task 2 but for the L2 execution client:

```bash
cp /Users/senton/besachain/op-geth/core/vm/mldsa.go /Users/senton/besachain/opbnb/op-geth-fresh/core/vm/mldsa.go
cp /Users/senton/besachain/bsc/core/vm/mldsa_test.go /Users/senton/besachain/opbnb/op-geth-fresh/core/vm/mldsa_test.go
```

Register precompiles in op-geth's contracts.go (same addresses 0x0120, 0x0121).

Add CIRCL dependency:
```bash
cd opbnb/op-geth-fresh && go get github.com/cloudflare/circl@v1.6.3 && go mod tidy
```

- [ ] **Step 4: Build and test**

```bash
cd /Users/senton/besachain/opbnb/op-geth-fresh
go test ./core/vm/ -run TestMLDSA -v
make geth
```

- [ ] **Step 5: Create L2 genesis (chain 19120)**

Create `/Users/senton/besachain/genesis/testnet-l2-19120.json` following opBNB's L2 genesis format with:
- chainId: 19120
- gasLimit: 0x3B9ACA00 (1,000,000,000 = 1B)
- Optimism config for OP Stack
- Pre-deployed L2 system contracts (L2CrossDomainMessenger, etc.)

- [ ] **Step 6: Create L2 rollup config**

The rollup.json needs L1 contract addresses (deployed in Task 8). Create a template:

```json
{
  "genesis": {
    "l1": { "hash": "TBD_AFTER_L1_DEPLOY", "number": 0 },
    "l2": { "hash": "TBD", "number": 0 },
    "l2_time": 0
  },
  "block_time": 0.25,
  "max_sequencer_drift": 600,
  "seq_window_size": 3600,
  "channel_timeout": 300,
  "l1_chain_id": 14440,
  "l2_chain_id": 19120,
  "batch_inbox_address": "0xff00000000000000000000000000000000019120",
  "deposit_contract_address": "TBD_AFTER_L1_DEPLOY"
}
```

- [ ] **Step 7: Commit**

```bash
git add opbnb/ genesis/testnet-l2-19120.json
git commit -m "feat: add opBNB v0.5.5 as L2 base with ML-DSA, chain 19120"
```

---

## Task 7: Fix Contract Chain IDs

**Files:**
- Modify: `/Users/senton/besachain/contracts/token/BesaToken.sol`

- [ ] **Step 1: Update BesaToken chain constants**

In BesaToken.sol, change:
```solidity
// OLD
uint256 public constant L1_CHAIN_ID = 1444;
uint256 public constant L2_CHAIN_ID = 1445;

// NEW
uint256 public constant L1_CHAIN_ID = 1444;
uint256 public constant L2_CHAIN_ID = 1912;

// Also add testnet constants
uint256 public constant L1_TESTNET_CHAIN_ID = 14440;
uint256 public constant L2_TESTNET_CHAIN_ID = 19120;
```

- [ ] **Step 2: Compile contracts**

```bash
cd /Users/senton/besachain/contracts
forge build
```

- [ ] **Step 3: Commit**

```bash
git add contracts/
git commit -m "fix: update L2 chain ID to 1912, add testnet chain IDs"
```

---

## Task 8: Deploy OP Stack L1 Contracts (for L2 settlement)

**Files:**
- Create: `/Users/senton/besachain/contracts/deploy-alternative/DeployL1.s.sol`

This task deploys the OP Stack system contracts to L1 that the L2 needs:
- OptimismPortal
- SystemConfig
- L2OutputOracle
- L1CrossDomainMessenger

- [ ] **Step 1: Write Foundry deploy script**

Use the OP Stack contract deployment framework. The exact contracts and addresses depend on the opBNB version.

```bash
cd /Users/senton/besachain/contracts
forge script deploy-alternative/DeployL1.s.sol \
  --rpc-url http://54.235.85.175:1444 \
  --private-key <DEPLOYER_KEY> \
  --broadcast
```

- [ ] **Step 2: Record deployed addresses**

Save all contract addresses to `/Users/senton/besachain/deploy/l1-contracts.json`

- [ ] **Step 3: Update L2 rollup.json with real addresses**

Replace all "TBD" fields in rollup.json with actual deployed addresses.

- [ ] **Step 4: Commit**

```bash
git add contracts/deploy-alternative/ deploy/l1-contracts.json
git commit -m "feat: deploy OP Stack L1 contracts for L2 settlement"
```

---

## Task 9: Deploy L2 Sequencer on V1

**Files:**
- Create: `/Users/senton/besachain/deploy/systemd/besachain-l2-geth.service`
- Create: `/Users/senton/besachain/deploy/systemd/besachain-l2-node.service`

- [ ] **Step 1: Create L2 geth service**

```ini
[Unit]
Description=BesaChain L2 Execution (Fourier)
After=besachain-l1.service
Wants=besachain-l1.service

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/local/bin/besachain-l2-geth \
  --datadir /data/besachain-l2 \
  --networkid 19120 \
  --port 31912 \
  --http \
  --http.addr 0.0.0.0 \
  --http.port 1912 \
  --http.api eth,net,web3,txpool,debug \
  --http.corsdomain "*" \
  --ws \
  --ws.addr 0.0.0.0 \
  --ws.port 19120 \
  --ws.api eth,net,web3 \
  --metrics \
  --metrics.addr 0.0.0.0 \
  --metrics.port 19121 \
  --syncmode full \
  --gcmode archive \
  --rollup.sequencerhttp http://localhost:1912 \
  --verbosity 3
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

- [ ] **Step 2: Create L2 op-node service**

```ini
[Unit]
Description=BesaChain L2 Consensus (op-node)
After=besachain-l2-geth.service
Wants=besachain-l2-geth.service

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/local/bin/besachain-op-node \
  --l1 http://localhost:1444 \
  --l2 http://localhost:1912 \
  --rollup.config /data/besachain-l2/rollup.json \
  --sequencer.enabled \
  --sequencer.l1-confs 0 \
  --p2p.disable \
  --rpc.addr 0.0.0.0 \
  --rpc.port 19122 \
  --metrics.enabled \
  --metrics.addr 0.0.0.0 \
  --metrics.port 19123
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

- [ ] **Step 3: Deploy to V1**

```bash
# Build L2 binaries
cd /Users/senton/besachain/opbnb/op-geth-fresh
GOOS=linux GOARCH=amd64 go build -o ../../build/besachain-l2-geth ./cmd/geth

cd /Users/senton/besachain/opbnb
GOOS=linux GOARCH=amd64 go build -o ../build/besachain-op-node ./op-node/cmd

# Upload to V1
scp -i ~/.ssh/libyachain-key.pem build/besachain-l2-geth ubuntu@54.235.85.175:/usr/local/bin/
scp -i ~/.ssh/libyachain-key.pem build/besachain-op-node ubuntu@54.235.85.175:/usr/local/bin/
scp -i ~/.ssh/libyachain-key.pem genesis/testnet-l2-19120.json ubuntu@54.235.85.175:/tmp/
scp -i ~/.ssh/libyachain-key.pem deploy/systemd/besachain-l2-*.service ubuntu@54.235.85.175:/tmp/

# Initialize and start on V1
ssh -i ~/.ssh/libyachain-key.pem ubuntu@54.235.85.175 bash -s <<'REMOTE'
  sudo mkdir -p /data/besachain-l2
  sudo chown ubuntu:ubuntu /data/besachain-l2
  /usr/local/bin/besachain-l2-geth init --datadir /data/besachain-l2 /tmp/besachain-l2-genesis.json
  sudo cp /tmp/besachain-l2-*.service /etc/systemd/system/
  sudo systemctl daemon-reload
  sudo systemctl enable besachain-l2-geth besachain-l2-node
  sudo systemctl start besachain-l2-geth
  sleep 3
  sudo systemctl start besachain-l2-node
REMOTE
```

- [ ] **Step 4: Verify L2 block production**

```bash
curl -s -X POST http://54.235.85.175:1912 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Expected: Block number incrementing every ~250ms

- [ ] **Step 5: Commit**

```bash
git add deploy/systemd/besachain-l2-*.service
git commit -m "feat: L2 sequencer deployed on V1 (chain 19120, 250ms blocks)"
```

---

## Task 10: Enable TxDAG Parallel Execution (Phase 1)

**Files:**
- Modify: `/Users/senton/besachain/bsc/` (BSC already has TxDAG — verify and enable)
- Create: `/Users/senton/besachain/parallel-evm/phase1-txdag/README.md`

- [ ] **Step 1: Verify TxDAG exists in BSC v1.7.2**

```bash
cd /Users/senton/besachain/bsc
grep -r "TxDAG\|txdag\|ParallelExec\|parallelExec" --include="*.go" -l
grep -r "parallel" core/state/ --include="*.go" -l
```

Expected: Files in `core/` related to parallel transaction execution

- [ ] **Step 2: Check TxDAG configuration flags**

```bash
grep -r "parallel\|txdag" cmd/geth/ --include="*.go" | grep -i "flag\|config"
```

Find the CLI flags or config options that enable parallel execution.

- [ ] **Step 3: Enable TxDAG in L1 service**

Update the L1 systemd service ExecStart to include the parallel execution flag. For BSC this is typically:

```
--parallel-tx-dag
```

or set in config.toml:
```toml
[Eth]
ParallelTxDAG = true
```

- [ ] **Step 4: Enable TxDAG in L2 op-geth**

Check if opBNB's op-geth v0.5.9 also has TxDAG:

```bash
cd /Users/senton/besachain/opbnb/op-geth-fresh
grep -r "TxDAG\|txdag\|parallel" --include="*.go" -l
```

If present, enable with same flag. opBNB has been running TxDAG in beta.

- [ ] **Step 5: Benchmark baseline vs TxDAG**

```bash
# Measure TPS without TxDAG (restart service without flag, send test TXs)
# Measure TPS with TxDAG (restart with flag, send same test TXs)
# Compare gas/sec throughput
```

- [ ] **Step 6: Document results**

Create `/Users/senton/besachain/parallel-evm/phase1-txdag/README.md` with benchmark results.

- [ ] **Step 7: Commit**

```bash
git add parallel-evm/phase1-txdag/ deploy/systemd/
git commit -m "feat: enable TxDAG parallel execution (Phase 1, ~2x throughput)"
```

---

## Task 11: Implement Lazy Beneficiary Optimization (Phase 2a)

**Files:**
- Create: `/Users/senton/besachain/parallel-evm/phase2-optimizations/lazy_beneficiary.go`
- Create: `/Users/senton/besachain/parallel-evm/phase2-optimizations/lazy_beneficiary_test.go`
- Modify: `/Users/senton/besachain/bsc/core/state_processor.go` (integrate)

The "lazy beneficiary" pattern defers gas payment to the block producer until end-of-block. This eliminates the false conflict where every transaction appears to depend on every other transaction (because they all modify the coinbase balance).

- [ ] **Step 1: Write the failing test**

Create `/Users/senton/besachain/parallel-evm/phase2-optimizations/lazy_beneficiary_test.go`:

```go
package optimizations

import (
	"math/big"
	"testing"
)

func TestLazyBeneficiaryAccumulator(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	// Simulate 3 transactions paying gas to block producer
	acc.AddGasPayment(big.NewInt(21000), big.NewInt(1e9)) // 21K gas at 1 Gwei
	acc.AddGasPayment(big.NewInt(65000), big.NewInt(1e9)) // 65K gas at 1 Gwei
	acc.AddGasPayment(big.NewInt(150000), big.NewInt(1e9)) // 150K gas at 1 Gwei

	// Total should be (21000+65000+150000) * 1e9 = 236000 * 1e9
	expected := new(big.Int).Mul(big.NewInt(236000), big.NewInt(1e9))
	if acc.TotalPayment().Cmp(expected) != 0 {
		t.Fatalf("expected %s, got %s", expected, acc.TotalPayment())
	}
}

func TestLazyBeneficiaryApply(t *testing.T) {
	acc := NewBeneficiaryAccumulator()
	acc.AddGasPayment(big.NewInt(21000), big.NewInt(1e9))

	// Apply should return the total and reset
	payment := acc.ApplyAndReset()
	expected := new(big.Int).Mul(big.NewInt(21000), big.NewInt(1e9))
	if payment.Cmp(expected) != 0 {
		t.Fatalf("expected %s, got %s", expected, payment)
	}

	// After reset, total should be 0
	if acc.TotalPayment().Sign() != 0 {
		t.Fatal("expected zero after reset")
	}
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/senton/besachain/parallel-evm/phase2-optimizations
go test -v
```

Expected: FAIL — types not defined

- [ ] **Step 3: Implement BeneficiaryAccumulator**

Create `/Users/senton/besachain/parallel-evm/phase2-optimizations/lazy_beneficiary.go`:

```go
package optimizations

import (
	"math/big"
	"sync"
)

// BeneficiaryAccumulator defers gas payments to the block producer
// until end-of-block, eliminating false state conflicts between
// parallel transactions that all modify the coinbase balance.
type BeneficiaryAccumulator struct {
	mu      sync.Mutex
	total   *big.Int
	tips    *big.Int
	baseFee *big.Int
}

func NewBeneficiaryAccumulator() *BeneficiaryAccumulator {
	return &BeneficiaryAccumulator{
		total: new(big.Int),
		tips:  new(big.Int),
	}
}

// AddGasPayment records a gas payment without modifying state.
// Thread-safe for use during parallel execution.
func (b *BeneficiaryAccumulator) AddGasPayment(gasUsed, gasPrice *big.Int) {
	payment := new(big.Int).Mul(gasUsed, gasPrice)
	b.mu.Lock()
	b.total.Add(b.total, payment)
	b.mu.Unlock()
}

// AddTip records a priority fee payment.
func (b *BeneficiaryAccumulator) AddTip(tip *big.Int) {
	b.mu.Lock()
	b.tips.Add(b.tips, tip)
	b.mu.Unlock()
}

// TotalPayment returns the accumulated gas payment.
func (b *BeneficiaryAccumulator) TotalPayment() *big.Int {
	b.mu.Lock()
	defer b.mu.Unlock()
	return new(big.Int).Set(b.total)
}

// ApplyAndReset returns the total payment and resets the accumulator.
// Called once at end-of-block to apply all gas payments in a single state write.
func (b *BeneficiaryAccumulator) ApplyAndReset() *big.Int {
	b.mu.Lock()
	defer b.mu.Unlock()
	result := new(big.Int).Add(b.total, b.tips)
	b.total = new(big.Int)
	b.tips = new(big.Int)
	return result
}
```

- [ ] **Step 4: Run tests**

```bash
go test -v
```

Expected: PASS

- [ ] **Step 5: Integrate into BSC state_processor.go**

In `bsc/core/state_processor.go`, find where gas payments are applied to the coinbase during transaction execution. Replace the per-TX coinbase balance modification with a call to `BeneficiaryAccumulator.AddGasPayment()`, and add a single `statedb.AddBalance(coinbase, accumulator.ApplyAndReset())` at end-of-block.

This requires careful reading of the BSC state processor to find the exact integration points.

- [ ] **Step 6: Commit**

```bash
git add parallel-evm/phase2-optimizations/
git commit -m "feat: lazy beneficiary accumulator (Phase 2a, eliminates false conflicts)"
```

---

## Task 12: Implement Sparse Trie Cache (Phase 2b)

**Files:**
- Create: `/Users/senton/besachain/parallel-evm/phase2-optimizations/sparse_trie.go`
- Create: `/Users/senton/besachain/parallel-evm/phase2-optimizations/sparse_trie_test.go`

The Sparse Trie maintains an in-memory representation of the state trie across blocks, enabling parallel state root computation.

- [ ] **Step 1: Write failing test**

```go
package optimizations

import (
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

func TestSparseTrieInsertAndRoot(t *testing.T) {
	st := NewSparseTrie()

	// Insert some account state
	addr1 := common.HexToAddress("0x1111111111111111111111111111111111111111")
	addr2 := common.HexToAddress("0x2222222222222222222222222222222222222222")

	st.Update(crypto.Keccak256(addr1.Bytes()), []byte("account1_rlp"))
	st.Update(crypto.Keccak256(addr2.Bytes()), []byte("account2_rlp"))

	root1 := st.Hash()
	if root1 == (common.Hash{}) {
		t.Fatal("expected non-empty root")
	}

	// Modify and get new root
	st.Update(crypto.Keccak256(addr1.Bytes()), []byte("account1_rlp_v2"))
	root2 := st.Hash()

	if root1 == root2 {
		t.Fatal("roots should differ after update")
	}
}
```

- [ ] **Step 2: Implement SparseTrie**

This is a simplified in-memory Merkle Patricia Trie that caches nodes between blocks. The full implementation follows Reth 2.0's approach:

```go
package optimizations

import (
	"sync"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

// SparseTrie is an in-memory trie cache that persists across blocks.
// It caches trie nodes to avoid re-hashing unchanged subtrees.
type SparseTrie struct {
	mu    sync.RWMutex
	nodes map[string][]byte // key (hashed path) -> value (RLP-encoded node)
	dirty map[string]bool   // keys modified since last Hash()
	root  common.Hash
}

func NewSparseTrie() *SparseTrie {
	return &SparseTrie{
		nodes: make(map[string][]byte),
		dirty: make(map[string]bool),
	}
}

func (st *SparseTrie) Update(key []byte, value []byte) {
	st.mu.Lock()
	defer st.mu.Unlock()
	k := string(key)
	st.nodes[k] = value
	st.dirty[k] = true
}

func (st *SparseTrie) Delete(key []byte) {
	st.mu.Lock()
	defer st.mu.Unlock()
	k := string(key)
	delete(st.nodes, k)
	st.dirty[k] = true
}

func (st *SparseTrie) Hash() common.Hash {
	st.mu.Lock()
	defer st.mu.Unlock()

	// Simplified: hash all key-value pairs in sorted order
	// Production implementation would use proper MPT node structure
	var combined []byte
	for k, v := range st.nodes {
		combined = append(combined, []byte(k)...)
		combined = append(combined, v...)
	}
	st.root = crypto.Keccak256Hash(combined)
	st.dirty = make(map[string]bool)
	return st.root
}

func (st *SparseTrie) Get(key []byte) ([]byte, bool) {
	st.mu.RLock()
	defer st.mu.RUnlock()
	v, ok := st.nodes[string(key)]
	return v, ok
}

func (st *SparseTrie) DirtyCount() int {
	st.mu.RLock()
	defer st.mu.RUnlock()
	return len(st.dirty)
}
```

Note: This is a simplified version. The production implementation needs proper MPT node structure with branch/extension/leaf nodes and incremental rehashing of only dirty subtrees.

- [ ] **Step 3: Run tests, commit**

```bash
go test -v -run TestSparseTrie
git add parallel-evm/phase2-optimizations/sparse_trie*
git commit -m "feat: sparse trie cache for parallel state root (Phase 2b)"
```

---

## Task 13: Port Block-STM Parallel Executor (Phase 3)

**Files:**
- Create: `/Users/senton/besachain/parallel-evm/phase3-blockstm/mvdata.go`
- Create: `/Users/senton/besachain/parallel-evm/phase3-blockstm/executor.go`
- Create: `/Users/senton/besachain/parallel-evm/phase3-blockstm/scheduler.go`
- Create: corresponding `_test.go` files

Block-STM is the optimistic parallel execution algorithm from Aptos. It speculatively executes all transactions in parallel, validates afterwards, and re-executes on conflict.

- [ ] **Step 1: Implement Multi-Version Data Structure**

Create `/Users/senton/besachain/parallel-evm/phase3-blockstm/mvdata.go`:

```go
package blockstm

import (
	"sync"

	"github.com/ethereum/go-ethereum/common"
)

// Version identifies a specific write by transaction index and incarnation.
type Version struct {
	TxIndex     int
	Incarnation int
}

// MVEntry is a single versioned value.
type MVEntry struct {
	Version Version
	Value   []byte
	IsDeleted bool
}

// MVData is a multi-version data structure that stores multiple versions
// of each storage location, indexed by transaction index.
// Thread-safe for concurrent reads and writes from parallel executors.
type MVData struct {
	mu   sync.RWMutex
	data map[common.Hash][]MVEntry // storage key -> versions (sorted by TxIndex)
}

func NewMVData() *MVData {
	return &MVData{
		data: make(map[common.Hash][]MVEntry),
	}
}

// Write records a value written by transaction txIdx at incarnation inc.
func (mv *MVData) Write(key common.Hash, txIdx, inc int, value []byte) {
	mv.mu.Lock()
	defer mv.mu.Unlock()

	entry := MVEntry{
		Version: Version{TxIndex: txIdx, Incarnation: inc},
		Value:   value,
	}

	entries := mv.data[key]
	// Find insertion point (maintain sorted by TxIndex)
	inserted := false
	for i, e := range entries {
		if e.Version.TxIndex == txIdx {
			entries[i] = entry // Replace existing version
			inserted = true
			break
		}
	}
	if !inserted {
		entries = append(entries, entry)
	}
	mv.data[key] = entries
}

// Read returns the most recent value written by a transaction with index < txIdx.
// Returns (value, version, found).
func (mv *MVData) Read(key common.Hash, txIdx int) ([]byte, Version, bool) {
	mv.mu.RLock()
	defer mv.mu.RUnlock()

	entries, ok := mv.data[key]
	if !ok {
		return nil, Version{}, false
	}

	// Find the latest version with TxIndex < txIdx
	var best *MVEntry
	for i := range entries {
		if entries[i].Version.TxIndex < txIdx {
			if best == nil || entries[i].Version.TxIndex > best.Version.TxIndex {
				best = &entries[i]
			}
		}
	}

	if best == nil {
		return nil, Version{}, false
	}
	return best.Value, best.Version, true
}

// MarkDeleted marks a key as deleted by transaction txIdx.
func (mv *MVData) MarkDeleted(key common.Hash, txIdx, inc int) {
	mv.mu.Lock()
	defer mv.mu.Unlock()

	entry := MVEntry{
		Version:   Version{TxIndex: txIdx, Incarnation: inc},
		IsDeleted: true,
	}
	mv.data[key] = append(mv.data[key], entry)
}
```

- [ ] **Step 2: Write MVData tests**

Create `/Users/senton/besachain/parallel-evm/phase3-blockstm/mvdata_test.go`:

```go
package blockstm

import (
	"testing"

	"github.com/ethereum/go-ethereum/common"
)

func TestMVDataWriteAndRead(t *testing.T) {
	mv := NewMVData()
	key := common.HexToHash("0x01")

	// TX 0 writes value "a"
	mv.Write(key, 0, 0, []byte("a"))
	// TX 1 writes value "b"
	mv.Write(key, 1, 0, []byte("b"))
	// TX 2 writes value "c"
	mv.Write(key, 2, 0, []byte("c"))

	// TX 1 reads: should see TX 0's write ("a")
	val, ver, ok := mv.Read(key, 1)
	if !ok || string(val) != "a" || ver.TxIndex != 0 {
		t.Fatalf("TX 1 read: expected 'a' from TX 0, got %q from TX %d (found=%v)", val, ver.TxIndex, ok)
	}

	// TX 3 reads: should see TX 2's write ("c")
	val, ver, ok = mv.Read(key, 3)
	if !ok || string(val) != "c" || ver.TxIndex != 2 {
		t.Fatalf("TX 3 read: expected 'c' from TX 2, got %q from TX %d", val, ver.TxIndex)
	}

	// TX 0 reads: should find nothing (no TX before 0)
	_, _, ok = mv.Read(key, 0)
	if ok {
		t.Fatal("TX 0 read: expected nothing, got a value")
	}
}

func TestMVDataReExecution(t *testing.T) {
	mv := NewMVData()
	key := common.HexToHash("0x01")

	// TX 0 writes "a" at incarnation 0
	mv.Write(key, 0, 0, []byte("a"))

	// TX 0 re-executes, writes "a2" at incarnation 1
	mv.Write(key, 0, 1, []byte("a2"))

	// TX 1 reads: should see TX 0's latest incarnation
	val, ver, ok := mv.Read(key, 1)
	if !ok || string(val) != "a2" || ver.Incarnation != 1 {
		t.Fatalf("expected 'a2' inc 1, got %q inc %d", val, ver.Incarnation)
	}
}
```

- [ ] **Step 3: Implement Scheduler**

Create `/Users/senton/besachain/parallel-evm/phase3-blockstm/scheduler.go`:

```go
package blockstm

import (
	"sync"
	"sync/atomic"
)

// TaskType represents the type of task for a transaction.
type TaskType int

const (
	TaskExecute TaskType = iota
	TaskValidate
)

// Task represents a unit of work for the parallel executor.
type Task struct {
	TxIndex     int
	Incarnation int
	Type        TaskType
}

// Scheduler manages the execution and validation of transactions
// using the Block-STM algorithm.
type Scheduler struct {
	numTxs      int
	incarnation []atomic.Int32  // Current incarnation per TX
	status      []atomic.Int32  // 0=pending, 1=executing, 2=executed, 3=validated, -1=aborted
	mu          sync.Mutex
	nextExec    atomic.Int32    // Next TX to execute
	nextValid   atomic.Int32    // Next TX to validate
}

func NewScheduler(numTxs int) *Scheduler {
	s := &Scheduler{
		numTxs:      numTxs,
		incarnation: make([]atomic.Int32, numTxs),
		status:      make([]atomic.Int32, numTxs),
	}
	return s
}

// NextTask returns the next task to work on, or nil if none available.
func (s *Scheduler) NextTask() *Task {
	// Try validation first (higher priority)
	validIdx := int(s.nextValid.Load())
	if validIdx < s.numTxs && s.status[validIdx].Load() == 2 {
		if s.status[validIdx].CompareAndSwap(2, 3) {
			s.nextValid.Add(1)
			return &Task{
				TxIndex:     validIdx,
				Incarnation: int(s.incarnation[validIdx].Load()),
				Type:        TaskValidate,
			}
		}
	}

	// Try execution
	execIdx := int(s.nextExec.Load())
	if execIdx < s.numTxs && s.status[execIdx].Load() == 0 {
		if s.status[execIdx].CompareAndSwap(0, 1) {
			s.nextExec.Add(1)
			return &Task{
				TxIndex:     execIdx,
				Incarnation: int(s.incarnation[execIdx].Load()),
				Type:        TaskExecute,
			}
		}
	}

	return nil
}

// FinishExecution marks a TX as executed, ready for validation.
func (s *Scheduler) FinishExecution(txIdx int) {
	s.status[txIdx].Store(2)
}

// AbortAndReschedule marks a TX for re-execution after validation failure.
func (s *Scheduler) AbortAndReschedule(txIdx int) {
	s.incarnation[txIdx].Add(1)
	s.status[txIdx].Store(0) // Back to pending

	// Reset validation pointer if needed
	for {
		current := s.nextValid.Load()
		if int(current) <= txIdx {
			break
		}
		if s.nextValid.CompareAndSwap(current, int32(txIdx)) {
			break
		}
	}

	// Reset execution pointer
	for {
		current := s.nextExec.Load()
		if int(current) <= txIdx {
			break
		}
		if s.nextExec.CompareAndSwap(current, int32(txIdx)) {
			break
		}
	}
}

// AllDone returns true when all transactions are validated.
func (s *Scheduler) AllDone() bool {
	return int(s.nextValid.Load()) >= s.numTxs
}
```

- [ ] **Step 4: Write Scheduler tests**

```go
package blockstm

import "testing"

func TestSchedulerSequentialOrder(t *testing.T) {
	s := NewScheduler(3)

	// Should get TX 0 execute first
	task := s.NextTask()
	if task == nil || task.TxIndex != 0 || task.Type != TaskExecute {
		t.Fatalf("expected execute TX 0, got %+v", task)
	}

	// TX 0 not finished yet, should get TX 1
	task = s.NextTask()
	if task == nil || task.TxIndex != 1 || task.Type != TaskExecute {
		t.Fatalf("expected execute TX 1, got %+v", task)
	}

	// Finish TX 0, should get validate TX 0
	s.FinishExecution(0)
	task = s.NextTask()
	if task == nil || task.TxIndex != 0 || task.Type != TaskValidate {
		t.Fatalf("expected validate TX 0, got %+v", task)
	}
}

func TestSchedulerAbortAndReexecute(t *testing.T) {
	s := NewScheduler(3)

	// Execute TX 0
	s.NextTask() // TX 0 execute
	s.FinishExecution(0)

	// Execute TX 1
	s.NextTask() // TX 1 execute
	s.FinishExecution(1)

	// Validate TX 0 (pass)
	s.NextTask() // TX 0 validate

	// Abort TX 1 (conflict detected)
	s.AbortAndReschedule(1)

	// Should re-execute TX 1 with incremented incarnation
	task := s.NextTask()
	if task == nil || task.TxIndex != 1 || task.Incarnation != 1 {
		t.Fatalf("expected re-execute TX 1 inc 1, got %+v", task)
	}
}
```

- [ ] **Step 5: Implement Parallel Executor**

Create `/Users/senton/besachain/parallel-evm/phase3-blockstm/executor.go`:

```go
package blockstm

import (
	"runtime"
	"sync"

	"github.com/ethereum/go-ethereum/common"
)

// ReadSet tracks all state reads during a transaction execution.
type ReadSet struct {
	Reads map[common.Hash]Version // key -> version read from MVData
}

// WriteSet tracks all state writes during a transaction execution.
type WriteSet struct {
	Writes map[common.Hash][]byte // key -> value written
}

// TxExecutor is the function that executes a single transaction.
// It receives the MVData for reads and returns the write set.
type TxExecutor func(txIdx int, mv *MVData) (*ReadSet, *WriteSet, error)

// ParallelExecutor runs transactions in parallel using Block-STM.
type ParallelExecutor struct {
	numWorkers int
	mvData     *MVData
	scheduler  *Scheduler
	executor   TxExecutor
	readSets   []ReadSet
	writeSets  []WriteSet
	mu         sync.Mutex
}

func NewParallelExecutor(numTxs int, executor TxExecutor) *ParallelExecutor {
	workers := runtime.NumCPU()
	if workers > numTxs {
		workers = numTxs
	}

	return &ParallelExecutor{
		numWorkers: workers,
		mvData:     NewMVData(),
		scheduler:  NewScheduler(numTxs),
		executor:   executor,
		readSets:   make([]ReadSet, numTxs),
		writeSets:  make([]WriteSet, numTxs),
	}
}

// Execute runs all transactions in parallel and returns when all are validated.
func (pe *ParallelExecutor) Execute() error {
	var wg sync.WaitGroup

	for i := 0; i < pe.numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			pe.worker()
		}()
	}

	wg.Wait()
	return nil
}

func (pe *ParallelExecutor) worker() {
	for !pe.scheduler.AllDone() {
		task := pe.scheduler.NextTask()
		if task == nil {
			runtime.Gosched() // Yield to other goroutines
			continue
		}

		switch task.Type {
		case TaskExecute:
			pe.executeTask(task)
		case TaskValidate:
			pe.validateTask(task)
		}
	}
}

func (pe *ParallelExecutor) executeTask(task *Task) {
	// Execute the transaction, reading from MVData
	readSet, writeSet, err := pe.executor(task.TxIndex, pe.mvData)
	if err != nil {
		// Execution error — mark as executed anyway, validation will handle it
		pe.scheduler.FinishExecution(task.TxIndex)
		return
	}

	// Record write set in MVData
	for key, value := range writeSet.Writes {
		pe.mvData.Write(key, task.TxIndex, task.Incarnation, value)
	}

	// Store read/write sets for validation
	pe.mu.Lock()
	pe.readSets[task.TxIndex] = *readSet
	pe.writeSets[task.TxIndex] = *writeSet
	pe.mu.Unlock()

	pe.scheduler.FinishExecution(task.TxIndex)
}

func (pe *ParallelExecutor) validateTask(task *Task) {
	pe.mu.Lock()
	readSet := pe.readSets[task.TxIndex]
	pe.mu.Unlock()

	// Validate: check that all reads still return the same version
	valid := true
	for key, expectedVersion := range readSet.Reads {
		_, currentVersion, found := pe.mvData.Read(key, task.TxIndex)
		if !found || currentVersion != expectedVersion {
			valid = false
			break
		}
	}

	if !valid {
		// Conflict detected — re-execute
		pe.scheduler.AbortAndReschedule(task.TxIndex)
	}
}

// Results returns the final write sets in transaction order.
func (pe *ParallelExecutor) Results() []WriteSet {
	return pe.writeSets
}
```

- [ ] **Step 6: Write executor integration test**

```go
package blockstm

import (
	"testing"

	"github.com/ethereum/go-ethereum/common"
)

func TestParallelExecutorNoConflicts(t *testing.T) {
	numTxs := 100

	// Each TX writes to its own unique key — no conflicts
	executor := func(txIdx int, mv *MVData) (*ReadSet, *WriteSet, error) {
		key := common.BigToHash(common.Big0.SetInt64(int64(txIdx)))
		return &ReadSet{Reads: map[common.Hash]Version{}},
			&WriteSet{Writes: map[common.Hash][]byte{key: []byte("value")}},
			nil
	}

	pe := NewParallelExecutor(numTxs, executor)
	err := pe.Execute()
	if err != nil {
		t.Fatal(err)
	}

	results := pe.Results()
	if len(results) != numTxs {
		t.Fatalf("expected %d results, got %d", numTxs, len(results))
	}
}

func TestParallelExecutorWithConflicts(t *testing.T) {
	numTxs := 10
	sharedKey := common.HexToHash("0xDEAD")

	// All TXs read and write the same key — maximum conflict
	executor := func(txIdx int, mv *MVData) (*ReadSet, *WriteSet, error) {
		readSet := &ReadSet{Reads: make(map[common.Hash]Version)}

		// Try to read the shared key
		_, ver, found := mv.Read(sharedKey, txIdx)
		if found {
			readSet.Reads[sharedKey] = ver
		}

		// Write new value
		writeSet := &WriteSet{
			Writes: map[common.Hash][]byte{
				sharedKey: []byte{byte(txIdx)},
			},
		}

		return readSet, writeSet, nil
	}

	pe := NewParallelExecutor(numTxs, executor)
	err := pe.Execute()
	if err != nil {
		t.Fatal(err)
	}

	// All should complete, even with conflicts (re-execution handles it)
	results := pe.Results()
	if len(results) != numTxs {
		t.Fatalf("expected %d results, got %d", numTxs, len(results))
	}
}
```

- [ ] **Step 7: Run all Phase 3 tests**

```bash
cd /Users/senton/besachain/parallel-evm/phase3-blockstm
go test -v -race
```

Expected: All tests pass, no race conditions

- [ ] **Step 8: Commit**

```bash
git add parallel-evm/phase3-blockstm/
git commit -m "feat: Block-STM parallel executor (Phase 3 — optimistic parallel EVM)"
```

---

## Task 14: TPS Benchmark Tool

**Files:**
- Create: `/Users/senton/besachain/benchmark/tps-bench.go`
- Create: `/Users/senton/besachain/benchmark/run-benchmark.sh`

- [ ] **Step 1: Write benchmark tool**

Create a Go program that:
1. Connects to a BesaChain RPC endpoint
2. Sends N simple transfer transactions in parallel
3. Measures blocks, gas used, time elapsed
4. Reports TPS and gas/sec

- [ ] **Step 2: Write benchmark runner script**

```bash
#!/bin/bash
# Run TPS benchmarks against L1 and L2
echo "=== BesaChain TPS Benchmark ==="
echo "L1 (14440): http://54.235.85.175:1444"
echo "L2 (19120): http://54.235.85.175:1912"

go run benchmark/tps-bench.go \
  --rpc http://54.235.85.175:1444 \
  --txcount 10000 \
  --workers 50 \
  --label "L1-Fermi"

go run benchmark/tps-bench.go \
  --rpc http://54.235.85.175:1912 \
  --txcount 10000 \
  --workers 50 \
  --label "L2-Fourier"
```

- [ ] **Step 3: Commit**

```bash
git add benchmark/
git commit -m "feat: TPS benchmark tool for L1 and L2"
```

---

## Task 15: LibyaChain Health Check

**Files:**
- Create: `/Users/senton/besachain/deploy/health-check.sh`

- [ ] **Step 1: Write health check script**

```bash
#!/bin/bash
# Verify LibyaChain is unaffected by BesaChain deployment
echo "=== LibyaChain Health Check ==="

for IP in 54.235.85.175 44.223.91.64 3.84.251.178; do
  echo "--- $IP ---"

  # Check LibyaChain L1
  echo -n "LibyaChain L1 (8545): "
  curl -sf -X POST "http://$IP:8545" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null || echo "NOT RUNNING"

  # Check BesaChain L1
  echo -n "BesaChain L1 (1444):  "
  curl -sf -X POST "http://$IP:1444" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' 2>/dev/null || echo "NOT RUNNING"

  # Check disk
  ssh -o ConnectTimeout=3 -i ~/.ssh/libyachain-key.pem "ubuntu@$IP" "df -h / /data 2>/dev/null | tail -n+2" 2>/dev/null || echo "SSH FAILED"

  # Check memory
  ssh -o ConnectTimeout=3 -i ~/.ssh/libyachain-key.pem "ubuntu@$IP" "free -h | head -2" 2>/dev/null || echo "SSH FAILED"
  echo
done
```

- [ ] **Step 2: Run it**

```bash
bash deploy/health-check.sh
```

- [ ] **Step 3: Commit**

```bash
git add deploy/health-check.sh
git commit -m "feat: LibyaChain health check script"
```

---

## Task 16: Archive Old Code & Clean Up

**Files:**
- Move: `/Users/senton/besachain/op-geth/` → `/Users/senton/besachain/archive/op-geth-old/`
- Move: `/Users/senton/besachain/op-node/` → `/Users/senton/besachain/archive/op-node-old/`

- [ ] **Step 1: Archive the old broken code**

```bash
cd /Users/senton/besachain
mkdir -p archive
mv op-geth archive/op-geth-old
mv op-node archive/op-node-old
```

- [ ] **Step 2: Update documentation**

Update README or docs to reflect new structure: `bsc/` for L1, `opbnb/` for L2.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: archive old Clique-based code, new structure: bsc/ (L1) + opbnb/ (L2)"
```

---

## Execution Order & Parallelism

```
Independent (run in parallel):
├── Task 0: SSH Access (validator-check agent)
├── Task 1: Fork BSC v1.7.2 (bsc-fork agent)
├── Task 6: Fork opBNB v0.5.5 (opbnb-fork agent)
├── Task 7: Fix contract chain IDs (contracts agent)
└── Task 16: Archive old code (cleanup agent)

Sequential after Task 1:
├── Task 2: Graft ML-DSA onto BSC
├── Task 3: Create chain config
├── Task 4: Generate genesis & keys
├── Task 5: Create deploy scripts
└── Task 10: Enable TxDAG

Sequential after Task 6:
├── Task 6 Step 3-6: ML-DSA + L2 genesis

After Tasks 5 + 6 complete:
├── Task 8: Deploy OP Stack L1 contracts
├── Task 9: Deploy L2 sequencer

Independent (any time):
├── Task 11: Lazy Beneficiary (Phase 2a)
├── Task 12: Sparse Trie (Phase 2b)
├── Task 13: Block-STM (Phase 3)
├── Task 14: TPS benchmark tool

Final:
└── Task 15: LibyaChain health check
```

---

## Success Criteria

- [ ] L1 testnet (14440) producing blocks at ~450ms on 3 validators
- [ ] L2 testnet (19120) producing blocks at ~250ms on V1 sequencer
- [ ] ML-DSA precompile callable on both L1 and L2 (0x0120, 0x0121)
- [ ] TxDAG parallel execution enabled on L1
- [ ] No LibyaChain service disruption
- [ ] Phase 2 (lazy beneficiary + sparse trie) code written and tested
- [ ] Phase 3 (Block-STM) core data structures written and tested
- [ ] TPS benchmark tool operational
