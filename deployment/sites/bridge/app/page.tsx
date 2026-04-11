import { Navbar } from '@/components/navbar';
import { BridgeInterface } from '@/components/bridge-interface';
import { Footer } from '@/components/footer';
import { Shield, Clock, Zap, Lock } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050507] bg-grid">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Bridge to <span className="text-gradient">BesaChain L2</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Transfer assets between L1 and L2 securely. Fast deposits, 
              trust-minimized withdrawals.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            <div className="glass rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-white font-medium">2 Min</div>
              <div className="text-xs text-gray-500">Deposit Time</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-white font-medium">7 Days</div>
              <div className="text-xs text-gray-500">Withdrawal</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-white font-medium">Secure</div>
              <div className="text-xs text-gray-500">Optimistic Rollup</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-white font-medium">24/7</div>
              <div className="text-xs text-gray-500">Available</div>
            </div>
          </div>

          {/* Bridge Interface */}
          <BridgeInterface />
        </div>
      </section>

      <Footer />
    </main>
  );
}
