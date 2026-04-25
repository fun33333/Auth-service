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

### 2026-04-24 (Bugfix — stale container image after P6/P7 model cleanup)

**Bug:** `ProgrammingError: column employees_employee.state does not exist` on admin Employee change/save.

**Root cause:** P6/P7 commit (`db7ed7a`) removed `state` from `Employee` model and generated migration `0014` to drop the column. Migration ran fine. But container image was never rebuilt — old image still had `state` in models.py. ORM generated SQL selecting `state` → PostgreSQL rejected it (column already dropped).

**Fix:** `docker compose build auth-service && docker compose up -d auth-service` — container now runs latest code, model and DB in sync.

**Lesson:** After any model field removal, container must be rebuilt, not just migrated.

---

### 2026-04-24 (Bugfix — stale field references after P1-P5 model cleanup)

**Bugs found via post-cleanup audit:**

1. **`employees/api.py` — `get_institution` + `update_institution` (`AttributeError` at runtime)**
   - Both response dicts accessed `inst.inst_id` and `inst.extra_data` — both removed from `Institution` in P4 cleanup (`ee110da`).
   - `InstitutionSchema` already had these fields stripped; only the response builders were missed.
   - Fixed: removed `inst_id` and `extra_data` keys from both response dicts (lines ~355, ~401).

2. **`employees/admin.py` — `AssignmentInline.fields` (over-corrected in initial fix)**
   - Original fix removed `branch` from the inline fields, but `EmployeeAssignment.branch` FK still exists on the model.
   - Only `institution` was removed (P1 commit `14b44ac`).
   - Fixed: fields now `['branch', 'department', 'designation', 'joining_date', 'shift', 'is_primary', 'is_active']`.

**Migration scripts** (`enrich_campus_timestamps.py`, `migrate_campuses_to_branches.py`, `migrate_employees.py`, `run_full_migration.py`) also reference `legacy_campus_id` / `domain_data` on `Branch` — these are one-time historical scripts, already executed, not called at runtime. Left as-is.

---

### 2026-04-24 (Bugfix — Django admin FieldError on EmployeeAssignment change view)

**Bug:** `FieldError: Unknown field(s) (institution) specified for EmployeeAssignment` when opening any employee record in `/auth-admin/`.

**Root cause:** `AssignmentInline.fields` in `employees/admin.py:83` still listed `branch` and `institution`, both of which were removed from `EmployeeAssignment` model in the P2-P5 data model cleanup (commit `ee110da`). Admin tried to render a non-existent field → Django threw `FieldError` at change_view time.

**Fix:** Removed `branch` + `institution` from `AssignmentInline.fields`. Fields now: `['designation', 'joining_date', 'shift', 'is_primary', 'is_active']` — matches actual model shape.

**File:** `Backend/src/employees/admin.py:83`

---

### 2026-04-22 (Phase 2 — CRUD forms rebuild: branches / departments / designations / institutions)

**Frontend — rhf+zod rewrites:**
- `frontend/src/app/branches/page.tsx` — modal rebuilt with `react-hook-form` + `zod`. Inline per-field errors, backend `field_errors` surfacing, PK phone + email regex validation. Delete uses `branch_code` as key (soft-delete, recoverable).
- `frontend/src/app/departments/page.tsx` — same treatment. `dept_code` locked on edit (server-side immutable). Regex validator (`^[A-Za-z0-9]+$`, ≤6 chars) enforces alphanumeric client-side before POST fires.
- `frontend/src/app/designations/page.tsx` — same treatment. `position_code` + `department_code` locked on edit.
- `frontend/src/app/institutions/new/page.tsx` — full rewrite (standalone route) with rhf+zod, org pill-picker, PK phone validation.
- `frontend/src/app/institutions/[id]/edit/page.tsx` — full rewrite with `reset()` pre-populate on GET.

**Backend — `Backend/src/employees/api.py`:**
- **Critical fix:** `payload: dict` in Django Ninja routes is treated as a **query** param, not body — causing 422 "Field required" on every JSON POST. Fixed by switching to `payload: Body[dict]` (ninja.Body) on `create_institution`, `update_institution`, `create_branch`, `update_branch`. This bug was silent until the frontend started actually sending JSON bodies from rhf forms. `from ninja import ... Body` added to imports.
- **New endpoints:** `PUT /branches/{branch_key}` + `DELETE /branches/{branch_key}` (soft-delete). Key accepts `branch_id` OR `branch_code` via `Q()` — frontend list passes `branch_code`. Previously frontend was calling these routes and silently 404ing.
- **Fix:** `DesignationUpdateSchema` fields were typed `str = None` — Pydantic v2 rejects `null` for non-`Optional` fields, causing 422 on PUT. Changed to `Optional[str] = None`.

