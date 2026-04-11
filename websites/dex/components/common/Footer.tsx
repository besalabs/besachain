'use client'

import Link from 'next/link'
import { Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050507]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <span className="text-black font-bold text-xs">B</span>
            </div>
            <span className="text-white font-medium">
              Besa<span className="text-emerald-400">Swap</span>
            </span>
            <span className="text-gray-600 text-sm ml-2">on</span>
            <Link href="https://besachain.com" className="text-gray-400 hover:text-white text-sm ml-1">
              BesaChain
            </Link>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="https://docs.besachain.com" className="hover:text-emerald-400 transition-colors">
              Docs
            </Link>
            <Link href="https://github.com/besalabs" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3" />
            </Link>
            <Link href="https://besachain.org" className="hover:text-emerald-400 transition-colors">
              Foundation
            </Link>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a href="https://twitter.com/besachain" className="text-gray-500 hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://discord.gg/besachain" className="text-gray-500 hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="https://github.com/besalabs" className="text-gray-500 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs text-gray-600">
          <p>Chain 1444 (L1) • 450ms block time • Quantum-safe signatures</p>
        </div>
      </div>
    </footer>
  )
}
