'use client'

import { cn } from '@/lib/utils'

interface TokenIconProps {
  symbol: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-lg',
}

const tokenColors: Record<string, string> = {
  BESA: 'from-purple-500 to-pink-500',
  WBTC: 'from-orange-500 to-yellow-500',
  WETH: 'from-blue-500 to-indigo-500',
  USDT: 'from-green-500 to-emerald-500',
  USDC: 'from-blue-400 to-blue-600',
  WBNB: 'from-yellow-400 to-yellow-600',
}

export function TokenIcon({ symbol, size = 'md', className }: TokenIconProps) {
  const gradient = tokenColors[symbol] || 'from-gray-500 to-gray-600'

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white',
        sizeClasses[size],
        gradient,
        className
      )}
    >
      {symbol.charAt(0)}
    </div>
  )
}
