#!/usr/bin/env python3
"""
Twitter Engagement Report Tool for @owockibot
Supports multiple authentication methods:
1. Twitter API (requires API key)
2. Cookies-based (twikit with cookies)
3. Demo mode (sample data)

Usage:
    python twitter_report.py           # Normal mode (needs cookies)
    python twitter_report.py --demo   # Demo mode with sample data
"""

import asyncio
import json
import os
import sys
import argparse
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
TWITTER_HANDLE = "owockibot"
DATA_DIR = Path(__file__).parent / "data"
DATA_FILE = DATA_DIR / "twitter_data.json"
COOKIES_FILE = DATA_DIR / "cookies.json"
OUTPUT_DIR = Path(__file__).parent / "output"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


def load_data():
    """Load existing data from JSON file"""
    if DATA_FILE.exists():
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {
        "initialized": datetime.now().isoformat(),
        "followers": [],
        "tweets": [],
        "weekly_reports": []
    }


def save_data(data):
    """Save data to JSON file"""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2, default=str)


def calculate_engagement_rate(impressions, likes, retweets, replies):
    """Calculate engagement rate"""
    if impressions and impressions > 0:
        total_engagements = likes + retweets + replies
        return (total_engagements / impressions) * 100
    return 0


def calculate_per_follower_engagement(likes, retweets, replies, followers):
    """Calculate engagement per follower"""
    if followers and followers > 0:
        total_engagements = likes + retweets + replies
        return (total_engagements / followers) * 100
    return 0


async def fetch_with_twikit(data):
    """Fetch Twitter data using twikit library"""
    try:
        from twikit import Client
        
        client = Client()
        
        # Try to load cookies
        if COOKIES_FILE.exists():
            print("Loading authentication tokens from cookies file...")
            with open(COOKIES_FILE, 'r') as f:
                cookies_dict = json.load(f)
            
            client.auth_token = cookies_dict.get('auth_token')
            client.ct0 = cookies_dict.get('ct0')

            if client.auth_token and client.ct0:
                print("✓ Auth tokens loaded from cookies.")
            else:
                print("⚠️  Warning: auth_token or ct0 not found in cookies.json.")
                print("Please ensure your cookies file contains 'auth_token' and 'ct0'.")
                print("Or run: python generate_sample.py for demo data")
                return data
        else:
            print("\n⚠️  No cookies file found.")
            print("Please export Twitter cookies to: data/cookies.json")
            print("Or run: python generate_sample.py for demo data")
            return data
        
        # Get user
        print(f"Fetching user @{TWITTER_HANDLE}...")
        user = await client.get_user_by_screen_name(TWITTER_HANDLE)
        
        if not user:
            print("User not found")
            return data
        
        print(f"Found: {user.name} (@{user.screen_name})")
        print(f"Followers: {user.followers_count}")
        
        # Add follower entry
        data["followers"].append({
            "date": datetime.now().isoformat(),
            "count": user.followers_count
        })
        
        # Get tweets
        print("Fetching tweets...")
        tweets = await client.get_user_tweets(user.id, count=100)
        
        # Handle pagination
        all_tweets = list(tweets) if tweets else []
        while tweets and hasattr(tweets, 'next_cursor') and tweets.next_cursor:
            try:
                tweets = await client.get_user_tweets(user.id, count=100, cursor=tweets.next_cursor)
                all_tweets.extend(tweets)
            except:
                break
        
        print(f"Fetched {len(all_tweets)} tweets")
        
        # Process tweets
        existing_ids = {t.get('id') for t in data["tweets"]}
        
        for tweet in all_tweets:
            if tweet.id not in existing_ids:
                tweet_data = {
                    "id": tweet.id,
                    "created_at": tweet.created_at.isoformat() if hasattr(tweet, 'created_at') and tweet.created_at else None,
                    "text": tweet.text if hasattr(tweet, 'text') else str(tweet),
                    "likes": tweet.favorite_count if hasattr(tweet, 'favorite_count') else 0,
                    "retweets": tweet.retweet_count if hasattr(tweet, 'retweet_count') else 0,
                    "replies": tweet.reply_count if hasattr(tweet, 'reply_count') else 0,
                    "impressions": tweet.view_count if hasattr(tweet, 'view_count') else 0,
                }
                data["tweets"].append(tweet_data)
                existing_ids.add(tweet.id)
        
        # Save cookies for future use
        try:
            cookies = client.get_cookies()
            with open(COOKIES_FILE, 'w') as f:
                json.dump(cookies, f)
            print("Cookies saved")
        except:
            pass
        
        return data
        
    except ImportError:
        print("Error: twikit not installed. Run: pip install twikit")
        return data
    except Exception as e:
        print(f"Error with twikit: {e}")
        import traceback
        traceback.print_exc()
        return data


