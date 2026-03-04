## SPEC Phase Complete - Bounty #230: Create an owockibot Base Name (.base.eth) registration tool

### What I Accomplished
1. **Read the owockibot-bounties skill** - Understood the workflow (SPEC → BUILD → VERIFY → REVIEW → SHIP) and quality expectations
2. **Researched Base Name Service** - Found key contract addresses and APIs:
   - **Registrar Controller:** `0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5`
   - **L2 Resolver:** `0xC6d566A56A1aFf6508b41f6c90ff131615583BCD`
   - **Pricing:** 3-char: 0.1 ETH/yr | 4-char: 0.01 ETH/yr | 5-9: 0.001 ETH/yr | 10+: 0.0001 ETH/yr
3. **Created SPEC.md** - Detailed technical requirements including contract ABIs, function signatures, and implementation approach

### Technical Approach
- Use **viem** library (recommended by Coinbase docs over ethers.js for ENS)
- Implement: `checkAvailability()`, `getPrice()`, and `register()` functions
- Support both Base mainnet and Base Sepolia (testnet)

### Clarified Requirements & Next Steps

1. **Names to Check:** We will check for the availability and cost of the following owockibot-related Base Names: `owocki.base`, `owockibot.base`, `bounties.base`, `owockitool.base`, `owockibotdev.base`.
2. **Registration:** No actual registration will be attempted. The tool will only check availability and estimate cost.
3. **Demo Approach:** The tool will work on **Base Mainnet directly**.
4. **Wallet:** The wallet used will be **configurable**.

### Files Created
- `/root/workspace/bounties/230-base-name-tool/SPEC.md` - Full spec
- `/root/workspace/bounties/230-base-name-tool/research-notes.md` - Research log

**Status:** Ready for BUILD phase, once remaining questions for other bounties are answered.