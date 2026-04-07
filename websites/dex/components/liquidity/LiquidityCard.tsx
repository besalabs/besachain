'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { TokenSelector } from '@/components/swap/TokenSelector'
import { TokenIcon } from '@/components/common/TokenIcon'
import { TOKENS, type Token } from '@/lib/config/chains'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useTokenApproval } from '@/hooks/useTokenApproval'
import { useLiquidity } from '@/hooks/useLiquidity'
import { CONTRACTS } from '@/lib/config/chains'
import { formatNumber } from '@/lib/utils'
import { useAccount } from 'wagmi'

export function LiquidityCard() {
  const { isConnected } = useAccount()
  const [tokenA, setTokenA] = useState<Token>(TOKENS.BESA)
  const [tokenB, setTokenB] = useState<Token>(TOKENS.USDT)
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [activeTab, setActiveTab] = useState('add')

  const { balance: balanceA } = useTokenBalance(tokenA.address)
  const { balance: balanceB } = useTokenBalance(tokenB.address)

  const { addLiquidity, isPending: isAdding } = useLiquidity()

  const handleAddLiquidity = async () => {
    if (!amountA || !amountB) return
    await addLiquidity(
      tokenA.address as `0x${string}`,
      tokenB.address as `0x${string}`,
      amountA,
      amountB,
      tokenA.decimals,
      tokenB.decimals
    )
  }

  const calculateAmountB = (val: string) => {
    // Mock ratio calculation
    const ratio = 0.5
    setAmountB((Number(val) * ratio).toFixed(tokenB.decimals))
  }

  return (
    <Card className="w-full max-w-lg">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Liquidity</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add
            </TabsTrigger>
            <TabsTrigger value="remove" className="flex items-center gap-2">
              <Minus className="w-4 h-4" />
              Remove
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4">
            {/* Token A Input */}
            <div className="bg-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amountA}
                  onChange={(e) => {
                    setAmountA(e.target.value)
                    calculateAmountB(e.target.value)
                  }}
                  className="text-2xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 placeholder:text-white/20"
                />
                <TokenSelector
                  selectedToken={tokenA}
                  onSelect={setTokenA}
                  excludeToken={tokenB}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">~${formatNumber(Number(amountA) * 1.5)}</span>
                <span className="text-white/60">Balance: {formatNumber(Number(balanceA))}</span>
              </div>
            </div>

            {/* Plus Icon */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="p-2 rounded-xl bg-[#1a1a1a] border border-white/10">
                <Plus className="w-5 h-5 text-white/60" />
              </div>
            </div>

            {/* Token B Input */}
            <div className="bg-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amountB}
                  readOnly
                  className="text-2xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 placeholder:text-white/20"
                />
                <TokenSelector
                  selectedToken={tokenB}
                  onSelect={setTokenB}
                  excludeToken={tokenA}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">~${formatNumber(Number(amountB) * 1.0)}</span>
                <span className="text-white/60">Balance: {formatNumber(Number(balanceB))}</span>
              </div>
            </div>

            {/* Pool Info */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-white">Prices and Pool Share</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-white font-medium">{formatNumber(2.5)}</p>
                  <p className="text-xs text-white/60">{tokenB.symbol} per {tokenA.symbol}</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">{formatNumber(0.4)}</p>
                  <p className="text-xs text-white/60">{tokenA.symbol} per {tokenB.symbol}</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-medium">&lt;0.01%</p>
                  <p className="text-xs text-white/60">Share of Pool</p>
                </div>
              </div>
            </div>

            {/* Add Button */}
            <Button
              onClick={handleAddLiquidity}
              disabled={!isConnected || !amountA || !amountB || isAdding}
              isLoading={isAdding}
              fullWidth
              size="lg"
            >
              {!isConnected ? 'Connect Wallet' : 'Add Liquidity'}
            </Button>
          </TabsContent>

          <TabsContent value="remove" className="space-y-4">
            <RemoveLiquidity />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function RemoveLiquidity() {
  const [percentage, setPercentage] = useState(50)
  const { isConnected } = useAccount()
  const { removeLiquidity, isPending } = useLiquidity()

  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        <p className="text-center text-4xl font-bold text-white">{percentage}%</p>
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <div className="flex gap-2">
          {[25, 50, 75, 100].map((value) => (
            <button
              key={value}
              onClick={() => setPercentage(value)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                percentage === value
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Pooled BESA</span>
          <span className="text-white">{formatNumber(1234.56 * percentage / 100)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Pooled USDT</span>
          <span className="text-white">{formatNumber(617.28 * percentage / 100)}</span>
        </div>
        <div className="flex justify-between text-sm pt-2 border-t border-white/10">
          <span className="text-white/60">Burned LP Tokens</span>
          <span className="text-white">{formatNumber(87.32 * percentage / 100)}</span>
        </div>
      </div>

      <Button
        disabled={!isConnected || percentage === 0 || isPending}
        isLoading={isPending}
        fullWidth
        size="lg"
        variant="danger"
      >
        {!isConnected ? 'Connect Wallet' : 'Remove Liquidity'}
      </Button>
    </div>
  )
}
