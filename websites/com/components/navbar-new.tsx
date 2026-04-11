'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ExternalLink } from 'lucide-react';
import { useChainData } from '@/hooks/useChainData';

const navLinks = [
  { label: 'Network', href: '#network' },
  { label: 'Technology', href: '#technology' },
  { label: 'Developers', href: '#developers' },
  { label: 'DEX', href: 'https://dex.besachain.com', external: true },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { l1Data } = useChainData();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#050507]/90 backdrop-blur-xl border-b border-white/5' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <span className="text-black font-bold text-sm">B</span>
            </div>
            <span className="text-white font-semibold text-lg">
              Besa<span className="text-emerald-400">Chain</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                {link.label}
                {link.external && <ExternalLink className="w-3 h-3" />}
              </a>
            ))}
          </div>

          {/* Live Indicator */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className={`w-1.5 h-1.5 rounded-full ${l1Data?.chainId ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-xs text-gray-400 font-mono">
                #{l1Data?.blockNumber?.toLocaleString() || '...'}
              </span>
            </div>
            <a
              href="https://docs.besachain.com"
              className="px-4 py-2 text-sm font-medium text-black bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors"
            >
              Docs
            </a>
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
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="text-gray-400 hover:text-white transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                  {link.external && <ExternalLink className="w-3 h-3 inline ml-1" />}
                </a>
              ))}
              <a
                href="https://docs.besachain.com"
                className="mt-2 px-4 py-2 text-center font-medium text-black bg-emerald-400 rounded-lg"
              >
                Documentation
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
