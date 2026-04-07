'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TokenIcon } from '@/components/common/TokenIcon'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TokenPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
}

const tokenPrices: TokenPrice[] = [
  { symbol: 'BESA', name: 'Besa Token', price: 1.52, change24h: 5.2, volume24h: 2500000, marketCap: 152000000 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', price: 67234.12, change24h: -2.1, volume24h: 8900000, marketCap: 1320000000000 },
  { symbol: 'WETH', name: 'Wrapped Ethereum', price: 3456.78, change24h: 1.8, volume24h: 12000000, marketCap: 415000000000 },
  { symbol: 'USDT', name: 'Tether USD', price: 1.0, change24h: 0.01, volume24h: 45000000, marketCap: 95000000000 },
  { symbol: 'USDC', name: 'USD Coin', price: 1.0, change24h: -0.02, volume24h: 38000000, marketCap: 32000000000 },
]

export function TokenPrices() {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Token Prices</h3>

        <div className="space-y-3">
          {tokenPrices.map((token) => {
            const isPositive = token.change24h >= 0

            return (
              <div
                key={token.symbol}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <TokenIcon symbol={token.symbol} size="md" />
                  <div>
                    <p className="font-medium text-white">{token.symbol}</p>
                    <p className="text-xs text-white/60">{token.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-white">
                    {token.price < 10
                      ? `$${token.price.toFixed(4)}`
                      : formatCurrency(token.price)}
                  </p>
                  <div className={`flex items-center justify-end gap-1 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{formatPercent(token.change24h)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
