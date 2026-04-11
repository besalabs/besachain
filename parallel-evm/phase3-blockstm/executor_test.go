package blockstm

import (
	"testing"
	"sync"
	"sync/atomic"
)

func TestNoConflictParallelExecution(t *testing.T) {
	// Each transaction reads and writes a different key
	execCount := 0
	var mu sync.Mutex

	execFunc := func(txIdx uint64) *TransactionData {
		mu.Lock()
		execCount++
		mu.Unlock()

		return &TransactionData{
			ReadSet:  map[string][]byte{},
			WriteSet: map[string][]byte{
				string([]byte{byte(txIdx)}): []byte{byte(txIdx * 2)},
			},
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true // Always valid
	}

	executor := NewParallelExecutor(10, 4, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed")
	}

	if executor.scheduler.ExecutedCount() != 10 {
		t.Errorf("Expected 10 executed, got %d", executor.scheduler.ExecutedCount())
	}
}

func TestHighConflictExecution(t *testing.T) {
	// All transactions touch the same key
	execFunc := func(txIdx uint64) *TransactionData {
		return &TransactionData{
			ReadSet: map[string][]byte{
				"sharedKey": nil, // Read the shared key
			},
			WriteSet: map[string][]byte{
				"sharedKey": []byte{byte(txIdx)},
			},
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true // All validations pass
	}

	executor := NewParallelExecutor(5, 2, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed")
	}

	if executor.scheduler.ExecutedCount() != 5 {
		t.Errorf("Expected 5 executed, got %d", executor.scheduler.ExecutedCount())
	}
}

func TestValidationFailureAndRetry(t *testing.T) {
	// Track execution attempts
	execAttempts := make(map[uint64]int)
	var mu sync.Mutex

	execFunc := func(txIdx uint64) *TransactionData {
		mu.Lock()
		execAttempts[txIdx]++
		mu.Unlock()

		return &TransactionData{
			ReadSet:  map[string][]byte{},
			WriteSet: map[string][]byte{"key": []byte{byte(txIdx)}},
		}
	}

	// Fail validation once, then pass
	validCalls := make(map[uint64]int)
	validFunc := func(txIdx uint64) bool {
		mu.Lock()
		defer mu.Unlock()
		validCalls[txIdx]++
		// Fail first time, pass on retry
		return validCalls[txIdx] > 1
	}

	executor := NewParallelExecutor(3, 2, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to eventually succeed")
	}

	// All transactions should be executed at least once
	mu.Lock()
	for i := 0; i < 3; i++ {
		if execAttempts[uint64(i)] < 1 {
			t.Errorf("TX%d should have been executed", i)
		}
	}
	mu.Unlock()
}

func TestMixedWorkload(t *testing.T) {
	// Some transactions conflict, some don't
	execFunc := func(txIdx uint64) *TransactionData {
		var writeKey string
		if txIdx < 5 {
			writeKey = "conflicted" // Transactions 0-4 conflict
		} else {
			writeKey = string([]byte{byte(txIdx)}) // Others don't
		}

		return &TransactionData{
			ReadSet:  map[string][]byte{},
			WriteSet: map[string][]byte{writeKey: []byte{byte(txIdx)}},
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true
	}

	executor := NewParallelExecutor(10, 4, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed")
	}

	if executor.scheduler.ExecutedCount() != 10 {
		t.Errorf("Expected 10 executed")
	}
}

func TestConcurrentWorkers(t *testing.T) {
	execCount := int32(0)

	execFunc := func(txIdx uint64) *TransactionData {
		atomic.AddInt32(&execCount, 1)
		return &TransactionData{
			ReadSet:  map[string][]byte{},
			WriteSet: map[string][]byte{"key": []byte{byte(txIdx)}},
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true
	}

	executor := NewParallelExecutor(20, 8, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed")
	}

	if int(execCount) < 20 {
		t.Errorf("Expected at least 20 executions, got %d", execCount)
	}
}

func TestEmptyTransactionData(t *testing.T) {
	execFunc := func(txIdx uint64) *TransactionData {
		return nil // No reads or writes
	}

	validFunc := func(txIdx uint64) bool {
		return true
	}

	executor := NewParallelExecutor(5, 2, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed with empty data")
	}

	if executor.scheduler.ExecutedCount() != 5 {
		t.Errorf("Expected 5 executed")
	}
}

func TestLargeTransaction(t *testing.T) {
	execFunc := func(txIdx uint64) *TransactionData {
		writeSet := make(map[string][]byte)
		for i := 0; i < 1000; i++ {
			writeSet[string([]byte{byte(txIdx), byte(i), byte(i >> 8)})] = []byte{byte(txIdx + uint64(i))}
		}

		return &TransactionData{
			ReadSet:  map[string][]byte{},
			WriteSet: writeSet,
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true
	}

	executor := NewParallelExecutor(5, 2, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed")
	}

	if executor.scheduler.ExecutedCount() != 5 {
		t.Errorf("Expected 5 executed")
	}
}

func TestSingleTransaction(t *testing.T) {
	execFunc := func(txIdx uint64) *TransactionData {
		return &TransactionData{
			ReadSet:  map[string][]byte{},
			WriteSet: map[string][]byte{"key": []byte("value")},
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true
	}

	executor := NewParallelExecutor(1, 1, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed")
	}

	if !executor.scheduler.AllDone() {
		t.Errorf("Expected all done")
	}
}

func TestMultipleWorkers(t *testing.T) {
	// Test with different worker counts
	for numWorkers := 1; numWorkers <= 8; numWorkers++ {
		execFunc := func(txIdx uint64) *TransactionData {
			return &TransactionData{
				ReadSet:  map[string][]byte{},
				WriteSet: map[string][]byte{"key": []byte{byte(txIdx)}},
			}
		}

		validFunc := func(txIdx uint64) bool {
			return true
		}

		executor := NewParallelExecutor(20, numWorkers, execFunc, validFunc)
		success := executor.Execute()

		if !success {
			t.Errorf("Expected execution to succeed with %d workers", numWorkers)
		}

		if executor.scheduler.ExecutedCount() != 20 {
			t.Errorf("Expected 20 executed with %d workers", numWorkers)
		}
	}
}

func TestValidationCounts(t *testing.T) {
	execFunc := func(txIdx uint64) *TransactionData {
		return &TransactionData{
			ReadSet:  map[string][]byte{},
			WriteSet: map[string][]byte{"key": []byte{byte(txIdx)}},
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true
	}

	executor := NewParallelExecutor(10, 4, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed")
	}

	if executor.scheduler.ValidatedCount() != 10 {
		t.Errorf("Expected 10 validated, got %d", executor.scheduler.ValidatedCount())
	}
}

func TestDataConsistency(t *testing.T) {
	// Transaction 0 writes account=100
	// Transaction 1 reads account, writes account+=50 (150)
	// Transaction 2 reads account, writes account+=25 (175)

	execFunc := func(txIdx uint64) *TransactionData {
		writeSet := make(map[string][]byte)
		readSet := make(map[string][]byte)

		if txIdx == 0 {
			writeSet["account"] = []byte{100}
		} else {
			readSet["account"] = nil // Mark as read
			writeSet["account"] = []byte{byte(100 + txIdx*25)}
		}

		return &TransactionData{
			ReadSet:  readSet,
			WriteSet: writeSet,
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true
	}

	executor := NewParallelExecutor(3, 2, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed")
	}

	// Verify writes are in MVData
	val := executor.mvdata.Read("account", 2)
	if val == nil {
		t.Errorf("Expected final value to be in MVData")
	}
}

func TestStressTest(t *testing.T) {
	execCount := int32(0)

	execFunc := func(txIdx uint64) *TransactionData {
		atomic.AddInt32(&execCount, 1)

		writeSet := make(map[string][]byte)
		writeSet["key"] = []byte{byte(txIdx)}

		return &TransactionData{
			ReadSet:  map[string][]byte{},
			WriteSet: writeSet,
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true
	}

	executor := NewParallelExecutor(100, 16, execFunc, validFunc)
	success := executor.Execute()

	if !success {
		t.Errorf("Expected execution to succeed")
	}

	if executor.scheduler.ExecutedCount() != 100 {
		t.Errorf("Expected 100 executed, got %d", executor.scheduler.ExecutedCount())
	}

	if executor.scheduler.ValidatedCount() != 100 {
		t.Errorf("Expected 100 validated, got %d", executor.scheduler.ValidatedCount())
	}
}

func TestGetAccessors(t *testing.T) {
	execFunc := func(txIdx uint64) *TransactionData {
		return &TransactionData{
			ReadSet:  map[string][]byte{},
			WriteSet: map[string][]byte{"key": []byte{byte(txIdx)}},
		}
	}

	validFunc := func(txIdx uint64) bool {
		return true
	}

	executor := NewParallelExecutor(5, 2, execFunc, validFunc)

	mvdata := executor.GetMVData()
	if mvdata == nil {
		t.Errorf("Expected non-nil MVData")
	}

	scheduler := executor.GetScheduler()
	if scheduler == nil {
		t.Errorf("Expected non-nil Scheduler")
	}
}
