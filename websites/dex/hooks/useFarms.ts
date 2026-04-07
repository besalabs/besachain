'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { masterChefAbi } from '@/lib/abis'
import { parseUnits, Address } from 'viem'

const MASTERCHEF_ADDRESS = '0x0000000000000000000000000000000000000000'

export function useFarms() {
  const { address } = useAccount()

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const deposit = async (pid: number, amount: string, decimals: number = 18) => {
    if (!address) return

    const amountBN = parseUnits(amount, decimals)

    writeContract({
      address: MASTERCHEF_ADDRESS as Address,
      abi: masterChefAbi,
      functionName: 'deposit',
      args: [BigInt(pid), amountBN],
    })
  }

  const withdraw = async (pid: number, amount: string, decimals: number = 18) => {
    if (!address) return

    const amountBN = parseUnits(amount, decimals)

    writeContract({
      address: MASTERCHEF_ADDRESS as Address,
      abi: masterChefAbi,
      functionName: 'withdraw',
      args: [BigInt(pid), amountBN],
    })
  }

  const harvest = async (pid: number) => {
    if (!address) return

    writeContract({
      address: MASTERCHEF_ADDRESS as Address,
      abi: masterChefAbi,
      functionName: 'harvest',
      args: [BigInt(pid)],
    })
  }

  const emergencyWithdraw = async (pid: number) => {
    if (!address) return

    writeContract({
      address: MASTERCHEF_ADDRESS as Address,
      abi: masterChefAbi,
      functionName: 'emergencyWithdraw',
      args: [BigInt(pid)],
    })
  }

  return {
    deposit,
    withdraw,
    harvest,
    emergencyWithdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export function useFarmInfo(pid: number) {
  const { data: poolInfo, isLoading } = useReadContract({
    address: MASTERCHEF_ADDRESS as Address,
    abi: masterChefAbi,
    functionName: 'poolInfo',
    args: [BigInt(pid)],
  })

  return { poolInfo, isLoading }
}

export function useUserFarmInfo(pid: number) {
  const { address } = useAccount()

  const { data: userInfo, isLoading } = useReadContract({
    address: MASTERCHEF_ADDRESS as Address,
    abi: masterChefAbi,
    functionName: 'userInfo',
    args: address ? [BigInt(pid), address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: pendingReward } = useReadContract({
    address: MASTERCHEF_ADDRESS as Address,
    abi: masterChefAbi,
    functionName: 'pendingBesa',
    args: address ? [BigInt(pid), address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return { userInfo, pendingReward, isLoading }
}
