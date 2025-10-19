# Implementation Plan

## Backend Runtime Decision
- Adopt Cloudflare Workers as the MVP backend runtime.
- Use Cloudflare KV for cached follower metrics and metadata.
- Schedule refreshes with a Worker Cron Trigger (≥30s cadence) and leverage `ctx.waitUntil()` for async cache writes.

## Milestones

1. **Scaffold Worker Project**
   - Initialize `backend/worker/` with `wrangler.toml`, TypeScript Worker entry, and KV binding (`SOCIAL_TICKER_CACHE`).
   - Configure environment variables through `wrangler secret` for Instagram credentials and runtime tuning (TTL, refresh cadence).

2. **Implement Data Refresh Job**
   - Add scheduled event handler to fetch follower totals using the Instagram Graph API or configured provider.
   - Validate payloads, coerce to numeric totals, and persist `{ total, profile, refreshedAt }` in KV.
   - Record failure metadata (error code, timestamp) to support degraded responses.

3. **Serve Cached Metrics**
   - Implement `fetch()` handler that reads KV, returns JSON payload, and sets cache-control headers for browsers.
   - Detect stale or missing cache entries and trigger a background refresh via `ctx.waitUntil()` while returning last-known data.
   - Include status flags (`stale`, `error`) in the response for frontend UX adjustments.

4. **Observability & Hardening**
   - Add structured logging for refresh attempts and responses.
   - Integrate alerting hooks (e.g., Slack, email) once quota/latency thresholds are exceeded.
   - Document rollback steps and manual cache invalidation procedures.

5. **Frontend Integration**
   - Build API client in the frontend to poll `/api/metrics`, interpret stale/error flags, and update the ticker UI smoothly.
   - Expose configuration for poll interval and fallback messaging in UI settings.

## Deployment Checklist
- Bind KV namespace and schedule in `wrangler.toml` for production and preview environments.
- Automate `wrangler publish` via CI once tests pass.
- Document secret management and rotation cadence for Instagram tokens.

## Containerized Development Environment

### Shared Network
- Create a user-defined bridge network named `socialticker-dev-net` so containers resolve each other by service name and mimic the private networking used in production platform clusters.

### Service Inventory
- **frontend**
  - Image: `node:18-alpine` with project dependencies installed.
  - Command: `npm run dev -- --host 0.0.0.0 --port 5173` for Vite-powered hot reload.
  - Ports: `5173:5173` (host→container) to expose the preview UI in the browser.
  - Volumes: bind mount `./frontend` to `/app` to share live code edits; mount `node_modules` as an anonymous volume to avoid host pollution.
  - Environment:
    - `VITE_API_BASE_URL=http://backend:8787/api` routes browser requests to the Worker emulator.
    - `VITE_POLL_INTERVAL_MS=15000` aligns with planned production polling defaults.
- **backend**
  - Image: `node:18-alpine` with Wrangler CLI installed (`npm install -g wrangler`).
  - Command: `wrangler dev --local --persist-to=./.wrangler/state --ip 0.0.0.0 --port 8787` to emulate the Worker locally and persist KV state.
  - Ports: `8787:8787` to surface the Worker preview API on the host.
  - Volumes: bind mount `./backend/worker` to `/app` for live code reload; persist `.wrangler/state` via a named volume (`wrangler-state`) so KV cache survives restarts.
  - Environment:
    - `CF_ACCOUNT_ID`, `CF_API_TOKEN` (scoped to Workers dev) emulate production auth expectations.
    - `INSTAGRAM_ACCESS_TOKEN` provides API access in both dev and prod.
    - `CACHE_TTL_SECONDS=60` mirrors production cache policy for parity.
    - `SOCIAL_TICKER_CACHE_REDIS=redis://redis:6379/0` toggles optional Redis usage when enabled.
- **redis** (optional local KV surrogate)
  - Image: `redis:7-alpine`.
  - Command: default server.
  - Ports: no host exposure by default; optionally `6379:6379` for debugging with CLI tools.
  - Volumes: named volume `redis-data` for persistence across container restarts.
  - Environment: none required; `redis` service name resolves inside the network for backend access.

### Developer Tooling Inside Containers
- **Frontend hot reload**: Vite watches the bind-mounted `./frontend` directory; file edits trigger automatic browser refresh via WebSocket on port 5173 without additional setup.
- **Backend live reload**: `wrangler dev` restarts the Worker when files under `/app/src` change. Persisted KV data in `wrangler-state` keeps the cache warm during restarts.
- **Shared `.env` management**: Use a `.env.development` file stored outside version control and injected via `env_file` in `docker-compose.yml` so secrets load consistently between developers.
- **CLI access**: Developers can run `docker compose exec frontend npm test` or `docker compose exec backend npm run lint` for isolated tooling that respects container dependencies.
- **Optional Redis tooling**: Attach with `docker compose exec redis redis-cli` to inspect cached payloads when debugging cache behavior.
