'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Check, Crown, Star, Trophy, Medal } from 'lucide-react'

interface Tier {
  name: string
  icon: React.ReactNode
  minStake: number
  benefits: string[]
  color: string
}

const tiers: Tier[] = [
  {
    name: 'Bronze',
    icon: <Medal className="w-6 h-6" />,
    minStake: 100,
    benefits: ['1.0x Reward Multiplier', 'Basic Support', 'Access to Staking'],
    color: 'from-amber-600 to-amber-800',
  },
  {
    name: 'Silver',
    icon: <Star className="w-6 h-6" />,
    minStake: 1000,
    benefits: ['1.2x Reward Multiplier', 'Priority Support', 'Early Access to Features'],
    color: 'from-slate-400 to-slate-600',
  },
  {
    name: 'Gold',
    icon: <Trophy className="w-6 h-6" />,
    minStake: 10000,
    benefits: ['1.5x Reward Multiplier', '24/7 Support', 'Governance Voting', 'Exclusive Rewards'],
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    name: 'Platinum',
    icon: <Crown className="w-6 h-6" />,
    minStake: 100000,
    benefits: ['2.0x Reward Multiplier', 'VIP Support', 'Early Product Access', 'Custom Strategies', 'Direct Team Contact'],
    color: 'from-purple-400 to-pink-500',
  },
]

export function StakingTiers() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Staking Tiers</h2>
        <p className="text-white/60 mt-2">Unlock exclusive benefits by staking more BESA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className="group hover:scale-[1.02] transition-transform duration-300"
          >
            <CardContent className="p-6 space-y-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-white`}
              >
                {tier.icon}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <p className="text-sm text-white/60">
                  Min. {tier.minStake.toLocaleString()} BESA
                </p>
              </div>

              <ul className="space-y-2">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-white/80">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 border-t border-white/10">
                <div className={`h-2 rounded-full bg-gradient-to-r ${tier.color} opacity-50`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
