'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { stakingAbi } from '@/lib/abis'
import { parseUnits, Address, formatUnits } from 'viem'

const STAKING_ADDRESS = '0x0000000000000000000000000000000000000000'

export function useStaking() {
  const { address } = useAccount()

  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const stake = async (amount: string, lockPeriod: number, decimals: number = 18) => {
    if (!address) return

    const amountBN = parseUnits(amount, decimals)

    writeContract({
      address: STAKING_ADDRESS as Address,
      abi: stakingAbi,
      functionName: 'stake',
      args: [amountBN, BigInt(lockPeriod)],
    })
  }

  const unstake = async (amount: string, decimals: number = 18) => {
    if (!address) return

    const amountBN = parseUnits(amount, decimals)

    writeContract({
      address: STAKING_ADDRESS as Address,
      abi: stakingAbi,
      functionName: 'unstake',
      args: [amountBN],
    })
  }

  const harvest = async () => {
    if (!address) return

    writeContract({
      address: STAKING_ADDRESS as Address,
      abi: stakingAbi,
      functionName: 'harvest',
      args: [],
    })
  }

  const compound = async (amount: string, decimals: number = 18) => {
    if (!address) return

    const amountBN = parseUnits(amount, decimals)

    writeContract({
      address: STAKING_ADDRESS as Address,
      abi: stakingAbi,
      functionName: 'compound',
      args: [amountBN],
    })
  }

  return {
    stake,
    unstake,
    harvest,
    compound,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}

export function useStakingInfo() {
  const { address } = useAccount()

  const { data: totalStaked, isLoading: totalLoading } = useReadContract({
    address: STAKING_ADDRESS as Address,
    abi: stakingAbi,
    functionName: 'totalStaked',
  })

  const { data: userInfo, isLoading: userLoading } = useReadContract({
    address: STAKING_ADDRESS as Address,
    abi: stakingAbi,
    functionName: 'userInfo',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: pendingReward } = useReadContract({
    address: STAKING_ADDRESS as Address,
    abi: stakingAbi,
    functionName: 'pendingReward',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: rewardRate } = useReadContract({
    address: STAKING_ADDRESS as Address,
    abi: stakingAbi,
    functionName: 'rewardRate',
  })

  return {
    totalStaked: totalStaked ? formatUnits(totalStaked, 18) : '0',
    userInfo: userInfo ? {
      amount: formatUnits(userInfo[0], 18),
      rewardDebt: formatUnits(userInfo[1], 18),
      lockEnd: Number(userInfo[2]),
    } : null,
    pendingReward: pendingReward ? formatUnits(pendingReward, 18) : '0',
    rewardRate: rewardRate ? formatUnits(rewardRate, 18) : '0',
    isLoading: totalLoading || userLoading,
  }
}
