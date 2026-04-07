import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/sections/hero"
import { MissionSection } from "@/components/sections/mission"
import { GovernanceSection } from "@/components/sections/governance"
import { GrantsSection } from "@/components/sections/grants"
import { ResearchSection } from "@/components/sections/research"
import { TeamSection } from "@/components/sections/team"
import { FinancialsSection } from "@/components/sections/financials"
import { NewsSection } from "@/components/sections/news"
import { ContactSection } from "@/components/sections/contact"
import { Footer } from "@/components/sections/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <MissionSection />
      <GovernanceSection />
      <GrantsSection />
      <ResearchSection />
      <TeamSection />
      <FinancialsSection />
      <NewsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
