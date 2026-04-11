'use client';

import { useState } from 'react';
import { Sprout, Lock, Clock, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const farms = [
  {
    id: 1,
    name: 'BESA-USDC LP',
    token0: { symbol: 'BESA', icon: 'B' },
    token1: { symbol: 'USDC', icon: '$' },
    tvl: 1850000,
    apr: 45.2,
    rewards: ['BESA'],
    lockPeriod: 0,
    staked: 0,
    earned: 0,
    multiplier: '1x',
  },
  {
    id: 2,
    name: 'BESA-WETH LP',
    token0: { symbol: 'BESA', icon: 'B' },
    token1: { symbol: 'WETH', icon: 'Ξ' },
    tvl: 920000,
    apr: 68.5,
    rewards: ['BESA'],
    lockPeriod: 0,
    staked: 2500,
    earned: 145.5,
    multiplier: '1.5x',
  },
  {
    id: 3,
    name: 'BESA Single Stake',
    token0: { symbol: 'BESA', icon: 'B' },
    token1: null,
    tvl: 2100000,
    apr: 22.8,
    rewards: ['BESA'],
    lockPeriod: 7,
    staked: 5000,
    earned: 89.25,
    multiplier: '2x',
  },
  {
    id: 4,
    name: 'BESA Locked Stake',
    token0: { symbol: 'BESA', icon: 'B' },
    token1: null,
    tvl: 1500000,
    apr: 85.4,
    rewards: ['BESA', 'veBESA'],
    lockPeriod: 30,
    staked: 0,
    earned: 0,
    multiplier: '3x',
  },
];

function formatCurrency(num: number): string {
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function Farms() {
  const [activeTab, setActiveTab] = useState<'active' | 'ended'>('active');
  const [selectedFarm, setSelectedFarm] = useState<typeof farms[0] | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Yield Farms</h2>
          <p className="text-gray-400 text-sm">Stake LP tokens or single assets to earn rewards</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-emerald-500 text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('ended')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'ended'
                ? 'bg-emerald-500 text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Ended
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Total Value Staked</div>
          <div className="text-xl font-bold text-white">$6.37M</div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Average APR</div>
          <div className="text-xl font-bold text-emerald-400">55.5%</div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Your Staked</div>
          <div className="text-xl font-bold text-white">$7,500</div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Pending Rewards</div>
          <div className="text-xl font-bold text-emerald-400">234.75 BESA</div>
        </div>
      </div>

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((farm) => (
          <motion.div
            key={farm.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 hover:border-emerald-500/30 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold border-2 border-[#0f0f1a]">
                    {farm.token0.icon}
                  </div>
                  {farm.token1 && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 flex items-center justify-center text-black font-bold border-2 border-[#0f0f1a]">
                      {farm.token1.icon}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{farm.name}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {farm.multiplier}
                    </span>
                    {farm.lockPeriod > 0 && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {farm.lockPeriod}d lock
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400">{farm.apr}%</div>
                <div className="text-xs text-gray-500">APR</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-white/5">
              <div>
                <div className="text-gray-400 text-sm">TVL</div>
                <div className="text-white font-medium">{formatCurrency(farm.tvl)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Rewards</div>
                <div className="text-white font-medium">{farm.rewards.join(', ')}</div>
              </div>
            </div>

            {/* User Position */}
            {farm.staked > 0 && (
              <div className="mb-4 p-3 bg-emerald-500/10 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Staked</span>
                  <span className="text-white font-medium">{formatCurrency(farm.staked)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Earned</span>
                  <span className="text-emerald-400 font-medium">{farm.earned} BESA</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFarm(farm)}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition-colors"
              >
                {farm.staked > 0 ? 'Manage' : 'Stake'}
              </button>
              {farm.staked > 0 && (
                <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors">
                  Harvest
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Harvest All Button */}
      <div className="mt-8 text-center">
        <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-semibold rounded-xl transition-all">
          Harvest All Rewards
        </button>
      </div>
    </div>
  );
}
