"use client"

import { motion } from "framer-motion"
import { ArrowRight, Zap, Shield, Cpu } from "lucide-react"
import { Button } from "./ui/button"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-gray-300">Mainnet Live • Chain 1444/1445</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Post-Quantum EVM
          <br />
          <span className="gradient-text text-glow">for the AI Era</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          The world's first EVM blockchain with ML-DSA quantum precompile.
          200K+ TPS. L1 + L2 scaling. Built for the post-quantum future.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button variant="primary" size="lg" href="#developers">
            Start Building
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" href="#technology">
            Explore Technology
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          <div className="glass rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <Zap className="w-8 h-8 text-accent-cyan" />
            </div>
            <div className="text-3xl font-bold mb-1">200K+</div>
            <div className="text-sm text-gray-400">Transactions Per Second</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <Shield className="w-8 h-8 text-accent-purple" />
            </div>
            <div className="text-3xl font-bold mb-1">ML-DSA</div>
            <div className="text-sm text-gray-400">Quantum Precompile</div>
          </div>
          <div className="glass rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <Cpu className="w-8 h-8 text-accent-blue" />
            </div>
            <div className="text-3xl font-bold mb-1">1444/1445</div>
            <div className="text-sm text-gray-400">L1 & L2 Chain IDs</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-accent-cyan"
          />
        </div>
      </motion.div>
    </section>
  )
}
