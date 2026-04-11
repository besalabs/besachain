package optimizations

import (
	"math/big"
	"testing"
	"sync"
)

func TestAddGasPaymentAccumulates(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	gas1 := big.NewInt(100)
	price1 := big.NewInt(50)
	acc.AddGasPayment(gas1, price1)

	total := acc.TotalPayment()
	expected := big.NewInt(5000) // 100 * 50

	if total.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v", expected, total)
	}
}

func TestAddGasPaymentMultipleTimes(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	acc.AddGasPayment(big.NewInt(100), big.NewInt(50))
	acc.AddGasPayment(big.NewInt(200), big.NewInt(25))

	total := acc.TotalPayment()
	expected := big.NewInt(10000) // (100*50) + (200*25) = 5000 + 5000

	if total.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v", expected, total)
	}
}

func TestAddTipAccumulates(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	acc.AddTip(big.NewInt(1000))

	total := acc.TotalTips()
	expected := big.NewInt(1000)

	if total.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v", expected, total)
	}
}

func TestAddTipMultipleTimes(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	acc.AddTip(big.NewInt(500))
	acc.AddTip(big.NewInt(300))
	acc.AddTip(big.NewInt(200))

	total := acc.TotalTips()
	expected := big.NewInt(1000)

	if total.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v", expected, total)
	}
}

func TestTotalPaymentReturnsCopy(t *testing.T) {
	acc := NewBeneficiaryAccumulator()
	acc.AddGasPayment(big.NewInt(100), big.NewInt(50))

	total1 := acc.TotalPayment()
	total1.Add(total1, big.NewInt(9999))

	total2 := acc.TotalPayment()
	expected := big.NewInt(5000)

	if total2.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v (copy was modified)", expected, total2)
	}
}

func TestApplyAndResetReturnsTotal(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	acc.AddGasPayment(big.NewInt(100), big.NewInt(50))
	acc.AddTip(big.NewInt(1000))

	result := acc.ApplyAndReset()
	expected := big.NewInt(6000) // 5000 + 1000

	if result.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

func TestApplyAndResetClears(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	acc.AddGasPayment(big.NewInt(100), big.NewInt(50))
	acc.AddTip(big.NewInt(1000))
	acc.ApplyAndReset()

	totalPayment := acc.TotalPayment()
	totalTips := acc.TotalTips()

	if totalPayment.Cmp(big.NewInt(0)) != 0 {
		t.Errorf("Expected payment to be reset to 0, got %v", totalPayment)
	}
	if totalTips.Cmp(big.NewInt(0)) != 0 {
		t.Errorf("Expected tips to be reset to 0, got %v", totalTips)
	}
}

func TestConcurrentAddGasPayment(t *testing.T) {
	acc := NewBeneficiaryAccumulator()
	numGoroutines := 100
	paymentsPerGoroutine := 10

	var wg sync.WaitGroup
	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < paymentsPerGoroutine; j++ {
				acc.AddGasPayment(big.NewInt(100), big.NewInt(50))
			}
		}()
	}

	wg.Wait()

	total := acc.TotalPayment()
	expected := big.NewInt(int64(numGoroutines * paymentsPerGoroutine * 5000))

	if total.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v", expected, total)
	}
}

func TestConcurrentAddTip(t *testing.T) {
	acc := NewBeneficiaryAccumulator()
	numGoroutines := 100
	tipsPerGoroutine := 10

	var wg sync.WaitGroup
	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func() {
			defer wg.Done()
			for j := 0; j < tipsPerGoroutine; j++ {
				acc.AddTip(big.NewInt(1000))
			}
		}()
	}

	wg.Wait()

	total := acc.TotalTips()
	expected := big.NewInt(int64(numGoroutines * tipsPerGoroutine * 1000))

	if total.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v", expected, total)
	}
}

func TestConcurrentMixedOperations(t *testing.T) {
	acc := NewBeneficiaryAccumulator()
	numGoroutines := 50

	var wg sync.WaitGroup
	wg.Add(numGoroutines)

	for i := 0; i < numGoroutines; i++ {
		go func(idx int) {
			defer wg.Done()
			if idx%2 == 0 {
				acc.AddGasPayment(big.NewInt(100), big.NewInt(50))
			} else {
				acc.AddTip(big.NewInt(1000))
			}
		}(i)
	}

	wg.Wait()

	// 25 gas payments of 5000 + 25 tips of 1000
	totalPayment := acc.TotalPayment()
	expectedPayment := big.NewInt(125000)
	if totalPayment.Cmp(expectedPayment) != 0 {
		t.Errorf("Expected payment %v, got %v", expectedPayment, totalPayment)
	}

	totalTips := acc.TotalTips()
	expectedTips := big.NewInt(25000)
	if totalTips.Cmp(expectedTips) != 0 {
		t.Errorf("Expected tips %v, got %v", expectedTips, totalTips)
	}
}

func TestConcurrentApplyAndReset(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	// Pre-populate with some values
	acc.AddGasPayment(big.NewInt(1000), big.NewInt(100))
	acc.AddTip(big.NewInt(50000))

	result := acc.ApplyAndReset()

	// Verify result is correct
	expected := big.NewInt(150000) // 100000 + 50000
	if result.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v", expected, result)
	}

	// Verify state is cleared
	total := acc.TotalPayment()
	if total.Cmp(big.NewInt(0)) != 0 {
		t.Errorf("Expected payment to be 0, got %v", total)
	}
}

func TestZeroValues(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	acc.AddGasPayment(big.NewInt(0), big.NewInt(0))
	acc.AddTip(big.NewInt(0))

	total := acc.TotalPayment()
	if total.Cmp(big.NewInt(0)) != 0 {
		t.Errorf("Expected 0, got %v", total)
	}

	tips := acc.TotalTips()
	if tips.Cmp(big.NewInt(0)) != 0 {
		t.Errorf("Expected 0, got %v", tips)
	}
}

func TestLargeValues(t *testing.T) {
	acc := NewBeneficiaryAccumulator()

	// Test with large numbers
	largeGas := new(big.Int).Exp(big.NewInt(10), big.NewInt(18), nil)
	largePrice := new(big.Int).Exp(big.NewInt(10), big.NewInt(9), nil)

	acc.AddGasPayment(largeGas, largePrice)

	result := acc.TotalPayment()
	expected := new(big.Int).Mul(largeGas, largePrice)

	if result.Cmp(expected) != 0 {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}
