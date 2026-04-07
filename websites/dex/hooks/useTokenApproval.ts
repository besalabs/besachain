'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { erc20Abi } from '@/lib/abis'
import { parseUnits, maxUint256 } from 'viem'

export function useTokenApproval(tokenAddress?: string, spenderAddress?: string) {
  const { address } = useAccount()

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && spenderAddress ? [address, spenderAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!tokenAddress && !!spenderAddress && !!address,
    },
  })

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = async (amount?: string, decimals?: number) => {
    if (!tokenAddress || !spenderAddress) return
    
    const amountToApprove = amount && decimals 
      ? parseUnits(amount, decimals)
      : maxUint256

    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress as `0x${string}`, amountToApprove],
    })
  }

  const isApproved = (amount: string, decimals: number): boolean => {
    if (!allowance || typeof allowance !== 'bigint') return false
    return allowance >= parseUnits(amount, decimals)
  }

  return {
    allowance,
    approve,
    isApproved,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    refetchAllowance,
    hash,
  }
}
