#!/usr/bin/env python3
"""
Generate sample/mock data for testing the Twitter report tool.
Run this to see example output without needing Twitter authentication.
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

DATA_FILE = Path(__file__).parent / "data" / "twitter_data.json"
OUTPUT_DIR = Path(__file__).parent / "output"

OUTPUT_DIR.mkdir(exist_ok=True)

# Sample data based on typical @owockibot account
SAMPLE_TWEETS = [
    "Just deployed a new AI agent to the network! 🚀 #Greenpill",
    "Working on something exciting for the regenerative economy 🌱",
    "The future of decentralized AI is here. Join us.",
    "New bounty dropped! Check out the latest task on owockibot.",
    "Building the agent economy one tweet at a time 🤖",
    "Regenerative finance meets autonomous agents. Exciting times!",
    "Just hit a new milestone! Thank you to all supporters.",
    "Weekend hack session incoming. Who's joining?",
    "The convergence of AI and crypto is inevitable.",
    "Our community is growing! Welcome new members 🌟",
]

def generate_sample_data():
    """Generate sample Twitter data for testing"""
    
    # Generate follower history (last 8 weeks)
    followers = []
    base_followers = 5000
    for i in range(8):
        date = datetime.now() - timedelta(weeks=7-i)
        # Add some growth with randomness
        growth = random.randint(10, 50)
        base_followers += growth
        followers.append({
            "date": date.isoformat(),
            "count": base_followers
        })
    
    # Generate tweets over time
    tweets = []
    tweet_count = 50
    base_date = datetime.now() - timedelta(days=60)
    
    for i in range(tweet_count):
        # Random date within last 60 days
        days_ago = random.randint(0, 60)
        created = base_date + timedelta(days=days_ago, hours=random.randint(0, 23))
        
        # More engagement for recent tweets
        recency_multiplier = 1 + (days_ago / 60)  # older = less engagement
        
        impressions = int(random.randint(500, 2000) * recency_multiplier)
        likes = int(random.randint(10, 100) * recency_multiplier)
        retweets = int(random.randint(5, 50) * recency_multiplier)
        replies = int(random.randint(2, 20) * recency_multiplier)
        
        tweets.append({
            "id": f"sample_{i}",
            "created_at": created.isoformat(),
            "text": SAMPLE_TWEETS[i % len(SAMPLE_TWEETS)],
            "likes": likes,
            "retweets": retweets,
            "replies": replies,
            "impressions": impressions,
        })
    
    # Sort by date
    tweets.sort(key=lambda t: t["created_at"], reverse=True)
    
    data = {
        "initialized": (datetime.now() - timedelta(days=60)).isoformat(),
        "followers": followers,
        "tweets": tweets,
        "weekly_reports": []
    }
    
    return data


def calculate_engagement_rate(impressions, likes, retweets, replies):
    if impressions and impressions > 0:
        total_engagements = likes + retweets + replies
        return (total_engagements / impressions) * 100
    return 0


def calculate_per_follower_engagement(likes, retweets, replies, followers):
    if followers and followers > 0:
        total_engagements = likes + retweets + replies
        return (total_engagements / followers) * 100
    return 0


def generate_weekly_report(data):
    """Generate weekly engagement report"""
    now = datetime.now()
    week_ago = now - timedelta(days=7)
    
    weekly_tweets = []
    for tweet in data.get("tweets", []):
        if tweet.get("created_at"):
            try:
                created = datetime.fromisoformat(tweet["created_at"])
                if created >= week_ago:
                    weekly_tweets.append(tweet)
            except:
                pass
    
    total_impressions = sum(t.get("impressions", 0) for t in weekly_tweets)
    total_likes = sum(t.get("likes", 0) for t in weekly_tweets)
    total_retweets = sum(t.get("retweets", 0) for t in weekly_tweets)
    total_replies = sum(t.get("replies", 0) for t in weekly_tweets)
    
    follower_history = data.get("followers", [])
    current_followers = follower_history[-1]["count"] if follower_history else 0
    previous_followers = follower_history[-2]["count"] if len(follower_history) > 1 else current_followers
    follower_growth = current_followers - previous_followers
    
    engagement_rate = calculate_engagement_rate(total_impressions, total_likes, total_retweets, total_replies)
    per_follower_engagement = calculate_per_follower_engagement(total_likes, total_retweets, total_replies, current_followers)
    
    for tweet in weekly_tweets:
        tweet["total_engagement"] = tweet.get("likes", 0) + tweet.get("retweets", 0) + tweet.get("replies", 0)
    
    top_tweets = sorted(weekly_tweets, key=lambda t: t.get("total_engagement", 0), reverse=True)[:5]
    
    return {
        "week_start": week_ago.isoformat(),
        "week_end": now.isoformat(),
        "tweet_count": len(weekly_tweets),
        "total_impressions": total_impressions,
        "total_likes": total_likes,
        "total_retweets": total_retweets,
        "total_replies": total_replies,
        "current_followers": current_followers,
        "follower_growth": follower_growth,
        "engagement_rate": round(engagement_rate, 2),
        "per_follower_engagement": round(per_follower_engagement, 2),
        "top_tweets": top_tweets
    }


def generate_markdown_report(report, handle="@owockibot"):
    md = f"""# 📊 {handle} Weekly Engagement Report

