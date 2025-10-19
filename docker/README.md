# Docker Assets

This directory now houses all container-specific assets:

- `frontend/` — Vite development Dockerfile and UI source tree
- `backend/` — Wrangler development Dockerfile and Worker sources
- Compose overrides, shared scripts, and container documentation

Keep environment-specific secrets in local `.env` files referenced by `docker-compose.dev.yml`; do not commit them to the repository.
