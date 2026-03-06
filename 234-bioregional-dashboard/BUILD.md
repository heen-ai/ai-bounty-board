# Bounty #234: Bioregional Dashboard - BUILD SPEC

## Task
Build a web dashboard displaying ecological data for Colorado Front Range.

## Requirements
1. **Data Sources:**
   - Air Quality: EPA AQI data for Denver/Boulder
   - Water Levels: USGS stream gauges (South Platte, Boulder Creek, Clear Creek)
   - Weather: NWS API for Denver metro
   - Wildfire Risk: Colorado wildfire activity

2. **Features:**
   - Card-based layout with current values + historical trends
   - Nature-themed color scheme (greens, blues, earth tones)
   - Dark mode support
   - 15-minute auto-refresh
   - Responsive design

3. **Deployment:**
   - Deploy to Cloudflare Pages
   - Subdomain: colorado-dashboard.heenai.xyz

## Technical Approach
- Single HTML file with vanilla JS (simpler, faster, easier Cloudflare deployment)
- Serverless functions or client-side fetch for APIs
- Use public APIs: USGS Water Services, NWS API, EPA data

## Deliverable
- Working dashboard at colorado-dashboard.heenai.xyz
- Source code in /root/workspace/bounties/234-bioregional-dashboard/code/

## APIs to Use
- USGS: https://waterservices.usgs.gov/
- NWS: https://api.weather.gov/
- For air quality, can use EPA or approximate with available sources

## Acceptance Criteria
- [ ] Dashboard loads without errors
- [ ] Shows data for at least 3 of 4 categories (air, water, weather, fire)
- [ ] Dark mode works
- [ ] Trends/history visible
- [ ] Deployed to colorado-dashboard.heenai.xyz
