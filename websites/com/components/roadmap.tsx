"use client"

import { motion } from "framer-motion"
import { Check, Circle, Clock, Rocket } from "lucide-react"

const milestones = [
  {
    quarter: "Q1 2026",
    title: "Testnet Launch",
    description: "Public testnet deployment with full EVM compatibility and basic ML-DSA support.",
    status: "completed",
    items: ["Testnet Live", "Faucet Available", "Documentation Portal", "Developer SDK"],
  },
  {
    quarter: "Q2 2026",
    title: "Mainnet Genesis",
    description: "Mainnet launch with L1 chain (1444) and initial validator set.",
    status: "completed",
    items: ["Mainnet Launch", "128 Validators", "Block Explorer", "Bridge Contracts"],
  },
  {
    quarter: "Q3 2026",
    title: "L2 Scaling",
    description: "L2 chain deployment with 200K+ TPS and native bridge between L1 and L2.",
    status: "in-progress",
    items: ["L2 Chain (1445)", "Native Bridge", "DEX Launch", "Wallet Support"],
  },
  {
    quarter: "Q4 2026",
    title: "AI & Quantum",
    description: "Full ML-DSA precompile and AI-optimized opcodes for machine learning workloads.",
    status: "upcoming",
    items: ["ML-DSA Precompile", "AI Opcodes", "Enterprise Partnerships", "Grant Program"],
  },
]

const statusConfig = {
  completed: {
    icon: Check,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30",
    label: "Completed",
  },
  "in-progress": {
    icon: Rocket,
    color: "text-accent-cyan",
    bgColor: "bg-accent-cyan/20",
    borderColor: "border-accent-cyan/30",
    label: "In Progress",
  },
  upcoming: {
    icon: Clock,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/30",
    label: "Upcoming",
  },
}

export function Roadmap() {
  return (
    <section id="roadmap" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[150px]" />

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
            Roadmap <span className="gradient-text">2026</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our journey to build the most advanced blockchain infrastructure
          </p>
        </motion.div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((milestone, index) => {
            const status = statusConfig[milestone.status as keyof typeof statusConfig]
            const StatusIcon = status.icon

            return (
              <motion.div
                key={milestone.quarter}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector line */}
                {index < milestones.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-[2px] bg-gradient-to-r from-white/10 to-transparent" />
                )}

                <div className={`glass rounded-2xl p-6 h-full border ${status.borderColor} hover:border-opacity-50 transition-all`}>
                  {/* Quarter Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold gradient-text">{milestone.quarter}</span>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bgColor}`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold mb-2">{milestone.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{milestone.description}</p>

                  {/* Items */}
                  <ul className="space-y-2">
                    {milestone.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-300">
                        <Circle className={`w-1.5 h-1.5 ${status.color} fill-current`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
