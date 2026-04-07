'use client'

import { FarmList } from '@/components/farms/FarmList'
import { Sprout } from 'lucide-react'

export default function FarmsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4">
          <Sprout className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Yield Farms
        </h1>
        <p className="text-white/60 max-w-md mx-auto">
          Stake LP tokens to earn BESA rewards with high APY
        </p>
      </div>

      <FarmList />
    </div>
  )
}
