# SPEC Phase: Bounty #236 - Build a token-gated community forum or chat for owockibot holders

## Requirements Analysis (from bounty description)
**Goal:** Create a simple forum or chat app that gates access to $owockibot token holders on Base.

**Core Functionality:**
1.  **Token Gating:** Access is restricted to users holding a minimum configurable amount of $owockibot tokens on Base.
2.  **Wallet Verification:** Users must connect their wallet to verify token ownership.
3.  **Community Feature:** Implement either a simple forum (posts, comments) or a chat application (real-time messaging).

**Must haves:**
*   Works on Base blockchain.
*   Verifies wallet ownership and $owockibot token balance.
*   Minimum token threshold is configurable.

**Bonus:**
*   Integrate with existing `owockibot.xyz` (e.g., share design elements, link back).

---

## Technical Options Investigated

| Approach          | Status     | Notes                                                                                                         |
|-------------------|------------|---------------------------------------------------------------------------------------------------------------|
| **Next.js + RainbowKit/Wagmi** | ✅ Viable   | Standard stack for dApps. Handles wallet connection, contract reads (token balance).                          |
| **Firebase/Supabase** | ✅ Viable   | For backend (user authentication, message storage) if real-time chat/forum is desired beyond simple static posts. |
| **Lit Protocol / WalletConnect** | 🟡 Complex  | For advanced token-gating (e.g., encryption for private chats), but might be overkill for "simple" app.   |

---

## Recommended Technical Approach

**Primary: Next.js + RainbowKit/Wagmi for Frontend; Flat JSON Files for Backend**
*   **Rationale:** Chosen for extreme simplicity and minimal setup, as requested for bounty submission, while clearly documenting limitations.
*   **Frontend (Next.js + Wallet Integration):**
    1.  Use RainbowKit for easy wallet connection (MetaMask, WalletConnect, etc.).
    2.  Use Wagmi hooks to read $owockibot token balance for the connected address.
    3.  Implement a client-side check to gate access to the forum UI based on the configurable token threshold (1 million tokens).
    4.  Display wallet address for identity, resolve ENS name for human readability, and ERC-8004 name for agent identity.
*   **Backend (Flat JSON Files):**
    1.  Forum posts and comments will be stored directly in flat JSON files within the project's deployed file system.
    2.  API routes will be implemented to read from and append to these JSON files.
    3.  **Limitations:** This approach has limited scalability and is prone to concurrency issues with frequent writes. This will be clearly documented in the README.

**Fallback: Simple HTML/JS with read-only content**
*   Not needed now that flat JSON is confirmed.

---

## Clarified Requirements & Next Steps

1.  **Token Address:** $owockibot token address: `0xfDC933Ff4e2980d18beCF48e4E030d8463A2Bb07` on Base.
2.  **Minimum Threshold:** **1 million tokens.**
3.  **Community Feature:** **Simple forum** (posts and comments, async).
4.  **User Identity:** Wallet address with **ENS name shown for humans**, **ERC-8004 name shown for agents.**
5.  **Bonus Integration:** Direct links, theme matching with `owockibot.xyz`.
6.  **Deployment:** Deploy as a standalone page on a `heenai.xyz` subdomain.
7.  **Moderation:** Not needed for this iteration.
8.  **Real-time vs. Async:** Async, doesn't have to be real-time.
9.  **Backend Choice:** Flat JSON files (stored in repo) for simplest implementation.
10. **Design:** Follow owockibot.xyz general aesthetic (dark theme, gold accents).


---

## Next Steps (to proceed to BUILD):

1.  **Confirm with Heenal:**
    *   Answers to the ambiguities/questions above.
2.  **Decision Point:** Once these details are clarified, I will proceed to the **BUILD** phase using the recommended technical approach.

---

**Status:** SPEC created, ready for Heenal's review.
