'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const data = [
  { time: '00:00', volume: 420000, tvl: 42000000 },
  { time: '04:00', volume: 380000, tvl: 42500000 },
  { time: '08:00', volume: 650000, tvl: 43000000 },
  { time: '12:00', volume: 890000, tvl: 44000000 },
  { time: '16:00', volume: 720000, tvl: 44500000 },
  { time: '20:00', volume: 540000, tvl: 45000000 },
  { time: '23:59', volume: 460000, tvl: 45600000 },
]

export function VolumeChart() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Volume & TVL</h3>
            <p className="text-sm text-white/60">Last 24 hours</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg bg-purple-500 text-white text-sm font-medium">
              24H
            </button>
            <button className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-sm font-medium hover:bg-white/20">
              7D
            </button>
            <button className="px-3 py-1 rounded-lg bg-white/10 text-white/60 text-sm font-medium hover:bg-white/20">
              30D
            </button>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.1)"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="rgba(255,255,255,0.1)"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="rgba(255,255,255,0.1)"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3">
                        <p className="text-white/60 text-sm mb-2">{label}</p>
                        <p className="text-purple-400 font-medium">
                          Volume: ${(payload[0].value as number).toLocaleString()}
                        </p>
                        <p className="text-green-400 font-medium">
                          TVL: ${(payload[1].value as number).toLocaleString()}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="volume"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#volumeGradient)"
                name="Volume"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="tvl"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#tvlGradient)"
                name="TVL"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
