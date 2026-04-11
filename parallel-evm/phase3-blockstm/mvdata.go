package blockstm

import (
	"sync"
)

// VersionedValue represents a value at a specific transaction version.
type VersionedValue struct {
	TxIdx       uint64
	Incarnation uint64
	Value       []byte
}

// MVData is a multi-version data structure that tracks reads and writes
// at different transaction indices and incarnations.
type MVData struct {
	mu       sync.RWMutex
	versions map[string][]*VersionedValue
	deleted  map[string]map[uint64]bool // key -> incarnation set
}

// NewMVData creates a new multi-version data structure.
func NewMVData() *MVData {
	return &MVData{
		versions: make(map[string][]*VersionedValue),
		deleted:  make(map[string]map[uint64]bool),
	}
}

// Write records a write at a specific transaction index and incarnation.
func (m *MVData) Write(key string, txIdx uint64, incarnation uint64, value []byte) {
	m.mu.Lock()
	defer m.mu.Unlock()

	vv := &VersionedValue{
		TxIdx:       txIdx,
		Incarnation: incarnation,
		Value:       append([]byte{}, value...), // copy
	}

	// If this transaction already has a version, replace it
	versions := m.versions[key]
	replaced := false
	for i, v := range versions {
		if v.TxIdx == txIdx && v.Incarnation == incarnation {
			versions[i] = vv
			replaced = true
			break
		}
	}

	if !replaced {
		versions = append(versions, vv)
		m.versions[key] = versions
	}
}

// Read returns the value written by the latest transaction before or equal to txIdx.
// Returns nil if no version exists.
func (m *MVData) Read(key string, txIdx uint64) []byte {
	m.mu.RLock()
	defer m.mu.RUnlock()

	versions, ok := m.versions[key]
	if !ok || len(versions) == 0 {
		return nil
	}

	// Find the latest version before or at txIdx
	var latest *VersionedValue
	for _, v := range versions {
		if v.TxIdx <= txIdx {
			if latest == nil || v.TxIdx > latest.TxIdx ||
				(v.TxIdx == latest.TxIdx && v.Incarnation > latest.Incarnation) {
				latest = v
			}
		}
	}

	if latest == nil {
		return nil
	}

	// Check if this version was deleted in a later incarnation
	if m.isDeleted(key, latest.TxIdx, latest.Incarnation) {
		return nil
	}

	return append([]byte{}, latest.Value...) // return copy
}

// MarkDeleted records that a key was deleted at a specific transaction and incarnation.
func (m *MVData) MarkDeleted(key string, txIdx uint64, incarnation uint64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, ok := m.deleted[key]; !ok {
		m.deleted[key] = make(map[uint64]bool)
	}
	m.deleted[key][incarnation] = true
}

// isDeleted checks if a key was deleted (assumes lock is held).
func (m *MVData) isDeleted(key string, txIdx uint64, incarnation uint64) bool {
	if deletions, ok := m.deleted[key]; ok {
		return deletions[incarnation]
	}
	return false
}

// GetVersions returns all versions for a key (for testing/debugging).
func (m *MVData) GetVersions(key string) []*VersionedValue {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if versions, ok := m.versions[key]; ok {
		// Return a copy
		result := make([]*VersionedValue, len(versions))
		for i, v := range versions {
			result[i] = &VersionedValue{
				TxIdx:       v.TxIdx,
				Incarnation: v.Incarnation,
				Value:       append([]byte{}, v.Value...),
			}
		}
		return result
	}
	return nil
}

// KeyCount returns the number of distinct keys (for testing/debugging).
func (m *MVData) KeyCount() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return len(m.versions)
}

// Clear removes all versions and deletions (for testing/debugging).
func (m *MVData) Clear() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.versions = make(map[string][]*VersionedValue)
	m.deleted = make(map[string]map[uint64]bool)
}
