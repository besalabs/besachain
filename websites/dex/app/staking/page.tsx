'use client'

import { StakingCard } from '@/components/staking/StakingCard'
import { StakingTiers } from '@/components/staking/StakingTiers'

export default function StakingPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          BESA Staking
        </h1>
        <p className="text-white/60 max-w-md mx-auto">
          Lock your BESA tokens to earn rewards and unlock exclusive benefits
        </p>
      </div>

      <StakingCard />
      <StakingTiers />
    </div>
  )
}
