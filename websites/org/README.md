# Besa Foundation Website

A professional non-profit organization website for the Besa Foundation, supporting the BesaChain ecosystem.

## Overview

The Besa Foundation website is a modern, institutional-quality Next.js application showcasing:
- Foundation mission and vision
- Governance and tokenomics
- Grants program
- Research initiatives
- Team and advisors
- Financial transparency
- News and updates
- Contact information

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui components
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

This generates a static export in the `dist/` directory, ready for deployment.

## Project Structure

```
besachain/websites/org/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── navigation.tsx     # Sticky navigation header
│   ├── ui/                # Reusable UI components
│   └── sections/          # Page sections
│       ├── hero.tsx
│       ├── mission.tsx
│       ├── governance.tsx
│       ├── grants.tsx
│       ├── research.tsx
│       ├── team.tsx
│       ├── financials.tsx
│       ├── news.tsx
│       ├── contact.tsx
│       └── footer.tsx
├── lib/
│   └── utils.ts           # Utility functions
├── public/                # Static assets
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Design System

### Colors
- **Primary Navy**: `#1e3a5f` (navy-800)
- **Accent Cyan**: `#00d4ff` (cyan-400)
- **Background**: White with navy-50 sections
- **Text**: navy-900 for headings, navy-600 for body

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, tracking-tight
- **Body**: Regular weight, comfortable line-height

### Components
- Cards with subtle shadows and hover effects
- Navy primary buttons with white text
- Outline buttons for secondary actions
- Progress bars for data visualization
- Badges for status indicators

## Sections

1. **Hero**: Main value proposition with feature grid
2. **Mission**: Foundation pillars and vision statement
3. **Governance**: Tokenomics chart, proposals, voting process
4. **Grants**: Program details, application process, funded projects
5. **Research**: Whitepapers, publications, academic partnerships
6. **Team**: Core contributors and advisory board
7. **Financials**: Treasury transparency, budget allocation, reports
8. **News**: Latest updates, press releases, newsletter signup
9. **Contact**: Contact form, email addresses, office locations
10. **Footer**: Links to ecosystem sites and social media

## Deployment

The site is configured for static export. To deploy:

1. Build the project: `npm run build`
2. The `dist/` folder contains the static site
3. Deploy to your preferred hosting service (Vercel, Netlify, Cloudflare Pages, etc.)

## External Links

- Main site: https://besachain.com
- DEX: https://dex.besachain.com
- Documentation: https://docs.besachain.com
- Explorer: https://explorer.besachain.com

## License

© 2024 Besa Foundation. All rights reserved.
