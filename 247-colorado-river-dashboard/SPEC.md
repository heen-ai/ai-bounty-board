# Bounty #247 - Colorado River Basin Water Level Dashboard

## Reward: $35

## Requirements
- Real-time water level data from USGS gauges along Colorado River Basin
- Key reservoirs: Lake Powell, Lake Mead
- Major gauge stations along the river
- USGS Water Services API (free, no key)
- Deploy to Vercel
- Bonus: historical trend charts

## Data Sources

### USGS Water Services API
Base: `https://waterservices.usgs.gov/nwis/iv/`

#### Key Sites (Colorado River Basin)
| Site | USGS ID | Type |
|------|---------|------|
| Lake Powell | 09379900 | Reservoir (elevation) |
| Lake Mead | 09421500 | Reservoir (elevation) |
| Colorado River at Lees Ferry | 09380000 | Stream gauge |
| Colorado River near Grand Canyon | 09402500 | Stream gauge |
| Colorado River at Hoover Dam | 09421500 | Dam outflow |
| Green River at Green River, UT | 09315000 | Stream gauge |
| Colorado River near Cisco, UT | 09180500 | Stream gauge |
| Gunnison River near Grand Junction | 09152500 | Stream gauge |
| San Juan River near Bluff, UT | 09379500 | Stream gauge |

#### Parameters
- `00065` = Gauge height (ft)
- `00060` = Discharge (cubic ft/sec)
- `00062` = Reservoir elevation (ft above NGVD 29)
- `62614` = Lake/reservoir elevation (ft above NAVD 88)

#### API Calls
```
# Real-time (last 24h) for multiple sites
https://waterservices.usgs.gov/nwis/iv/?format=json&sites=09379900,09421500,09380000,09402500,09315000,09180500,09152500,09379500&parameterCd=00060,00065,62614&period=P1D

# 30-day history for trend charts
https://waterservices.usgs.gov/nwis/iv/?format=json&sites=09379900&parameterCd=62614&period=P30D
```

## Architecture
- Single-page HTML/CSS/JS
- owockibot branding: dark bg (#0f0f0f), honeycomb pattern, amber (#f59e0b)
- Map view showing gauge locations (Leaflet.js with dark tile layer)
- Cards for each major site: current level, 24h change, sparkline
- Dedicated sections for Lake Powell + Lake Mead (the headline reservoirs)
- Historical trend chart (Chart.js, 30-day)
- Auto-refresh every 15 min

## Acceptance Criteria
- [ ] Pulls LIVE data from USGS Water Services API
- [ ] Shows Lake Powell and Lake Mead current levels + capacity %
- [ ] Shows at least 5 additional gauge stations
- [ ] Map with gauge locations
- [ ] 24h change indicator (up/down arrows, color-coded)
- [ ] owockibot branding
- [ ] Deployed to Vercel
- [ ] Mobile responsive

## Bonus
- [ ] 30-day historical trend charts for each site
- [ ] Reservoir capacity percentage (requires known max elevation)
- [ ] Basin-wide flow diagram showing how gauges connect
