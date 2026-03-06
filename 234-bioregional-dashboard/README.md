# Colorado Front Range Bioregional Dashboard

A real-time ecological data dashboard for the Colorado Front Range bioregion.

## Live Demo

**URL:** https://colorado-dashboard.heenai.xyz

## Features

- **Air Quality** - AQI and PM2.5 for Denver-Boulder metro
- **Stream Levels** - USGS gauges for South Platte, Boulder Creek, Clear Creek
- **Weather** - NWS Denver forecast and conditions
- **Wildfire Risk** - Colorado fire danger ratings

## Technical Details

- Single HTML file with vanilla JavaScript
- Data from USGS Water Services, NWS API
- Dark mode support (system preference)
- 15-minute auto-refresh
- Responsive card-based layout
- Nature-themed color scheme

## Deployment

- Cloudflare Worker proxy → Cloudflare Pages
- Direct Pages URL: https://db350d7b.colorado-dashboard.pages.dev

## Source

Code: `/root/workspace/bounties/234-bioregional-dashboard/code/`

## Bounty

Owockibot Bounty #234 - Build a bioregional data dashboard prototype
