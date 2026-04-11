package blockstm

import (
	"testing"
	"sync"
)

func TestWriteAndRead(t *testing.T) {
	m := NewMVData()

	key := "account_balance"
	value := []byte{1, 2, 3, 4, 5}

	m.Write(key, 0, 0, value)

	result := m.Read(key, 0)
	if result == nil {
		t.Fatalf("Expected value, got nil")
	}

	for i, b := range value {
		if result[i] != b {
			t.Errorf("Value mismatch at index %d", i)
		}
	}
}

func TestReadNonexistentKey(t *testing.T) {
	m := NewMVData()

	result := m.Read("nonexistent", 0)
	if result != nil {
		t.Errorf("Expected nil for nonexistent key, got %v", result)
	}
}

func TestWriteMultipleVersions(t *testing.T) {
	m := NewMVData()

	key := "balance"

	// TX0 writes 100
	m.Write(key, 0, 0, []byte{100})
	// TX1 writes 200
	m.Write(key, 1, 0, []byte{200})
	// TX2 writes 44 (255 - 211)
	m.Write(key, 2, 0, []byte{44})

	// Reading at TX0 returns 100
	if m.Read(key, 0)[0] != 100 {
		t.Errorf("Expected 100")
	}

	// Reading at TX1 returns 200
	if m.Read(key, 1)[0] != 200 {
		t.Errorf("Expected 200")
	}

	// Reading at TX2 returns 44
	if m.Read(key, 2)[0] != 44 {
		t.Errorf("Expected 44")
	}
}

func TestReadLatestBefore(t *testing.T) {
	m := NewMVData()

	key := "balance"

	m.Write(key, 0, 0, []byte{100})
	m.Write(key, 2, 0, []byte{200})

	// Reading at TX1 should return value from TX0 (latest before)
	result := m.Read(key, 1)
	if result[0] != 100 {
		t.Errorf("Expected 100, got %d", result[0])
	}
}

func TestReExecutionOverwrites(t *testing.T) {
	m := NewMVData()

	key := "balance"

	// TX0 first execution
	m.Write(key, 0, 0, []byte{100})
	if m.Read(key, 0)[0] != 100 {
		t.Errorf("Expected 100")
	}

	// TX0 second execution (re-execution with incarnation 1)
	m.Write(key, 0, 1, []byte{150})
	if m.Read(key, 0)[0] != 150 {
		t.Errorf("Expected 150 after re-execution")
	}
}

func TestMarkDeleted(t *testing.T) {
	m := NewMVData()

	key := "balance"

	m.Write(key, 0, 0, []byte{100})
	m.MarkDeleted(key, 0, 0)

	result := m.Read(key, 1)
	if result != nil {
		t.Errorf("Expected nil after deletion, got %v", result)
	}
}

func TestReadReturnsCopy(t *testing.T) {
	m := NewMVData()

	key := "balance"
	original := []byte{1, 2, 3}

	m.Write(key, 0, 0, original)

	result := m.Read(key, 0)
	result[0] = 99

	// Read again and verify original value unchanged
	result2 := m.Read(key, 0)
	if result2[0] != 1 {
		t.Errorf("Expected 1, got %d (copy was modified)", result2[0])
	}
}

func TestComplexScenario(t *testing.T) {
	m := NewMVData()

	key1 := "account1"
	key2 := "account2"

	// Block execution:
	// TX0: writes account1=100, account2=50
	m.Write(key1, 0, 0, []byte{100})
	m.Write(key2, 0, 0, []byte{50})

	// TX1: reads account1 (gets 100), writes account2=75
	if m.Read(key1, 1)[0] != 100 {
		t.Errorf("TX1 should read 100 from TX0")
	}
	m.Write(key2, 1, 0, []byte{75})

	// TX2: reads both (should get 100, 75)
	if m.Read(key1, 2)[0] != 100 {
		t.Errorf("Expected 100")
	}
	if m.Read(key2, 2)[0] != 75 {
		t.Errorf("Expected 75")
	}
}

