'use client';

import { Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                <span className="text-black font-bold text-sm">B</span>
              </div>
              <span className="text-slate-900 font-semibold text-lg">
                Besa<span className="text-emerald-600">Chain</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm mb-4">
              Post-quantum EVM blockchain with 450ms finality. 
              Built for the quantum era.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/besalabs" className="text-slate-400 hover:text-slate-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/besachain" className="text-slate-400 hover:text-slate-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://discord.gg/besachain" className="text-slate-400 hover:text-slate-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Docs */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Documentation</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#getting-started" className="hover:text-emerald-600 transition-colors">Getting Started</a></li>
              <li><a href="#rpc" className="hover:text-emerald-600 transition-colors">RPC Endpoints</a></li>
              <li><a href="#contracts" className="hover:text-emerald-600 transition-colors">Contracts</a></li>
              <li><a href="#api" className="hover:text-emerald-600 transition-colors">API Reference</a></li>
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="text-slate-900 font-semibold mb-4">Ecosystem</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>
                <a href="https://besachain.com" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                  Main Site <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://dex.besachain.com" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                  DEX <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://faucet.besachain.com" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                  Faucet <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://bridge.besachain.com" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                  Bridge <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 BesaChain. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-700">Privacy Policy</a>
            <a href="#" className="hover:text-slate-700">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
