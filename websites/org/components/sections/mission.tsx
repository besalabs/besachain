"use client"

import { Lock, Globe, Users, Zap, BookOpen, HeartHandshake } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const pillars = [
  {
    icon: Lock,
    title: "Post-Quantum Security",
    description: "Pioneering quantum-resistant cryptography to secure the future of blockchain infrastructure against emerging threats."
  },
  {
    icon: Globe,
    title: "Open Infrastructure",
    description: "Building transparent, decentralized systems that empower communities and eliminate single points of failure."
  },
  {
    icon: Users,
    title: "Global Access",
    description: "Democratizing access to financial services and digital infrastructure regardless of geography or background."
  },
  {
    icon: Zap,
    title: "Sustainable Innovation",
    description: "Developing energy-efficient consensus mechanisms that minimize environmental impact while maximizing performance."
  },
  {
    icon: BookOpen,
    title: "Education & Research",
    description: "Funding cutting-edge research and educational initiatives to advance blockchain technology understanding."
  },
  {
    icon: HeartHandshake,
    title: "Community First",
    description: "Prioritizing community governance and participation in all ecosystem decisions and developments."
  }
]

export function MissionSection() {
  return (
    <section id="mission" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            Besa Foundation exists to support, nurture, and expand the BesaChain ecosystem. 
            We are dedicated to creating an unbreakable foundation for the future of decentralized 
            technology—one that is secure, accessible, and governed by the community it serves.
          </p>
        </div>

        {/* Vision Statement */}
        <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-8 lg:p-12 mb-16 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-lg text-navy-100 leading-relaxed">
              A world where financial freedom, digital sovereignty, and technological innovation 
              are accessible to all—secured by post-quantum cryptography and governed by transparent, 
              decentralized institutions.
            </p>
          </div>
        </div>

        {/* Mission Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow border-navy-200">
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-to-br from-navy-100 to-navy-50 rounded-xl flex items-center justify-center mb-4 group-hover:from-navy-200 group-hover:to-navy-100 transition-colors">
                  <pillar.icon className="h-7 w-7 text-navy-800" />
                </div>
                <CardTitle className="text-xl">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-navy-600 leading-relaxed">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Values */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-navy-800 mb-2">100%</div>
            <div className="text-navy-600 font-medium">Transparency</div>
            <p className="text-sm text-navy-500 mt-2">All operations and financials are publicly accessible</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-navy-800 mb-2">0%</div>
            <div className="text-navy-600 font-medium">Profit Motive</div>
            <p className="text-sm text-navy-500 mt-2">Non-profit organization focused solely on ecosystem growth</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-navy-800 mb-2">∞</div>
            <div className="text-navy-600 font-medium">Commitment</div>
            <p className="text-sm text-navy-500 mt-2">Long-term dedication to the BesaChain vision</p>
          </div>
        </div>
      </div>
    </section>
  )
}
