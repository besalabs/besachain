package blockstm

import (
	"sync"
)

// TaskType represents the type of task to execute.
type TaskType int

const (
	// TaskTypeExecute indicates a transaction execution task.
	TaskTypeExecute TaskType = iota
	// TaskTypeValidate indicates a transaction validation task.
	TaskTypeValidate
)

// Task represents a unit of work in the scheduler.
type Task struct {
	Type        TaskType
	TxIdx       uint64
	Incarnation uint64
}

// Scheduler manages the execution and validation of transactions.
// It ensures transactions are executed and validated in the correct order
// while supporting re-execution on conflicts.
type Scheduler struct {
	mu              sync.Mutex
	numTxs          uint64
	taskQueue       []*Task
	executed        map[uint64]bool           // set of executed transaction indices
	validated       map[uint64]bool           // set of validated transaction indices
	incarnations    map[uint64]uint64         // track current incarnation per tx
	nextTaskIdx     int                       // index in taskQueue for next task
	issuedTasks     map[uint64]map[uint64]bool // txIdx -> incarnation set of issued execute tasks
}

// NewScheduler creates a new scheduler for a block with numTxs transactions.
func NewScheduler(numTxs uint64) *Scheduler {
	s := &Scheduler{
		numTxs:       numTxs,
		executed:     make(map[uint64]bool),
		validated:    make(map[uint64]bool),
		incarnations: make(map[uint64]uint64),
		issuedTasks:  make(map[uint64]map[uint64]bool),
	}

	// Initialize taskQueue with execute tasks for all transactions in order
	for i := uint64(0); i < numTxs; i++ {
		s.taskQueue = append(s.taskQueue, &Task{
			Type:        TaskTypeExecute,
			TxIdx:       i,
			Incarnation: 0,
		})
		s.issuedTasks[i] = make(map[uint64]bool)
	}

	return s
}

// NextTask returns the next task to execute.
// Returns nil if all tasks are complete.
// Returns execute tasks first, then validation tasks when all execute tasks are queued.
func (s *Scheduler) NextTask() *Task {
	s.mu.Lock()
	defer s.mu.Unlock()

	// First, try to return the next execute task from the queue
	for s.nextTaskIdx < len(s.taskQueue) {
		task := s.taskQueue[s.nextTaskIdx]
		s.nextTaskIdx++

		// Check if this task has already been issued
		if !s.issuedTasks[task.TxIdx][task.Incarnation] {
			s.issuedTasks[task.TxIdx][task.Incarnation] = true
			return task
		}
	}

	// Queue is exhausted, look for a validate task for a completed but not yet validated transaction
	for i := uint64(0); i < s.numTxs; i++ {
		if s.executed[i] && !s.validated[i] {
			return &Task{
				Type:        TaskTypeValidate,
				TxIdx:       i,
				Incarnation: s.incarnations[i],
			}
		}
	}

	// No more tasks
	return nil
}

// FinishExecution marks a transaction as executed.
func (s *Scheduler) FinishExecution(txIdx uint64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.executed[txIdx] = true
}

// AbortAndReschedule increments the incarnation for a transaction and
// re-queues it for execution.
func (s *Scheduler) AbortAndReschedule(txIdx uint64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Increment incarnation
	s.incarnations[txIdx]++
	nextIncarnation := s.incarnations[txIdx]

	// Re-queue execution task
	s.taskQueue = append(s.taskQueue, &Task{
		Type:        TaskTypeExecute,
		TxIdx:       txIdx,
		Incarnation: nextIncarnation,
	})

	// Mark as not executed again
	s.executed[txIdx] = false
}

// AllDone returns true when all transactions have been executed and validated.
func (s *Scheduler) AllDone() bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i := uint64(0); i < s.numTxs; i++ {
		if !s.executed[i] || !s.validated[i] {
			return false
		}
	}
	return true
}

// MarkValidated marks a transaction as validated.
func (s *Scheduler) MarkValidated(txIdx uint64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.validated[txIdx] = true
}

// ExecutedCount returns the number of transactions that have been executed.
func (s *Scheduler) ExecutedCount() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	count := 0
	for i := uint64(0); i < s.numTxs; i++ {
		if s.executed[i] {
			count++
		}
	}
	return count
}

// ValidatedCount returns the number of transactions that have been validated.
func (s *Scheduler) ValidatedCount() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.validated)
}
