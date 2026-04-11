# TxDAG Technical Reference

Quick reference for developers integrating or upgrading TxDAG parallel execution.

---

## 1. Core Interfaces

### TxDAG Interface

**Location:** `core/types/dag.go:59-77`

```go
type TxDAG interface {
    // Type returns TxDAG type identifier
    Type() byte  // EmptyTxDAGType (0x00) or PlainTxDAGType (0x01)
    
    // Inner returns the inner instance (for RLP encoding)
    Inner() interface{}
    
    // DelayGasFeeDistribution indicates if gas fees can be distributed at finalization
    DelayGasFeeDistribution() bool
    
    // TxDep returns the dependencies for transaction at index i
    TxDep(int) *TxDep
    
    // TxCount returns total transaction count
    TxCount() int
    
    // SetTxDep sets the dependency for transaction at index i
    SetTxDep(int, TxDep) error
}
```

### TxDep Structure

**Location:** `core/types/dag.go:321-386`

```go
type TxDep struct {
    TxIndexes []uint64  // Indices of prior transactions this TX depends on
    Flags     *uint8    // Optional flags (nil if no flags)
}

// Flags (bitwise flags)
const (
    NonDependentRelFlag uint8 = 0x01  // TX is independent of all prior TXs
    ExcludedTxFlag      uint8 = 0x02  // TX must execute sequentially
)

// Methods
func (d *TxDep) AppendDep(i int)        // Append dependency on transaction i
func (d *TxDep) Exist(i int) bool       // Check if depends on transaction i
func (d *TxDep) Count() int             // Number of dependencies
func (d *TxDep) Last() int              // Index of last dependency (-1 if none)
func (d *TxDep) CheckFlag(flag uint8) bool
func (d *TxDep) SetFlag(flag uint8)
func (d *TxDep) ClearFlag(flag uint8)
```

---

## 2. Creating TxDAG Structures

### Empty DAG (Sequential Execution)

```go
dag := types.NewEmptyTxDAG()
// Type: EmptyTxDAGType (0x00)
// DelayGasFeeDistribution: false
// All transactions execute sequentially
```

### Plain DAG (Parallel Execution)

```go
dag := types.NewPlainTxDAG(txCount)
// Type: PlainTxDAGType (0x01)
// DelayGasFeeDistribution: true
// Each transaction has a TxDep in dag.TxDeps[i]

// Example: TX-2 depends on TX-0 and TX-1
dep := types.NewTxDep([]uint64{0, 1})
dag.SetTxDep(2, dep)

// Example: TX-3 is independent
indepDep := types.NewTxDep(nil, types.NonDependentRelFlag)
dag.SetTxDep(3, indepDep)

// Example: TX-4 must execute sequentially (e.g., system contract)
excludedDep := types.NewTxDep(nil, types.ExcludedTxFlag)
dag.SetTxDep(4, excludedDep)
```

---

## 3. Encoding/Decoding

### Encode TxDAG to Bytes

```go
// Encode as raw bytes
data, err := types.EncodeTxDAG(dag)
// data: []byte containing type byte + RLP-encoded inner

// Encode as transaction calldata (includes ABI encoding)
calldata, err := types.EncodeTxDAGCalldata(dag)
// calldata: []byte ready to use as transaction data
// Calls setTxDAG(bytes) on a system contract
```

### Decode from Bytes

```go
// Decode raw bytes
dag, err := types.DecodeTxDAG(data)
// Handles EmptyTxDAGType and PlainTxDAGType

// Decode from transaction calldata
dag, err := types.DecodeTxDAGCalldata(txData)
// Extracts method signature, unpacks arguments
```

### Extract from Block

```go
// Get TxDAG from block (stored in last transaction)
dag, err := types.GetTxDAG(block)
// Returns error if no TxDAG found
// Assumes block.Transactions()[-1].Data() contains encoded TxDAG
```

---

## 4. Validation

### Validate TxDAG Structure

