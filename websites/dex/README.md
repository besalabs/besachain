# BesaSwap DEX

A PancakeSwap-style decentralized exchange built for BesaChain (Chain ID: 1444).

## Features

- **Token Swaps**: Exchange BESA, WBTC, WETH, USDT, USDC, and WBNB
- **Liquidity Pools**: Add/remove liquidity and earn trading fees
- **Yield Farms**: Stake LP tokens to earn BESA rewards with high APY
- **Staking**: Lock BESA tokens for different periods with boosted rewards
- **Analytics**: Track TVL, volume, token prices, and top pools

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: wagmi/viem
- **Wallet**: RainbowKit
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Navigate to the project directory
cd /Users/senton/besachain/websites/dex

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start at `http://localhost:3000`.

### Build for Production

```bash
# Build the static export
npm run build

# The static files will be in the `dist` folder
```

## Configuration

### Chain Configuration

The DEX is configured to connect to BesaChain:

- **Chain ID**: 1444
- **RPC**: http://54.235.85.175:1444
- **WS**: ws://54.235.85.175:14444

### Smart Contract Addresses

Update these addresses in `lib/config/chains.ts` when contracts are deployed:

```typescript
const CONTRACTS = {
  router: '0x0000000000000000000000000000000000000000',
  factory: '0x0000000000000000000000000000000000000000',
  besaToken: '0x9322Ae3D3F43bEcDE4aCAfb4a216Aa7FBBA22604',
  wbtc: '0x0000000000000000000000000000000000000001',
  weth: '0x0000000000000000000000000000000000000002',
  usdt: '0x0000000000000000000000000000000000000003',
  usdc: '0x0000000000000000000000000000000000000004',
  wbnb: '0x0000000000000000000000000000000000000005',
}
```

## Project Structure

```
besachain/websites/dex/
├── app/                    # Next.js app router pages
│   ├── swap/              # Swap page
│   ├── liquidity/         # Liquidity pools page
│   ├── farms/             # Yield farms page
│   ├── staking/           # Staking page
│   ├── analytics/         # Analytics dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home redirect
├── components/            # React components
│   ├── swap/              # Swap-related components
│   ├── liquidity/         # Liquidity components
│   ├── farms/             # Farm components
│   ├── staking/           # Staking components
│   ├── analytics/         # Analytics components
│   ├── common/            # Shared components (Header, TokenIcon, etc.)
│   └── ui/                # UI primitives (Button, Card, etc.)
├── hooks/                 # Custom React hooks
│   ├── useTokenBalance.ts
│   ├── useTokenApproval.ts
│   ├── useSwap.ts
│   ├── useLiquidity.ts
│   ├── useFarms.ts
│   └── useStaking.ts
├── lib/                   # Utility functions and configs
│   ├── abis/              # Smart contract ABIs
│   ├── config/            # Chain and wagmi configuration
│   └── utils.ts           # Helper functions
├── public/                # Static assets
├── package.json           # Dependencies
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## Smart Contract Integration

### Available Hooks

- `useTokenBalance(tokenAddress)` - Get token balance
- `useTokenApproval(tokenAddress, spenderAddress)` - Approve token spending
- `useSwap()` - Execute token swaps
- `useLiquidity()` - Add/remove liquidity
- `useFarms()` - Farm deposit/withdraw/harvest
- `useStaking()` - Stake/unstake/harvest/compound

### ABIs Included

- ERC20 Token
- Uniswap V2 Router
- Uniswap V2 Factory
- Uniswap V2 Pair
- MasterChef (Yield Farming)
- Staking Contract

## Design

The DEX features a dark theme inspired by PancakeSwap:

- **Background**: #0a0a0a (Deep black)
- **Primary Gradient**: Purple (#8b5cf6) to Pink (#ec4899)
- **Cards**: Glass morphism with white/5 background and backdrop blur
- **Animations**: Subtle pulsing gradients and smooth transitions

## Deployment

### Static Export

The project is configured for static export to `dist/` folder:

```javascript
// next.config.js
module.exports = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
}
```

### Hosting Options

The static export can be deployed to:
- Netlify
- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront
- Any static hosting provider

## Development Notes

### Adding New Tokens

To add support for new tokens, update `TOKENS` in `lib/config/chains.ts`:

```typescript
NEW_TOKEN: {
  address: '0x...',
  symbol: 'NEW',
  name: 'New Token',
  decimals: 18,
  logoURI: '/icons/new.svg',
}
```

### Updating Contract Addresses

After deploying contracts, update the addresses in `lib/config/chains.ts`:

```typescript
export const CONTRACTS = {
  router: '0xYOUR_ROUTER_ADDRESS',
  factory: '0xYOUR_FACTORY_ADDRESS',
  // ... other addresses
}
```

## License

MIT License

## Support

For issues and feature requests, please open an issue in the repository.
