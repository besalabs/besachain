"use client"

import { ArrowRight, Shield, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-50 via-white to-navy-100 py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #1e3a5f 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-navy-800/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-navy-100 text-navy-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Shield className="h-4 w-4" />
            <span>Non-Profit Organization</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 tracking-tight mb-6">
            Building the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-800 to-cyan-500">
              Unbreakable Future
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-navy-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Besa Foundation supports the BesaChain ecosystem through governance, grants, 
            research, and community building—powering a post-quantum secure blockchain infrastructure.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="w-full sm:w-auto group" asChild>
              <a href="#grants">
                Apply for Grants
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <a href="#mission">Learn More</a>
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-navy-200 shadow-sm">
              <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-navy-800" />
              </div>
              <h3 className="font-semibold text-navy-900 mb-2">Post-Quantum Security</h3>
              <p className="text-sm text-navy-600">Advanced cryptographic protection for the quantum era</p>
            </div>
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-navy-200 shadow-sm">
              <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-navy-800" />
              </div>
              <h3 className="font-semibold text-navy-900 mb-2">Open Infrastructure</h3>
              <p className="text-sm text-navy-600">Decentralized, transparent, and community-governed</p>
            </div>
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl border border-navy-200 shadow-sm">
              <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-navy-800" />
              </div>
              <h3 className="font-semibold text-navy-900 mb-2">Global Access</h3>
              <p className="text-sm text-navy-600">Borderless financial infrastructure for everyone</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
