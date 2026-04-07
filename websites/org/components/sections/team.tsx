"use client"

import { Linkedin, Twitter, Github, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const coreTeam = [
  {
    name: "Dr. Sarah Chen",
    role: "Executive Director",
    bio: "Former MIT researcher with 15+ years in cryptography and distributed systems",
    image: "SC"
  },
  {
    name: "Michael Roberts",
    role: "Head of Research",
    bio: "PhD in Computer Science, previously led blockchain research at Stanford",
    image: "MR"
  },
  {
    name: "Elena Vasquez",
    role: "Grants Program Lead",
    bio: "10 years in non-profit management and ecosystem development",
    image: "EV"
  },
  {
    name: "David Kim",
    role: "Technical Director",
    bio: "Core contributor to multiple blockchain protocols, expert in consensus mechanisms",
    image: "DK"
  }
]

const advisors = [
  {
    name: "Prof. James Wilson",
    role: "Cryptography Advisor",
    affiliation: "Oxford University",
    image: "JW"
  },
  {
    name: "Dr. Anna Kowalski",
    role: "Quantum Computing Advisor",
    affiliation: "IBM Research",
    image: "AK"
  },
  {
    name: "Robert Chang",
    role: "Strategy Advisor",
    affiliation: "Former Ethereum Foundation",
    image: "RC"
  },
  {
    name: "Dr. Maria Santos",
    role: "Governance Advisor",
    affiliation: "Harvard Kennedy School",
    image: "MS"
  }
]

export function TeamSection() {
  return (
    <section id="team" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
            Our Team
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            A dedicated team of researchers, developers, and community builders 
            working to advance the BesaChain ecosystem.
          </p>
        </div>

        {/* Core Team */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-navy-900 text-center mb-8">Core Contributors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreTeam.map((member, index) => (
              <Card key={index} className="group">
                <CardContent className="p-6 text-center">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-gradient-to-br from-navy-700 to-navy-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-navy-600 group-hover:to-navy-800 transition-colors">
                    <span className="text-2xl font-bold text-white">{member.image}</span>
                  </div>
                  
                  {/* Info */}
                  <h4 className="font-semibold text-navy-900 text-lg">{member.name}</h4>
                  <p className="text-cyan-500 font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-sm text-navy-600 mb-4">{member.bio}</p>
                  
                  {/* Social Links */}
                  <div className="flex justify-center space-x-3">
                    <a href="#" className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center text-navy-600 hover:bg-navy-200 transition-colors">
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a href="#" className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center text-navy-600 hover:bg-navy-200 transition-colors">
                      <Twitter className="h-4 w-4" />
                    </a>
                    <a href="#" className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center text-navy-600 hover:bg-navy-200 transition-colors">
                      <Github className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Advisors */}
        <div>
          <h3 className="text-2xl font-bold text-navy-900 text-center mb-8">Advisory Board</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advisors.map((advisor, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-br from-navy-200 to-navy-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-navy-800">{advisor.image}</span>
                  </div>
                  
                  {/* Info */}
                  <h4 className="font-semibold text-navy-900">{advisor.name}</h4>
                  <p className="text-cyan-600 font-medium text-sm">{advisor.role}</p>
                  <p className="text-xs text-navy-500 mt-1">{advisor.affiliation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Join Us CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-navy-50 border-navy-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-navy-900 mb-4">Join Our Team</h3>
              <p className="text-navy-600 mb-6 max-w-2xl mx-auto">
                We're always looking for talented individuals who are passionate about 
                blockchain technology, cryptography, and decentralized systems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="#contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-navy-800 text-white rounded-lg font-medium hover:bg-navy-900 transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Us
                </a>
                <a 
                  href="#" 
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-navy-800 text-navy-800 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                >
                  View Open Positions
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
