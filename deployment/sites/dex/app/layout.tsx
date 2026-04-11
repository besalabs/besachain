import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BesaSwap | BesaChain DEX',
  description: 'Decentralized exchange on BesaChain. Swap tokens, provide liquidity, and earn yield.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#050507] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
