"use client"

import { Shield, Twitter, Github, Linkedin, MessageSquare, ExternalLink } from "lucide-react"

const footerLinks = {
  foundation: [
    { label: "About Us", href: "#mission" },
    { label: "Team", href: "#team" },
    { label: "Financials", href: "#financials" },
    { label: "Contact", href: "#contact" }
  ],
  ecosystem: [
    { label: "BesaChain", href: "https://besachain.com" },
    { label: "Besa DEX", href: "https://dex.besachain.com" },
    { label: "Documentation", href: "https://docs.besachain.com" },
    { label: "Explorer", href: "https://explorer.besachain.com" }
  ],
  resources: [
    { label: "Whitepapers", href: "#research" },
    { label: "Grants", href: "#grants" },
    { label: "Governance", href: "#governance" },
    { label: "News", href: "#news" }
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Disclaimers", href: "#" }
  ]
}

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/besafoundation" },
  { icon: Github, label: "GitHub", href: "https://github.com/besachain" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/besafoundation" },
  { icon: MessageSquare, label: "Discord", href: "https://discord.gg/besachain" }
]

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-navy-900" />
                </div>
                <span className="text-xl font-bold">Besa Foundation</span>
              </div>
              <p className="text-navy-300 text-sm leading-relaxed mb-6 max-w-sm">
                A non-profit organization supporting the BesaChain ecosystem through 
                governance, grants, research, and community building.
              </p>
              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((link, index) => (
                  <a 
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center text-navy-300 hover:bg-navy-700 hover:text-white transition-colors"
                    aria-label={link.label}
                  >
                    <link.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Foundation</h4>
                <ul className="space-y-2">
                  {footerLinks.foundation.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-navy-300 hover:text-white text-sm transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Ecosystem</h4>
                <ul className="space-y-2">
                  {footerLinks.ecosystem.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-navy-300 hover:text-white text-sm transition-colors inline-flex items-center"
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  {footerLinks.resources.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-navy-300 hover:text-white text-sm transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-navy-300 hover:text-white text-sm transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-navy-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-navy-400">
              © {new Date().getFullYear()} Besa Foundation. All rights reserved.
            </div>
            <div className="text-sm text-navy-400">
              Registered non-profit organization | EIN: XX-XXXXXXX
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
