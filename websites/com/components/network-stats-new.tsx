'use client';

import { motion } from 'framer-motion';
import { Activity, Box, Users, Clock, Zap, Database, Globe, Server } from 'lucide-react';
import { useChainData, useLiveBlocks, formatNumber, formatGwei } from '@/hooks/useChainData';

export function NetworkStats() {
  const { l1Data, l2Data, loading, error } = useChainData();
  const l1Blocks = useLiveBlocks(1444);

  const stats = [
    {
      chain: 'L1',
      icon: Box,
      label: 'Block Height',
      value: loading ? '-' : formatNumber(l1Data?.blockNumber || 0),
      raw: l1Data?.blockNumber || 0,
      subtext: '450ms blocks',
      color: 'emerald'
    },
    {
      chain: 'L1',
      icon: Zap,
      label: 'Gas Price',
      value: loading ? '-' : `${formatGwei(l1Data?.gasPrice || 0)} Gwei`,
      subtext: 'Real-time',
      color: 'cyan'
    },
    {
      chain: 'L1',
      icon: Users,
      label: 'Network Peers',
      value: loading ? '-' : (l1Data?.peers || 0).toString(),
      subtext: l1Data && l1Data.peers === 0 ? 'Bootstrapping' : 'Connected',
      color: 'violet'
    },
    {
      chain: 'L2',
      icon: Database,
      label: 'L2 Block Height',
      value: loading ? '-' : formatNumber(l2Data?.blockNumber || 0),
      subtext: 'OP Stack Rollup',
      color: 'amber'
    },
  ];

  return (
    <section id="network" className="py-24 bg-[#050507] relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050507] via-gray-900/20 to-[#050507]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-4"
          >
            Live Network
          </motion.h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Real-time data from BesaChain L1 and L2. Connected to running nodes at{' '}
            <code className="text-emerald-400">54.235.85.175</code>
          </p>
          {error && (
            <p className="text-amber-500 mt-2 text-sm">
              ⚠️ {error} — Showing cached data
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-${stat.color}-500/20 hover:border-${stat.color}-500/40 transition-all group`}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                <span className={`text-xs font-mono px-2 py-1 rounded bg-${stat.color}-500/10 text-${stat.color}-400`}>
                  {stat.chain}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1 font-mono group-hover:scale-105 transition-transform">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className={`text-xs text-${stat.color}-500/70 mt-2`}>{stat.subtext}</div>
            </motion.div>
          ))}
        </div>

        {/* Live Blocks + Network Status */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Blocks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 p-6 rounded-2xl bg-gray-900/50 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Recent L1 Blocks</h3>
                <p className="text-sm text-gray-500">Live from Chain 1444</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-mono">LIVE</span>
              </div>
            </div>

            {l1Blocks.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Waiting for blocks...</p>
                <p className="text-xs mt-1">Validators not yet producing blocks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {l1Blocks.map((block, i) => (
                  <div 
                    key={block.number}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-400 font-mono text-sm">#{block.number}</span>
                      <span className="text-gray-500 text-sm">{block.hash}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm">{block.txCount} txs</span>
                      <span className="text-xs text-gray-600">
                        {new Date(block.timestamp * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Network Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-gray-900/50 border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Network</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-gray-500">Consensus</span>
                <span className="text-emerald-400 font-medium">Parlia PoSA</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-gray-500">Block Time</span>
                <span className="text-white font-mono">450ms</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-gray-500">Chain ID (L1)</span>
                <span className="text-white font-mono">1444</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-gray-500">Chain ID (L2)</span>
                <span className="text-white font-mono">1445</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-500">RPC Endpoint</span>
                <code className="text-xs text-cyan-400">rpc.besachain.com</code>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <a 
                href="https://rpc.besachain.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">View RPC Endpoint</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
