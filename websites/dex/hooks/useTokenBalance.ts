'use client'

import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi } from '@/lib/abis'
import { formatUnits } from 'viem'

export function useTokenBalance(tokenAddress?: string) {
  const { address } = useAccount()

  const { data, isLoading, error, refetch } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!tokenAddress && !!address,
    },
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
    query: {
      enabled: !!tokenAddress,
    },
  })

  const balance = data && decimals && typeof data === 'bigint' && typeof decimals === 'number' ? formatUnits(data, decimals) : '0'

  return {
    balance,
    rawBalance: data,
    decimals,
    isLoading,
    error,
    refetch,
  }
}
