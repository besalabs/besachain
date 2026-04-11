# BesaChain L2 250ms Block Time Implementation

## Overview
This document summarizes the implementation of 250ms block times for BesaChain L2 using the opBNB Fourier upgrade approach.

## Key Findings

### How opBNB Achieves 250ms Block Times

1. **Modified op-geth** (bnb-chain/op-geth v0.5.9)
   - Millisecond timestamps stored in `Header.MixDigest`
   - Fourier hardfork activation
   - Block interval parsing from engine API

2. **Modified op-node** (bnb-chain/opbnb v0.5.5)
   - Millisecond-level block time calculation
   - Block time parameter in milliseconds (not seconds)
   - `PayloadAttributes` with millisecond timestamps

3. **Hardfork Configuration**
   - `fourier_time`: Activates 250ms block production
   - Block time: 250 (milliseconds)
   - Millisecond representation in block headers

## Implementation Steps

### Step 1: Build Custom Binaries

```bash
# Build op-geth with millisecond support
git clone --depth 1 --branch v0.5.9 https://github.com/bnb-chain/op-geth.git
cd op-geth && make geth
sudo cp build/bin/geth /usr/local/bin/besachain-op-geth

# Build op-node with millisecond support
git clone --depth 1 --branch v0.5.5 https://github.com/bnb-chain/opbnb.git
cd opbnb && make op-node
sudo cp op-node/bin/op-node /usr/local/bin/besachain-op-node

# Build op-batcher and op-proposer
make op-batcher
make op-proposer
sudo cp op-batcher/bin/op-batcher /usr/local/bin/besachain-op-batcher
sudo cp op-proposer/bin/op-proposer /usr/local/bin/besachain-op-proposer
```

### Step 2: L2 Genesis Configuration

The L2 genesis must include:
- Millisecond timestamp support
- OP Stack predeployed contracts
- Optimism config with EIP-1559 parameters

### Step 3: Rollup Configuration

Key differences for 250ms:
```json
{
  "block_time": 250,
  "fourier_time": 0,
  "max_sequencer_drift": 1200,
  "seq_window_size": 7200,
  "channel_timeout": 600
}
```

### Step 4: Service Configuration

**op-node flags for 250ms:**
- `--l1.epoch-poll-interval 375ms` (adjusted for 450ms L1)
- Block time calculated in milliseconds
- Millisecond timestamps in `PayloadAttributes`

## Technical Details

### Millisecond Timestamp Storage

opBNB stores milliseconds in `Header.MixDigest`:
- First 2 bytes: opBNB millisecond time
- Last 2 bytes: BSC millisecond time (for reference)
- Forward compatibility check: `h.MixDigest == (common.Hash{})`

### Block Time Calculation

```go
// In op-node, block time is in milliseconds
blockTime := 250 // 250ms

// Millisecond timestamp functions
MilliTimestamp()      // Returns ms-level timestamp
NextMilliTimestamp()  // Calculates next block timestamp
NextSecondsTimestamp() // For fork compatibility
```

### Parameter Adjustments

| Parameter | 1s Block | 250ms Block | Notes |
|-----------|----------|-------------|-------|
| L1EpochPollInterval | 3s | 750ms | Sync with L1 |
| MaxSequencerDrift | 1800 blocks | 7200 blocks | Time-based |
| SeqWindowSize | 14400 | 57600 | Recovery window |
| ChannelTimeout | 1200 | 4800 | Batch timeout |
| MaxChannelDuration | 32 | 128 | Batcher config |

## Deployment Scripts

Two scripts have been created:

1. **`deploy-op-stack.sh`** - Standard OP Stack deployment (1s blocks)
2. **`deploy-250ms-l2.sh`** - 250ms block time deployment using opBNB

## Expected Performance

| Metric | Standard OP Stack | BesaChain L2 (250ms) |
|--------|------------------|---------------------|
| Block Time | 1s | 250ms |
| TPS (transfer) | ~1000 | ~4000+ |
| Confirmation | 1s | 250ms |
| Finality | L1 dependent | L1 dependent |

## When Server Recovers

Run the deployment:
```bash
# SSH to server
ssh -i ~/.ssh/libyachain-validators.pem ec2-user@54.235.85.175

# Upload and run script
chmod +x /tmp/deploy-250ms-l2.sh
/tmp/deploy-250ms-l2.sh
```

## References

- [opBNB GitHub](https://github.com/bnb-chain/opbnb)
- [op-geth BNB Chain](https://github.com/bnb-chain/op-geth)
- [Fourier Hardfork Announcement](https://docs.bnbchain.org/announce/fourier-opbnb/)
- [BEP-543: 500ms Block Time](https://forum.bnbchain.org/t/bep-proposal-opbnb-shorter-block-interval-to-500ms/3378)

## Status

- ✅ L1: 450ms block time (working)
- ⏳ L2: 250ms block time (pending server recovery)
- ⏳ Full OP Stack deployment (pending)
