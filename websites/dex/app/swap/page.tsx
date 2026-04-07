'use client'

import { SwapCard } from '@/components/swap/SwapCard'

export default function SwapPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Exchange Tokens
        </h1>
        <p className="text-white/60 max-w-md mx-auto">
          Trade tokens instantly with low fees and minimal slippage on BesaChain
        </p>
      </div>
      <SwapCard />
    </div>
  )
}
