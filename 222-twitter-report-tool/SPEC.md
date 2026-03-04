## SPEC Phase: Bounty #222 - owockibot Twitter Engagement Report Tool

### Requirements Analysis (from bounty description)
**Goal:** Build a script/tool that generates a weekly engagement report for @owockibot on X/Twitter.

**Must track:**
1. Total impressions/views
2. Likes
3. Retweets
4. Replies
5. Follower growth
6. Top performing tweets
7. Engagement rate

**Output format:** Markdown or formatted HTML summary

**Data source:** Twitter API free tier OR scraping

---

### Technical Options Investigated

| Approach | Status | Notes |
|----------|--------|-------|
| **Twitter API v2** | ❌ Credits depleted | Account 2019436676209057792 has 0 credits |
| **Camofox browser** | ❌ Not running | Need to start camofox service |
| **Chrome relay** | ❌ No tab attached | Requires user to connect a tab |
| **FxTwitter/Nitter** | ❌ Not working | Blocked or unavailable |
| **twikit library** | ✅ Available | GitHub: d60/twikit - scrapes without API key |
| **twitterapi.io** | ✅ Alternative | Paid but cheap alternative |

---

### Recommended Technical Approach

**Primary: Use twikit library** (https://github.com/d60/twikit)
- Python library that scrapes Twitter's internal API
- No API key required
- Free to use
- Can fetch user tweets, metrics, follower counts

**Alternative: Start Camofox** 
- Would enable existing x-twitter skill to work
- More reliable but requires service startup

**Fallback: Purchase Twitter API credits**
- ~$100/month for basic tier
- Most reliable but costs money

---

### Clarified Requirements & Next Steps

1. **Target Account:** The exact Twitter handle for the report is `@owockibot`.
2. **Report Frequency:** Weekly, includes comparison to previous week, trend data, and is auto-run via cron.
3. **Historical Data:** Track **ALL TIME** (requires persistent storage).
4. **Delivery Method:** Report posted to a **website** (e.g., a Heenai subdomain) and a summary **tweeted** (via Postiz).
5. **Engagement Rate:** Include **both** the standard formula `(likes + retweets + replies) / impressions × 100` and a per-follower basis.
6. **Top Tweets:** Top 5 by engagement.
7. **Follower Growth:** Net gain over the week.

---

**Next Steps (to proceed to BUILD):**

1. **Confirm with Heenal:**
   - The exact Twitter handle for @owockibot.
2. **Decision Point:** Once the handle is confirmed, I will proceed to the **BUILD** phase using the `twikit` library. If preferred, alternatives like official API (requiring funding) or Camofox (requiring service startup) can be reconsidered.