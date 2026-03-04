# Twitter Engagement Report Tool for @owockibot

A Python-based tool that generates weekly engagement reports for `@owockibot` on Twitter/X.

## Features

- 📊 Tracks all key metrics:
  - Total impressions/views
  - Likes, retweets, replies
  - Follower growth
  - Top performing tweets
  - Engagement rate (standard + per-follower)
- 📈 Weekly reports with historical data
- 💾 Persistent storage (all-time history)
- 🌐 Website-ready output (Markdown + JSON)
- 🐦 Tweet summary generation for social sharing

## Quick Start

### 1. Install Dependencies

```bash
cd bounties/222-twitter-report-tool
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Get Twitter Authentication

This tool uses the `twikit` library to scrape Twitter. You need cookies:

**Option A: Export from Browser**
1. Login to `@owockibot` on twitter.com in Chrome/Firefox
2. Open DevTools (F12) → Application → Cookies → twitter.com
3. Export cookies as JSON (need `auth_token` and `ct0`)
4. Save to `data/cookies.json`

**Option B: Run Setup Script**
```bash
python setup_auth.py
```

### 3. Generate Report

```bash
python twitter_report.py
```

Reports are saved to:
- `output/weekly_report.md` - Human-readable report
- `output/weekly_report.json` - Machine-readable data

## Project Structure

```
222-twitter-report-tool/
├── twitter_report.py      # Main report generator
├── generate_sample.py     # Generate sample data for testing
├── setup_auth.py          # Authentication setup helper
├── requirements.txt       # Python dependencies
├── README.md              # This file
├── data/
│   ├── twitter_data.json  # Historical data storage
│   └── cookies.json       # Twitter cookies (you provide)
└── output/
    ├── weekly_report.md   # Latest report
    └── weekly_report.json # JSON data
```

## Metrics Explained

| Metric | Description |
|--------|-------------|
| Engagement Rate | (likes + retweets + replies) / impressions × 100 |
| Per-Follower Engagement | (likes + retweets + replies) / followers × 100 |
| Top Tweets | Ranked by total engagement (likes + RTs + replies) |

## Website Hosting

The reports are designed to be hosted on a website. To publish:

1. **Option A: Vercel/Netlify**
   - Deploy the `output/` folder as static site
   - Add custom domain (e.g., `reports.owockibot.xyz`)

2. **Option B: GitHub Pages**
   - Push to GitHub repo
   - Enable Pages in settings

## Automated Reports (Cron)

To run weekly automatically:

```bash
# Add to crontab
0 9 * * 1 /path/to/venv/bin/python /path/to/twitter_report.py
```

This runs every Monday at 9 AM UTC.

## Tweet Summary

After generating a report, you can post a summary to Twitter:

```
📊 @owockibot Weekly Stats

👁️ 21K impressions
❤️ 839 likes  
🔁 491 retweets
📈 +23 new followers
🆙 7.26% engagement rate

Full report: [YOUR_REPORT_URL]
```

Use Postiz to automate the tweet posting.

## Troubleshooting

**"Client.login() missing auth_info_1"**
→ Cookies not valid. Re-export from browser.

**"User not found"**
→ Check if @owockibot handle is correct.

**Rate limiting**
→ Twitter may temporarily block scraping. Wait and retry.

## Requirements

- Python 3.8+
- twikit
- aiohttp
- (See requirements.txt for full list)

## License

MIT - Built for owockibot bounty #222
