'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const timeRanges = ['24H', '7D', '30D', '90D', '1Y', 'ALL'];

const topTokens = [
  { symbol: 'BESA', name: 'BesaChain', price: 2.45, change24h: 5.2, volume: 1245000, tvl: 4250000, icon: 'B' },
  { symbol: 'WETH', name: 'Wrapped ETH', price: 3450, change24h: -1.8, volume: 890000, tvl: 2100000, icon: 'Ξ' },
  { symbol: 'WBTC', name: 'Wrapped BTC', price: 67500, change24h: 2.1, volume: 650000, tvl: 1850000, icon: '₿' },
  { symbol: 'USDC', name: 'USD Coin', price: 1.00, change24h: 0.01, volume: 2100000, tvl: 5200000, icon: '$' },
  { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: -0.02, volume: 1850000, tvl: 3800000, icon: '₮' },
];

const recentTransactions = [
  { type: 'swap', from: 'BESA', to: 'USDC', amount: 1250, value: 3062.5, time: '2 min ago', user: '0x1234...5678' },
  { type: 'add', pool: 'BESA-USDC', amount: 5000, value: 5000, time: '5 min ago', user: '0x8765...4321' },
  { type: 'swap', from: 'WETH', to: 'BESA', amount: 2.5, value: 8625, time: '12 min ago', user: '0xabcd...ef01' },
  { type: 'remove', pool: 'WBTC-USDC', amount: 0.1, value: 6750, time: '18 min ago', user: '0x2468...1357' },
  { type: 'swap', from: 'USDC', to: 'WETH', amount: 10000, value: 10000, time: '25 min ago', user: '0x1357...2468' },
];

function formatCurrency(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatNumber(num: number): string {
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

export function Analytics() {
  const [selectedRange, setSelectedRange] = useState('24H');

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
          <p className="text-gray-400 text-sm">Track BesaSwap metrics and performance</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedRange === range
                  ? 'bg-emerald-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            Total TVL
          </div>
          <div className="text-2xl font-bold text-white">$13.2M</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm mt-1">
            <TrendingUp className="w-3 h-3" />
            +15.3%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Activity className="w-4 h-4" />
            Volume (24h)
          </div>
          <div className="text-2xl font-bold text-white">$4.67M</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm mt-1">
            <TrendingUp className="w-3 h-3" />
            +8.7%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Users className="w-4 h-4" />
            Active Users
          </div>
          <div className="text-2xl font-bold text-white">2,847</div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm mt-1">
            <TrendingUp className="w-3 h-3" />
            +23.1%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <BarChart3 className="w-4 h-4" />
            Transactions
          </div>
          <div className="text-2xl font-bold text-white">12.5K</div>
          <div className="flex items-center gap-1 text-red-400 text-sm mt-1">
            <TrendingDown className="w-3 h-3" />
            -2.4%
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Tokens */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Top Tokens</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400">Token</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-400">Price</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-400">Change</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-400">Volume (24h)</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-400">TVL</th>
                  </tr>
                </thead>
                <tbody>
                  {topTokens.map((token) => (
                    <tr
                      key={token.symbol}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-black font-bold text-xs">
                            {token.icon}
                          </div>
                          <div>
                            <div className="font-medium text-white">{token.symbol}</div>
                            <div className="text-xs text-gray-500">{token.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-white">
                        ${token.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300">
                        {formatCurrency(token.volume)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-300">
                        {formatCurrency(token.tvl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="divide-y divide-white/5">
            {recentTransactions.map((tx, i) => (
              <div key={i} className="px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    tx.type === 'swap' ? 'text-cyan-400' : 
                    tx.type === 'add' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {tx.type === 'swap' ? 'Swap' : tx.type === 'add' ? 'Add Liquidity' : 'Remove Liquidity'}
                  </span>
                  <span className="text-xs text-gray-500">{tx.time}</span>
                </div>
                <div className="text-sm text-gray-300 mb-1">
                  {tx.type === 'swap' ? (
                    <>{formatNumber(tx.amount)} {tx.from} → {tx.to}</>
                  ) : (
                    <>{formatNumber(tx.amount)} {tx.pool}</>
                  )}
                </div>
                <div className="text-xs text-gray-500">{tx.user}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
