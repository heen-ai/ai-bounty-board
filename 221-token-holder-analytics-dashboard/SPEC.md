# SPEC Phase: Bounty #221 - Build a $owockibot token holder analytics dashboard

## Requirements Analysis (from bounty description)
**Goal:** Create a publicly accessible dashboard showing $owockibot token holder stats on Base.

**Must include:**
1.  Top 20 holders
2.  Total holder count
3.  Holder distribution chart (whale/dolphin/shrimp tiers)
4.  Holder growth over time

**Data source options:**
*   Basescan API
*   Dune Analytics
*   Direct RPC calls

**Deployment:** Live webpage

---

## Technical Options Investigated

| Approach          | Status     | Notes                                                                     |
|-------------------|------------|---------------------------------------------------------------------------|
| **Basescan API**  | ✅ Viable   | `tokentx` for transfers, `gettokenholdercount` for total. Rate limits apply. |
| **Dune Analytics**| 🟡 Complex  | Requires building a Dune query, which can be time-consuming to optimize.  |
| **Direct RPC**    | ✅ Viable   | Requires custom logic to track transfers/balances over time.               |

---

## Recommended Technical Approach

**Primary: Direct RPC calls using a lightweight Web3 library (e.g., Viem or Ethers.js)**
*   **Rationale:** Provides most flexibility and real-time data without reliance on third-party aggregators that may have delays or rate limits.
*   **Steps:**
    1.  Fetch historical `Transfer` events for the $owockibot token contract to build holder history.
    2.  Query current token balances for addresses identified from transfer events.
    3.  Calculate total supply, holder count, and distribute into tiers.

**Fallback: Basescan API (if direct RPC proves too complex/rate-limited)**
*   Less granular control but quicker setup for basic stats.

---

## Clarified Requirements & Next Steps

1.  **Token Address:** $owockibot token address: `0xfDC933Ff4e2980d18beCF48e4E030d8463A2Bb07` on Base.
2.  **Dashboard UI:** Must be clean, responsive, and easy to understand. Consider a dark theme to match owockibot.xyz.
3.  **Tier Definitions (Example):**
    *   Whale: > 1% of total supply
    *   Dolphin: > 0.1% of total supply
    *   Shrimp: < 0.1% of total supply
4.  **Data Refresh:** How often should the dashboard data refresh (e.g., every hour, daily)?
5.  **Deployment:** Deploy as a standalone page on a `heenai.xyz` subdomain.

---

## Ambiguities & Questions

1.  **Historical Depth:** How far back should "holder growth over time" go (e.g., last 30 days, all time)?
2.  **Chart Types:** Specific chart types for distribution and growth (e.g., pie chart for distribution, line chart for growth)?
3.  **UI/UX Preferences:** Any specific design preferences or existing components to reuse?

---

## Next Steps (to proceed to BUILD):

1.  **Confirm with Heenal:**
    *   Answers to the ambiguities/questions above.
2.  **Decision Point:** Once these details are clarified, I will proceed to the **BUILD** phase using the recommended technical approach.

---

**Status:** SPEC created, ready for Heenal's review.
