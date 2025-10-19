# TODO

- [x] Evaluate backend runtime options and select MVP target (Workers vs Node).
- [x] Update README to reflect the chosen runtime and remove conflicting guidance.
- [x] Update PLAN.md with implementation steps for the selected backend approach.
- [x] Document fetch and cache workflow for the chosen platform (Workers APIs).
- [x] Document containerized service layout (frontend, backend, optional data stores) in PLAN.md.
- [x] Specify development container settings (ports, volumes, env vars) mirroring production assumptions.
- [x] Describe developer tooling expectations (e.g., hot reload) when running in containers.
- [ ] Scaffold docker/dev environment files and directories.
  - [ ] Create a top-level `docker/` folder (if missing) and add a `docker-compose.dev.yml` scaffold.
  - [ ] Add placeholder service stubs for frontend/backend images with comments describing build contexts.
- [ ] Define docker-compose.dev services with local bind mounts and dev commands.
  - [ ] Configure bind mounts for source directories to enable hot reload (e.g., `./app:/usr/src/app`).
  - [ ] Specify development commands (npm/yarn dev scripts) and shared environment (ports, restart policies).
- [ ] Configure development environment variables and gitignore entries.
  - [ ] Reference `.env.development` in compose env_file entries but ensure it remains excluded via `.gitignore` updates.
  - [ ] Document fallback defaults for critical vars inside compose or README comments.
- [ ] Document verification steps and update review notes after implementation.
  - [ ] Outline manual test steps (compose up, service health checks, hot reload) in README or docs.
  - [ ] Summarize results in the `## Review` section once tasks complete.

## Review
- Chose Cloudflare Workers + KV as the MVP backend target and updated README/PLAN with Worker-specific architecture, deployment, and cache flow details.
- Added containerized development plan covering service composition, shared networking, environment parity, and hot-reload tooling expectations.
