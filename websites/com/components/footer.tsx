'use client';

import { Github, Twitter, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#050507] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <span className="text-black font-bold text-sm">B</span>
              </div>
              <span className="text-white font-semibold text-lg">
                Besa<span className="text-emerald-400">Chain</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              Post-Quantum EVM blockchain. 450ms finality. 10,500+ TPS. 
              Built for the quantum era.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/besalabs" className="text-gray-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/besachain" className="text-gray-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://discord.gg/besachain" className="text-gray-500 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Network</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="https://besachain.com" className="hover:text-emerald-400 transition-colors">Mainnet</a></li>
              <li><a href="https://rpc.besachain.com" className="hover:text-emerald-400 transition-colors">RPC Endpoint</a></li>
              <li><a href="https://explorer.besachain.com" className="hover:text-emerald-400 transition-colors">Explorer</a></li>
              <li><a href="https://dex.besachain.com" className="hover:text-emerald-400 transition-colors">DEX</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="https://docs.besachain.com" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
              <li><a href="https://github.com/besalabs" className="hover:text-emerald-400 transition-colors">GitHub</a></li>
              <li><a href="https://besachain.org" className="hover:text-emerald-400 transition-colors">Foundation</a></li>
              <li><a href="https://besachain.org/grants" className="hover:text-emerald-400 transition-colors">Grants</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 BesaChain. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Chain 1444 (L1)</span>
            <span>Chain 1445 (L2)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
