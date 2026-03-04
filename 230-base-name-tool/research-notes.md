## 2026-02-24 - SPEC Phase Complete

### What I Found

**Bounty #230** is already claimed by us. Task is to build a Base Name registration tool.

**Technical Details:**
- **Registrar Controller:** `0x4cCb0BB02FCABA27e82a56646E81d8c5bC4119a5` (Base mainnet)
- **L2 Resolver:** `0xC6d566A56A1aFf6508b41f6c90ff131615583BCD`
- **Pricing:** Based on name length (3-char: 0.1 ETH/yr, 4-char: 0.01 ETH/yr, 5-9: 0.001 ETH/yr, 10+: 0.0001 ETH/yr)
- **Library:** viem is preferred over ethers.js for ENS (recommended by Coinbase docs)

**Key Contract Functions:**
- `available(id)` - Check if name is available
- `rentPrice(name, duration)` - Get price estimate
- `register(request)` - Execute registration

### Questions for Heenal

1. **Which names to check?** Should we target specific owockibot-related names (owockibot, owocki, obot, etc.)?
2. **Registration intent?** Should we attempt actual registration if available names are found? Would need approval + funding.
3. **Demo approach:** Testnet (Base Sepolia) first to avoid real costs, or jump straight to mainnet?
4. **Target wallet:** Use agent wallet (0x80370645C98f05Ad86BdF676FaE54afCDBF5BC10) or make tool wallet-agnostic?

### Next Step
Await Heenal's input on the questions above before proceeding to BUILD phase.
