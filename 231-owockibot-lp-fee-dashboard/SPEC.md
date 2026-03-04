# SPEC: Bounty #231 - owockibot LP Fee Tracking Dashboard

## Summary
Build a web dashboard for tracking Clanker LP fee accrual and claim history for the $owockibot token on Base.

## Requirements Clarification

### Core Features (from bounty description)
1. **Fees Collected vs Uncollected** - Show currently claimable fees vs total earned
2. **WETH vs Token Split** - Display how fees are distributed between WETH and $owockibot tokens
3. **Historical Claims** - Show a history of past claim transactions
4. **Current Pool Stats** - Display Uniswap V4 pool statistics (TVL, volume, etc.)

### Technical Details

#### Contract Addresses (Base Mainnet)
| Contract | Address | Purpose |
|----------|---------|---------|
| $owockibot Token | `0xfdc933ff4e2980d18becf48e4e030d8463a2bb07` | The token being tracked |
| Locker (ClankerLpLockerFeeConversion) | `0x63D2DfEA64b3433F4071A98665bcD7Ca14d93496` | Manages LP recipients & fee preferences |
| Fee Splitter (ClankerFeeLocker) | `0xF3622742b1E446D92e45E22923Ef11C2fcD55D68` | Accrues fees, `claim()` and `availableFees()` functions |

#### Key Contract Functions

**ClankerFeeLocker (Fee Splitter):**
- `availableFees(address feeOwner, address token) → uint256` - View claimable fees
- `claim(address feeOwner, address token)` - Transfer fees to recipient

**ClankerLpLockerFeeConversion (Locker):**
- Fee preferences: `Both`, `Paired` (WETH), or `Clanker` (token)
- Manages reward recipients for LP positions

#### Fee Flow
1. LP fees are collected from the Uniswap V4 pool via ClankerHook
2. Fees are moved to ClankerFeeLocker (Fee Splitter)
3. Token deployer can claim fees via `claim()` function
4. WETH fees are grouped per fee recipient (across all tokens)

### Data Sources Required
1. **On-chain (via RPC):** `availableFees()` for current claimable amounts
2. **Basescan API:** Historical transactions for claim history
3. **Dune Analytics:** `IClankerLpLocker.ClaimedRewards` event for per-token WETH breakdown
4. **Uniswap V4:** Pool stats (if available via subgraph or direct query)

## Technical Approach

### Stack
- **Frontend:** Next.js 14 (existing codebase in `/app`)
- **Blockchain:** viem or ethers.js for contract reads
- **Styling:** Tailwind CSS (existing)
- **Deployment:** Vercel (existing) or standalone

### Implementation Plan

1. **Dashboard Page:** Create new route (e.g., `/owockibot-fees` or extend existing dashboard)
2. **Contract Hooks:** Create React hooks for:
   - `useAvailableFees(feeOwner, token)` 
   - `useFeeHistory(feeOwner)`
3. **Components:**
   - FeeSummaryCard: Total collected vs uncollected
   - FeeBreakdown: WETH vs token split
   - ClaimsHistory: Table of past claims
   - PoolStats: Current pool metrics
4. **Data Fetching:**
   - Use public Base RPC (e.g., https://mainnet.base.org)
   - Optional: Dune API for historical event data

### Key Considerations
- The bounty allows standalone page OR PR to owockibot.xyz   I DON'T THINK THE OWOCKIBOT WEBSITE/DASHBAORD HAS A PUBLIC REPO? DOES IT??? PR WOULD BE BEST BUT IF NOT WE CAN DO A SEPARATE SITE. 
- Recommend creating in existing `/app` first (easier to demo)
- Fee data requires the deployer/owner address (`0x26B7805Dd8aEc26DA55fc8e0c659cf6822b740Be`)
- Note: WETH fees across multiple tokens are aggregated in FeeLocker (no per-token breakdown on-chain)

## Deliverables
1. Working dashboard page with all 4 required features
2. Clean, responsive UI using existing Tailwind setup
3. Clear documentation of contract interactions

## Status: SPEC Complete
Ready for BUILD phase.
