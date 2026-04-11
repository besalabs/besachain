'use client'

import { useEffect, useState } from 'react'
import { Activity, Zap, Globe } from 'lucide-react'

interface ChainStats {
  blockNumber: number
  gasPrice: string
  chainId: number
}

export function NetworkStatus() {
  const [stats, setStats] = useState<ChainStats | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try production first, fallback to direct IP
        const rpcUrl = 'https://rpc.besachain.com'
        
        const [blockResponse, gasResponse, chainResponse] = await Promise.all([
          fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] })
          }),
          fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] })
          }),
          fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] })
          })
        ])

        const [blockData, gasData, chainData] = await Promise.all([
          blockResponse.json(),
          gasResponse.json(),
          chainResponse.json()
        ])

        if (chainData.result && parseInt(chainData.result, 16) === 1444) {
          setStats({
            blockNumber: parseInt(blockData.result, 16),
            gasPrice: (parseInt(gasData.result, 16) / 1e9).toFixed(2),
            chainId: 1444
          })
          setIsLive(true)
        }
      } catch (error) {
        // Silent fail - banner will show offline
        setIsLive(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!isLive) {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-amber-400">
            Connecting to BesaChain L1 (Chain 1444)...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-emerald-500/5 border-b border-emerald-500/10 px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-medium">LIVE</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Globe className="w-3 h-3" />
          <span className="font-mono">Chain 1444</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Activity className="w-3 h-3" />
          <span className="font-mono">Block #{stats?.blockNumber.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Zap className="w-3 h-3" />
          <span className="font-mono">{stats?.gasPrice} Gwei</span>
        </div>
        
        <div className="hidden sm:block text-gray-600">
          450ms finality • 10,500+ TPS
        </div>
      </div>
    </div>
  )
}
