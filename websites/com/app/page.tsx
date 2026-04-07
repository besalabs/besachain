import { ParticlesBackground } from "@/components/particles"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Technology } from "@/components/technology"
import { NetworkStats } from "@/components/network-stats"
import { Developers } from "@/components/developers"
import { Roadmap } from "@/components/roadmap"
import { Community } from "@/components/community"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Background Effects */}
      <ParticlesBackground />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Sections */}
      <Hero />
      <Features />
      <Technology />
      <NetworkStats />
      <Developers />
      <Roadmap />
      <Community />
      <Footer />
    </main>
  )
}