```go
// Comprehensive validation
err := types.ValidateTxDAG(dag, txCount)
if err != nil {
    // Errors:
    // - TxDag TxCount != actual transaction count
    // - Dependency indices exceed transaction count
    // - Dependency indices not in ascending order
    // - Unknown flags set
    log.Error("Invalid TxDAG", "err", err)
}

// Type-specific validation
err := types.ValidatePlainTxDAG(dag, txCount)
```

---

## 5. Read/Write Set Tracking

### RWSet Structure

**Location:** `core/types/mvstates.go:66-100`

```go
type RWSet struct {
    index              int
    accReadSet         map[common.Address]map[AccountState]struct{}
    accWriteSet        map[common.Address]map[AccountState]struct{}
    slotReadSet        map[common.Address]map[common.Hash]struct{}
    slotWriteSet       map[common.Address]map[common.Hash]struct{}
    excludedTx         bool  // Mark TX as non-parallelizable
    cannotGasFeeDelay  bool  // Mark TX as requiring sequential fee distribution
}

// Account state types being tracked
const (
    AccountSelf     AccountState = 0x01  // Account exists/deleted
    AccountNonce    AccountState = 0x02  // Nonce changes
    AccountBalance  AccountState = 0x04  // Balance changes
    AccountCodeHash AccountState = 0x08  // Code changes
    AccountSuicide  AccountState = 0x10  // Self-destruct
)

// Methods
func (s *RWSet) RecordAccountRead(addr common.Address, state AccountState)
func (s *RWSet) RecordAccountWrite(addr common.Address, state AccountState)
func (s *RWSet) RecordStorageRead(addr common.Address, key common.Hash)
func (s *RWSet) RecordStorageWrite(addr common.Address, key common.Hash)
```

---

## 6. MultiVersionState Engine

### Reset MVStates for Block

**Location:** `core/state_processor.go:95-98`

```go
if p.bc.enableTxDAG {
    feeReceivers := []common.Address{
        context.Coinbase,                           // Block miner
        params.OptimismBaseFeeRecipient,            // L2 Sequencer (Optimism)
        params.OptimismL1FeeRecipient,              // L1 Fee vault (Optimism)
    }
    statedb.ResetMVStates(len(block.Transactions()), feeReceivers).EnableAsyncGen()
}
```

### Signal Batch Processing Complete

**Location:** `core/state_processor.go:117-119`

```go
if statedb.MVStates() != nil {
    statedb.MVStates().BatchRecordHandle()
}
```

### Resolve TxDAG from RWSets

**Location:** `core/state_processor.go:132`

```go
dag, err := statedb.ResolveTxDAG(len(block.Transactions()))
// Returns PlainTxDAG or EmptyTxDAG based on detected conflicts
// Performs conflict analysis on accumulated RWSets
```

### Stop MVStates

**Location:** `core/state_processor.go:127-130`

```go
if p.bc.enableTxDAG {
    defer func() {
        statedb.MVStates().Stop()
    }()
}
```

---

## 7. CLI Configuration

### Flag Definition

**Location:** `cmd/utils/flags.go`

```go
var ParallelTxDAGFlag = &cli.BoolFlag{
    Name:     "parallel.txdag",
    Usage:    "Enable the experimental parallel TxDAG generation (default = false)",
    Category: flags.VMCategory,
}

var ParallelTxDAGSenderPrivFlag = &cli.StringFlag{
    Name:     "parallel.txdagsenderpriv",
    Usage:    "private key of the sender who sends the TxDAG transactions",
    Value:    "",
    Category: flags.VMCategory,
}
```

### Flag Parsing

**Location:** `cmd/utils/flags.go`

```go
if ctx.IsSet(ParallelTxDAGFlag.Name) {
    cfg.EnableParallelTxDAG = ctx.Bool(ParallelTxDAGFlag.Name)
}

if ctx.IsSet(ParallelTxDAGSenderPrivFlag.Name) {
    priHex := ctx.String(ParallelTxDAGSenderPrivFlag.Name)
    cfg.Miner.ParallelTxDAGSenderPriv, err = crypto.HexToECDSA(priHex)
    if err != nil {
        Fatalf("Failed to parse txdag private key...")
    }
}
```

### Config Struct

**Location:** `eth/ethconfig/config.go`

