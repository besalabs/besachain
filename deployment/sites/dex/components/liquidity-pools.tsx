'use client';

import { useState } from 'react';
import { Plus, Droplets, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const pools = [
  {
    id: 1,
    token0: { symbol: 'BESA', icon: 'B' },
    token1: { symbol: 'USDC', icon: '$' },
    tvl: 2450000,
    apr: 24.5,
    volume24h: 890000,
    fee: 0.3,
    userLiquidity: 0,
  },
  {
    id: 2,
    token0: { symbol: 'WETH', icon: 'Ξ' },
    token1: { symbol: 'USDC', icon: '$' },
    tvl: 1890000,
    apr: 18.2,
    volume24h: 620000,
    fee: 0.3,
    userLiquidity: 1250,
  },
  {
    id: 3,
    token0: { symbol: 'WBTC', icon: '₿' },
    token1: { symbol: 'USDC', icon: '$' },
    tvl: 1560000,
    apr: 15.8,
    volume24h: 480000,
    fee: 0.3,
    userLiquidity: 0,
  },
  {
    id: 4,
    token0: { symbol: 'BESA', icon: 'B' },
    token1: { symbol: 'WETH', icon: 'Ξ' },
    tvl: 980000,
    apr: 32.1,
    volume24h: 340000,
    fee: 0.3,
    userLiquidity: 500,
  },
];

function formatCurrency(num: number): string {
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

export function LiquidityPools() {
  const [showAddLiquidity, setShowAddLiquidity] = useState(false);
  const [selectedPool, setSelectedPool] = useState<typeof pools[0] | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Liquidity Pools</h2>
          <p className="text-gray-400 text-sm">Provide liquidity and earn trading fees</p>
        </div>
        <button
          onClick={() => setShowAddLiquidity(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Liquidity
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Total TVL</div>
          <div className="text-2xl font-bold text-white">$6.88M</div>
          <div className="text-emerald-400 text-sm mt-1">+12.5% this week</div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">24h Volume</div>
          <div className="text-2xl font-bold text-white">$2.33M</div>
          <div className="text-emerald-400 text-sm mt-1">+8.2% this week</div>
        </div>
        <div className="glass rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Your LP Earnings</div>
          <div className="text-2xl font-bold text-white">$142.50</div>
          <div className="text-gray-400 text-sm mt-1">Lifetime earnings</div>
        </div>
      </div>

      {/* Pools Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Pool</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">TVL</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">APR</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Volume (24h)</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Your Position</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {pools.map((pool) => (
                <tr
                  key={pool.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedPool(pool)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold text-xs border-2 border-[#0f0f1a]">
                          {pool.token0.icon}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 flex items-center justify-center text-black font-bold text-xs border-2 border-[#0f0f1a]">
                          {pool.token1.icon}
                        </div>
                      </div>
                      <span className="font-medium text-white">
                        {pool.token0.symbol}/{pool.token1.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-white font-medium">{formatCurrency(pool.tvl)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      {pool.apr}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-white">{formatCurrency(pool.volume24h)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {pool.userLiquidity > 0 ? (
                      <div className="text-white">{formatCurrency(pool.userLiquidity)}</div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-5 h-5 text-gray-400 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Liquidity Modal */}
      {showAddLiquidity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0f0f1a] border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add Liquidity</h3>
              <button
                onClick={() => setShowAddLiquidity(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="text-center py-12 text-gray-400">
              <Droplets className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a pool to add liquidity</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
