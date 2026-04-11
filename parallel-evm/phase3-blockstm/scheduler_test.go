package blockstm

import (
	"testing"
	"sync"
)

func TestNewScheduler(t *testing.T) {
	s := NewScheduler(5)

	if s.ExecutedCount() != 0 {
		t.Errorf("Expected 0 executed initially")
	}

	if s.ValidatedCount() != 0 {
		t.Errorf("Expected 0 validated initially")
	}

	if s.AllDone() {
		t.Errorf("Expected not all done initially")
	}
}

func TestNextTaskSequential(t *testing.T) {
	s := NewScheduler(3)

	// Should get execute tasks in order
	task1 := s.NextTask()
	if task1.Type != TaskTypeExecute || task1.TxIdx != 0 {
		t.Errorf("Expected execute task for TX0, got %v", task1)
	}

	task2 := s.NextTask()
	if task2.Type != TaskTypeExecute || task2.TxIdx != 1 {
		t.Errorf("Expected execute task for TX1, got %v", task2)
	}

	task3 := s.NextTask()
	if task3.Type != TaskTypeExecute || task3.TxIdx != 2 {
		t.Errorf("Expected execute task for TX2, got %v", task3)
	}

	// Mark all as executed
	s.FinishExecution(0)
	s.FinishExecution(1)
	s.FinishExecution(2)

	// Now should get validate tasks
	task := s.NextTask()
	if task.Type != TaskTypeValidate || task.TxIdx != 0 {
		t.Errorf("Expected validate task for TX0, got %v", task)
	}
}

func TestIncarnationTracking(t *testing.T) {
	s := NewScheduler(1)

	task1 := s.NextTask()
	if task1.Incarnation != 0 {
		t.Errorf("Expected incarnation 0")
	}

	s.AbortAndReschedule(0)

	task2 := s.NextTask()
	if task2.Incarnation != 1 {
		t.Errorf("Expected incarnation 1, got %d", task2.Incarnation)
	}

	s.AbortAndReschedule(0)

	task3 := s.NextTask()
	if task3.Incarnation != 2 {
		t.Errorf("Expected incarnation 2, got %d", task3.Incarnation)
	}
}

func TestFinishExecution(t *testing.T) {
	s := NewScheduler(1)

	s.FinishExecution(0)

	if s.ExecutedCount() != 1 {
		t.Errorf("Expected 1 executed")
	}
}

func TestAbortAndReschedule(t *testing.T) {
	s := NewScheduler(2)

	// Get first execute task for TX0
	task1 := s.NextTask()
	if task1.TxIdx != 0 {
		t.Fatalf("Expected task for TX0")
	}

	// Abort TX0
	s.AbortAndReschedule(0)

	// Next task should be TX1
	task2 := s.NextTask()
	if task2.TxIdx != 1 {
		t.Errorf("Expected task for TX1")
	}

	s.FinishExecution(1)

	// After completing TX1, next task should be the rescheduled TX0
	task3 := s.NextTask()
	if task3.Type != TaskTypeExecute || task3.TxIdx != 0 {
		t.Errorf("Expected rescheduled execute for TX0, got %v", task3)
	}

	if task3.Incarnation != 1 {
		t.Errorf("Expected incarnation 1, got %d", task3.Incarnation)
	}
}

func TestValidatePriority(t *testing.T) {
	s := NewScheduler(3)

	// Execute TX0 and TX1
	task0 := s.NextTask() // Execute TX0
	s.FinishExecution(0)
	task1 := s.NextTask() // Execute TX1
	s.FinishExecution(1)
	task2 := s.NextTask() // Execute TX2
	s.FinishExecution(2)

	// Now next tasks should be validates (priority over future executes if any)
	if task0.TxIdx != 0 || task1.TxIdx != 1 || task2.TxIdx != 2 {
		t.Errorf("Execution order wrong")
	}

	// Should get validate tasks now
	vt := s.NextTask()
	if vt.Type != TaskTypeValidate {
		t.Errorf("Expected validate task, got %v", vt)
	}
}

func TestAllDone(t *testing.T) {
	s := NewScheduler(2)

	if s.AllDone() {
		t.Errorf("Expected not done initially")
	}

	// Execute both
	_ = s.NextTask() // TX0
	s.FinishExecution(0)
	_ = s.NextTask() // TX1
	s.FinishExecution(1)

	if s.AllDone() {
		t.Errorf("Expected not done after execution (validation pending)")
	}

	// Validate both
	vt0 := s.NextTask()
	if vt0.Type != TaskTypeValidate {
		t.Fatalf("Expected validate")
	}
	s.MarkValidated(0)

	vt1 := s.NextTask()
	if vt1.Type != TaskTypeValidate {
		t.Fatalf("Expected validate")
	}
	s.MarkValidated(1)

	if !s.AllDone() {
		t.Errorf("Expected all done after execution and validation")
	}
}