**Verified end-to-end with Playwright (spec: `docs/superpowers/specs/2026-04-22-crud-forms-e2e-test-plan.md`):**

| Entity | Create | Edit | Validation |
|--------|--------|------|------------|
| Branch | ✅ 201 | ✅ PUT 200 | ✅ 3 inline errors, no POST |
| Department | ✅ 201 | ✅ PUT 200 | ✅ regex error on `AB$`, no POST |
| Designation | ✅ 201 | ✅ PUT 200 | ✅ 3 inline errors, no POST |
| Institution | ✅ 201 → redirect | ✅ PUT 200 → redirect | ✅ phone error on `12345`, no POST |

12/12 checks pass.

### 2026-04-21 (Phase 2 kickoff — Employee create + edit: rebuild + E2E verified)

**Frontend — full rewrites with `react-hook-form` + `zod`:**
- `frontend/src/app/employees/new/page.tsx` — rebuilt from 544 lines (formData + setState bloat) to a clean rhf+zod multi-step form. 4 steps (Identity / Contact / Placement / History). Client-side validators mirror backend Pydantic: CNIC `^\d{5}-?\d{7}-?\d{1}$`, PK mobile, email. Cascading dropdowns (institution→branch, department→designation) with useEffect+watch. Inline field errors. Backend `field_errors` map surfaced per field. Robust error fallback handles Ninja's default `{detail:[{type,loc,msg}]}` shape so React can't crash on bad responses.
- `frontend/src/app/employees/[id]/edit/page.tsx` — same pattern + `reset()` on GET response to pre-populate. Uses `primary` assignment for placement pre-selection.
- Installed: `react-hook-form`, `zod`, `@hookform/resolvers`.

**Backend — `Backend/src/employees/api.py`:**
- `POST /employees`: signature `Form(...) + File(...)` → plain JSON body (`payload: EmployeeCreateSchema`). Frontend was sending JSON, backend was expecting multipart — produced 422 on every submit. Resume upload deferred to a future separate endpoint.
- `GET /employees/{employee_id}`: now accepts **either** `employee_id` (e.g. `IAK-0001`) **or** `employee_code` (e.g. `AIT01-G-26-T-0006`) via `Q(employee_id=...) | Q(employee_code=...)`. Frontend list passes `employee_code`; old endpoint only matched `employee_id`. Same change applied to `PUT` and `DELETE /employees/{employee_id}`.
- `GET /employees/{id}` response: assignments now include `institution_code`, `branch_code`, `department_code`, `designation_code` alongside names. Edit form needs codes to pre-select dropdowns.
- `GET /employees/{id}` response: added raw enum values `gender`, `marital_status`, `employment_type` alongside `*_display` labels. Edit form binds raw values to `<select>`.
- `POST /employees` + `PUT /employees/{id}`: empty string `""` → `None` for `org_email`, `org_phone`, `personal_email` before save. `Employee.org_email` has `unique=True, blank=True, null=True` — two records with `org_email=""` collide on the unique index. Fix preserves NULL-as-absent semantics.

**Backend — schema correction (from arch report heads-up, deferred for now):**
- `EmployeeAssignment.institution` and `.branch` FKs remain (documented tech debt). **Not removed this sprint** — in-use by `create_employee` (line ~649) and `get_employee` (line ~859). Full denormalization removal planned as Phase 1.5 with a data-integrity pre-check (count impossible assignments where stored `branch` disagrees with `designation.department.branch`).

**Verified end-to-end with Playwright:**
- Login → fill create form (Identity/Contact/Placement) → submit → **201** → redirect to `/employees`.
- Open edit → form pre-populated from GET → edit name → save → **PUT 200** → redirect to `/employees`.
- Cascade: Institution "IT Institute" → Branch dropdown populated "Alkhair Institute of Technology"; Department "Academic" → Designation "Teacher". Working as designed.

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
