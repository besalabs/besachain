'use client'

import { useState, useCallback, useEffect } from 'react'
import { ArrowDown, Settings, RefreshCw } from 'lucide-react'
import { TokenSelector } from './TokenSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TOKENS, type Token } from '@/lib/config/chains'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useTokenApproval } from '@/hooks/useTokenApproval'
import { useSwap } from '@/hooks/useSwap'
import { CONTRACTS } from '@/lib/config/chains'
import { formatNumber } from '@/lib/utils'
import { PriceChart } from '@/components/common/PriceChart'
import { useAccount } from 'wagmi'

export function SwapCard() {
  const { isConnected } = useAccount()
  const [tokenIn, setTokenIn] = useState<Token>(TOKENS.BESA)
  const [tokenOut, setTokenOut] = useState<Token>(TOKENS.USDT)
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [showSettings, setShowSettings] = useState(false)

  const { balance: balanceIn } = useTokenBalance(tokenIn.address)
  const { approve, isApproved, isPending: isApproving } = useTokenApproval(
    tokenIn.address,
    CONTRACTS.router
  )
  const { swapExactTokensForTokens, isPending: isSwapping } = useSwap()

  const handleSwapTokens = useCallback(() => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn(amountOut)
    setAmountOut(amountIn)
  }, [tokenIn, tokenOut, amountIn, amountOut])

  const handleMax = () => {
    setAmountIn(balanceIn)
  }

  const needsApproval = amountIn && !isApproved(amountIn, tokenIn.decimals)
  const canSwap = isConnected && amountIn && amountOut && Number(amountIn) <= Number(balanceIn)

  const handleSwap = async () => {
    if (!canSwap) return

    if (needsApproval) {
      await approve(amountIn, tokenIn.decimals)
      return
    }

    const minOut = (Number(amountOut) * (1 - slippage / 100)).toString()
    await swapExactTokensForTokens(
      amountIn,
      minOut,
      [tokenIn.address as `0x${string}`, tokenOut.address as `0x${string}`],
      tokenIn.decimals,
      tokenOut.decimals
    )
  }

  // Mock price calculation
  useEffect(() => {
    if (amountIn) {
      const mockRate = 0.5 + Math.random() * 0.1
      setAmountOut((Number(amountIn) * mockRate).toFixed(6))
    } else {
      setAmountOut('')
    }
  }, [amountIn, tokenIn, tokenOut])

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Swap</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings */}
        {showSettings && (
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-white">Slippage Tolerance</p>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    slippage === value
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10">
                <input
                  type="number"
                  value={slippage}
                  onChange={(e) => setSlippage(Number(e.target.value))}
                  className="w-12 bg-transparent text-white text-sm outline-none"
                />
                <span className="text-white/60 text-sm">%</span>
              </div>
            </div>
          </div>
        )}

        {/* Input Token */}
        <div className="bg-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="text-2xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 placeholder:text-white/20"
            />
            <TokenSelector
              selectedToken={tokenIn}
              onSelect={setTokenIn}
              excludeToken={tokenOut}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/40">~${formatNumber(Number(amountIn) * 1.5)}</span>
            <div className="flex items-center gap-2">
              <span className="text-white/60">Balance: {formatNumber(Number(balanceIn))}</span>
              <button
                onClick={handleMax}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="p-2 rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-purple-500/50 transition-colors"
          >
            <ArrowDown className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Output Token */}
        <div className="bg-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Input
              type="number"
              placeholder="0.0"
              value={amountOut}
              readOnly
              className="text-2xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 placeholder:text-white/20"
            />
            <TokenSelector
              selectedToken={tokenOut}
              onSelect={setTokenOut}
              excludeToken={tokenIn}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/40">~${formatNumber(Number(amountOut) * 1.5)}</span>
          </div>
        </div>

        {/* Price Info */}
        {amountIn && amountOut && (
          <div className="bg-white/5 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Rate</span>
              <span className="text-white">
                1 {tokenIn.symbol} = {(Number(amountOut) / Number(amountIn)).toFixed(6)} {tokenOut.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Price Impact</span>
              <span className="text-green-400">&lt;0.01%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Minimum received</span>
              <span className="text-white">
                {(Number(amountOut) * (1 - slippage / 100)).toFixed(6)} {tokenOut.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Chart */}
        {amountIn && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm font-medium text-white/60 mb-2">24H Price Chart</p>
            <PriceChart height={120} />
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!canSwap || isApproving || isSwapping}
          isLoading={isApproving || isSwapping}
          fullWidth
          size="lg"
        >
          {!isConnected
            ? 'Connect Wallet'
            : needsApproval
            ? 'Approve'
            : Number(amountIn) > Number(balanceIn)
            ? 'Insufficient Balance'
            : 'Swap'}
        </Button>
      </CardContent>
    </Card>
  )
}
