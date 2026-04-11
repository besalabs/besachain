'use client'

import { useState, useEffect } from 'react'
import { Shield, Globe, Users, Zap, ArrowRight, Github, Twitter, MessageCircle, Mail } from 'lucide-react'

export default function FoundationPage() {
  const [blockHeight, setBlockHeight] = useState<number | null>(null)

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const response = await fetch('https://rpc.besachain.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_blockNumber',
            params: []
          })
        })
        const data = await response.json()
        setBlockHeight(parseInt(data.result, 16))
      } catch (e) {
        // Silent fail
      }
    }
    fetchBlock()
    const interval = setInterval(fetchBlock, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#050507]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050507]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <span className="text-black font-bold text-sm">B</span>
            </div>
            <span className="text-white font-semibold text-lg">
              Besa<span className="text-emerald-400">Chain</span>
              <span className="text-gray-500 ml-2 text-sm font-normal">Foundation</span>
            </span>
          </a>
          <div className="flex items-center gap-6 text-sm">
            <a href="#mission" className="text-gray-400 hover:text-white transition-colors">Mission</a>
            <a href="#grants" className="text-gray-400 hover:text-white transition-colors">Grants</a>
            <a href="https://besachain.com" className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
              Main Site <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-emerald-400">
              {blockHeight ? `Block #${blockHeight.toLocaleString()}` : 'Connecting...'}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Building the
            <span className="text-gradient block">Post-Quantum Future</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            The BesaChain Foundation supports research, development, and adoption of 
            quantum-safe blockchain infrastructure for the next era of computing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#grants"
              className="px-8 py-4 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
            >
              Apply for Grants
            </a>
            <a 
              href="#mission"
              className="px-8 py-4 border border-gray-700 text-white rounded-lg hover:border-gray-500 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value="450ms" label="Block Time" />
            <Stat value="10,500+" label="TPS (L1)" />
            <Stat value="200,000+" label="TPS (L2)" />
            <Stat value="Chain 1444" label="Network ID" />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Preparing blockchain infrastructure for the quantum computing era
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <MissionCard 
              icon={Shield}
              title="Quantum Safety"
              description="Integrating NIST-standardized post-quantum cryptography (ML-DSA) into core blockchain infrastructure."
            />
            <MissionCard 
              icon={Zap}
              title="Performance"
              description="450ms block finality with 10,500+ TPS on L1 and 200,000+ TPS on L2 through optimistic rollups."
            />
            <MissionCard 
              icon={Globe}
              title="Accessibility"
              description="Full EVM compatibility ensures existing developers can build without learning new tools."
            />
          </div>
        </div>
      </section>

      {/* Grants */}
      <section id="grants" className="py-24 px-6 bg-gradient-to-b from-[#050507] to-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ecosystem Grants
              </h2>
              <p className="text-gray-400 mb-8">
                We fund projects that advance the BesaChain ecosystem. From infrastructure 
                to applications, we support builders creating the future of quantum-safe DeFi.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Infrastructure & Tooling',
                  'DeFi Protocols',
                  'Research & Security',
                  'Developer Education'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              <a 
                href="mailto:grants@besachain.org"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact for Grants
              </a>
            </div>

            <div className="p-8 rounded-2xl bg-gray-900/50 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-6">Grant Tiers</h3>
              <div className="space-y-4">
                <GrantTier name="Seed" amount="$5K - $25K" description="Early-stage projects" />
                <GrantTier name="Growth" amount="$25K - $100K" description="Scaling projects" />
                <GrantTier name="Enterprise" amount="$100K+" description="Major infrastructure" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Info */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Network Information</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <NetworkCard 
              title="BesaChain L1"
              chainId="1444"
              rpc="https://rpc.besachain.com"
              blockTime="450ms"
            />
            <NetworkCard 
              title="BesaChain L2"
              chainId="1445"
              rpc="https://l2-rpc.besachain.com"
              blockTime="250ms"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <span className="text-black font-bold text-xs">B</span>
              </div>
              <span className="text-white font-medium">
                Besa<span className="text-emerald-400">Chain</span>
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="https://github.com/besalabs" className="text-gray-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/besachain" className="text-gray-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://discord.gg/besachain" className="text-gray-500 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="mailto:foundation@besachain.org" className="text-gray-500 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-gray-600">
            <p>© 2026 BesaChain Foundation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function MissionCard({ icon: Icon, title, description }: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10 hover:border-emerald-500/30 transition-colors">
      <Icon className="w-8 h-8 text-emerald-400 mb-4" />
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  )
}

function GrantTier({ name, amount, description }: {
  name: string
  amount: string
  description: string
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
      <div>
        <div className="font-medium text-white">{name}</div>
        <div className="text-sm text-gray-500">{description}</div>
      </div>
      <div className="text-emerald-400 font-mono">{amount}</div>
    </div>
  )
}

function NetworkCard({ title, chainId, rpc, blockTime }: {
  title: string
  chainId: string
  rpc: string
  blockTime: string
}) {
  return (
    <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Chain ID</span>
          <span className="text-white font-mono">{chainId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Block Time</span>
          <span className="text-white">{blockTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">RPC</span>
          <code className="text-emerald-400 text-xs">{rpc}</code>
        </div>
      </div>
    </div>
  )
}
