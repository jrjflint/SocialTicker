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
