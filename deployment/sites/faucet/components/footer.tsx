'use client';

import { Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <span className="text-black font-bold text-xs">B</span>
            </div>
            <span className="text-slate-900 font-semibold">
              Besa<span className="text-emerald-600">Faucet</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="https://besachain.com" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              Main Site <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://docs.besachain.com" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              Docs <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://github.com/besalabs" className="hover:text-emerald-600 transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-sm text-slate-400">
            © 2026 BesaChain
          </p>
        </div>
      </div>
    </footer>
  );
}
