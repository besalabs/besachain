"use client"

import { motion } from "framer-motion"
import { Layers, GitFork, FileCode, Server } from "lucide-react"
import { Card } from "./ui/card"

const techStack = [
  {
    icon: Layers,
    title: "L1 + L2 Architecture",
    description: "Dual-chain architecture with Chain ID 1444 (L1) for security and Chain ID 1445 (L2) for scalability. Native bridge enables seamless asset transfers.",
  },
  {
    icon: GitFork,
    title: "BSC Fork Foundation",
    description: "Built on battle-tested BSC codebase with significant modifications for quantum resistance and AI optimization.",
  },
  {
    icon: FileCode,
    title: "EIP-7702 Support",
    description: "Full support for Account Abstraction via EIP-7702. Smart contract wallets with social recovery and gasless transactions.",
  },
  {
    icon: Server,
    title: "AWS Infrastructure",
    description: "Enterprise-grade infrastructure running on AWS with global distribution for low latency worldwide.",
  },
]

export function Technology() {
  return (
    <section id="technology" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/5 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Technical <span className="gradient-text">Excellence</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Advanced architecture combining proven foundations with cutting-edge innovations
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="glass rounded-3xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* L1 Chain */}
              <div className="glass rounded-2xl p-6 border border-accent-cyan/30 glow-cyan-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Layer 1</h3>
                    <p className="text-sm text-accent-cyan">Chain ID 1444</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                    Consensus Layer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                    ML-DSA Precompile
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                    State Security
                  </li>
                </ul>
              </div>

              {/* Bridge */}
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center mx-auto mb-3 glow-cyan-sm">
                    <GitFork className="w-8 h-8 text-accent-cyan" />
                  </div>
                  <p className="text-sm font-medium">Native Bridge</p>
                  <p className="text-xs text-gray-400">Atomic Cross-Chain</p>
                </div>
              </div>

              {/* L2 Chain */}
              <div className="glass rounded-2xl p-6 border border-accent-purple/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center">
                    <ZapIcon className="w-5 h-5 text-accent-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Layer 2</h3>
                    <p className="text-sm text-accent-purple">Chain ID 1445</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                    Execution Layer
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                    200K+ TPS
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                    Low Gas Fees
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tech Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <tech.icon className="w-6 h-6 text-accent-cyan" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{tech.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{tech.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}
