## 2025-10-20

### Added
- Cloudflare Worker endpoint `/api/followers/instagram/:handle` with KV-backed caching, Instagram web profile fetching, and CORS headers for the frontend ticker.
- Frontend polling script that displays the live follower total, connection health, and countdown timers for `@jamesfollent`.
- QR module rendering a generated code that links directly to `https://www.instagram.com/jamesfollent`.

### Changed
- Updated prototype layout copy and status pill to reflect the James Follent profile and dynamic connection states.

### Fixed
- Handled stale cache fallbacks with descriptive alerts when Instagram responses fail or lag.

## 2025-10-19

### Added
- Docker Compose development stack scaffolding to streamline local multi-service workflows.
- Dedicated development Dockerfiles for the frontend and backend services with multi-stage builds and documented configuration options.

### Changed
- Relocated frontend and backend source directories beneath `docker/` to simplify container build contexts and align tooling paths.

### Documentation
- Expanded README guidance covering Docker Compose usage, environment variables, Cloudflare Tunnel integration, and the reorganized repository layout.
