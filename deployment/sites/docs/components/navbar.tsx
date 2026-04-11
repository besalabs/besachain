'use client';

import { useState } from 'react';
import { Menu, X, Search, ExternalLink, Moon, Sun } from 'lucide-react';

const navLinks = [
  { label: 'Getting Started', href: '#getting-started' },
  { label: 'RPC Endpoints', href: '#rpc' },
  { label: 'Contracts', href: '#contracts' },
  { label: 'API', href: '#api' },
];

const ecosystemLinks = [
  { label: 'BesaChain', href: 'https://besachain.com', external: true },
  { label: 'DEX', href: 'https://dex.besachain.com', external: true },
  { label: 'Faucet', href: 'https://faucet.besachain.com', external: true },
  { label: 'Bridge', href: 'https://bridge.besachain.com', external: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <span className="text-black font-bold text-sm">B</span>
            </div>
            <span className="text-slate-900 font-semibold text-lg">
              Besa<span className="text-emerald-600">Chain</span>
              <span className="text-slate-400 font-normal text-sm ml-2">Docs</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs..."
                className="pl-9 pr-4 py-2 w-48 bg-slate-100 border border-transparent rounded-lg text-sm focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>

            {/* GitHub */}
            <a
              href="https://github.com/besalabs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="my-2 border-t border-slate-200" />
              <div className="px-4 py-2 text-xs text-slate-400 uppercase tracking-wider">Ecosystem</div>
              {ecosystemLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-between px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                  {link.external && <ExternalLink className="w-4 h-4" />}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
