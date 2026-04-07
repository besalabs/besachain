"use client"

import { FileText, Download, ExternalLink, BookOpen, Microscope, GraduationCap, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const whitepapers = [
  {
    title: "BesaChain: A Post-Quantum Secure Blockchain",
    authors: "Dr. Sarah Chen, Prof. Michael Roberts",
    date: "March 2024",
    category: "Protocol",
    downloads: 12500
  },
  {
    title: "Lattice-Based Signatures for Blockchain Applications",
    authors: "Dr. James Wilson, Dr. Anna Kowalski",
    date: "January 2024",
    category: "Cryptography",
    downloads: 8900
  },
  {
    title: "Sustainable Consensus: Energy-Efficient Proof of Stake",
    authors: "Prof. David Kim, Dr. Lisa Zhang",
    date: "November 2023",
    category: "Consensus",
    downloads: 15200
  }
]

const publications = [
  {
    title: "Quantum Threats to Modern Cryptography",
    journal: "Journal of Cryptographic Research",
    date: "2024",
    type: "Peer-Reviewed"
  },
  {
    title: "Decentralized Governance Models in Practice",
    journal: "Blockchain Governance Review",
    date: "2024",
    type: "Research Paper"
  },
  {
    title: "Cross-Chain Communication Security",
    journal: "IEEE Blockchain Conference",
    date: "2023",
    type: "Conference Paper"
  }
]

const partners = [
  { name: "MIT Digital Currency Initiative", type: "Academic" },
  { name: "Stanford Blockchain Lab", type: "Academic" },
  { name: "Oxford Internet Institute", type: "Academic" },
  { name: "NIST Post-Quantum Cryptography Team", type: "Research" },
  { name: "Ethereum Foundation Research", type: "Industry" },
  { name: "Linux Foundation", type: "Industry" }
]

const researchAreas = [
  {
    icon: Microscope,
    title: "Post-Quantum Cryptography",
    description: "Developing and implementing quantum-resistant cryptographic primitives for long-term security"
  },
  {
    icon: BookOpen,
    title: "Protocol Design",
    description: "Researching next-generation blockchain protocols for scalability, security, and decentralization"
  },
  {
    icon: Users,
    title: "Governance Models",
    description: "Studying effective decentralized governance mechanisms and voting systems"
  },
  {
    icon: GraduationCap,
    title: "Education & Outreach",
    description: "Creating educational resources and training programs for developers and researchers"
  }
]

export function ResearchSection() {
  return (
    <section id="research" className="py-20 lg:py-32 bg-navy-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
            Research
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            Advancing the frontier of blockchain technology through rigorous research, 
            academic partnerships, and open publication of our findings.
          </p>
        </div>

        {/* Research Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {researchAreas.map((area, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="w-14 h-14 bg-navy-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <area.icon className="h-7 w-7 text-navy-800" />
                </div>
                <CardTitle className="text-lg">{area.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-navy-600">{area.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Whitepapers */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-navy-900 mb-8">Whitepapers</h3>
          <div className="grid grid-cols-1 gap-4">
            {whitepapers.map((paper, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">{paper.category}</Badge>
                        <span className="text-sm text-navy-500">{paper.date}</span>
                      </div>
                      <h4 className="font-semibold text-navy-900 text-lg mb-1">{paper.title}</h4>
                      <p className="text-sm text-navy-600">{paper.authors}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-navy-500">
                        <Download className="h-4 w-4 inline mr-1" />
                        {paper.downloads.toLocaleString()} downloads
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Publications & Partners Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Publications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Publications</CardTitle>
              <CardDescription>Academic and industry publications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {publications.map((pub, index) => (
                  <div key={index} className="flex items-start justify-between p-4 bg-navy-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-navy-900">{pub.title}</h4>
                      <p className="text-sm text-navy-600">{pub.journal}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">{pub.type}</Badge>
                      <p className="text-xs text-navy-500 mt-1">{pub.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Research Partners */}
          <Card>
            <CardHeader>
              <CardTitle>Research Partners</CardTitle>
              <CardDescription>Academic and industry collaborators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partners.map((partner, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-navy-100 rounded-lg hover:bg-navy-50 transition-colors">
                    <span className="font-medium text-navy-900">{partner.name}</span>
                    <Badge variant="secondary" className="text-xs">{partner.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-navy-800 to-navy-900 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Join Our Research Program</h3>
              <p className="text-navy-100 mb-6 max-w-2xl mx-auto">
                We're always looking for researchers, academics, and institutions to collaborate with. 
                If you're working on post-quantum cryptography, blockchain protocols, or decentralized systems, 
                we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Apply for Research Grant
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  View Research Portal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
