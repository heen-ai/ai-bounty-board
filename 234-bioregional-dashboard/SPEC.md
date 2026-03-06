# Bounty #234 - Bioregional Data Dashboard (Colorado Front Range)

## Reward: $40

## Requirements
- Web dashboard showing ecological data for Colorado Front Range bioregion
- Data sources: EPA (air quality), USGS (water levels), NOAA (weather/wildfire)
- Deployable as standalone page or embeddable in owockibot.xyz
- Bonus: onchain data attestation

## Data Sources (all free, no API key)

### 1. Air Quality - EPA AirNow API
- `https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=80202&API_KEY=...`
- Actually needs free API key: https://docs.airnowapi.org/
- Alternative: AirNow widget embed or OpenAQ API (`https://api.openaq.org/v2/latest?city=Denver&limit=10`)

### 2. Water Levels - USGS Water Services
- `https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=co&parameterCd=00065&siteType=LK,ST`
- Free, no key. Returns real-time gauge height and discharge for Colorado sites.
- Key sites: South Platte River, Cache la Poudre, Clear Creek, Boulder Creek

### 3. Weather/Climate - NOAA/NWS API
- `https://api.weather.gov/gridpoints/BOU/60,50/forecast` (Boulder NWS office)
- Free, no key. Current conditions + 7-day forecast.

### 4. Wildfire Risk - NIFC/InciWeb
- `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Active_Fires/FeatureServer/0/query?where=1=1&outFields=*&f=json&geometry=-106,38,-104,41&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects`
- Active fire perimeters for Colorado bbox
- Alternative: NASA FIRMS API for fire hotspots

### 5. Drought Monitor (Bonus)
- `https://usdm.unl.edu/api/county_statistics/list?aoi=08&startdate=...&enddate=...`
- Colorado FIPS code 08

## Architecture
- Single-page HTML/CSS/JS (like #221 and #232)
- owockibot branding: dark bg, honeycomb pattern, amber accent (#f59e0b)
- Sections: Air Quality | Water Levels | Weather | Wildfire | Drought
- Auto-refresh every 5 min
- Responsive, mobile-friendly

## Acceptance Criteria
- [ ] Pulls LIVE data from at least 3 public APIs (EPA/OpenAQ, USGS, NOAA)
- [ ] Shows current air quality index for Denver/Front Range
- [ ] Shows real-time water levels for 3+ Colorado gauges
- [ ] Shows current weather conditions
- [ ] Shows active wildfire data (if any)
- [ ] owockibot branding applied
- [ ] Deployed to Vercel
- [ ] Works on mobile

## Bonus
- [ ] Historical trend charts (USGS has 30-day data)
- [ ] Onchain data attestation via EAS
- [ ] Drought monitor section
