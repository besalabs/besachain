package optimizations

import (
	"testing"
	"sync"
)

func TestInsertAndGet(t *testing.T) {
	st := NewSparseTrie()

	key := []byte("key1")
	value := []byte("value1")

	st.Update(key, value)

	retrieved, ok := st.Get(key)
	if !ok {
		t.Fatalf("Expected key to exist")
	}

	if string(retrieved) != string(value) {
		t.Errorf("Expected %s, got %s", value, retrieved)
	}
}

func TestGetNonexistentKey(t *testing.T) {
	st := NewSparseTrie()

	_, ok := st.Get([]byte("nonexistent"))
	if ok {
		t.Errorf("Expected key to not exist")
	}
}

func TestDelete(t *testing.T) {
	st := NewSparseTrie()

	key := []byte("key1")
	value := []byte("value1")

	st.Update(key, value)
	st.Delete(key)

	_, ok := st.Get(key)
	if ok {
		t.Errorf("Expected key to be deleted")
	}
}

func TestUpdateOverwrite(t *testing.T) {
	st := NewSparseTrie()

	key := []byte("key1")
	value1 := []byte("value1")
	value2 := []byte("value2")

	st.Update(key, value1)
	st.Update(key, value2)

	retrieved, ok := st.Get(key)
	if !ok {
		t.Fatalf("Expected key to exist")
	}

	if string(retrieved) != string(value2) {
		t.Errorf("Expected %s, got %s", value2, retrieved)
	}
}

func TestHashDeterminism(t *testing.T) {
	st1 := NewSparseTrie()
	st2 := NewSparseTrie()

	// Add same data in same order
	for i := 0; i < 10; i++ {
		key := []byte{byte(i)}
		value := []byte{byte(i * 2)}
		st1.Update(key, value)
		st2.Update(key, value)
	}

	hash1 := st1.Hash()
	hash2 := st2.Hash()

	if hash1 != hash2 {
		t.Errorf("Expected same hash for same data, got %v vs %v", hash1, hash2)
	}
}

func TestHashDeterminismDifferentOrder(t *testing.T) {
	st1 := NewSparseTrie()
	st2 := NewSparseTrie()

	// Add same data in different order
	for i := 0; i < 10; i++ {
		key := []byte{byte(i)}
		value := []byte{byte(i * 2)}
		st1.Update(key, value)
	}

	for i := 9; i >= 0; i-- {
		key := []byte{byte(i)}
		value := []byte{byte(i * 2)}
		st2.Update(key, value)
	}

	hash1 := st1.Hash()
	hash2 := st2.Hash()

	if hash1 != hash2 {
		t.Errorf("Expected same hash regardless of insertion order, got %v vs %v", hash1, hash2)
	}
}

func TestHashChangesOnUpdate(t *testing.T) {
	st := NewSparseTrie()

	st.Update([]byte("key1"), []byte("value1"))
	hash1 := st.Hash()

	st.Update([]byte("key1"), []byte("value2"))
	hash2 := st.Hash()

	if hash1 == hash2 {
		t.Errorf("Expected hash to change when value changes")
	}
}

func TestHashChangesOnDelete(t *testing.T) {
	st := NewSparseTrie()

	st.Update([]byte("key1"), []byte("value1"))
	hash1 := st.Hash()

	st.Delete([]byte("key1"))
	hash2 := st.Hash()

	if hash1 == hash2 {
		t.Errorf("Expected hash to change when key is deleted")
	}
}

func TestDirtyCount(t *testing.T) {
	st := NewSparseTrie()

	st.Update([]byte("key1"), []byte("value1"))
	st.Update([]byte("key2"), []byte("value2"))

	if st.DirtyCount() != 2 {
		t.Errorf("Expected dirty count 2, got %d", st.DirtyCount())
	}

	// Hash clears dirty
	st.Hash()

	if st.DirtyCount() != 0 {
		t.Errorf("Expected dirty count 0 after hash, got %d", st.DirtyCount())
	}
}

func TestDirtyCountAfterDelete(t *testing.T) {
	st := NewSparseTrie()

	st.Update([]byte("key1"), []byte("value1"))
	st.Hash() // Clear dirty

	st.Delete([]byte("key1"))

	if st.DirtyCount() != 1 {
		t.Errorf("Expected dirty count 1 after delete, got %d", st.DirtyCount())
	}
}

func TestGetReturnsCopy(t *testing.T) {
	st := NewSparseTrie()

	original := []byte("value1")
	st.Update([]byte("key1"), original)

	retrieved, _ := st.Get([]byte("key1"))
	// Modify retrieved
	retrieved[0] = 'X'

	// Get again and verify original not modified
	retrieved2, _ := st.Get([]byte("key1"))
	if retrieved2[0] != 'v' {
		t.Errorf("Expected value to be unchanged, got %v", retrieved2)
	}
}

