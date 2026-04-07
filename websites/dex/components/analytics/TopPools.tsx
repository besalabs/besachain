'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TokenIcon } from '@/components/common/TokenIcon'
import { formatCurrency, formatPercent } from '@/lib/utils'

interface Pool {
  rank: number
  token0: string
  token1: string
  tvl: number
  volume24h: number
  apy: number
  fees24h: number
}

const topPools: Pool[] = [
  { rank: 1, token0: 'BESA', token1: 'USDT', tvl: 4500000, volume24h: 1200000, apy: 45.2, fees24h: 3600 },
  { rank: 2, token0: 'WETH', token1: 'USDT', tvl: 3800000, volume24h: 980000, apy: 28.4, fees24h: 2940 },
  { rank: 3, token0: 'WBTC', token1: 'WETH', tvl: 3200000, volume24h: 720000, apy: 22.3, fees24h: 2160 },
  { rank: 4, token0: 'BESA', token1: 'WBTC', tvl: 2800000, volume24h: 650000, apy: 52.8, fees24h: 1950 },
  { rank: 5, token0: 'USDC', token1: 'USDT', tvl: 2500000, volume24h: 480000, apy: 18.5, fees24h: 1440 },
]

export function TopPools() {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Top Pools</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-white/60 border-b border-white/10">
                <th className="pb-3 font-medium">#</th>
                <th className="pb-3 font-medium">Pool</th>
                <th className="pb-3 font-medium text-right">TVL</th>
                <th className="pb-3 font-medium text-right">Volume 24H</th>
                <th className="pb-3 font-medium text-right">APY</th>
                <th className="pb-3 font-medium text-right">Fees 24H</th>
              </tr>
            </thead>
            <tbody>
              {topPools.map((pool) => (
                <tr key={pool.rank} className="border-b border-white/5 last:border-0">
                  <td className="py-3">
                    <span className="text-white/60">{pool.rank}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <TokenIcon symbol={pool.token0} size="sm" />
                        <TokenIcon symbol={pool.token1} size="sm" />
                      </div>
                      <span className="font-medium text-white text-sm">
                        {pool.token0}/{pool.token1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-white text-sm">
                    {formatCurrency(pool.tvl)}
                  </td>
                  <td className="py-3 text-right text-white text-sm">
                    {formatCurrency(pool.volume24h)}
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-green-400 font-medium text-sm">
                      {formatPercent(pool.apy)}
                    </span>
                  </td>
                  <td className="py-3 text-right text-white/60 text-sm">
                    ${pool.fees24h.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
