## SPEC Phase Complete - Bounty #232: Create an owockibot onchain activity feed

**What I accomplished:**
- Read the `owockibot-bounties` skill to understand workflow and quality expectations
- Analyzed bounty #232 requirements in detail
- Researched necessary APIs and tools

**Requirements Clarified:**
The feed needs to show 4 types of onchain activity from Base blockchain:
1. **Safe transactions** - from Gnosis Safe `0x26B7805Dd8aEc26DA55fc8e0c659cf6822b740Be`
2. **Token transfers** - OWOCKIBOT token `0xfDC933Ff4e2980d18beCF48e4E030d8463A2Bb07`
3. **Bounty payouts** - likely USDC transfers from Safe
4. **LP fee claims** - from Uniswap V4 pool

**Tools Identified:**
- **BaseScan API** (primary) - chainid 8453, endpoints: `txlist`, `tokentx`
  - Free tier available, need to register for API key
- **The Graph** - backup but Uniswap V4 subgraphs less mature

**Technical Approach:**
- Recommended: Simple HTML/JS page with BaseScan API (meets "standalone" requirement)
- Fetch transactions from Safe address, token address, and LP pool
- Display as timeline with timestamps, BaseScan links, and human-readable descriptions
- Deploy to Vercel/GitHub Pages or PR to owockibot.xyz

**Key Decisions Needed:**
1. Register for BaseScan API key
2. Decide on hosting/deployment location
3. Confirm UI requirements with Heenal before building

**Logged to:** `memory/work-log/2026-02-25.md`

Ready for BUILD phase when approved.