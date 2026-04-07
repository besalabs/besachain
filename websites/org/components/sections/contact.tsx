"use client"

import { Mail, MapPin, Phone, Twitter, Github, Linkedin, MessageSquare, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const contactMethods = [
  {
    icon: Mail,
    title: "General Inquiries",
    value: "info@besafoundation.org",
    description: "For general questions and information"
  },
  {
    icon: Send,
    title: "Grants",
    value: "grants@besafoundation.org",
    description: "For grant applications and questions"
  },
  {
    icon: MessageSquare,
    title: "Research",
    value: "research@besafoundation.org",
    description: "For research collaborations and publications"
  },
  {
    icon: Phone,
    title: "Media",
    value: "media@besafoundation.org",
    description: "For press and media inquiries"
  }
]

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com/besafoundation" },
  { icon: Github, label: "GitHub", href: "https://github.com/besachain" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/besafoundation" },
  { icon: MessageSquare, label: "Discord", href: "https://discord.gg/besachain" }
]

const offices = [
  {
    city: "Zurich",
    country: "Switzerland",
    address: "Bahnhofstrasse 42, 8001 Zürich",
    type: "Headquarters"
  },
  {
    city: "San Francisco",
    country: "USA",
    address: "555 Montgomery St, Suite 700",
    type: "Office"
  },
  {
    city: "Singapore",
    country: "Singapore",
    address: "1 Raffles Place, Tower 2",
    type: "Office"
  }
]

export function ContactSection() {
  return (
    <section id="contact" className="py-20 lg:py-32 bg-navy-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
            Get in Touch
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            Whether you're interested in grants, research partnerships, or just want to learn more 
            about the Besa Foundation, we'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Subject</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-navy-800 bg-white">
                    <option>General Inquiry</option>
                    <option>Grant Application</option>
                    <option>Research Collaboration</option>
                    <option>Media Inquiry</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-navy-200 focus:outline-none focus:ring-2 focus:ring-navy-800 resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button className="w-full" size="lg">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-navy-50 rounded-lg">
                      <div className="w-10 h-10 bg-navy-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <method.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-navy-900">{method.title}</h4>
                        <a href={`mailto:${method.value}`} className="text-cyan-600 hover:text-cyan-700">
                          {method.value}
                        </a>
                        <p className="text-sm text-navy-500">{method.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-navy-100 rounded-lg text-navy-800 hover:bg-navy-200 transition-colors"
                    >
                      <link.icon className="h-4 w-4" />
                      <span className="font-medium">{link.label}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Offices */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-navy-900 text-center mb-8">Our Offices</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offices.map((office, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-6 w-6 text-navy-800" />
                  </div>
                  <Badge variant="secondary" className="mb-2">{office.type}</Badge>
                  <h4 className="font-semibold text-navy-900">{office.city}</h4>
                  <p className="text-navy-600">{office.country}</p>
                  <p className="text-sm text-navy-500 mt-2">{office.address}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
