"use client"

import { motion } from "framer-motion"
import { Activity, Box, Users, Clock } from "lucide-react"
import { Card } from "./ui/card"

const stats = [
  {
    icon: Activity,
    label: "Live TPS",
    value: "184,392",
    change: "+12.5%",
    positive: true,
  },
  {
    icon: BlockIcon,
    label: "Block Height",
    value: "12,847,293",
    change: "+1.2s",
    positive: true,
  },
  {
    icon: Users,
    label: "Validators",
    value: "128",
    change: "Active",
    positive: true,
  },
  {
    icon: Clock,
    label: "Block Time",
    value: "1.2s",
    change: "-0.1s",
    positive: true,
  },
]

export function NetworkStats() {
  return (
    <section id="network" className="py-24 relative">
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
            Network <span className="gradient-text">Status</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real-time metrics from the BesaChain network
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-accent-cyan" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold mb-1 font-mono">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Network Activity Graph Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Network Activity</h3>
              <div className="flex gap-2">
                <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-white/5">24H</span>
                <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-white/5">7D</span>
                <span className="text-xs text-accent-cyan px-3 py-1 rounded-full bg-accent-cyan/10">30D</span>
              </div>
            </div>
            <div className="h-48 sm:h-64 relative">
              {/* Animated graph bars */}
              <div className="absolute inset-0 flex items-end justify-between gap-1">
                {Array.from({ length: 50 }).map((_, i) => {
                  const height = Math.random() * 60 + 20
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.01 }}
                      className="flex-1 bg-gradient-to-t from-accent-cyan/20 to-accent-cyan/60 rounded-t-sm"
                      style={{ maxWidth: '8px' }}
                    />
                  )
                })}
              </div>
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-t border-white/5" />
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

function BlockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  )
}
