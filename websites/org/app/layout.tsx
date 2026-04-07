import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Besa Foundation - Building the Unbreakable Future",
  description: "Besa Foundation is a non-profit organization supporting the BesaChain ecosystem through governance, grants, research, and community building initiatives.",
  keywords: ["Besa Foundation", "BesaChain", "blockchain", "non-profit", "governance", "grants", "research"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