```go
type Config struct {
    // ... existing fields ...
    
    EnableParallelTxDAG bool
}
```

### Service Activation

**Location:** `eth/backend.go`

```go
if config.EnableParallelTxDAG {
    eth.blockchain.SetupTxDAGGeneration()
}
```

---

## 8. Systemd Service Configuration

### Example Unit File

```ini
[Unit]
Description=Besachain Node
After=network.target

[Service]
Type=simple
User=geth
WorkingDirectory=/var/lib/geth

ExecStart=/usr/local/bin/geth \
    --datadir=/var/lib/geth \
    --http \
    --http.addr=0.0.0.0 \
    --http.port=8545 \
    --http.api=eth,net,web3,debug \
    --ws \
    --ws.addr=0.0.0.0 \
    --ws.port=8546 \
    --ws.api=eth,net,web3,debug \
    --networkid=21801 \
    --syncmode=full \
    --metrics \
    --metrics.addr=0.0.0.0 \
    --metrics.port=6060 \
    --cache=2048 \
    --maxpeers=50 \
    --parallel.txdag \
    --parallel.txdagsenderpriv=0x$(cat /etc/geth/txdag-key.hex)

Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
```

### Key File Management

```bash
# Generate TxDAG sender account (if needed)
# Account must have sufficient balance for TxDAG TX gas
geth account new --datadir=/var/lib/geth --keystore=/etc/geth/keystore

# Extract private key from keystore (CAREFULLY!)
# Store in /etc/geth/txdag-key.hex with restrictive permissions
chmod 600 /etc/geth/txdag-key.hex
chown geth:geth /etc/geth/txdag-key.hex
```

---

## 9. Mining with TxDAG

### Generate TxDAG During Block Mining

**Location:** `miner/worker.go`

```go
// When building a block
sender := w.config.ParallelTxDAGSenderPriv
if sender == nil {
    return nil, fmt.Errorf("missing sender private key")
}

// After executing all transactions:
// txIndex = len(block.Transactions())
// statedb has RWSets for all transactions

// Resolve TxDAG from RWSets
txDAG, err := statedb.ResolveTxDAG(txIndex, types.TxDep{Flags: &types.NonDependentRelFlag})
if txDAG == nil {
    return nil, err
}

// Encode TxDAG
data, err := types.EncodeTxDAGCalldata(txDAG)
if err != nil {
    return nil, fmt.Errorf("failed to encode txDAG, err: %v", err)
}

// Create TxDAG transaction
nonce := statedb.GetNonce(fromAddress)
txDAGTx := types.NewTransaction(
    nonce,
    systemContractAddr,  // Target system contract
    big.NewInt(0),       // No value
    21000 + len(data)*16, // Gas limit
    gasPrice,
    data,                // Encoded TxDAG calldata
)

// Sign and append to block
signedTx, _ := types.SignTx(txDAGTx, signer, sender)
block.Transactions = append(block.Transactions, signedTx)
```

---

## 10. Performance Metrics

### Metrics Registration

**Location:** `core/types/dag.go:388-403`

```go
var (
    totalTxMeter    = metrics.NewRegisteredMeter("dag/txcnt", nil)
    totalNoDepMeter = metrics.NewRegisteredMeter("dag/nodepcnt", nil)
)

func EvaluateTxDAGPerformance(dag TxDAG) {
    if dag.TxCount() == 0 {
        return
    }
    totalTxMeter.Mark(int64(dag.TxCount()))
    for i := 0; i < dag.TxCount(); i++ {
        if len(TxDependency(dag, i)) == 0 {
            totalNoDepMeter.Mark(1)
        }
    }
}
```

### Reading Metrics

```bash
# Query metrics endpoint (assuming Prometheus)
curl http://localhost:6060/debug/metrics

# Look for:
# dag/txcnt = total transactions processed per block
# dag/nodepcnt = transactions with zero dependencies (parallelizable)

# Calculate parallelization ratio:
# ratio = dag/nodepcnt / dag/txcnt
```

---

## 11. Testing Utilities

### Enable TxDAG in Block Tests

**Location:** `tests/block_test_util.go`

