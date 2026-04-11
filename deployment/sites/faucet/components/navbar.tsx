'use client';

import { useState } from 'react';
import { Menu, X, ExternalLink, Droplets } from 'lucide-react';

const ecosystemLinks = [
  { label: 'BesaChain', href: 'https://besachain.com', external: true },
  { label: 'DEX', href: 'https://dex.besachain.com', external: true },
  { label: 'Docs', href: 'https://docs.besachain.com', external: true },
  { label: 'Bridge', href: 'https://bridge.besachain.com', external: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-black" />
            </div>
            <span className="text-slate-900 font-semibold text-lg">
              Besa<span className="text-emerald-600">Faucet</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full">
              Testnet
            </span>
          </div>

          {/* Ecosystem Links */}
          <div className="hidden md:flex items-center gap-4">
            {ecosystemLinks.slice(0, 3).map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                {link.label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
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
              <div className="px-4 py-2 text-xs text-slate-400 uppercase tracking-wider">Network</div>
              <div className="px-4 py-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full">
                  Testnet Only
                </span>
              </div>
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
