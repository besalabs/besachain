'use client';

import { useState, useEffect, useCallback } from 'react';
import { BESACHAIN_L1, BESACHAIN_L2, getChainStats, formatNumber, formatGwei, calculateTPS } from '@/lib/besachain';

export interface ChainData {
  blockNumber: number;
  chainId: number;
  syncing: boolean;
  peers: number;
  gasPrice: number;
  tps: number;
  lastUpdate: Date;
}

export function useChainData() {
  const [l1Data, setL1Data] = useState<ChainData | null>(null);
  const [l2Data, setL2Data] = useState<ChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Use localhost for development, production URLs for deployed
      const l1Rpc = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://54.235.85.175:1444' 
        : BESACHAIN_L1.rpcUrl;
      const l2Rpc = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://54.235.85.175:1445'
        : BESACHAIN_L2.rpcUrl;

      const [l1Stats, l2Stats] = await Promise.all([
        getChainStats(l1Rpc),
        getChainStats(l2Rpc)
      ]);

      if (l1Stats.chainId) {
        setL1Data({
          ...l1Stats,
          tps: calculateTPS(BESACHAIN_L1.blockTime),
          lastUpdate: new Date()
        });
      }

      if (l2Stats.chainId) {
        setL2Data({
          ...l2Stats,
          tps: calculateTPS(BESACHAIN_L2.blockTime),
          lastUpdate: new Date()
        });
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch chain data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  return { l1Data, l2Data, loading, error, refetch: fetchData };
}

// Hook for live block updates
export function useLiveBlocks(chainId: 1444 | 1445) {
  const [blocks, setBlocks] = useState<Array<{
    number: number;
    hash: string;
    timestamp: number;
    txCount: number;
  }>>([]);

  useEffect(() => {
    const rpcUrl = chainId === 1444 
      ? (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://54.235.85.175:1444' : BESACHAIN_L1.rpcUrl)
      : (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://54.235.85.175:1445' : BESACHAIN_L2.rpcUrl);

    const fetchLatestBlock = async () => {
      try {
        const response = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBlockByNumber',
            params: ['latest', false]
          })
        });
        const data = await response.json();
        if (data.result) {
          const block = {
            number: parseInt(data.result.number, 16),
            hash: data.result.hash.slice(0, 18) + '...',
            timestamp: parseInt(data.result.timestamp, 16),
            txCount: data.result.transactions?.length || 0
          };
          setBlocks(prev => [block, ...prev].slice(0, 10));
        }
      } catch (e) {
        // Silent fail for background polling
      }
    };

    fetchLatestBlock();
    const interval = setInterval(fetchLatestBlock, chainId === 1444 ? 500 : 300);
    return () => clearInterval(interval);
  }, [chainId]);

  return blocks;
}

export { formatNumber, formatGwei, calculateTPS };
