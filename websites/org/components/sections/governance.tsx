"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Vote, FileText, Users, Scale } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const tokenomicsData = [
  { name: "Validator Rewards", value: 10, color: "#1e3a5f", amount: "100M BESA" },
  { name: "Ecosystem Grants", value: 15, color: "#00d4ff", amount: "150M BESA" },
  { name: "Liquidity", value: 20, color: "#334e68", amount: "200M BESA" },
  { name: "Foundation", value: 15, color: "#486581", amount: "150M BESA" },
  { name: "Founder", value: 15, color: "#627d98", amount: "150M BESA" },
  { name: "Treasury", value: 10, color: "#829ab1", amount: "100M BESA" },
  { name: "Community", value: 5, color: "#9fb3c8", amount: "50M BESA" },
  { name: "Genesis", value: 10, color: "#bcccdc", amount: "100M BESA" },
]

const proposals = [
  {
    id: "BFP-001",
    title: "Increase Validator Set Size",
    status: "active",
    votes: { for: 68, against: 12, abstain: 5 },
    endDate: "2024-12-31"
  },
  {
    id: "BFP-002",
    title: "Ecosystem Grant Budget Allocation Q1 2025",
    status: "passed",
    votes: { for: 89, against: 3, abstain: 8 },
    endDate: "2024-11-15"
  },
  {
    id: "BFP-003",
    title: "Protocol Upgrade: Quantum Resistance v2",
    status: "passed",
    votes: { for: 94, against: 1, abstain: 5 },
    endDate: "2024-10-30"
  }
]

const votingProcess = [
  {
    step: 1,
    title: "Proposal Submission",
    description: "Any BESA holder with 10,000+ tokens can submit a proposal"
  },
  {
    step: 2,
    title: "Discussion Period",
    description: "7-day community discussion and feedback period"
  },
  {
    step: 3,
    title: "Voting Period",
    description: "5-day voting window with token-weighted votes"
  },
  {
    step: 4,
    title: "Implementation",
    description: "Passed proposals are executed by the Foundation"
  }
]

export function GovernanceSection() {
  return (
    <section id="governance" className="py-20 lg:py-32 bg-navy-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
            Governance
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            The Besa Foundation is governed by the BESA token holders. Through decentralized 
            governance, our community shapes the future of the ecosystem.
          </p>
        </div>

        <Tabs defaultValue="tokenomics" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="process">Process</TabsTrigger>
          </TabsList>

          {/* Tokenomics Tab */}
          <TabsContent value="tokenomics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>BESA Token Distribution</CardTitle>
                  <CardDescription>Total Supply: 1,000,000,000 BESA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tokenomicsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {tokenomicsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, "Allocation"]}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #d9e2ec' }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          iconType="circle"
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Allocation Details</CardTitle>
                  <CardDescription>Breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tokenomicsData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-navy-900">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-navy-900">{item.value}%</div>
                          <div className="text-xs text-navy-500">{item.amount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            <div className="grid grid-cols-1 gap-6 mt-8 max-w-4xl mx-auto">
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={proposal.status === "active" ? "default" : "success"}>
                            {proposal.status === "active" ? "Active" : "Passed"}
                          </Badge>
                          <span className="text-sm text-navy-500">{proposal.id}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-navy-900">{proposal.title}</h3>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{proposal.votes.for}%</div>
                          <div className="text-navy-500">For</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-600">{proposal.votes.against}%</div>
                          <div className="text-navy-500">Against</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-navy-600">{proposal.votes.abstain}%</div>
                          <div className="text-navy-500">Abstain</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Process Tab */}
          <TabsContent value="process">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {votingProcess.map((step, index) => (
                <Card key={index} className="relative">
                  {index < votingProcess.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-navy-200" />
                  )}
                  <CardHeader>
                    <div className="w-10 h-10 bg-navy-800 text-white rounded-full flex items-center justify-center font-bold mb-4">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-navy-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Governance Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-navy-800 mx-auto mb-2" />
              <div className="text-3xl font-bold text-navy-900">12,450+</div>
              <div className="text-sm text-navy-600">Token Holders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-navy-800 mx-auto mb-2" />
              <div className="text-3xl font-bold text-navy-900">47</div>
              <div className="text-sm text-navy-600">Proposals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Vote className="h-8 w-8 text-navy-800 mx-auto mb-2" />
              <div className="text-3xl font-bold text-navy-900">89%</div>
              <div className="text-sm text-navy-600">Participation</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Scale className="h-8 w-8 text-navy-800 mx-auto mb-2" />
              <div className="text-3xl font-bold text-navy-900">100%</div>
              <div className="text-sm text-navy-600">Transparent</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
