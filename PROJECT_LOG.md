# PROJECT_LOG.md — Auth-Service Change Log

> Single source of truth for all changes. Update immediately after every change, then commit.

---

## Feature Roadmap

| Feature | Status | Notes |
|---------|--------|-------|
| JWT login + refresh | Done | `authentication/api.py`, `jwt_utils.py` (access 1h, refresh 7d) |
| HDMS service gating | Done | `login-hdms` endpoint + `HdmsRole` model |
| VMS service gating | Done | `b5c32c9` — dynamic service registry + `VmsRole` |
| Employee UUID lookup | Done | `05384c8` — `GET /employees/by-user/{user_id}` |
| Branch support on employees | Done | `9c38bc4` — Branch import fix, designation POST restored |
| Unified Docker compose | Done | `docker-compose.yml` at repo root, both containers on `erp_network` |
| Frontend API integration guide | Done | `FRONTEND_API_INTEGRATION_GUIDE.md` (1735 lines, per-page contract) |
| Next.js frontend pages | In progress | login, employees, institutions, branches, departments, designations, profile, audit-logs, settings scaffolded |
| Remove redundant FKs on `EmployeeAssignment` | **Planned** | See `authservice_architecture_report.md` §3 — drop `branch` + `institution`, derive via `designation.department.branch.institution` |
| OpenAPI → TS type generation | **Planned** | Exploit the monorepo layout; sync backend schemas into `frontend/src/types/` |
| Tighten CORS / ALLOWED_HOSTS for prod | **Planned** | Currently `*` — acceptable for dev, must gate before prod |
| Audit log UI wiring | **Planned** | `/api/audit/*` endpoints exist; frontend page is scaffold only |
| Content-Types-based `Department` parent | **Future** | Replace 3 nullable FKs (org/institution/branch) with Generic FK per arch report §4 |

---

## Change History

### 2026-04-21 (Phase 1 — Broken POST/PUT URLs + backend PUT /employees)

**Frontend URL fixes (5 files):**
- `employees/new/page.tsx:127` — `/branches?institution_code=...` → `/employees/branches?institution_code=...` (was missing the router prefix; dependent dropdown for branch selection was broken).
- `employees/new/page.tsx:232` — success redirect `/employees/employees` → `/employees` (double-prefix was a frontend route, not an API path).
- `employees/[id]/edit/page.tsx:198` — `` `employees/designations?...` `` → `` `/employees/designations?...` `` (missing leading slash meant relative URL).
- `employees/[id]/edit/page.tsx:257` — `` `employees/employees/${id}` `` → `` `/employees/${id}` `` (wrong path; now matches new backend `PUT /employees/{employee_id}`).
- `institutions/[id]/edit/page.tsx:53,104` + `institutions/[id]/page.tsx:35,59` — removed trailing slashes; standardized with rest of codebase (Django was 301-redirecting).
- `institutions/[id]/edit/page.tsx:111` + `institutions/[id]/page.tsx:61` — success redirect `/employees/institutions` → `/institutions` (wrong route).

**Backend — new endpoint:**
- `Backend/src/employees/api.py` — added `PUT /employees/{employee_id}` (`EmployeeUpdateSchema` + `update_employee`). All fields optional; CNIC uniqueness check excludes self; primary `EmployeeAssignment` updated in place if any assignment FK is provided; same Pydantic validators as create (CNIC, phone, email formats). Returns 400 with `field_errors` map for inline surfacing.

**Removed:**
- `frontend/src/app/settings/page.tsx` — deleted. Page was UI-only (buttons not wired), no API. Not linked from nav. User requested removal.

### 2026-04-21 (Soft-delete rule confirmed + saved to memory)
- Verified all DELETE endpoints in `Backend/src/employees/api.py` soft-delete (`is_deleted=True`). `SoftDeleteModel` in `employees/utils.py` provides `soft_delete()`, `restore()`, and a loud `hard_delete()` escape hatch. Only hard-deletes in codebase: `RefreshToken.cleanup_expired` (expired-token maintenance) and `scripts/test_auth_system.py` (test fixture reset) — both acceptable.
- Saved as durable user rule in `~/.claude/projects/.../memory/feedback_soft_delete.md`.

### 2026-04-21 (Claude Code init)
- **`CLAUDE.md`** (new) — Root assistant guide modelled on `HDMS/CLAUDE.md`. Documents role/tone, service-monorepo layout, backend + frontend dev commands, Django Ninja API surface, employee hierarchy, auth/JWT flow, and cross-project links to HDMS. Flags known gotchas: `/api/employees/employees` double-prefix (intentional), `CORS_ALLOW_ALL_ORIGINS` not prod-safe, `EmployeeAssignment` denormalization risk.
- **`PROJECT_LOG.md`** (new) — This file. Seeded Feature Roadmap from recent commits (VMS support, UUID lookup, Branch fix) and planned work from `authservice_architecture_report.md`.
- **Pointers:** `FRONTEND_API_INTEGRATION_GUIDE.md` designated as canonical frontend↔backend contract; `authservice_architecture_report.md` as the hierarchy audit reference.

### 2026-04-21 (Git sync — intern's work merged)
- **Fix:** Local `maryam` branch was tracking `origin/main` instead of `origin/maryam` — intern's commit `183c7af` (work-in-progress fixes) was never pulling. Merged `origin/maryam` into local `maryam` (non-fast-forward, merge commit `9d979bd`), preserving local commits `b5c32c9` (VMS) and `05384c8` (UUID lookup). Upstream reset to `origin/maryam`.

### 2026-04-16 to 2026-04-20 (pre-log commits — reconstructed from `git log`)
- `b5c32c9` — **feat(auth):** VMS service support added via dynamic service registry. `permissions.VmsRole` model + registration mirrors the HDMS pattern.
- `05384c8` — **feat:** `GET /api/employees/by-user/{user_id}` endpoint added for UUID-based employee lookup (needed by HDMS ticket-service to resolve requestor names from `user_uuid`).
- `9c38bc4` — **fix (backend, 3):** (1) missing `Branch` import that was crashing all branch endpoints, (2) removed duplicate `create_employee` route (kept the one with Branch support), (3) restored missing `POST /designations` endpoint.
- `19d5327` — **docs:** initial `FRONTEND_API_INTEGRATION_GUIDE.md` published for the frontend intern.
- `c006d84` — **feat:** unified auth-service deployment via root `docker-compose.yml`, added frontend `Dockerfile`, updated user authentication API response shape.

---

## Known Issues / Tech Debt

- **`EmployeeAssignment` carries redundant `branch` + `institution` FKs** — can produce "Impossible Assignments" where the assignment's branch disagrees with `designation.department.branch`. Fix: drop the fields, derive on read. (`authservice_architecture_report.md` §3)
- **`Department` uses 3 nullable FKs for parent** (org / institution / branch) — brittle at scale. Fix: Django Content Types / Generic FK. (§4)
- **`domain_data = JSONField()` used for structural schema extensions** (school vs hospital) — hurts query perf. Fix: Multi-Table Inheritance. (§4)
- **`CORS_ALLOW_ALL_ORIGINS = True` and `ALLOWED_HOSTS = ['*']`** in `core/settings.py` — must tighten before any prod deploy.
- **Migrations run with `--fake-initial`** in the Docker CMD — safe on fresh DBs with existing schema, but can hide migration graph issues. Watch when renaming models.
