'use client';

import { Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#050507] border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <span className="text-black font-bold text-sm">B</span>
              </div>
              <span className="text-white font-semibold text-lg">
                Besa<span className="text-emerald-400">Swap</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              The premier decentralized exchange on BesaChain. 
              Fast swaps, deep liquidity, and low fees.
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

          {/* Products */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#swap" className="hover:text-emerald-400 transition-colors">Swap</a></li>
              <li><a href="#pools" className="hover:text-emerald-400 transition-colors">Liquidity Pools</a></li>
              <li><a href="#farms" className="hover:text-emerald-400 transition-colors">Yield Farms</a></li>
              <li><a href="#analytics" className="hover:text-emerald-400 transition-colors">Analytics</a></li>
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="text-white font-semibold mb-4">Ecosystem</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="https://besachain.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  BesaChain <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://docs.besachain.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Documentation <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://faucet.besachain.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Faucet <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://bridge.besachain.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Bridge <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 BesaSwap. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Powered by BesaChain</span>
            <span className="text-emerald-400">v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