func TestNextTaskReturnsNilWhenDone(t *testing.T) {
	s := NewScheduler(1)

	s.NextTask() // Execute
	s.FinishExecution(0)
	s.NextTask() // Validate
	s.MarkValidated(0)

	task := s.NextTask()
	if task != nil {
		t.Errorf("Expected nil when all done, got %v", task)
	}
}

func TestConcurrentExecution(t *testing.T) {
	s := NewScheduler(10)

	var wg sync.WaitGroup
	wg.Add(10)

	for i := 0; i < 10; i++ {
		go func() {
			defer wg.Done()
			task := s.NextTask()
			if task == nil {
				t.Error("Expected task")
				return
			}
			s.FinishExecution(task.TxIdx)
		}()
	}

	wg.Wait()

	if s.ExecutedCount() != 10 {
		t.Errorf("Expected 10 executed, got %d", s.ExecutedCount())
	}
}

func TestMultipleAborts(t *testing.T) {
	s := NewScheduler(1)

	t0 := s.NextTask()
	if t0.TxIdx != 0 {
		t.Fatalf("Expected TX0")
	}

	// Abort multiple times
	s.AbortAndReschedule(0)
	s.AbortAndReschedule(0)
	s.AbortAndReschedule(0)

	// Get the three rescheduled tasks
	tasks := make([]*Task, 0)
	for i := 0; i < 3; i++ {
		task := s.NextTask()
		if task != nil && task.TxIdx == 0 {
			tasks = append(tasks, task)
		}
	}

	if len(tasks) != 3 {
		t.Errorf("Expected 3 rescheduled tasks, got %d", len(tasks))
	}

	// Verify incarnations are correct
	if tasks[0].Incarnation != 1 || tasks[1].Incarnation != 2 || tasks[2].Incarnation != 3 {
		t.Errorf("Expected incarnations 1, 2, 3")
	}
}

func TestValidatedCount(t *testing.T) {
	s := NewScheduler(3)

	// Execute all
	for i := 0; i < 3; i++ {
		task := s.NextTask()
		s.FinishExecution(task.TxIdx)
	}

	// Validate selectively
	s.MarkValidated(0)
	if s.ValidatedCount() != 1 {
		t.Errorf("Expected 1 validated, got %d", s.ValidatedCount())
	}

	s.MarkValidated(1)
	if s.ValidatedCount() != 2 {
		t.Errorf("Expected 2 validated, got %d", s.ValidatedCount())
	}

	s.MarkValidated(2)
	if s.ValidatedCount() != 3 {
		t.Errorf("Expected 3 validated, got %d", s.ValidatedCount())
	}
}

func TestLargeNumberOfTransactions(t *testing.T) {
	s := NewScheduler(1000)

	// Execute all
	for i := 0; i < 1000; i++ {
		task := s.NextTask()
		if task == nil {
			t.Errorf("Expected task at iteration %d", i)
			break
		}
		s.FinishExecution(task.TxIdx)
	}

	if s.ExecutedCount() != 1000 {
		t.Errorf("Expected 1000 executed, got %d", s.ExecutedCount())
	}

	// Validate all
	for i := 0; i < 1000; i++ {
		task := s.NextTask()
		if task == nil {
			t.Errorf("Expected validate task at iteration %d", i)
			break
		}
		if task.Type != TaskTypeValidate {
			t.Errorf("Expected validate at iteration %d", i)
			break
		}
		s.MarkValidated(task.TxIdx)
	}

	if !s.AllDone() {
		t.Errorf("Expected all done")
	}
}

func TestConcurrentAbortAndReschedule(t *testing.T) {
	s := NewScheduler(10)

	var wg sync.WaitGroup
	wg.Add(20)

	for i := 0; i < 10; i++ {
		go func(txIdx int) {
			defer wg.Done()
			s.NextTask()
			s.AbortAndReschedule(uint64(txIdx))
		}(i)
	}

	for i := 0; i < 10; i++ {
		go func(txIdx int) {
			defer wg.Done()
			task := s.NextTask()
			if task != nil && task.TxIdx == uint64(txIdx) {
				s.FinishExecution(task.TxIdx)
			}
		}(i)
	}

	wg.Wait()
}
