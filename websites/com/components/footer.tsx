"use client"

import { Github, Twitter, MessageCircle, FileText } from "lucide-react"

const footerLinks = {
  ecosystem: [
    { name: "BesaChain Foundation", href: "https://besachain.org" },
    { name: "Besa DEX", href: "https://dex.besachain.com" },
    { name: "Block Explorer", href: "https://scan.besachain.com" },
    { name: "Documentation", href: "https://docs.besachain.com" },
  ],
  developers: [
    { name: "Developer Portal", href: "https://docs.besachain.com" },
    { name: "GitHub", href: "https://github.com/besachain" },
    { name: "SDK", href: "https://docs.besachain.com/sdk" },
    { name: "Bug Bounty", href: "https://bugbounty.besachain.com" },
  ],
  community: [
    { name: "Discord", href: "https://discord.gg/besachain" },
    { name: "Twitter", href: "https://twitter.com/besachain" },
    { name: "Telegram", href: "https://t.me/besachain" },
    { name: "Forum", href: "https://forum.besachain.com" },
  ],
  resources: [
    { name: "Whitepaper", href: "https://besachain.org/whitepaper" },
    { name: "Brand Kit", href: "https://besachain.org/brand" },
    { name: "Press Kit", href: "https://besachain.org/press" },
    { name: "Careers", href: "https://besachain.org/careers" },
  ],
}

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/besachain", label: "Twitter" },
  { icon: Github, href: "https://github.com/besachain", label: "GitHub" },
  { icon: MessageCircle, href: "https://discord.gg/besachain", label: "Discord" },
  { icon: FileText, href: "https://docs.besachain.com", label: "Documentation" },
]

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
                <span className="text-background font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold">
                Besa<span className="gradient-text">Chain</span>
              </span>
            </a>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              The world's first post-quantum EVM blockchain. Built for the AI era with 200K+ TPS.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-accent-cyan hover:bg-white/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Ecosystem</h4>
            <ul className="space-y-3">
              {footerLinks.ecosystem.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-accent-cyan transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Developers</h4>
            <ul className="space-y-3">
              {footerLinks.developers.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-accent-cyan transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Community</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-accent-cyan transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-accent-cyan transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2026 BesaChain Foundation. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
