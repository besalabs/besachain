'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Cpu, Activity } from 'lucide-react';
import { useChainData, formatNumber } from '@/hooks/useChainData';

export function Hero() {
  const { l1Data, l2Data, loading } = useChainData();

  const l1Block = l1Data?.blockNumber ?? 0;
  const l2Block = l2Data?.blockNumber ?? 0;
  const isLive = l1Data?.chainId === 1444;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050507]">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,157,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,157,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            transform: 'perspective(500px) rotateX(60deg)',
            transformOrigin: 'center top',
            height: '200%',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[180px]" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8"
        >
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'} `} />
          <span className="text-sm text-emerald-400 font-mono">
            {isLive ? 'MAINNET LIVE' : 'CONNECTING...'} 
            {l1Block > 0 && ` • Block #${formatNumber(l1Block)}`}
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
        >
          <span className="text-white">Besa</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
            Chain
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-4"
        >
          Post-Quantum EVM Blockchain
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-gray-500 max-w-xl mx-auto mb-12"
        >
          450ms finality. 10,500+ TPS. ML-DSA quantum-safe signatures.
          <br />Chain 1444 (L1) • Chain 1445 (L2)
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <a 
            href="https://docs.besachain.com"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-all"
          >
            Start Building
            <ArrowRight className="w-5 h-5" />
          </a>
          <a 
            href="https://dex.besachain.com"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-700 hover:border-gray-500 text-white font-semibold rounded-lg transition-all"
          >
            Launch DEX
          </a>
        </motion.div>

        {/* Live Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          <StatCard 
            icon={Zap} 
            label="L1 Block Time" 
            value="450ms" 
            subtext="Finality"
          />
          <StatCard 
            icon={Activity} 
            label="L1 TPS" 
            value={loading ? '...' : formatNumber(l1Data?.tps || 10500)} 
            subtext="Sustained"
          />
          <StatCard 
            icon={Shield} 
            label="Security" 
            value="ML-DSA" 
            subtext="Quantum-Safe"
          />
          <StatCard 
            icon={Cpu} 
            label="Live Block" 
            value={loading ? '...' : formatNumber(l1Block)} 
            subtext={l2Block > 0 ? `L2: #${formatNumber(l2Block)}` : 'L2 Syncing'}
          />
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050507] to-transparent" />

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(60px); }
        }
      `}</style>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, subtext }: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <Icon className="w-5 h-5 text-emerald-400 mb-3" />
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-emerald-500/70 mt-1">{subtext}</div>
    </div>
  );
}
