'use client'

import { StatsOverview } from '@/components/analytics/StatsOverview'
import { VolumeChart } from '@/components/analytics/VolumeChart'
import { TopPools } from '@/components/analytics/TopPools'
import { TokenPrices } from '@/components/analytics/TokenPrices'

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Analytics
        </h1>
        <p className="text-white/60 max-w-md mx-auto">
          Track the performance of BesaSwap and explore key metrics
        </p>
      </div>

      <StatsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeChart />
        </div>
        <div>
          <TokenPrices />
        </div>
      </div>

      <TopPools />
    </div>
  )
}
