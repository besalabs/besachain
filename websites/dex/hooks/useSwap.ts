'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { routerAbi } from '@/lib/abis'
import { CONTRACTS } from '@/lib/config/chains'
import { parseUnits, Address } from 'viem'

export function useSwap() {
  const { address } = useAccount()

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const { data: amountsOut } = useReadContract({
    address: CONTRACTS.router as Address,
    abi: routerAbi,
    functionName: 'getAmountsOut',
  })

  const swapExactTokensForTokens = async (
    amountIn: string,
    amountOutMin: string,
    path: Address[],
    decimalsIn: number,
    decimalsOut: number
  ) => {
    if (!address) return

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)

    writeContract({
      address: CONTRACTS.router as Address,
      abi: routerAbi,
      functionName: 'swapExactTokensForTokens',
      args: [
        parseUnits(amountIn, decimalsIn),
        parseUnits(amountOutMin, decimalsOut),
        path,
        address,
        deadline,
      ],
    })
  }

  return {
    swapExactTokensForTokens,
    amountsOut,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}
