"use client"

import { Wallet, TrendingUp, PieChart, ArrowUpRight, FileText, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const treasuryData = {
  total: "$12,450,000",
  breakdown: [
    { category: "BESA Tokens", amount: "$8,200,000", percentage: 66, color: "bg-navy-800" },
    { category: "Stablecoins", amount: "$2,100,000", percentage: 17, color: "bg-cyan-400" },
    { category: "ETH/BTC", amount: "$1,400,000", percentage: 11, color: "bg-navy-600" },
    { category: "Other Assets", amount: "$750,000", percentage: 6, color: "bg-navy-400" }
  ]
}

const budgetAllocation = [
  { category: "Grants Program", percentage: 45, amount: "$5.6M", color: "bg-navy-800" },
  { category: "Research & Development", percentage: 25, amount: "$3.1M", color: "bg-navy-600" },
  { category: "Operations", percentage: 15, amount: "$1.9M", color: "bg-navy-500" },
  { category: "Community & Events", percentage: 10, amount: "$1.2M", color: "bg-navy-400" },
  { category: "Reserve", percentage: 5, amount: "$0.6M", color: "bg-navy-300" }
]

const recentTransactions = [
  { type: "Grant", project: "BesaWallet Development", amount: "-$250,000", date: "2024-11-15", status: "Completed" },
  { type: "Income", project: "Validator Rewards", amount: "+$45,000", date: "2024-11-10", status: "Received" },
  { type: "Grant", project: "Research Partnership - MIT", amount: "-$120,000", date: "2024-11-05", status: "Ongoing" },
  { type: "Income", project: "Token Appreciation", amount: "+$320,000", date: "2024-11-01", status: "Unrealized" },
  { type: "Operations", project: "Q4 Operating Expenses", amount: "-$85,000", date: "2024-10-30", status: "Completed" }
]

const reports = [
  { quarter: "Q3 2024", type: "Financial Report", date: "October 2024" },
  { quarter: "Q2 2024", type: "Financial Report", date: "July 2024" },
  { quarter: "Q1 2024", type: "Annual Report", date: "April 2024" },
  { quarter: "FY 2023", type: "Annual Report", date: "January 2024" }
]

export function FinancialsSection() {
  return (
    <section id="financials" className="py-20 lg:py-32 bg-navy-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
            Financial Transparency
          </h2>
          <p className="text-lg text-navy-600 leading-relaxed">
            As a non-profit organization, we are committed to complete financial transparency. 
            All transactions, budgets, and treasury holdings are publicly accessible.
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <Wallet className="h-8 w-8 text-navy-800 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy-900">{treasuryData.total}</div>
              <div className="text-sm text-navy-600">Treasury Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-navy-800 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy-900">+24%</div>
              <div className="text-sm text-navy-600">YTD Growth</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <PieChart className="h-8 w-8 text-navy-800 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy-900">$5.6M</div>
              <div className="text-sm text-navy-600">Grants Deployed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-navy-800 mx-auto mb-2" />
              <div className="text-2xl font-bold text-navy-900">100%</div>
              <div className="text-sm text-navy-600">Audited</div>
            </CardContent>
          </Card>
        </div>

        {/* Treasury & Budget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Treasury Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Treasury Composition</CardTitle>
              <CardDescription>Current asset allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {treasuryData.breakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-navy-900">{item.category}</span>
                      <span className="text-navy-600">{item.amount} ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} max={100} color={item.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Allocation */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Budget Allocation</CardTitle>
              <CardDescription>How funds are deployed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetAllocation.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-navy-900">{item.category}</span>
                      <span className="text-navy-600">{item.amount} ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} max={100} color={item.color} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-navy-900 mb-8">Recent Transactions</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-50">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-navy-900">Type</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-navy-900">Project</th>
                      <th className="text-right px-6 py-4 text-sm font-semibold text-navy-900">Amount</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-navy-900">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-navy-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {recentTransactions.map((tx, index) => (
                      <tr key={index} className="hover:bg-navy-50/50">
                        <td className="px-6 py-4">
                          <Badge variant={tx.type === "Income" ? "success" : tx.type === "Grant" ? "default" : "secondary"}>
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-navy-900">{tx.project}</td>
                        <td className={`px-6 py-4 text-right font-medium ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount}
                        </td>
                        <td className="px-6 py-4 text-navy-600">{tx.date}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-navy-600">{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Reports */}
        <div>
          <h3 className="text-2xl font-bold text-navy-900 mb-8">Financial Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reports.map((report, index) => (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center group-hover:bg-navy-200 transition-colors">
                      <FileText className="h-6 w-6 text-navy-800" />
                    </div>
                    <Button variant="ghost" size="sm" className="text-navy-600">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <h4 className="font-semibold text-navy-900">{report.quarter}</h4>
                  <p className="text-sm text-navy-600">{report.type}</p>
                  <p className="text-xs text-navy-400 mt-1">{report.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* View All Link */}
        <div className="mt-8 text-center">
          <a 
            href="#" 
            className="inline-flex items-center text-navy-800 hover:text-navy-600 font-medium"
          >
            View All Transactions on Blockchain
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
