import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { NetworkStatus } from '@/components/common/NetworkStatus'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'BesaSwap | DEX on BesaChain',
  description: 'Trade tokens on BesaChain with 450ms finality. Low fees, deep liquidity, and quantum-safe security.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-[#050507] antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <NetworkStatus />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
