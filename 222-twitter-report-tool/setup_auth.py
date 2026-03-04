#!/usr/bin/env python3
"""
Setup script to authenticate with Twitter and save cookies for twikit.
Run this once to generate cookies.json that twitter_report.py can use.
"""

import asyncio
import json
from pathlib import Path
from twikit import Client

COOKIES_FILE = Path(__file__).parent / "data" / "cookies.json"

async def main():
    print("Twitter Authentication Setup")
    print("="*50)
    print("\nTo use twikit, you need to provide Twitter credentials.")
    print("Options:")
    print("1. Username and Password (requires 2FA if enabled)")
    print("2. Load existing cookies")
    print("\nNote: For production, consider using Twitter API instead.")
    print("\nAlternatively, you can manually export Twitter cookies")
    print("from your browser and save to:", COOKIES_FILE)
    print("\nCookie format should be a JSON dict with keys like:")
    print('{"auth_token": "...", "ct0": "..."}')
    
    # Try loading existing cookies
    if COOKIES_FILE.exists():
        print(f"\nFound existing cookies at {COOKIES_FILE}")
        with open(COOKIES_FILE, 'r') as f:
            cookies = json.load(f)
        print(f"Cookies loaded: {list(cookies.keys())}")
        
        # Try to use them
        client = Client()
        try:
            await client.login(cookies=cookies)
            print("✓ Cookies work! Authentication successful.")
            return True
        except Exception as e:
            print(f"✗ Cookies failed: {e}")
    
    print("\nTo get cookies manually:")
    print("1. Open twitter.com in your browser")
    print("2. Login to @owockibot account")
    print("3. Open Developer Tools (F12) -> Application -> Cookies")
    print("4. Export cookies as JSON and save to data/cookies.json")
    
    return False

if __name__ == "__main__":
    asyncio.run(main())
