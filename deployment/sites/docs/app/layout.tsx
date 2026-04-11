import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BesaChain Documentation',
  description: 'Complete documentation for BesaChain - Post-Quantum EVM Blockchain',
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
      <body className="bg-[#fafafa] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