def generate_weekly_report(data):
    """Generate weekly engagement report"""
    now = datetime.now()
    week_ago = now - timedelta(days=7)
    
    # Filter tweets from last week
    weekly_tweets = []
    for tweet in data.get("tweets", []):
        if tweet.get("created_at"):
            try:
                created = datetime.fromisoformat(tweet["created_at"])
                if created >= week_ago:
                    weekly_tweets.append(tweet)
            except:
                pass
    
    # Calculate weekly stats
    total_impressions = sum(t.get("impressions", 0) for t in weekly_tweets)
    total_likes = sum(t.get("likes", 0) for t in weekly_tweets)
    total_retweets = sum(t.get("retweets", 0) for t in weekly_tweets)
    total_replies = sum(t.get("replies", 0) for t in weekly_tweets)
    
    # Follower growth
    follower_history = data.get("followers", [])
    current_followers = follower_history[-1]["count"] if follower_history else 0
    previous_followers = follower_history[-2]["count"] if len(follower_history) > 1 else current_followers
    follower_growth = current_followers - previous_followers
    
    # Engagement rates
    engagement_rate = calculate_engagement_rate(total_impressions, total_likes, total_retweets, total_replies)
    per_follower_engagement = calculate_per_follower_engagement(total_likes, total_retweets, total_replies, current_followers)
    
    # Top tweets
    for tweet in weekly_tweets:
        tweet["total_engagement"] = tweet.get("likes", 0) + tweet.get("retweets", 0) + tweet.get("replies", 0)
    
    top_tweets = sorted(weekly_tweets, key=lambda t: t.get("total_engagement", 0), reverse=True)[:5]
    
    report = {
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
    
    return report


def generate_markdown_report(report, handle=TWITTER_HANDLE):
    """Generate markdown formatted report"""
    md = f"""# 📊 @{handle} Weekly Engagement Report

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


def get_all_time_stats(data):
    """Get all-time statistics"""
    all_tweets = data.get("tweets", [])
    
    total_likes = sum(t.get("likes", 0) for t in all_tweets)
    total_retweets = sum(t.get("retweets", 0) for t in all_tweets)
    total_replies = sum(t.get("replies", 0) for t in all_tweets)
    total_impressions = sum(t.get("impressions", 0) for t in all_tweets)
    
    follower_history = data.get("followers", [])
    current_followers = follower_history[-1]["count"] if follower_history else 0
    
    return {
        "total_tweets": len(all_tweets),
        "total_likes": total_likes,
        "total_retweets": total_retweets,
        "total_replies": total_replies,
        "total_impressions": total_impressions,
        "current_followers": current_followers
    }


async def main():
    parser = argparse.ArgumentParser(description='Twitter Engagement Report Tool')
    parser.add_argument('--demo', action='store_true', help='Run in demo mode with sample data')
    args = parser.parse_args()
    
    print(f"Twitter Engagement Report Tool for @{TWITTER_HANDLE}")
    print("="*50)
    
    # Load existing data
    data = load_data()
    
    if args.demo:
        # Run demo/sample mode
        print("Running in DEMO mode...")
        import generate_sample
        data = generate_sample.generate_sample_data()
        save_data(data)
    else:
        print(f"Loaded existing data: {len(data.get('tweets', []))} tweets, {len(data.get('followers', []))} follower records")
        
        # Try to fetch new data
        data = await fetch_with_twikit(data)
        
        # Save updated data
        save_data(data)
    
    # Generate weekly report
    report = generate_weekly_report(data)
    
    # Print markdown report
    print("\n" + "="*50)
    print("WEEKLY REPORT")
    print("="*50)
    md_report = generate_markdown_report(report)
    print(md_report)
    
    # Save report
    report_file = OUTPUT_DIR / "weekly_report.md"
    with open(report_file, 'w') as f:
        f.write(md_report)
    print(f"\nReport saved to: {report_file}")
    
    # Also save JSON report for programmatic use
    json_report_file = OUTPUT_DIR / "weekly_report.json"
    with open(json_report_file, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    print(f"JSON report saved to: {json_report_file}")
    
    # Print all-time stats
    print("\n" + "="*50)
    print("ALL-TIME STATS")
    print("="*50)
    stats = get_all_time_stats(data)
    for key, value in stats.items():
        print(f"{key}: {value:,}")
    
    print("\n✓ Report generation complete!")


if __name__ == "__main__":
    asyncio.run(main())
