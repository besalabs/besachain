"use client"

import { motion } from "framer-motion"
import { MessageCircle, Twitter, Send, Github } from "lucide-react"
import { Card } from "./ui/card"

const socialLinks = [
  {
    icon: Twitter,
    name: "Twitter",
    handle: "@BesaChain",
    description: "Latest updates, announcements, and community highlights",
    href: "https://twitter.com/besachain",
    color: "from-blue-400 to-blue-600",
    members: "50K+",
  },
  {
    icon: DiscordIcon,
    name: "Discord",
    handle: "Discord Server",
    description: "Join the conversation with developers and validators",
    href: "https://discord.gg/besachain",
    color: "from-indigo-400 to-indigo-600",
    members: "25K+",
  },
  {
    icon: Send,
    name: "Telegram",
    handle: "@BesaChain",
    description: "Real-time discussions and community support",
    href: "https://t.me/besachain",
    color: "from-cyan-400 to-cyan-600",
    members: "30K+",
  },
  {
    icon: Github,
    name: "GitHub",
    handle: "besachain",
    description: "Open source code, contributions, and technical discussions",
    href: "https://github.com/besachain",
    color: "from-gray-400 to-gray-600",
    members: "2K+",
  },
]

export function Community() {
  return (
    <section id="community" className="py-24 relative">
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
            Join the <span className="gradient-text">Community</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect with developers, validators, and enthusiasts building the future of blockchain
          </p>
        </motion.div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group h-full hover:scale-[1.02] transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <social.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{social.name}</h3>
                <p className="text-accent-cyan text-sm mb-2">{social.handle}</p>
                <p className="text-gray-400 text-sm mb-4">{social.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400">
                    {social.members} members
                  </span>
                </div>
              </Card>
            </motion.a>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <Card className="p-8 text-center border-accent-cyan/20">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Subscribe to our newsletter for the latest news, updates, and exclusive insights
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-cyan/50 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent-cyan text-background font-medium rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}
