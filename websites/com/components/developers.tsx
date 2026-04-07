"use client"

import { motion } from "framer-motion"
import { Copy, Check, ExternalLink, Book, Github, FileText } from "lucide-react"
import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"

const rpcEndpoints = [
  {
    name: "L1 HTTP RPC",
    url: "http://54.235.85.175:1444",
    chainId: "1444",
  },
  {
    name: "L1 WebSocket",
    url: "ws://54.235.85.175:14444",
    chainId: "1444",
  },
  {
    name: "L2 HTTP RPC",
    url: "http://54.235.85.175:1445",
    chainId: "1445",
  },
  {
    name: "L2 WebSocket",
    url: "ws://54.235.85.175:14445",
    chainId: "1445",
  },
]

const resources = [
  {
    icon: Book,
    title: "Documentation",
    description: "Comprehensive guides for developers building on BesaChain",
    href: "https://docs.besachain.com",
    color: "text-accent-cyan",
  },
  {
    icon: Github,
    title: "GitHub",
    description: "Open source repositories and code examples",
    href: "https://github.com/besachain",
    color: "text-white",
  },
  {
    icon: FileText,
    title: "Block Explorer",
    description: "Explore transactions, blocks, and accounts",
    href: "https://scan.besachain.com",
    color: "text-accent-purple",
  },
]

function EndpointCard({ endpoint }: { endpoint: typeof rpcEndpoints[0] }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(endpoint.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="glass rounded-xl p-4 border border-white/5 hover:border-accent-cyan/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{endpoint.name}</span>
        <span className="text-xs px-2 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan">
          Chain {endpoint.chainId}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs sm:text-sm font-mono text-gray-400 truncate">
          {endpoint.url}
        </code>
        <button
          onClick={copyToClipboard}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  )
}

export function Developers() {
  return (
    <section id="developers" className="py-24 relative">
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-[150px]" />

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
            Build on <span className="gradient-text">BesaChain</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to start developing on the post-quantum EVM
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* RPC Endpoints */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                  <span className="text-accent-cyan text-sm">{"</>"}</span>
                </span>
                RPC Endpoints
              </h3>
              <div className="space-y-3">
                {rpcEndpoints.map((endpoint) => (
                  <EndpointCard key={endpoint.name} endpoint={endpoint} />
                ))}
              </div>

              {/* Quick Config */}
              <div className="mt-6 p-4 rounded-xl bg-black/30 border border-white/5">
                <p className="text-xs text-gray-400 mb-2">Network Config (MetaMask)</p>
                <pre className="text-xs font-mono text-gray-300 overflow-x-auto">
{`{
  "chainId": "0x5A4",
  "chainName": "BesaChain L1",
  "rpcUrls": ["http://54.235.85.175:1444"],
  "nativeCurrency": {
    "name": "BESA",
    "symbol": "BESA",
    "decimals": 18
  }
}`}
                </pre>
              </div>
            </Card>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {resources.map((resource, index) => (
              <motion.a
                key={resource.title}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group hover:border-accent-cyan/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                      <resource.icon className={`w-6 h-6 ${resource.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{resource.title}</h3>
                        <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{resource.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.a>
            ))}

            {/* Quick Start CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass rounded-2xl p-6 border border-accent-cyan/20"
            >
              <h3 className="font-semibold mb-2">Ready to deploy?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Deploy your first smart contract on BesaChain in minutes
              </p>
              <Button variant="primary" size="sm" href="https://docs.besachain.com/quickstart">
                Quick Start Guide
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
