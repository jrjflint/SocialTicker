# Social Ticker

A browser-based, display-ready ticker that shows an Instagram account’s live follower count with smooth updates, profile branding, and a scannable QR code link to the profile. Designed for events, studios, and retail screens.

Status: MVP in planning. See `PRD.md` for product scope and `PLAN.md` for implementation milestones.

## Features
- Live follower count with smooth animation (near real-time)
- Profile identity module: handle, avatar, optional tagline
- QR code deep-link to the Instagram profile
- Display-ready themes for landscape/portrait, large type, high contrast
- Configurable layout: toggle modules, accent colors, typography

## Architecture Overview

The ticker is a web UI that pulls follower data from a lightweight backend which handles Instagram API access and caching to respect rate limits.

- Frontend (browser)
  - Full-screen web app optimized for large displays
  - Polls a backend endpoint frequently (e.g., every 5–8s) for a cached follower total
  - Animates deltas, renders QR code, applies theme

- Backend (data fetch + cache)
  - Runs a scheduled job (cron trigger, worker schedule, or queue) that refreshes the follower total no more than every 30 seconds (≥18-second minimum) to honor API rate limits
  - Persists the latest totals to a managed key-value cache such as Cloudflare KV/Durable Objects, Redis, or Supabase KV with a default 90-second TTL
  - Exposes a simple HTTPS endpoint returning the cached metrics, profile metadata, and the timestamp of the last refresh

Backend implementation options (choose one and keep hosting consistent):
- Cloudflare Workers (KV/Durable Objects + Cron Triggers) — edge runtime, no Node/Express
- Supabase Edge Functions — Deno-based runtime, similar constraints
- Node.js + Express (VM or container) — traditional server environment

Note on rate limits: The UI may refresh every few seconds, but actual API calls should occur server-side at a much lower rate and be served from a cache. See `QUESTIONS.md` for known constraints and tradeoffs.

## Getting Started

This repository currently contains product docs and scaffolding. Code is forthcoming. The steps below outline the intended setup once the implementation lands.

### Prerequisites
- Node.js 18+ and npm/pnpm (for local dev)
- An Instagram Business account and Graph API access, or a third-party data source
- For edge deployments: Cloudflare account (Workers + KV/Durable Objects) or Supabase project

### Environment Variables (planned)
Create a `.env` (or platform-specific secrets) with:

```
# Instagram Graph API (if using Business Discovery)
IG_BUSINESS_ID=
IG_ACCESS_TOKEN=

# Caching & polling
CACHE_TTL_SECONDS=90           # backend cache TTL (should exceed refresh cadence)
FRONTEND_POLL_INTERVAL_MS=5000 # UI refresh; reads cached data

# Profile & theming
PROFILE_HANDLE=@yourhandle
PROFILE_URL=https://instagram.com/yourhandle
ACCENT_COLOR=#ff4d4d
THEME=dark                     # dark | light | high-contrast
```

### Repository Structure (planned)
- `frontend/` — web app (UI, theming, QR rendering)
- `backend/` — Worker/Edge Function/Express server (choose one)
- `public/` — static assets and default themes
- `docs/` — additional documentation and screenshots

## Usage (planned)
- Start backend to serve `/api/metrics` with cached follower total
- Start frontend dev server and open full-screen in a Chromium browser
- Configure theme, toggles (e.g., QR on/off), and refresh interval

## Configuration
- Polling strategy
  - UI polling: frequent (e.g., every 5–8s) against the cached endpoint for smooth visuals
  - Backend fetch: scheduled refresh every 30s or slower (≥18s) that updates the cache without exceeding quotas
- Fallback states
  - Gracefully handle network errors and API timeouts
  - Display last-known value and a subtle “offline” indicator when the cache is stale
  - Surface API quota or refresh errors by flagging the response and retaining the previous cached total
- Theming
  - Accent color, typography scale, and theme preset
  - Portrait/landscape layout presets

## Deployment

Pick one path and keep the runtime consistent with your hosting target.

- Cloudflare Workers
  - Use KV for cached metrics and a Cron Trigger to refresh
  - Expose `/api/metrics` returning cached follower count + profile
  - Deploy with `wrangler`

- Node.js + Express (VM/Container)
  - Run a scheduler (cron/worker) to refresh cache (memory/Redis)
  - Expose `/api/metrics` and serve the frontend
  - Deploy via Docker or your preferred platform

- Supabase Edge Functions
  - Similar to Workers; use a scheduled job or external scheduler
  - Store cached values in Postgres or KV-like storage

## Limitations & Notes
- Instagram’s API access and quotas constrain “real-time” behavior. Favor caching to avoid throttling.
- Visual updates can be frequent even if the source data updates less often.
- If you cannot use the Business Discovery API, use a compliant third-party provider and document its quotas.

## Roadmap
- Additional social networks (out of scope for MVP)
- Historical analytics and dashboards
- Native desktop/mobile companion apps

## Contributing
- Follow Conventional Commits and keep changes atomic
- Align with `PRD.md` and use `CHANGELOG.md` for user-visible changes
- Open questions or tradeoffs in `QUESTIONS.md`

## License
TBD

