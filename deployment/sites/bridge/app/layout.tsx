import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BesaChain Bridge',
  description: 'Bridge assets between L1 and L2 on BesaChain',
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
