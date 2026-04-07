"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Brain, Code, Globe, Lock } from "lucide-react"
import { Card } from "./ui/card"

const features = [
  {
    icon: Shield,
    title: "Quantum Safe",
    description: "NIST-approved ML-DSA quantum-resistant signatures with dedicated EVM precompile for post-quantum security.",
    color: "text-accent-cyan",
  },
  {
    icon: Zap,
    title: "High TPS",
    description: "200,000+ transactions per second through optimized consensus and parallel execution architecture.",
    color: "text-accent-purple",
  },
  {
    icon: Brain,
    title: "AI-Optimized",
    description: "Purpose-built for AI workloads with optimized opcodes for machine learning inference and training.",
    color: "text-accent-blue",
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "Full EVM compatibility means your existing Solidity contracts work out of the box. No rewrites needed.",
    color: "text-green-400",
  },
  {
    icon: Globe,
    title: "L1 + L2 Scaling",
    description: "Seamless L2 scaling with Chain ID 1445. Move assets between L1 and L2 with native bridge.",
    color: "text-orange-400",
  },
  {
    icon: Lock,
    title: "Decentralized",
    description: "Proof-of-Stake consensus with distributed validator set. No single point of failure.",
    color: "text-pink-400",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Built for the <span className="gradient-text">Future</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Combining quantum-resistant cryptography with high-performance EVM execution
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full group hover:scale-[1.02] transition-transform">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
