'use client'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, Activity, DollarSign, Users, BarChart3 } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
}

const stats = [
  {
    title: 'Total Value Locked',
    value: formatCurrency(45600000),
    change: 12.5,
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    title: 'Volume 24H',
    value: formatCurrency(8900000),
    change: -5.2,
    icon: <Activity className="w-5 h-5" />,
  },
  {
    title: 'Active Users',
    value: formatNumber(15234),
    change: 8.7,
    icon: <Users className="w-5 h-5" />,
  },
  {
    title: 'Total Transactions',
    value: formatNumber(456789),
    change: 15.3,
    icon: <BarChart3 className="w-5 h-5" />,
  },
]

function StatCard({ title, value, change, icon }: StatCardProps) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/60">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
              <span className="text-xs text-white/40 ml-1">vs 24h</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-white/60">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
