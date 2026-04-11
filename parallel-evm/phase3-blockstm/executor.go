package blockstm

import (
	"sync"
)

// TransactionData represents the read and write sets for a transaction.
type TransactionData struct {
	ReadSet  map[string][]byte // keys read from state
	WriteSet map[string][]byte // keys written to state
}

// ExecutionFunc is the function signature for executing a transaction.
// It receives the transaction index and returns the transaction data (read/write sets).
type ExecutionFunc func(txIdx uint64) *TransactionData

// ValidationFunc is the function signature for validating a transaction.
// It receives the transaction index and returns true if validation passes.
type ValidationFunc func(txIdx uint64) bool

// ParallelExecutor runs transactions in parallel using the Block-STM algorithm.
type ParallelExecutor struct {
	mvdata      *MVData
	scheduler   *Scheduler
	execFunc    ExecutionFunc
	validFunc   ValidationFunc
	numWorkers  int
	mu          sync.Mutex
}

// NewParallelExecutor creates a new parallel executor.
func NewParallelExecutor(numTxs uint64, numWorkers int, execFunc ExecutionFunc, validFunc ValidationFunc) *ParallelExecutor {
	return &ParallelExecutor{
		mvdata:     NewMVData(),
		scheduler:  NewScheduler(numTxs),
		execFunc:   execFunc,
		validFunc:  validFunc,
		numWorkers: numWorkers,
	}
}

// Execute runs all transactions using the Block-STM algorithm.
// Returns true if all transactions were successfully executed and validated.
func (pe *ParallelExecutor) Execute() bool {
	var wg sync.WaitGroup
	wg.Add(pe.numWorkers)

	for i := 0; i < pe.numWorkers; i++ {
		go func() {
			defer wg.Done()
			pe.workerLoop()
		}()
	}

	wg.Wait()

	return pe.scheduler.AllDone()
}

// workerLoop is the main loop executed by each worker.
func (pe *ParallelExecutor) workerLoop() {
	for {
		task := pe.scheduler.NextTask()
		if task == nil {
			break
		}

		if task.Type == TaskTypeExecute {
			pe.executeTransaction(task.TxIdx)
		} else if task.Type == TaskTypeValidate {
			pe.validateTransaction(task.TxIdx, task.Incarnation)
		}
	}
}

// executeTransaction executes a single transaction.
func (pe *ParallelExecutor) executeTransaction(txIdx uint64) {
	// Call the user-provided execution function
	txData := pe.execFunc(txIdx)

	// Record all reads and writes in MVData
	if txData != nil {
		for key, value := range txData.WriteSet {
			pe.mvdata.Write(key, txIdx, 0, value)
		}

		// Also track reads (for dependency analysis if needed)
		for key := range txData.ReadSet {
			// Just verify the read is available
			_ = pe.mvdata.Read(key, txIdx)
		}
	}

	pe.scheduler.FinishExecution(txIdx)
}

// validateTransaction validates a transaction against its read set.
func (pe *ParallelExecutor) validateTransaction(txIdx uint64, incarnation uint64) {
	// Call the user-provided validation function
	if pe.validFunc(txIdx) {
		// Validation passed
		pe.scheduler.MarkValidated(txIdx)
	} else {
		// Validation failed - abort and reschedule
		pe.scheduler.AbortAndReschedule(txIdx)
	}
}

// GetMVData returns the multi-version data structure (for testing).
func (pe *ParallelExecutor) GetMVData() *MVData {
	return pe.mvdata
}

// GetScheduler returns the scheduler (for testing).
func (pe *ParallelExecutor) GetScheduler() *Scheduler {
	return pe.scheduler
}
