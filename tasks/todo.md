# TODO

- [x] Evaluate backend runtime options and select MVP target (Workers vs Node).
- [x] Update README to reflect the chosen runtime and remove conflicting guidance.
- [x] Update PLAN.md with implementation steps for the selected backend approach.
- [x] Document fetch and cache workflow for the chosen platform (Workers APIs).
- [x] Document containerized service layout (frontend, backend, optional data stores) in PLAN.md.
- [x] Specify development container settings (ports, volumes, env vars) mirroring production assumptions.
- [x] Describe developer tooling expectations (e.g., hot reload) when running in containers.
- [x] Scaffold docker/dev environment files and directories.
  - [x] Create a top-level `docker/` folder (if missing) and add a `docker-compose.dev.yml` scaffold.
  - [x] Add placeholder service stubs for frontend/backend images with comments describing build contexts.
- [x] Define docker-compose.dev services with local bind mounts and dev commands.
  - [x] Configure bind mounts for source directories to enable hot reload (e.g., `./app:/usr/src/app`).
  - [x] Specify development commands (npm/yarn dev scripts) and shared environment (ports, restart policies).
- [x] Configure development environment variables and gitignore entries.
  - [x] Reference `.env.development` in compose env_file entries but ensure it remains excluded via `.gitignore` updates.
  - [x] Document fallback defaults for critical vars inside compose or README comments.
- [x] Planning: Docker Compose development scaffolding updates.
  - [x] Inspect existing frontend/backend directory layout for mount targets and entry commands.
  - [x] Determine shared networks, volumes, and environment defaults required for dev services.
  - [x] Outline documentation updates needed to explain environment variables and verification steps.
- [x] Document verification steps and update review notes after implementation.
  - [x] Outline manual test steps (compose up, service health checks, hot reload) in README or docs.
  - [x] Summarize results in the `## Review` section once tasks complete.
- [x] Plan Docker development scaffolding updates for frontend and backend services.
  - [x] Review existing repository structure for frontend/backend placement and compose expectations.
  - [x] Determine required Dockerfile.dev stages, dependencies, and working directories.
- [x] Implement Dockerfile.dev scaffolding for frontend and backend.
  - [x] Create `frontend/Dockerfile.dev` with builder/runtime stages and development-friendly configuration.
  - [x] Create `backend/Dockerfile.dev` mirroring the development workflow requirements.
- [x] Document key configuration choices.
  - [x] Add inline comments about Node versions and build arguments to each Dockerfile for reproducibility.
- [x] Document Docker Compose development workflow in README.
  - [x] Outline prerequisites and environment variable management expectations for local containers.
  - [x] Describe start, stop, log, and teardown commands for docker compose usage.
  - [x] Provide guidance for integrating Cloudflare Tunnel once services are running.

## Review
- Chose Cloudflare Workers + KV as the MVP backend target and updated README/PLAN with Worker-specific architecture, deployment, and cache flow details.
- Added containerized development plan covering service composition, shared networking, environment parity, and hot-reload tooling expectations.
- Scaffolded frontend and backend development Dockerfiles with documented build arguments and multi-stage workflows.
- Documented Docker Compose usage, lifecycle commands, environment variable handling, and Cloudflare Tunnel integration guidance in the README.
- Added docker-compose.dev scaffold with hot-reload mounts, dev commands, and environment fallbacks alongside `.gitignore` protections for local secrets.
- Relocated frontend and backend source directories under `docker/` and updated compose contexts, documentation, and ignore rules to match the new structure.
- Logged the 2025-10-19 changelog entry covering Docker Compose scaffolding, development Dockerfiles, repository reorganization, and expanded documentation guidance.


## Reorganization Tasks

- [x] Plan backend/frontend relocation into docker-scoped directories.
  - [x] Inventory files referencing ./frontend or ./backend paths.
  - [x] Decide target directory names inside ./docker/ for source and config assets.
- [x] Migrate frontend and backend source trees beneath ./docker/ with minimal path disruption.
  - [x] Move existing directories and ensure .gitignore or tooling expectations still hold.
- [x] Update Docker development tooling to match new locations.
  - [x] Adjust docker-compose.dev.yml build contexts, mounts, and commands.
  - [x] Update Dockerfile paths or other scripts that assume old locations.
- [x] Refresh documentation and repository references for the new structure.
  - [x] Revise README and docker/README to describe new layout and usage instructions.
- [x] Document verification steps and summarize results in Review section.

## Changelog Update 2025-10-19

- [x] Review recent commits and repository changes to capture today's accomplishments.
- [x] Draft concise changelog entry for the latest work.
- [x] Update `CHANGELOG.md` with the new entry under the appropriate date.
- [x] Summarize the outcome in the `## Review` section after completion.
