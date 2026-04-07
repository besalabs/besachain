'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TokenIcon } from '@/components/common/TokenIcon'
import { useStaking, useStakingInfo } from '@/hooks/useStaking'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { useAccount } from 'wagmi'
import { CONTRACTS } from '@/lib/config/chains'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Lock, Unlock, Clock, TrendingUp, Zap, Percent } from 'lucide-react'

const LOCK_PERIODS = [
  { days: 7, multiplier: 1.0, label: '7 Days' },
  { days: 30, multiplier: 1.5, label: '30 Days' },
  { days: 90, multiplier: 2.0, label: '90 Days' },
  { days: 180, multiplier: 3.0, label: '180 Days' },
  { days: 365, multiplier: 5.0, label: '365 Days' },
]

export function StakingCard() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')
  const [stakeAmount, setStakeAmount] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState(LOCK_PERIODS[0])

  const { balance } = useTokenBalance(CONTRACTS.besaToken)
  const { totalStaked, userInfo, pendingReward, rewardRate } = useStakingInfo()
  const { stake, unstake, harvest, compound, isPending } = useStaking()

  const handleStake = async () => {
    if (!stakeAmount) return
    await stake(stakeAmount, selectedPeriod.days)
    setStakeAmount('')
  }

  const handleMax = () => {
    setStakeAmount(balance)
  }

  const calculateAPY = () => {
    const baseAPY = 25 // Base 25% APY
    return baseAPY * selectedPeriod.multiplier
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Staking Form */}
      <Card className="lg:col-span-2">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">BESA Staking</h2>
              <p className="text-sm text-white/60">Stake BESA to earn rewards</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{formatCurrency(Number(totalStaked))}</p>
              <p className="text-xs text-white/60">Total Staked</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{calculateAPY().toFixed(0)}%</p>
              <p className="text-xs text-white/60">Max APY</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{LOCK_PERIODS.length}</p>
              <p className="text-xs text-white/60">Lock Options</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setActiveTab('stake')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'stake'
                  ? 'bg-purple-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Stake
            </button>
            <button
              onClick={() => setActiveTab('unstake')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'unstake'
                  ? 'bg-purple-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Unstake
            </button>
          </div>

          {activeTab === 'stake' ? (
            <div className="space-y-4">
              {/* Amount Input */}
              <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="text-2xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0 placeholder:text-white/20"
                  />
                  <div className="flex items-center gap-2">
                    <TokenIcon symbol="BESA" size="sm" />
                    <span className="font-semibold text-white">BESA</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">~${formatNumber(Number(stakeAmount) * 1.5)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60">Balance: {formatNumber(Number(balance))}</span>
                    <button
                      onClick={handleMax}
                      className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>

              {/* Lock Period Selection */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">Select Lock Period</p>
                <div className="grid grid-cols-5 gap-2">
                  {LOCK_PERIODS.map((period) => (
                    <button
                      key={period.days}
                      onClick={() => setSelectedPeriod(period)}
                      className={`p-2 rounded-xl text-center transition-colors ${
                        selectedPeriod.days === period.days
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <p className="text-xs font-medium">{period.label}</p>
                      <p className="text-[10px] opacity-70">{period.multiplier}x</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Rewards */}
              {stakeAmount && (
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-white">Estimated Rewards</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Daily Reward</span>
                    <span className="text-white">{formatNumber(Number(stakeAmount) * calculateAPY() / 100 / 365)} BESA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Monthly Reward</span>
                    <span className="text-white">{formatNumber(Number(stakeAmount) * calculateAPY() / 100 / 12)} BESA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Yearly Reward</span>
                    <span className="text-green-400">{formatNumber(Number(stakeAmount) * calculateAPY() / 100)} BESA</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleStake}
                disabled={!isConnected || !stakeAmount || isPending}
                isLoading={isPending}
                fullWidth
                size="lg"
              >
                {!isConnected ? 'Connect Wallet' : 'Stake BESA'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-6 text-center">
                <p className="text-white/60 mb-2">Your Staked Balance</p>
                <p className="text-3xl font-bold text-white">
                  {userInfo ? formatNumber(Number(userInfo.amount)) : '0'} BESA
                </p>
                {userInfo && userInfo.lockEnd > Date.now() / 1000 && (
                  <p className="text-sm text-white/60 mt-2">
                    Locked until {new Date(userInfo.lockEnd * 1000).toLocaleDateString()}
                  </p>
                )}
              </div>

              <Button
                onClick={() => unstake(userInfo?.amount || '0')}
                disabled={!isConnected || !userInfo || Number(userInfo.amount) === 0 || isPending}
                isLoading={isPending}
                fullWidth
                size="lg"
                variant="danger"
              >
                Unstake All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Your Rewards</h3>
              <p className="text-xs text-white/60">Claim or compound</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 text-center">
            <p className="text-sm text-white/60 mb-2">Pending Rewards</p>
            <p className="text-3xl font-bold text-green-400">
              {formatNumber(Number(pendingReward))} BESA
            </p>
            <p className="text-sm text-white/60 mt-1">
              ~${formatNumber(Number(pendingReward) * 1.5)}
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={harvest}
              disabled={!isConnected || Number(pendingReward) === 0 || isPending}
              isLoading={isPending}
              fullWidth
            >
              Harvest Rewards
            </Button>
            <Button
              variant="secondary"
              onClick={() => compound(pendingReward)}
              disabled={!isConnected || Number(pendingReward) === 0 || isPending}
              isLoading={isPending}
              fullWidth
            >
              Compound
            </Button>
          </div>

          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Total Staked</span>
              <span className="text-white">{userInfo ? formatNumber(Number(userInfo.amount)) : '0'} BESA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Lock Period</span>
              <span className="text-white">{selectedPeriod.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Multiplier</span>
              <span className="text-green-400">{selectedPeriod.multiplier}x</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
