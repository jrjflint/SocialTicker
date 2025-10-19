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

The MVP targets a Cloudflare Worker backend that manages Instagram API access and caching to respect rate limits while keeping the frontend lightweight.

- Frontend (browser)
  - Full-screen web app optimized for large displays
  - Polls the Worker endpoint frequently (e.g., every 5–8s) for a cached follower total
  - Animates deltas, renders QR code, applies theme

- Backend (Cloudflare Worker)
  - Uses a scheduled Cron Trigger to refresh the follower total no more than every 30 seconds (≥18-second minimum) to honor API rate limits
  - Stores the latest totals and metadata in Cloudflare KV with a default 90-second TTL and writes the refresh timestamp alongside the payload
  - Serves `/api/metrics` via the Worker fetch handler, returning the cached metrics, profile metadata, last refresh timestamp, and stale indicators when needed

### Worker Fetch & Cache Flow

1. **Scheduled refresh**
   - A Cron Trigger invokes the Worker on a configured cadence (≥30 seconds).
   - The Worker fetches the Instagram follower total (or alternate provider) using secrets injected via `wrangler`.
   - The response is validated and written to Cloudflare KV under a deterministic key with metadata `{ total, profile, refreshedAt }`.
2. **Cache serving**
   - The `fetch()` handler responds to `/api/metrics`.
   - It reads the KV entry; if missing or stale (older than `CACHE_TTL_SECONDS`), it triggers a background refresh via `ctx.waitUntil()` while returning the last known value with `stale: true`.
   - Successful reads return JSON including `total`, `profile`, `refreshedAt`, and `stale` status for the frontend to render gracefully.
3. **Error handling**
   - API failures store an error marker and preserve the previous total to avoid dropping to zero.
   - Logged errors are surfaced through Cloudflare's observability tooling for follow-up.

Note on rate limits: The UI may refresh every few seconds, but actual API calls should occur server-side at a much lower rate and be served from a cache. See `QUESTIONS.md` for known constraints and tradeoffs.

## Getting Started

This repository currently contains product docs and scaffolding. Code is forthcoming. The steps below outline the intended setup once the implementation lands.

### Prerequisites
- Node.js 18+ and npm/pnpm (for local Worker development tooling)
- Cloudflare account with Workers, KV, and Cron Triggers enabled
- An Instagram Business account and Graph API access, or a third-party data source

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

Use `.env.development.example` as a starting point when creating your local `.env.development` file.

## Running locally with Docker Compose

### Prerequisites
- Docker Desktop 4.x+ (macOS/Windows) or Docker Engine 20.10+ with Compose v2 (Linux)
- Cloned repository with access to `docker-compose.dev.yml` and the service Dockerfiles
- A `.env.development` file (copy from `.env.development.example`) that mirrors the keys listed above; never commit secrets to the repo

### Start services
Build fresh images and launch the development stack:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This command builds each service declared in `docker-compose.dev.yml`, loads environment variables from the referenced `env_file` entries (for example, `.env.development`), and starts the containers with shared networking for hot reload and API access. The compose build contexts assume the frontend and backend live under `docker/frontend` and `docker/backend`, so run the command from the repository root.

### Stop, logs, and teardown
- **Stop containers without removing resources:**

  ```bash
  docker compose -f docker-compose.dev.yml stop
  ```

- **Tail logs for all services or a single service:**

  ```bash
  docker compose -f docker-compose.dev.yml logs -f            # all services
  docker compose -f docker-compose.dev.yml logs -f frontend   # specific service
  ```

- **Remove containers, networks, and anonymous volumes:**

  ```bash
  docker compose -f docker-compose.dev.yml down -v
  ```

Running `down -v` ensures transient caches or database volumes are reset between test runs. Omit `-v` if you want to preserve state.

### Environment variables
Each service in `docker-compose.dev.yml` should load shared settings via `env_file` entries that point at `.env.development`. Copy `.env.development.example` to `.env.development` and populate it with API tokens, Cloudflare credentials, and UI configuration. Compose reads the file at runtime, so updates take effect after restarting the affected service. Keep secret values out of version control by listing the file in `.gitignore`.

If you do not provide overrides in `.env.development`, the compose file falls back to sensible defaults:
- `FRONTEND_PORT` → defaults to `5173`, matching the Vite dev server.
- `WORKER_DEV_PORT` → defaults to `8787`, matching the Wrangler dev tunnel used by the backend.
- `VITE_API_BASE_URL` → defaults to `http://localhost:8787` so the frontend proxy resolves to the local Worker dev server.

Adjust these values in your `.env.development` when port conflicts arise or when you expose the API through a tunnel.

### Integrating Cloudflare Tunnel
After the stack is running locally, expose the frontend or API through Cloudflare Tunnel to test remote displays:

```bash
# One-off tunnel pointing to the frontend dev server on port 3000
cloudflared tunnel --url http://localhost:3000

# Or run a named tunnel configured in your cloudflared.yml
cloudflared tunnel run social-ticker-dev
```

Ensure the tunnel is authenticated with your Cloudflare account before starting it. Once connected, share the generated public URL with collaborators or devices that need to access the ticker securely without opening firewall ports.

### Repository Structure (planned)
- `docker/frontend/` — web app (UI, theming, QR rendering)
- `docker/backend/worker/` — Cloudflare Worker source, KV bindings, scheduled logic
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

- **Cloudflare Workers (MVP target)**
  - Bind a KV namespace (e.g., `SOCIAL_TICKER_CACHE`) and Cron Trigger in `wrangler.toml`.
  - Run `wrangler dev` locally to iterate on the Worker and frontend in tandem.
  - Deploy with `wrangler publish`, ensuring secrets (`IG_ACCESS_TOKEN`, etc.) are stored via `wrangler secret put`.

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

