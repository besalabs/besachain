package optimizations

import (
	"crypto/sha256"
	"sort"
	"sync"
)

// SparseTrie is an in-memory trie cache that persists across blocks.
type SparseTrie struct {
	mu    sync.RWMutex
	nodes map[string][]byte
	dirty map[string]bool
	root  [32]byte
}

// NewSparseTrie creates a new sparse trie.
func NewSparseTrie() *SparseTrie {
	return &SparseTrie{
		nodes: make(map[string][]byte),
		dirty: make(map[string]bool),
	}
}

// Update inserts or overwrites a key-value pair.
func (st *SparseTrie) Update(key []byte, value []byte) {
	st.mu.Lock()
	defer st.mu.Unlock()
	k := string(key)
	st.nodes[k] = append([]byte{}, value...) // copy
	st.dirty[k] = true
}

// Delete removes a key from the trie.
func (st *SparseTrie) Delete(key []byte) {
	st.mu.Lock()
	defer st.mu.Unlock()
	k := string(key)
	delete(st.nodes, k)
	st.dirty[k] = true
}

// Hash computes a deterministic hash of the trie and clears dirty tracking.
func (st *SparseTrie) Hash() [32]byte {
	st.mu.Lock()
	defer st.mu.Unlock()

	// Collect and sort keys for deterministic hashing
	keys := make([]string, 0, len(st.nodes))
	for k := range st.nodes {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	h := sha256.New()
	for _, k := range keys {
		h.Write([]byte(k))
		h.Write(st.nodes[k])
	}
	copy(st.root[:], h.Sum(nil))
	st.dirty = make(map[string]bool)
	return st.root
}

// Get retrieves a value by key (read-only).
func (st *SparseTrie) Get(key []byte) ([]byte, bool) {
	st.mu.RLock()
	defer st.mu.RUnlock()
	v, ok := st.nodes[string(key)]
	if !ok {
		return nil, false
	}
	// Return a copy
	return append([]byte{}, v...), true
}

// DirtyCount returns the number of dirty keys.
func (st *SparseTrie) DirtyCount() int {
	st.mu.RLock()
	defer st.mu.RUnlock()
	return len(st.dirty)
}

// NodeCount returns the total number of nodes in the trie.
func (st *SparseTrie) NodeCount() int {
	st.mu.RLock()
	defer st.mu.RUnlock()
	return len(st.nodes)
}

// Clear removes all nodes from the trie.
func (st *SparseTrie) Clear() {
	st.mu.Lock()
	defer st.mu.Unlock()
	st.nodes = make(map[string][]byte)
	st.dirty = make(map[string]bool)
	st.root = [32]byte{}
}
