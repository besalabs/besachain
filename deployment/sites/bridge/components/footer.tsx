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
                Besa<span className="text-emerald-400">Bridge</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm mb-4">
              Securely bridge assets between BesaChain L1 and L2. 
              Fast deposits, secure withdrawals.
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

          {/* Bridge */}
          <div>
            <h4 className="text-white font-semibold mb-4">Bridge</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Deposit</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Withdraw</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Transaction History</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
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
                <a href="https://dex.besachain.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  DEX <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://docs.besachain.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Docs <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://faucet.besachain.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Faucet <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">
            © 2026 BesaBridge. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-600">
            <span>Optimistic Rollup Bridge</span>
            <span className="text-emerald-400">Secure & Decentralized</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
