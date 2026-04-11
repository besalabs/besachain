package optimizations

import (
	"math/big"
	"sync"
)

// BeneficiaryAccumulator defers gas payments to the block producer
// until end-of-block, eliminating false state conflicts between
// parallel transactions that all modify the coinbase balance.
type BeneficiaryAccumulator struct {
	mu    sync.Mutex
	total *big.Int
	tips  *big.Int
}

// NewBeneficiaryAccumulator creates a new beneficiary accumulator.
func NewBeneficiaryAccumulator() *BeneficiaryAccumulator {
	return &BeneficiaryAccumulator{
		total: new(big.Int),
		tips:  new(big.Int),
	}
}

// AddGasPayment records a gas payment without modifying state.
// Thread-safe for use during parallel execution.
func (b *BeneficiaryAccumulator) AddGasPayment(gasUsed, gasPrice *big.Int) {
	payment := new(big.Int).Mul(gasUsed, gasPrice)
	b.mu.Lock()
	b.total.Add(b.total, payment)
	b.mu.Unlock()
}

// AddTip records a priority fee payment.
func (b *BeneficiaryAccumulator) AddTip(tip *big.Int) {
	b.mu.Lock()
	b.tips.Add(b.tips, tip)
	b.mu.Unlock()
}

// TotalPayment returns the accumulated gas payment (copy).
func (b *BeneficiaryAccumulator) TotalPayment() *big.Int {
	b.mu.Lock()
	defer b.mu.Unlock()
	return new(big.Int).Set(b.total)
}

// TotalTips returns the accumulated tips (copy).
func (b *BeneficiaryAccumulator) TotalTips() *big.Int {
	b.mu.Lock()
	defer b.mu.Unlock()
	return new(big.Int).Set(b.tips)
}

// ApplyAndReset returns the total (gas + tips) and resets.
// Called once at end-of-block.
func (b *BeneficiaryAccumulator) ApplyAndReset() *big.Int {
	b.mu.Lock()
	defer b.mu.Unlock()
	result := new(big.Int).Add(b.total, b.tips)
	b.total = new(big.Int)
	b.tips = new(big.Int)
	return result
}