**Period:** {report['week_start'][:10]} to {report['week_end'][:10]}

## 📈 Overview

| Metric | Value |
|--------|-------|
| Tweets This Week | {report['tweet_count']} |
| Total Impressions | {report['total_impressions']:,} |
| Total Likes | {report['total_likes']:,} |
| Total Retweets | {report['total_retweets']:,} |
| Total Replies | {report['total_replies']:,} |
| Follower Growth | {report['follower_growth']:+d} |
| Engagement Rate | {report['engagement_rate']}% |
| Per-Follower Engagement | {report['per_follower_engagement']}% |

## 🏆 Top Performing Tweets

"""
    
    if report['top_tweets']:
        for i, tweet in enumerate(report['top_tweets'], 1):
            text = tweet.get('text', '')[:100]
            if len(tweet.get('text', '')) > 100:
                text += '...'
            md += f"""### {i}. {text}

- ❤️ Likes: {tweet.get('likes', 0):,}
- 🔁 Retweets: {tweet.get('retweets', 0):,}
- 💬 Replies: {tweet.get('replies', 0):,}
- 👁️ Impressions: {tweet.get('impressions', 0):,}

"""
    else:
        md += "*No tweets this week*\n"
    
    return md


def main():
    print("Generating sample data for @owockibot...")
    
    # Generate sample data
    data = generate_sample_data()
    
    # Save to file
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Sample data saved to: {DATA_FILE}")
    
    # Generate report
    report = generate_weekly_report(data)
    
    # Save markdown report
    md = generate_markdown_report(report)
    report_file = OUTPUT_DIR / "weekly_report.md"
    with open(report_file, 'w') as f:
        f.write(md)
    print(f"Report saved to: {report_file}")
    
    # Save JSON report
    json_file = OUTPUT_DIR / "weekly_report.json"
    with open(json_file, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    print(f"JSON report saved to: {json_file}")
    
    # Print summary
    print("\n" + "="*50)
    print("SAMPLE REPORT PREVIEW")
    print("="*50)
    print(md)
    
    # All-time stats
    all_tweets = data.get("tweets", [])
    print("\n" + "="*50)
    print("ALL-TIME STATS")
    print("="*50)
    print(f"Total Tweets: {len(all_tweets)}")
    print(f"Total Likes: {sum(t.get('likes', 0) for t in all_tweets):,}")
    print(f"Total Retweets: {sum(t.get('retweets', 0) for t in all_tweets):,}")
    print(f"Total Replies: {sum(t.get('replies', 0) for t in all_tweets):,}")
    print(f"Current Followers: {data['followers'][-1]['count']:,}")
    
    print("\n✓ Sample data generation complete!")
    print("\nTo use real data, follow these steps:")
    print("1. Get Twitter cookies (see README.md)")
    print("2. Save cookies to: data/cookies.json")
    print("3. Run: python twitter_report.py")


if __name__ == "__main__":
    main()