```go
func (t *BlockTest) Run(
    snapshotter bool, 
    scheme string, 
    tracer vm.EVMLogger, 
    enableTxDAG bool,  // <-- Pass true to enable
    postCheck func(error, *core.BlockChain),
) (result error) {
    // ...
    if enableTxDAG {
        chain.SetupTxDAGGeneration()
    }
    // ...
}
```

### Generate Test Block with TxDAG

**Location:** `miner/worker_test.go`

```go
func generateTxDAGGaslessBlock(t *testing.T, enableMev, enableTxDAG bool) {
    t.Log("generateTxDAGGaslessBlock", enableMev, enableTxDAG)
    
    var (
        db     = rawdb.NewMemoryDatabase()
        config = &params.ChainConfig{...}
        engine = ethash.NewFaker()
    )
    
    w, b := newTestWorker(t, &config, engine, db, 0, &cfg, &vmConfig)
    defer w.close()
    
    if enableTxDAG {
        w.chain.SetupTxDAGGeneration()
    }
    
    // Build block with parallel execution
    block := w.buildBlock()
    
    // Verify TxDAG was generated
    dag, _ := types.GetTxDAG(block)
    if enableTxDAG {
        assert.NotNil(t, dag)
    }
}
```

---

## 12. Debugging & Logging

### Enable Debug Logs

**Location:** `core/state_processor.go:135`

```go
log.Debug("Process TxDAG result", "block", block.NumberU64(), "tx", len(block.Transactions()), "txDAG", dag.TxCount())
```

### Log Levels

```go
// Info level
log.Info("node enable TxDAG feature")

// Debug level
log.Debug("Process TxDAG result", ...)

// Error level
log.Error("ResolveTxDAG err", "block", block.NumberU64(), "err", err)
```

### Enable Debug Mode (Systemd)

```bash
# Start geth with debug logging
geth --log.lvl debug --parallel.txdag ...

# Or modify systemd service:
ExecStart=/usr/local/bin/geth ... 2>&1 | logger -t geth -p daemon.debug
```

---

## 13. Migration Checklist

For upgrading from BSC v1.7.2 to version with TxDAG:

- [ ] Generate or import TxDAG sender account
  - [ ] Extract private key to secure location
  - [ ] Fund account with sufficient gas (10+ ETH)
- [ ] Add `--parallel.txdag` flag to geth launch parameters
- [ ] Add `--parallel.txdagsenderpriv=0x...` with key
- [ ] Restart geth node
- [ ] Monitor `dag/txcnt` and `dag/nodepcnt` metrics
- [ ] Verify blocks include TxDAG transaction (last TX)
- [ ] Benchmark: Compare block execution times before/after
- [ ] Update documentation for operations team

---

## 14. Known Issues & Workarounds

| Issue | Cause | Workaround |
|-------|-------|-----------|
| TxDAG TX fails with "insufficient balance" | Account not funded | Send ETH to TxDAG sender account |
| All blocks fall back to EmptyTxDAG | Many excluded transactions | Check for system calls, contract deployments |
| Metrics not updating | Metrics not enabled | Use `--metrics` flag, check Prometheus |
| Private key parse error | Invalid hex format | Ensure key starts with 0x, is 64 hex chars |
| ResolveTxDAG timeout | Block too complex | Increase timeouts or disable for this block |

---

## 15. Performance Tuning

### Expected Performance

```
Block Size      Independent TXs   Speedup
50 TXs          5  (10%)          ~1.1x
50 TXs          10 (20%)          ~1.2x
50 TXs          25 (50%)          ~1.5x
50 TXs          40 (80%)          ~2.0x

Mining Overhead: ~50-100ms per block (RWSet analysis)
Block Validation: ~0ms additional (already cached)
```

### Tuning Options

```go
// In core/types/mvstates.go, adjust pool sizes:
const (
    initSyncPoolSize  = 4       // Goroutine pool size
    asyncSendInterval = 20      // Batch send interval (TXs)
)

// Larger pool = more parallel execution
// Larger interval = better batching but higher memory
```

---

**Last Updated:** 2026-04-11  
**Reference:** op-geth v0.5.9 source code
