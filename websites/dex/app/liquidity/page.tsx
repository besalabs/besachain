'use client'

import { LiquidityCard } from '@/components/liquidity/LiquidityCard'
import { PoolList } from '@/components/liquidity/PoolList'
import { UserPositions } from '@/components/liquidity/UserPositions'

export default function LiquidityPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Liquidity Pools
        </h1>
        <p className="text-white/60 max-w-md mx-auto">
          Add liquidity to earn trading fees and farm rewards
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiquidityCard />
        </div>
        <div>
          <UserPositions />
        </div>
      </div>

      <PoolList />
    </div>
  )
}
