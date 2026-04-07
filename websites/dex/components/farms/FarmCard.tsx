'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TokenIcon } from '@/components/common/TokenIcon'
import { Input } from '@/components/ui/input'
import { useFarms, useFarmInfo, useUserFarmInfo } from '@/hooks/useFarms'
import { useAccount } from 'wagmi'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Sprout, Wallet, TrendingUp } from 'lucide-react'

interface FarmCardProps {
  pid: number
  token0: string
  token1: string
  multiplier: string
  tvl: number
  apy: number
}

export function FarmCard({ pid, token0, token1, multiplier, tvl, apy }: FarmCardProps) {
  const { isConnected } = useAccount()
  const [isExpanded, setIsExpanded] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('')

  const { deposit, withdraw, harvest, isPending } = useFarms()
  const { pendingReward } = useUserFarmInfo(pid)

  const handleStake = async () => {
    if (!stakeAmount) return
    await deposit(pid, stakeAmount)
    setStakeAmount('')
  }

  const handleHarvest = async () => {
    await harvest(pid)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <TokenIcon symbol={token0} size="md" />
              <TokenIcon symbol={token1} size="md" />
            </div>
            <div>
              <h3 className="font-bold text-white">
                {token0}-{token1}
              </h3>
              <span className="text-xs text-purple-400 font-medium">{multiplier}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">{formatPercent(apy)}</p>
            <p className="text-xs text-white/60">APY</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              TVL
            </div>
            <p className="font-semibold text-white">{formatCurrency(tvl)}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Sprout className="w-4 h-4" />
              Reward
            </div>
            <p className="font-semibold text-white">BESA</p>
          </div>
        </div>

        {/* Connected User Info */}
        {isConnected && (
          <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/60">Staked</span>
              <span className="text-sm font-medium text-white">{formatNumber(0)} LP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/60">Pending Rewards</span>
              <span className="text-sm font-medium text-white">
                {pendingReward ? formatNumber(Number(pendingReward)) : '0'} BESA
              </span>
            </div>
            {pendingReward && Number(pendingReward) > 0 && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={handleHarvest}
                isLoading={isPending}
              >
                Harvest
              </Button>
            )}
          </div>
        )}

        {/* Expand/Collapse */}
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Stake/Unstake'}
        </Button>

        {/* Stake/Unstake Form */}
        {isExpanded && isConnected && (
          <div className="mt-4 space-y-4 pt-4 border-t border-white/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Stake LP Tokens</span>
                <span className="text-white/60">Balance: {formatNumber(0)}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setStakeAmount('0')}
                  className="shrink-0"
                >
                  MAX
                </Button>
              </div>
              <Button
                variant="primary"
                fullWidth
                onClick={handleStake}
                isLoading={isPending}
                disabled={!stakeAmount}
              >
                Stake
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Unstake LP Tokens</span>
                <span className="text-white/60">Staked: {formatNumber(0)}</span>
              </div>
              <Input type="number" placeholder="0.0" />
              <Button
                variant="outline"
                fullWidth
                onClick={() => withdraw(pid, '0')}
                isLoading={isPending}
              >
                Unstake
              </Button>
            </div>
          </div>
        )}

        {isExpanded && !isConnected && (
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-white/60">Connect wallet to stake</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`
}
