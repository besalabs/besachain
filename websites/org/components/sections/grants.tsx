"use client"

import { CheckCircle, FileText, Users, Rocket, Lightbulb, Code, Globe, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const grantCategories = [
  {
    icon: Code,
    title: "Infrastructure",
    description: "Core protocol development, tooling, and infrastructure improvements",
    amount: "$50K - $500K",
    color: "bg-blue-100 text-blue-800"
  },
  {
    icon: Lightbulb,
    title: "Research",
    description: "Academic research, whitepapers, and technical publications",
    amount: "$25K - $150K",
    color: "bg-purple-100 text-purple-800"
  },
  {
    icon: Globe,
    title: "Ecosystem",
    description: "dApps, integrations, and ecosystem expansion projects",
    amount: "$10K - $100K",
    color: "bg-green-100 text-green-800"
  },
  {
    icon: Users,
    title: "Community",
    description: "Education, events, and community-building initiatives",
    amount: "$5K - $50K",
    color: "bg-amber-100 text-amber-800"
  }
]

const fundedProjects = [
  {
    name: "BesaWallet",
    category: "Infrastructure",
    amount: "$250,000",
    description: "Open-source wallet with post-quantum security features",
    status: "In Progress"
  },
  {
    name: "QuantumResearch Lab",
    category: "Research",
    amount: "$120,000",
    description: "Academic partnership for lattice-based cryptography research",
    status: "Active"
  },
  {
    name: "DeFi Bridge Protocol",
    category: "Ecosystem",
    amount: "$85,000",
    description: "Cross-chain bridge with quantum-resistant signatures",
    status: "Completed"
  },
  {
    name: "Global Education Initiative",
    category: "Community",
    amount: "$45,000",
    description: "Worldwide workshops and developer bootcamps",
    status: "Active"
  }
]

const applicationSteps = [
  {
    icon: FileText,
    title: "Submit Proposal",
    description: "Complete the online application with project details, timeline, and budget"
  },
  {
    icon: Users,
    title: "Review Process",
    description: "Our grants committee reviews proposals within 2-4 weeks"
  },
  {
    icon: CheckCircle,
    title: "Approval & Funding",
    description: "Approved projects receive milestone-based funding"
  },
  {
    icon: Rocket,
    title: "Build & Deliver",
    description: "Work with our team to bring your project to life"
  }
]

const criteria = [
  "Alignment with BesaChain ecosystem goals",
  "Technical feasibility and innovation",
  "Team experience and capability",
  "Clear roadmap and milestones",
  "Open-source commitment",
  "Community impact potential"
]

export function GrantsSection() {
  return (
    <section id="grants" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
            Grants Program
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed mb-8">
            We fund innovative projects that advance the BesaChain ecosystem. 
            From infrastructure to research, community to dApps—if you're building 
            the future, we want to support you.
          </p>
          <Button size="lg" asChild>
            <a href="#contact">
              Apply for a Grant
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Grant Categories */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-navy-900 text-center mb-8">Grant Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {grantCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-semibold text-navy-800">{category.amount}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Application Process */}
        <div className="bg-navy-50 rounded-2xl p-8 lg:p-12 mb-16">
          <h3 className="text-2xl font-bold text-navy-900 text-center mb-8">Application Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {applicationSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-navy-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-navy-900 mb-2">{step.title}</h4>
                <p className="text-sm text-navy-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Criteria & Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Evaluation Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Criteria</CardTitle>
              <CardDescription>What we look for in grant applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {criteria.map((criterion, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-navy-700">{criterion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Program Impact</CardTitle>
              <CardDescription>Our grants program by the numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-navy-50 rounded-lg">
                  <div className="text-3xl font-bold text-navy-800">$5M+</div>
                  <div className="text-sm text-navy-600">Total Funded</div>
                </div>
                <div className="text-center p-4 bg-navy-50 rounded-lg">
                  <div className="text-3xl font-bold text-navy-800">78</div>
                  <div className="text-sm text-navy-600">Projects Funded</div>
                </div>
                <div className="text-center p-4 bg-navy-50 rounded-lg">
                  <div className="text-3xl font-bold text-navy-800">35+</div>
                  <div className="text-sm text-navy-600">Countries</div>
                </div>
                <div className="text-center p-4 bg-navy-50 rounded-lg">
                  <div className="text-3xl font-bold text-navy-800">92%</div>
                  <div className="text-sm text-navy-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funded Projects */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-navy-900 text-center mb-8">Recently Funded Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fundedProjects.map((project, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-navy-900">{project.name}</h4>
                      <Badge variant="secondary" className="mt-1">{project.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-navy-800">{project.amount}</div>
                      <Badge variant={project.status === "Completed" ? "success" : "default"} className="mt-1">
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-navy-600">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
