'use client';

import { useState } from 'react';
import { Menu, X, Wallet, ExternalLink } from 'lucide-react';

const ecosystemLinks = [
  { label: 'BesaChain', href: 'https://besachain.com', external: true },
  { label: 'DEX', href: 'https://dex.besachain.com', external: true },
  { label: 'Docs', href: 'https://docs.besachain.com', external: true },
  { label: 'Faucet', href: 'https://faucet.besachain.com', external: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050507]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <span className="text-black font-bold text-sm">B</span>
            </div>
            <span className="text-white font-semibold text-lg">
              Besa<span className="text-emerald-400">Bridge</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              Deposit
            </a>
            <a href="#" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              Withdraw
            </a>
            <a href="#" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              History
            </a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Ecosystem */}
            <div className="relative group">
              <button className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                Ecosystem
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-1 w-48 py-2 bg-[#0f0f1a] border border-white/10 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {ecosystemLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                ))}
              </div>
            </div>

            {/* Connect Wallet */}
            <button
              onClick={() => setWalletConnected(!walletConnected)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                walletConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              <Wallet className="w-4 h-4" />
              {walletConnected ? '0x1234...5678' : 'Connect'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
              <a href="#" className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                Deposit
              </a>
              <a href="#" className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                Withdraw
              </a>
              <a href="#" className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                History
              </a>
              <div className="my-2 border-t border-white/10" />
              <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">Ecosystem</div>
              {ecosystemLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-between px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
