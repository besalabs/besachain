'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { routerAbi } from '@/lib/abis'
import { CONTRACTS } from '@/lib/config/chains'
import { parseUnits, Address } from 'viem'

export function useLiquidity() {
  const { address } = useAccount()

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const addLiquidity = async (
    tokenA: Address,
    tokenB: Address,
    amountA: string,
    amountB: string,
    decimalsA: number,
    decimalsB: number,
    slippage: number = 0.5
  ) => {
    if (!address) return

    const amountADesired = parseUnits(amountA, decimalsA)
    const amountBDesired = parseUnits(amountB, decimalsB)
    const amountAMin = (amountADesired * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000)
    const amountBMin = (amountBDesired * BigInt(Math.floor((100 - slippage) * 100))) / BigInt(10000)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)

    writeContract({
      address: CONTRACTS.router as Address,
      abi: routerAbi,
      functionName: 'addLiquidity',
      args: [tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, address, deadline],
    })
  }

  const removeLiquidity = async (
    tokenA: Address,
    tokenB: Address,
    liquidity: string,
    decimalsA: number,
    decimalsB: number,
    slippage: number = 0.5
  ) => {
    if (!address) return

    const liquidityBN = parseUnits(liquidity, 18)
    const amountAMin = 0n
    const amountBMin = 0n
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20)

    writeContract({
      address: CONTRACTS.router as Address,
      abi: routerAbi,
      functionName: 'removeLiquidity',
      args: [tokenA, tokenB, liquidityBN, amountAMin, amountBMin, address, deadline],
    })
  }

  return {
    addLiquidity,
    removeLiquidity,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}
