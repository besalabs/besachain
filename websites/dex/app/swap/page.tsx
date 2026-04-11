'use client'

import { SwapCard } from '@/components/swap/SwapCard'
import { PriceChart } from '@/components/common/PriceChart'
import { TrendingUp, Shield, Zap } from 'lucide-react'

export default function SwapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Exchange Tokens
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Trade with 450ms finality on BesaChain L1. Low fees, minimal slippage.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-gray-900/50 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  BESA/USDT
                </h2>
                <p className="text-sm text-gray-500">Live from Chain 1444</p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+2.4%</span>
                <span className="text-gray-500">24h</span>
              </div>
            </div>
            <PriceChart />
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-4">
            <FeatureCard 
              icon={Zap} 
              title="450ms Finality" 
              description="Sub-second block confirmation"
            />
            <FeatureCard 
              icon={Shield} 
              title="Quantum Safe" 
              description="ML-DSA signature support"
            />
            <FeatureCard 
              icon={TrendingUp} 
              title="Low Fees" 
              description="~0.05 Gwei average"
            />
          </div>
        </div>

        {/* Swap Card */}
        <div className="lg:col-span-1">
          <SwapCard />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <Icon className="w-5 h-5 text-emerald-400 mb-2" />
      <h3 className="text-sm font-medium text-white">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  )
}
