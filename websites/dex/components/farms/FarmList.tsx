'use client'

import { useState } from 'react'
import { FarmCard } from './FarmCard'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'

interface Farm {
  pid: number
  token0: string
  token1: string
  multiplier: string
  tvl: number
  apy: number
}

const mockFarms: Farm[] = [
  { pid: 0, token0: 'BESA', token1: 'USDT', multiplier: '40x', tvl: 2450000, apy: 125.4 },
  { pid: 1, token0: 'BESA', token1: 'WBTC', multiplier: '30x', tvl: 1890000, apy: 98.7 },
  { pid: 2, token0: 'BESA', token1: 'WETH', multiplier: '25x', tvl: 1500000, apy: 87.3 },
  { pid: 3, token0: 'WETH', token1: 'USDT', multiplier: '20x', tvl: 3200000, apy: 45.2 },
  { pid: 4, token0: 'WBTC', token1: 'WETH', multiplier: '15x', tvl: 2800000, apy: 38.9 },
  { pid: 5, token0: 'USDC', token1: 'USDT', multiplier: '10x', tvl: 4100000, apy: 18.5 },
  { pid: 6, token0: 'BESA', token1: 'USDC', multiplier: '35x', tvl: 2100000, apy: 112.6 },
  { pid: 7, token0: 'WBNB', token1: 'USDT', multiplier: '12x', tvl: 980000, apy: 28.4 },
]

export function FarmList() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'apy' | 'tvl'>('apy')
  const [showStakedOnly, setShowStakedOnly] = useState(false)

  const filteredFarms = mockFarms
    .filter((farm) => {
      if (showStakedOnly) return false // Mock - no staked farms
      if (!search) return true
      const searchLower = search.toLowerCase()
      return (
        farm.token0.toLowerCase().includes(searchLower) ||
        farm.token1.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search farms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('apy')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              sortBy === 'apy'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            APY
          </button>
          <button
            onClick={() => setSortBy('tvl')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              sortBy === 'tvl'
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            TVL
          </button>
          <button
            onClick={() => setShowStakedOnly(!showStakedOnly)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              showStakedOnly
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Staked Only
          </button>
        </div>
      </div>

      {/* Farm Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFarms.map((farm) => (
          <FarmCard key={farm.pid} {...farm} />
        ))}
      </div>

      {filteredFarms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60">No farms found</p>
        </div>
      )}
    </div>
  )
}
