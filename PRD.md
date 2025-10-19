# Product Requirements Document: Social Ticker

## Overview
Social Ticker is a browser-based digital counter that showcases an Instagram account's live follower count alongside branding elements such as a QR code for quick access to the profile. The experience should be visually engaging for display screens at events, retail locations, and studios.

## Objectives
- Provide a near real-time reflection of an Instagram profile's follower count.
- Present a polished visual layout suitable for large displays.
- Encourage audience engagement by making it effortless to visit the associated Instagram profile.

## Key Features
1. **Real-Time Follower Count**
   - Poll the Instagram API or a proxy data source at a configurable interval managed by the backend scheduler.
   - The backend must refresh the follower total no more frequently than every 30 seconds (or via an equivalent cron job) to remain safely within API quotas while still supporting responsive UI updates.
   - The frontend polls the cache-backed endpoint frequently (e.g., every 5–8 seconds) to animate changes without hitting the upstream API directly.
   - Smoothly animate changes to the follower total to avoid abrupt jumps.
2. **Profile Identity Module**
   - Display the Instagram handle, profile image, and optional tagline.
   - Allow customization of accent colors and typography to match branding.
3. **QR Code Linkout**
   - Generate and render a QR code that deep links to the Instagram profile.
   - Include short instructions prompting viewers to scan the code.
4. **Display-Ready Layout**
   - Offer preset themes optimized for different screen orientations (landscape and portrait).
   - Provide controls for toggling modules (e.g., hide QR code, show follower delta, etc.).

## Data Refresh & Caching
- A lightweight backend job (cron trigger, scheduled worker, or queue) retrieves the Instagram follower total at a cadence of 30 seconds or slower (≥18 seconds minimum) to respect rate limits.
- Retrieved totals are persisted to a managed cache store (Cloudflare KV/Durable Object, Redis, or an equivalent key-value store) with a default TTL of 90 seconds so the UI can read without repeatedly hitting the API.
- The backend exposes a cache-backed endpoint (e.g., `/api/metrics`) returning the most recent follower total and timestamp metadata so the UI can detect staleness.
- Frontend clients continue polling the cached endpoint on a short interval for smooth visuals without increasing upstream load.

## Success Metrics
- Accurate follower counts within ±1% of the live total.
- Visual latency under two seconds after each data refresh.
- Successful QR code scans during pilot deployments.

## Acceptance Criteria
- When the cache is fresh (timestamp within TTL), the UI renders the follower total, profile module, and QR code without errors.
- If the cache is older than its TTL, the UI displays the last-known total with a "stale" or "offline" indicator and reduces animation to avoid misleading viewers, while logging an alert for operators.
- When the backend encounters API quota errors, it retains the previous cached total, surfaces an error flag in the API response, and the UI shows the degraded state message without crashing.
- Scheduled refresh jobs can be configured for different hosting targets (e.g., cron trigger, worker schedule) while maintaining the minimum ≥18-second fetch separation.

## Constraints & Assumptions
- Initial release targets modern Chromium-based browsers running on dedicated displays.
- Instagram data access may require third-party services due to API limitations.
- Network interruptions should not crash the display; fallback UI states are required.

## Future Enhancements (Out of Scope)
- Support for additional social networks beyond Instagram.
- Historical analytics dashboards.
- Native mobile or desktop applications.
