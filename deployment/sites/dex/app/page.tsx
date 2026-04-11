'use client';

import { Navbar } from '@/components/navbar';
import { SwapInterface } from '@/components/swap-interface';
import { LiquidityPools } from '@/components/liquidity-pools';
import { Farms } from '@/components/farms';
import { Analytics } from '@/components/analytics';
import { Footer } from '@/components/footer';
import { Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050507] bg-grid">
      <Navbar />

      {/* Hero / Swap Section */}
      <section id="swap" className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400">Live on BesaChain Mainnet</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Trade tokens with <span className="text-gradient">zero slippage</span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-lg">
                The most efficient DEX on BesaChain. Experience lightning-fast swaps, 
                deep liquidity, and minimal fees.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 glass rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">450ms</div>
                    <div className="text-sm text-gray-500">Finality</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 glass rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">0.3%</div>
                    <div className="text-sm text-gray-500">Trading Fee</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 glass rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">$13M+</div>
                    <div className="text-sm text-gray-500">TVL</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 glass rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white font-medium">85%+</div>
                    <div className="text-sm text-gray-500">Max APR</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Swap Interface */}
            <div>
              <SwapInterface />
            </div>
          </div>
        </div>
      </section>

      {/* Pools Section */}
      <section id="pools" className="py-20 px-4 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <LiquidityPools />
        </div>
      </section>

      {/* Farms Section */}
      <section id="farms" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Farms />
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-20 px-4 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-7xl mx-auto">
          <Analytics />
        </div>
      </section>

      <Footer />
    </main>
  );
}
