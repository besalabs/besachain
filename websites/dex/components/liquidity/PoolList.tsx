'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TokenIcon } from '@/components/common/TokenIcon'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { useAccount } from 'wagmi'

interface Pool {
  id: number
  token0: string
  token1: string
  tvl: number
  volume24h: number
  apy: number
  userLpBalance?: number
}

const mockPools: Pool[] = [
  { id: 1, token0: 'BESA', token1: 'USDT', tvl: 2450000, volume24h: 890000, apy: 45.2 },
  { id: 2, token0: 'BESA', token1: 'WBTC', tvl: 1890000, volume24h: 650000, apy: 52.8 },
  { id: 3, token0: 'WETH', token1: 'USDT', tvl: 3200000, volume24h: 1200000, apy: 18.5 },
  { id: 4, token0: 'WBTC', token1: 'WETH', tvl: 2800000, volume24h: 980000, apy: 22.3 },
  { id: 5, token0: 'BESA', token1: 'WETH', tvl: 1500000, volume24h: 420000, apy: 68.4 },
]

export function PoolList() {
  const { isConnected } = useAccount()
  const [expandedPool, setExpandedPool] = useState<number | null>(null)

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">All Pools</h2>
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Pair
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-white/60 border-b border-white/10">
                <th className="pb-4 font-medium">Pool</th>
                <th className="pb-4 font-medium text-right">TVL</th>
                <th className="pb-4 font-medium text-right">Volume 24H</th>
                <th className="pb-4 font-medium text-right">APY</th>
                <th className="pb-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockPools.map((pool) => (
                <PoolRow
                  key={pool.id}
                  pool={pool}
                  isExpanded={expandedPool === pool.id}
                  onToggle={() => setExpandedPool(expandedPool === pool.id ? null : pool.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function PoolRow({
  pool,
  isExpanded,
  onToggle,
}: {
  pool: Pool
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <>
      <tr
        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <TokenIcon symbol={pool.token0} size="sm" />
              <TokenIcon symbol={pool.token1} size="sm" />
            </div>
            <span className="font-medium text-white">
              {pool.token0}/{pool.token1}
            </span>
          </div>
        </td>
        <td className="py-4 text-right text-white">{formatCurrency(pool.tvl)}</td>
        <td className="py-4 text-right text-white">{formatCurrency(pool.volume24h)}</td>
        <td className="py-4 text-right">
          <span className="text-green-400 font-medium">{formatPercent(pool.apy)}</span>
        </td>
        <td className="py-4 text-right">
          <button className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="py-4 bg-white/5">
            <div className="flex gap-4 justify-end px-4">
              <Button variant="secondary" size="sm">Add Liquidity</Button>
              <Button variant="outline" size="sm">Trade</Button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
