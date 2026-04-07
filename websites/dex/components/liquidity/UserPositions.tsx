'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TokenIcon } from '@/components/common/TokenIcon'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import { useAccount } from 'wagmi'

interface Position {
  id: number
  token0: string
  token1: string
  lpBalance: number
  token0Amount: number
  token1Amount: number
  value: number
  apy: number
}

const mockPositions: Position[] = [
  {
    id: 1,
    token0: 'BESA',
    token1: 'USDT',
    lpBalance: 123.45,
    token0Amount: 2340.5,
    token1Amount: 1170.25,
    value: 4680.5,
    apy: 45.2,
  },
  {
    id: 2,
    token0: 'WBTC',
    token1: 'WETH',
    lpBalance: 5.67,
    token0Amount: 0.45,
    token1Amount: 12.3,
    value: 28900,
    apy: 22.3,
  },
]

export function UserPositions() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Positions</h2>
          <div className="text-center py-8">
            <p className="text-white/60">Connect your wallet to view your positions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (mockPositions.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Positions</h2>
          <div className="text-center py-8">
            <p className="text-white/60">No positions found</p>
            <Button className="mt-4" variant="primary">Add Liquidity</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalValue = mockPositions.reduce((sum, pos) => sum + pos.value, 0)

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Positions</h2>
          <div className="text-right">
            <p className="text-sm text-white/60">Total Value</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalValue)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {mockPositions.map((position) => (
            <div
              key={position.id}
              className="bg-white/5 rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <TokenIcon symbol={position.token0} size="sm" />
                    <TokenIcon symbol={position.token1} size="sm" />
                  </div>
                  <span className="font-semibold text-white">
                    {position.token0}/{position.token1}
                  </span>
                </div>
                <span className="text-green-400 font-medium">{formatPercent(position.apy)} APY</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white/60">Your Pool Tokens</p>
                  <p className="font-medium text-white">{formatNumber(position.lpBalance)}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Pool Share</p>
                  <p className="font-medium text-white">{formatNumber(0.05)}%</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Pooled {position.token0}</span>
                  <span className="text-white">{formatNumber(position.token0Amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Pooled {position.token1}</span>
                  <span className="text-white">{formatNumber(position.token1Amount)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" fullWidth>Add</Button>
                <Button variant="outline" size="sm" fullWidth>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
