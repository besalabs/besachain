---
title: BesaChain Regression — How We Broke 3-Validator Consensus
description: Post-mortem on destroying a working 3-validator network by wiping instead of patching
updated: 2026-04-13
tags: [besachain, parlia, infrastructure, lesson]
---

# BesaChain Regression: Wiped Working System, Couldn't Rebuild

## What Happened
April 11-12, 2026. BesaChain had a working 3-validator Parlia PoSA network (set up by a previous tool). Elijah destroyed it to "rebuild properly" with BSC v1.7.2 + ML-DSA. Spent 12+ hours failing to get 3 validators synced again.

## Root Causes
1. Wiped all chain data and running processes without documenting them first
2. Didn't understand BSC v1.7.2's P2P changes (static-nodes.json deprecated)
3. Didn't preserve nodekeys across `geth init` wipes
4. Started all validators with `--mine` simultaneously → instant forks
5. Moved to 1-validator "quick fix" and accumulated technical debt

## The Real Fix (Never Attempted Properly)
1. Start V1 alone, build 10+ blocks
2. V2/V3 start WITHOUT --mine, sync V1's chain via config.toml StaticNodes
3. Once synced (verified by matching block hashes), THEN enable mining
4. The trick: V2/V3 must NOT produce any blocks before syncing V1's chain

## Rules
- Never wipe working infrastructure without backing up nodekeys, configs, and chain data
- Always patch in place (swap binary, restart — don't rebuild from genesis)
- Test on 1 node first, roll to others only after 500+ blocks verified
- `config.toml [Node.P2P] StaticNodes` is the ONLY way to set static peers in BSC v1.7.2
