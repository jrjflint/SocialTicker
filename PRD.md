# Product Requirements Document: Social Ticker

## Overview
Social Ticker is a browser-based digital counter that showcases an Instagram account's live follower count alongside branding elements such as a QR code for quick access to the profile. The experience should be visually engaging for display screens at events, retail locations, and studios.

## Objectives
- Provide a near real-time reflection of an Instagram profile's follower count.
- Present a polished visual layout suitable for large displays.
- Encourage audience engagement by making it effortless to visit the associated Instagram profile.

## Key Features
1. **Real-Time Follower Count**
   - Poll the Instagram API or a proxy data source at a configurable interval.
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

## Success Metrics
- Accurate follower counts within ±1% of the live total.
- Visual latency under two seconds after each data refresh.
- Successful QR code scans during pilot deployments.

## Constraints & Assumptions
- Initial release targets modern Chromium-based browsers running on dedicated displays.
- Instagram data access may require third-party services due to API limitations.
- Network interruptions should not crash the display; fallback UI states are required.

## Future Enhancements (Out of Scope)
- Support for additional social networks beyond Instagram.
- Historical analytics dashboards.
- Native mobile or desktop applications.