func TestConcurrentUpdates(t *testing.T) {
	st := NewSparseTrie()
	numGoroutines := 100

	var wg sync.WaitGroup
	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func(idx int) {
			defer wg.Done()
			for j := 0; j < 10; j++ {
				// Use string keys to avoid byte overflow
				key := []byte(string(rune(idx*10 + j)))
				value := []byte{byte((idx*10 + j + 1) % 256)}
				st.Update(key, value)
			}
		}(i)
	}

	wg.Wait()

	if st.NodeCount() != numGoroutines*10 {
		t.Errorf("Expected %d nodes, got %d", numGoroutines*10, st.NodeCount())
	}
}

func TestConcurrentReadsAndWrites(t *testing.T) {
	st := NewSparseTrie()

	// Pre-populate
	for i := 0; i < 50; i++ {
		st.Update([]byte{byte(i)}, []byte{byte(i * 2)})
	}

	var wg sync.WaitGroup
	wg.Add(100)

	for i := 0; i < 50; i++ {
		// Readers
		go func(idx int) {
			defer wg.Done()
			for j := 0; j < 100; j++ {
				st.Get([]byte{byte(idx)})
			}
		}(i)

		// Writers
		go func(idx int) {
			defer wg.Done()
			for j := 0; j < 100; j++ {
				st.Update([]byte{byte(idx)}, []byte{byte(idx*2 + j)})
			}
		}(i)
	}

	wg.Wait()

	if st.NodeCount() != 50 {
		t.Errorf("Expected 50 nodes, got %d", st.NodeCount())
	}
}

func TestConcurrentHashAndUpdates(t *testing.T) {
	st := NewSparseTrie()

	var wg sync.WaitGroup
	wg.Add(101)

	// One hasher
	go func() {
		defer wg.Done()
		for i := 0; i < 100; i++ {
			st.Hash()
		}
	}()

	// Multiple updaters
	for i := 0; i < 100; i++ {
		go func(idx int) {
			defer wg.Done()
			st.Update([]byte{byte(idx)}, []byte{byte(idx * 2)})
		}(i)
	}

	wg.Wait()
}

func TestNodeCount(t *testing.T) {
	st := NewSparseTrie()

	if st.NodeCount() != 0 {
		t.Errorf("Expected 0 nodes initially, got %d", st.NodeCount())
	}

	st.Update([]byte("key1"), []byte("value1"))
	if st.NodeCount() != 1 {
		t.Errorf("Expected 1 node, got %d", st.NodeCount())
	}

	st.Update([]byte("key2"), []byte("value2"))
	if st.NodeCount() != 2 {
		t.Errorf("Expected 2 nodes, got %d", st.NodeCount())
	}

	st.Delete([]byte("key1"))
	if st.NodeCount() != 1 {
		t.Errorf("Expected 1 node after delete, got %d", st.NodeCount())
	}
}

func TestClear(t *testing.T) {
	st := NewSparseTrie()

	st.Update([]byte("key1"), []byte("value1"))
	st.Update([]byte("key2"), []byte("value2"))
	st.Hash()

	st.Clear()

	if st.NodeCount() != 0 {
		t.Errorf("Expected 0 nodes after clear, got %d", st.NodeCount())
	}

	if st.DirtyCount() != 0 {
		t.Errorf("Expected 0 dirty after clear, got %d", st.DirtyCount())
	}

	_, ok := st.Get([]byte("key1"))
	if ok {
		t.Errorf("Expected key to not exist after clear")
	}
}

func TestLargeKeyValues(t *testing.T) {
	st := NewSparseTrie()

	// Large key and value
	largeKey := make([]byte, 1000)
	for i := 0; i < len(largeKey); i++ {
		largeKey[i] = byte(i % 256)
	}

	largeValue := make([]byte, 10000)
	for i := 0; i < len(largeValue); i++ {
		largeValue[i] = byte((i * 7) % 256)
	}

	st.Update(largeKey, largeValue)

	retrieved, ok := st.Get(largeKey)
	if !ok {
		t.Fatalf("Expected key to exist")
	}

	if len(retrieved) != len(largeValue) {
		t.Errorf("Expected value length %d, got %d", len(largeValue), len(retrieved))
	}

	for i := 0; i < len(largeValue); i++ {
		if retrieved[i] != largeValue[i] {
			t.Errorf("Value mismatch at index %d", i)
			break
		}
	}
}

func TestEmptyKeyAndValue(t *testing.T) {
	st := NewSparseTrie()

	st.Update([]byte{}, []byte{})

	retrieved, ok := st.Get([]byte{})
	if !ok {
		t.Fatalf("Expected empty key to exist")
	}

	if len(retrieved) != 0 {
		t.Errorf("Expected empty value, got %v", retrieved)
	}
}

func TestMultipleUpdatesAndHashes(t *testing.T) {
	st := NewSparseTrie()

	st.Update([]byte("key1"), []byte("value1"))
	hash1 := st.Hash()

	st.Update([]byte("key1"), []byte("value1")) // Same value
	hash2 := st.Hash()

	if hash1 != hash2 {
		t.Errorf("Expected same hash for same value")
	}

	st.Update([]byte("key1"), []byte("value1new"))
	hash3 := st.Hash()

	if hash1 == hash3 {
		t.Errorf("Expected different hash for different value")
	}
}
