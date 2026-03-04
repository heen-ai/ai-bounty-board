
import json
from pathlib import Path

NETSCAPE_COOKIES_FILE = Path(__file__).parent / "data" / "cookies.txt"
JSON_COOKIES_FILE = Path(__file__).parent / "data" / "cookies.json"

def convert_netscape_to_specific_json(netscape_file: Path, json_file: Path):
    auth_token = None
    ct0 = None
    
    with open(netscape_file, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            parts = line.split('	')
            if len(parts) >= 7:
                # Standard Netscape format
                name = parts[5]
                value = parts[6]
                if name == 'auth_token':
                    auth_token = value
                elif name == 'ct0':
                    ct0 = value
            elif len(parts) >= 6: # Handle cases where flag might be missing
                # Attempt to extract name/value from common positions
                name = parts[4] # Usually 5th element is name for 6-part
                value = parts[5] # Usually 6th element is value for 6-part
                if name == 'auth_token':
                    auth_token = value
                elif name == 'ct0':
                    ct0 = value

    output_cookies = {}
    if auth_token:
        output_cookies['auth_token'] = auth_token
    if ct0:
        output_cookies['ct0'] = ct0

    if output_cookies:
        with open(json_file, 'w') as f:
            json.dump(output_cookies, f, indent=2)
    else:
        print("No auth_token or ct0 found in the Netscape cookies.")
        # Ensure an empty JSON file is still created to avoid further errors
        with open(json_file, 'w') as f:
            json.dump({}, f)

if __name__ == "__main__":
    if NETSCAPE_COOKIES_FILE.exists():
        print(f"Converting {NETSCAPE_COOKIES_FILE} to {JSON_COOKIES_FILE} for specific tokens...")
        convert_netscape_to_specific_json(NETSCAPE_COOKIES_FILE, JSON_COOKIES_FILE)
        print("Conversion complete.")
    else:
        print(f"Error: {NETSCAPE_COOKIES_FILE} not found.")