func TestMVDataIncarnationTracking(t *testing.T) {
	m := NewMVData()

	key := "counter"

	// TX0 first run (incarnation 0)
	m.Write(key, 0, 0, []byte{1})

	// TX0 aborts, second run (incarnation 1)
	m.Write(key, 0, 1, []byte{2})

	// TX0 aborts again, third run (incarnation 2)
	m.Write(key, 0, 2, []byte{3})

	// Latest incarnation should be read
	if m.Read(key, 0)[0] != 3 {
		t.Errorf("Expected 3 (latest incarnation)")
	}
}

func TestConcurrentWrites(t *testing.T) {
	m := NewMVData()

	numGoroutines := 50

	var wg sync.WaitGroup
	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func(txIdx int) {
			defer wg.Done()
			key := "balance"
			m.Write(key, uint64(txIdx), 0, []byte{byte(txIdx)})
		}(i)
	}

	wg.Wait()

	if m.KeyCount() != 1 {
		t.Errorf("Expected 1 key, got %d", m.KeyCount())
	}
}

func TestConcurrentReadsAndWrites(t *testing.T) {
	m := NewMVData()

	// Pre-populate
	for i := 0; i < 10; i++ {
		m.Write("key1", uint64(i), 0, []byte{byte(i)})
	}

	var wg sync.WaitGroup
	wg.Add(100)

	// Readers
	for i := 0; i < 50; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < 100; j++ {
				m.Read("key1", uint64(j%10))
			}
		}()
	}

	// Writers
	for i := 0; i < 50; i++ {
		go func(idx int) {
			defer wg.Done()
			for j := 0; j < 100; j++ {
				m.Write("key2", uint64(idx), uint64(j), []byte{byte(j)})
			}
		}(i)
	}

	wg.Wait()
}

func TestMultipleKeys(t *testing.T) {
	m := NewMVData()

	keys := []string{"key1", "key2", "key3"}

	for i, key := range keys {
		m.Write(key, uint64(i), 0, []byte{byte(i)})
	}

	if m.KeyCount() != 3 {
		t.Errorf("Expected 3 keys, got %d", m.KeyCount())
	}

	for i, key := range keys {
		result := m.Read(key, 10)
		if result[0] != byte(i) {
			t.Errorf("Expected %d for %s", i, key)
		}
	}
}

func TestGetVersions(t *testing.T) {
	m := NewMVData()

	key := "balance"

	m.Write(key, 0, 0, []byte{100})
	m.Write(key, 0, 1, []byte{150})
	m.Write(key, 1, 0, []byte{200})

	versions := m.GetVersions(key)

	if len(versions) != 3 {
		t.Errorf("Expected 3 versions, got %d", len(versions))
	}

	// Verify copies
	versions[0].Value[0] = 99
	result := m.Read(key, 0)
	if result[0] != 150 { // latest incarnation for TX0
		t.Errorf("Modification to versions should not affect stored data")
	}
}

func TestEmptyValue(t *testing.T) {
	m := NewMVData()

	m.Write("key", 0, 0, []byte{})

	result := m.Read("key", 0)
	if len(result) != 0 {
		t.Errorf("Expected empty value")
	}
}

func TestLargeValues(t *testing.T) {
	m := NewMVData()

	largeValue := make([]byte, 100000)
	for i := 0; i < len(largeValue); i++ {
		largeValue[i] = byte((i * 7) % 256)
	}

	m.Write("key", 0, 0, largeValue)

	result := m.Read("key", 0)
	if len(result) != len(largeValue) {
		t.Errorf("Expected length %d, got %d", len(largeValue), len(result))
	}

	for i := 0; i < len(largeValue); i++ {
		if result[i] != largeValue[i] {
			t.Errorf("Value mismatch at index %d", i)
			break
		}
	}
}

func TestClear(t *testing.T) {
	m := NewMVData()

	m.Write("key1", 0, 0, []byte{100})
	m.Write("key2", 1, 0, []byte{200})

	m.Clear()

	if m.KeyCount() != 0 {
		t.Errorf("Expected 0 keys after clear")
	}

	if m.Read("key1", 0) != nil {
		t.Errorf("Expected nil after clear")
	}
}
