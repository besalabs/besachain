"use client"

import { Calendar, ArrowRight, Newspaper, Megaphone, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const featuredNews = {
  title: "BesaChain Mainnet Launch: A New Era of Post-Quantum Security",
  excerpt: "Today marks a historic milestone as BesaChain officially launches its mainnet, bringing post-quantum cryptographic security to blockchain infrastructure. The launch represents years of research and development...",
  date: "December 1, 2024",
  category: "Major Announcement",
  readTime: "5 min read"
}

const newsItems = [
  {
    title: "$2M Grant Program for Quantum-Resistant dApps",
    excerpt: "New funding initiative to support developers building quantum-resistant decentralized applications on BesaChain.",
    date: "November 28, 2024",
    category: "Grants",
    readTime: "3 min read"
  },
  {
    title: "Partnership Announcement: Stanford Blockchain Lab",
    excerpt: "Besa Foundation partners with Stanford Blockchain Lab to advance post-quantum cryptography research.",
    date: "November 20, 2024",
    category: "Partnership",
    readTime: "4 min read"
  },
  {
    title: "Q3 2024 Financial Report Published",
    excerpt: "Complete transparency report showing treasury status, grant distributions, and operational expenses.",
    date: "November 15, 2024",
    category: "Financial",
    readTime: "6 min read"
  },
  {
    title: "BesaWallet Reaches 100,000 Downloads",
    excerpt: "Our official wallet application hits major milestone with growing adoption across 45 countries.",
    date: "November 10, 2024",
    category: "Ecosystem",
    readTime: "2 min read"
  }
]

const pressReleases = [
  {
    title: "Besa Foundation Announces Board Expansion",
    date: "October 2024",
    type: "Press Release"
  },
  {
    title: "Research Grant Awarded to Oxford University Team",
    date: "September 2024",
    type: "Press Release"
  },
  {
    title: "BesaChain Testnet Processes 10M Transactions",
    date: "August 2024",
    type: "Press Release"
  }
]

export function NewsSection() {
  return (
    <section id="news" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
            Latest Updates
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            Stay informed about the latest developments, announcements, and milestones 
            from the Besa Foundation and the broader BesaChain ecosystem.
          </p>
        </div>

        {/* Featured News */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="bg-gradient-to-br from-navy-800 to-navy-900 p-8 lg:p-12 flex items-center">
                <div className="text-white">
                  <Badge className="bg-cyan-400 text-navy-900 mb-4">Featured</Badge>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4">{featuredNews.title}</h3>
                  <p className="text-navy-100 mb-6">{featuredNews.excerpt}</p>
                  <div className="flex items-center space-x-4 text-sm text-navy-200">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {featuredNews.date}
                    </span>
                    <span>{featuredNews.readTime}</span>
                  </div>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="space-y-4">
                  <h4 className="font-semibold text-navy-900">Key Highlights</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                      <span className="text-navy-700">First production-grade post-quantum blockchain</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                      <span className="text-navy-700">100+ validator nodes at launch</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                      <span className="text-navy-700">Support for EVM-compatible smart contracts</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2" />
                      <span className="text-navy-700">Energy-efficient consensus mechanism</span>
                    </li>
                  </ul>
                  <Button className="mt-4">
                    Read Full Announcement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {newsItems.map((item, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{item.category}</Badge>
                  <span className="text-xs text-navy-500">{item.readTime}</span>
                </div>
                <CardTitle className="text-lg group-hover:text-navy-700 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription>{item.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {item.date}
                  </span>
                  <Button variant="ghost" size="sm" className="text-navy-700">
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Press Releases & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Press Releases */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Megaphone className="h-5 w-5 text-navy-800" />
                <CardTitle>Press Releases</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pressReleases.map((release, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors cursor-pointer">
                    <div>
                      <h4 className="font-medium text-navy-900 text-sm">{release.title}</h4>
                      <p className="text-xs text-navy-500">{release.date}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{release.type}</Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Press Releases
              </Button>
            </CardContent>
          </Card>

          {/* Newsletter Signup */}
          <Card className="bg-gradient-to-br from-navy-800 to-navy-900 text-white">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Newspaper className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-white">Stay Updated</CardTitle>
              </div>
              <CardDescription className="text-navy-200">
                Subscribe to our newsletter for the latest news and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-navy-600 text-white placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <Button className="w-full bg-cyan-400 text-navy-900 hover:bg-cyan-500">
                  Subscribe to Newsletter
                </Button>
              </form>
              <p className="text-xs text-navy-300 mt-4">
                By subscribing, you agree to receive updates from Besa Foundation. 
                Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
