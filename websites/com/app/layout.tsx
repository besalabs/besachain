import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BesaChain | Post-Quantum EVM Blockchain",
  description: "The world's first post-quantum EVM blockchain with 200K+ TPS, ML-DSA quantum precompile, and AI-optimized architecture. Chain IDs 1444 (L1) and 1445 (L2).",
  keywords: ["blockchain", "post-quantum", "EVM", "cryptocurrency", "BesaChain", "ML-DSA", "quantum resistant"],
  authors: [{ name: "BesaChain Foundation" }],
  openGraph: {
    title: "BesaChain | Post-Quantum EVM Blockchain",
    description: "The world's first post-quantum EVM blockchain with 200K+ TPS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
