'use client';

import { useState } from 'react';
import { ChevronRight, BookOpen, Zap, Server, FileCode, Layers, Shield, Coins } from 'lucide-react';

const sidebarSections = [
  {
    title: 'Getting Started',
    icon: BookOpen,
    items: [
      { label: 'Introduction', href: '#introduction' },
      { label: 'Quick Start', href: '#quick-start' },
      { label: 'Network Info', href: '#network-info' },
      { label: 'Wallet Setup', href: '#wallet-setup' },
    ],
  },
  {
    title: 'RPC Endpoints',
    icon: Server,
    items: [
      { label: 'L1 Mainnet', href: '#l1-mainnet' },
      { label: 'L2 Mainnet', href: '#l2-mainnet' },
      { label: 'Testnet', href: '#testnet' },
      { label: 'Rate Limits', href: '#rate-limits' },
    ],
  },
  {
    title: 'Smart Contracts',
    icon: FileCode,
    items: [
      { label: 'Contract Addresses', href: '#contracts' },
      { label: 'Deployed Contracts', href: '#deployed' },
      { label: 'Verified Contracts', href: '#verified' },
      { label: 'Proxy Contracts', href: '#proxies' },
    ],
  },
  {
    title: 'API Reference',
    icon: Layers,
    items: [
      { label: 'JSON-RPC', href: '#json-rpc' },
      { label: 'WebSocket', href: '#websocket' },
      { label: 'GraphQL', href: '#graphql' },
      { label: 'SDK', href: '#sdk' },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    items: [
      { label: 'ML-DSA Signatures', href: '#ml-dsa' },
      { label: 'Audit Reports', href: '#audits' },
      { label: 'Bug Bounty', href: '#bug-bounty' },
    ],
  },
  {
    title: 'Tokens',
    icon: Coins,
    items: [
      { label: 'BESA Token', href: '#besa-token' },
      { label: 'Token Standards', href: '#token-standards' },
      { label: 'Bridged Assets', href: '#bridged' },
    ],
  },
];

export function Sidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Getting Started']);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="w-64 hidden lg:block fixed left-0 top-16 bottom-0 border-r border-slate-200 bg-white overflow-y-auto">
      <nav className="p-4">
        {sidebarSections.map((section) => (
          <div key={section.title} className="mb-4">
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <section.icon className="w-4 h-4 text-emerald-600" />
              {section.title}
              <ChevronRight
                className={`w-4 h-4 ml-auto transition-transform ${
                  expandedSections.includes(section.title) ? 'rotate-90' : ''
                }`}
              />
            </button>
            {expandedSections.includes(section.title) && (
              <div className="ml-4 mt-1 space-y-1">
                {section.items.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block px-3 py-1.5 text-sm text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
