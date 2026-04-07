# BesaChain Website

A modern, professional blockchain landing page for BesaChain - the world's first post-quantum EVM blockchain.

## Overview

BesaChain is a post-quantum EVM blockchain featuring:
- Chain ID 1444 (L1) and 1445 (L2)
- ML-DSA quantum precompile
- 200K+ TPS capability
- AWS infrastructure at 54.235.85.175

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui inspired components
- **Animations**: Framer Motion

## Design

- **Theme**: Dark futuristic blockchain aesthetic
- **Colors**:
  - Background: `#0a0a0a` (deep black)
  - Foreground: `#ffffff` (electric white)
  - Accent: `#00d4ff` (cyan)
  - Secondary: `#a855f7` (purple)
- **Effects**: Glass morphism, animated gradients, particle background

## Sections

1. **Hero**: "Post-Quantum EVM for the AI Era" with 200K+ TPS, ML-DSA, Chain 1444
2. **Features**: Quantum Safe, High TPS, AI-Optimized, Developer Friendly, L1+L2, Decentralized
3. **Technology**: L1+L2 architecture, BSC fork, EIP-7702 support
4. **Network Stats**: Live TPS, Block height, Validators (mock data)
5. **Developers**: RPC endpoints, Documentation, GitHub links
6. **Roadmap**: Q1-Q4 2026 milestones
7. **Community**: Discord, Twitter, Telegram links
8. **Footer**: Links to Foundation, DEX, resources

## RPC Endpoints

- L1 RPC: `http://54.235.85.175:1444`
- L1 WS: `ws://54.235.85.175:14444`
- L2 RPC: `http://54.235.85.175:1445`
- L2 WS: `ws://54.235.85.175:14445`
- Chain IDs: 1444 (L1), 1445 (L2)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Create production build
npm run build

# Output will be in the `dist` folder
```

## Project Structure

```
besachain/websites/com/
├── app/
│   ├── globals.css       # Global styles & Tailwind
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Main page component
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── particles.tsx     # Animated particle background
│   ├── navbar.tsx        # Navigation component
│   ├── hero.tsx          # Hero section
│   ├── features.tsx      # Features section
│   ├── technology.tsx    # Technology section
│   ├── network-stats.tsx # Network stats section
│   ├── developers.tsx    # Developer resources section
│   ├── roadmap.tsx       # Roadmap section
│   ├── community.tsx     # Community section
│   └── footer.tsx        # Footer component
├── lib/
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Deployment

The project is configured for static export:

```javascript
// next.config.js
{
  output: 'export',
  distDir: 'dist'
}
```

Build output will be in the `dist` folder, ready for deployment to any static hosting service.

## Customization

### Colors

Edit `tailwind.config.ts` to modify the theme colors:

```typescript
colors: {
  accent: {
    cyan: '#00d4ff',
    purple: '#a855f7',
    blue: '#3b82f6',
  }
}
```

### Content

All content is in the component files under `components/`. Edit the relevant section component to update content.

## Links

- **Foundation**: https://besachain.org
- **DEX**: https://dex.besachain.com
- **Explorer**: https://scan.besachain.com
- **Documentation**: https://docs.besachain.com

## License

© 2026 BesaChain Foundation. All rights reserved.
