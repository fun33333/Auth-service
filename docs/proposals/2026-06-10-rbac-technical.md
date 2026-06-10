# Role-Based Access Control — Technical Proposal

**Prepared by:** Muhammad Ubaid  
**Date:** June 10, 2026  
**Audience:** Technical Lead, Senior Developers, Architects  
**Status:** Awaiting Approval

---

## Problem Statement

### 1. Per-Service Hardcoded Role Models

`HdmsRole` and `VmsRole` are separate Django models with boolean permission fields baked into the schema. Every new service that requires roles demands:
- A new model + migration
- A new `OneToOneField` on `ServiceAccess`
- Custom `clean()` and `save()` logic per model
- A new login/validation endpoint

This pattern does not scale. Adding HRMS, Finance, or any future service multiplies the burden linearly.

### 2. No Internal RBAC on Auth-service

`ServiceAccess` gates which service an employee can enter, but once inside Auth-service itself there is no action-level control. Any employee with Auth-service access can perform any operation: create/delete employees, manage org hierarchy, grant service access to others. There is no concept of an "Auth-service role."

### 3. Additional Design Issues

| Issue | Location | Severity |
|-------|----------|----------|
| `service` field is a CharField, not FK | `ServiceAccess.service` | Medium — loses referential integrity, validated only via `clean()` |
| Permissions as boolean columns | `HdmsRole.can_view_all_tickets`, etc. | High — not queryable, not reusable, requires migration per new permission |
| No permission audit at granular level | `PermissionAudit` logs service-level events only | Medium |

---

## Proposed Architecture

### Data Model

Four new tables. All models inherit `SoftDeleteModel` to match existing codebase pattern.

```python
class Permission(models.Model):
    codename    = CharField(max_length=100, unique=True)  # "employee.create"
    name        = CharField(max_length=150)               # "Create Employee"
    service     = CharField(max_length=20)                # "auth"
    description = TextField(blank=True)

class Role(SoftDeleteModel):
    id          = UUIDField(primary_key=True, default=uuid4)
    name        = CharField(max_length=100)               # "HR Manager"
    service     = CharField(max_length=20)                # "auth"
    is_default  = BooleanField(default=False)             # seedable default role
    permissions = ManyToManyField(Permission, blank=True)
    description = TextField(blank=True)
    created_by  = ForeignKey(Employee, null=True, on_delete=SET_NULL)

class EmployeeRole(SoftDeleteModel):
    id          = UUIDField(primary_key=True, default=uuid4)
    employee    = ForeignKey(Employee, on_delete=CASCADE, related_name='assigned_roles')
    role        = ForeignKey(Role, on_delete=CASCADE)
    # Phase 2: scope fields (null = global)
    scope_content_type = ForeignKey(ContentType, null=True, blank=True, on_delete=SET_NULL)
    scope_object_id    = UUIDField(null=True, blank=True)
    scope              = GenericForeignKey('scope_content_type', 'scope_object_id')
    granted_by  = ForeignKey(Employee, null=True, on_delete=SET_NULL, related_name='roles_granted')
    granted_at  = DateTimeField(auto_now_add=True)

class EmployeePermissionOverride(SoftDeleteModel):
    id          = UUIDField(primary_key=True, default=uuid4)
    employee    = ForeignKey(Employee, on_delete=CASCADE, related_name='permission_overrides')
    permission  = ForeignKey(Permission, on_delete=CASCADE)
    is_allowed  = BooleanField()  # True = grant extra | False = block from role
    # Phase 2: same scope fields as EmployeeRole
    scope_content_type = ForeignKey(ContentType, null=True, blank=True, on_delete=SET_NULL)
    scope_object_id    = UUIDField(null=True, blank=True)
    scope              = GenericForeignKey('scope_content_type', 'scope_object_id')
    granted_by  = ForeignKey(Employee, null=True, on_delete=SET_NULL, related_name='overrides_granted')
    granted_at  = DateTimeField(auto_now_add=True)
```

### Effective Permission Algorithm

```python
def has_permission(employee: Employee, codename: str) -> bool:
    if employee.is_superadmin:  # SuperAdmin bypasses all checks
        return True

    # Aggregate permissions from all assigned roles
    role_perms = set(
        Permission.objects.filter(
            roles__employee_roles__employee=employee,
            roles__employee_roles__is_deleted=False,
        ).values_list('codename', flat=True)
    )

    # Apply individual overrides
    for override in employee.permission_overrides.filter(
        permission__codename=codename, is_deleted=False
    ):
        if override.is_allowed:
            role_perms.add(codename)
        else:
            role_perms.discard(codename)

    return codename in role_perms
```

Formula: `effective = role_perms ∪ {allowed overrides} − {denied overrides}`

### Django Ninja Enforcement

```python
# permissions/utils.py
def require_permission(codename: str):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            employee = request.auth
            if isinstance(employee, SuperAdmin):
                return func(request, *args, **kwargs)
            if not has_permission(employee, codename):
                raise HttpError(403, f"Permission denied: {codename}")
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

# Usage on endpoints:
@router.post("/employees")
@require_permission("employee.create")
def create_employee(request, payload: EmployeeCreateSchema):
    ...
```

### Seed Permissions Management Command

```bash
python manage.py seed_permissions
```

Idempotent (`get_or_create`). Defines all Auth-service permissions in one place:

```python
AUTH_PERMISSIONS = [
    ("employee.create",          "Create Employee"),
    ("employee.edit",            "Edit Employee"),
    ("employee.delete",          "Delete Employee"),
    ("department.create",        "Create Department"),
    ("department.edit",          "Edit Department"),
    ("branch.create",            "Create Branch"),
    ("institution.create",       "Create Institution"),
    ("service_access.grant",     "Grant Service Access"),
    ("service_access.revoke",    "Revoke Service Access"),
    ("role.manage",              "Manage Roles"),
    ("designation.create",       "Create Designation"),
    ("organization.manage",      "Manage Organization"),
]
```

---

## Scope Field — Phase 2 Readiness

MVP: `scope_content_type` and `scope_object_id` columns exist but are always `null` (global scope).

Phase 2: Fill in scope to restrict a role or override to a specific entity:
- `scope = Branch(TB01)` → permission applies only within that branch
- `scope = Institution(TINST)` → permission applies only within that institution

No model rewrite needed — both columns are nullable, Phase 2 migration is purely additive.

---

## New API Endpoints

All under `permissions_router` mounted at `/api/permissions/`:

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/permissions/` | List all permissions (by service) |
| `POST` | `/permissions/` | Create permission (admin only) |
| `GET` | `/roles/` | List roles (filterable by service) |
| `POST` | `/roles/` | Create role |
| `GET` | `/roles/{id}/` | Role detail with permissions |
| `PUT` | `/roles/{id}/` | Update role name/permissions |
| `DELETE` | `/roles/{id}/` | Soft-delete role |
| `POST` | `/roles/{id}/assign/` | Assign role to employee |
| `DELETE` | `/roles/{id}/unassign/` | Remove role from employee |
| `GET` | `/employees/{id}/effective-permissions/` | Compute full effective permission set |
| `GET` | `/employees/{id}/overrides/` | List per-employee overrides |
| `POST` | `/employees/{id}/overrides/` | Add override (allow or deny) |
| `DELETE` | `/employees/{id}/overrides/{override_id}/` | Remove override |

---

## Migration Path

### MVP (this proposal)
- 4 new tables via standard Django migrations
- Zero changes to `HdmsRole`, `VmsRole`, `ServiceAccess`
- No data migration — new tables start empty
- Existing employees continue working normally

### Phase 2 (future)
1. Define HDMS permissions in `seed_permissions` (under `service='hdms'`)
2. Migrate `HdmsRole` rows → `EmployeeRole` + `EmployeePermissionOverride` rows via data migration script
3. Deprecate and eventually drop `HdmsRole` / `VmsRole`
4. Update HDMS backend to call Auth-service `/employees/{id}/effective-permissions/` instead of reading `HdmsRole` directly

---

## Frontend Changes

All changes are to the existing `/service` page (`frontend/src/app/service/page.tsx`).

**1. Add "Auth" subsystem tab**
Alongside existing HDMS / VMS tabs. Shows employees who have Auth-service access and their assigned roles.

**2. Add "Roles" sub-tab (within Auth tab)**
- Role list with create / edit / delete actions
- Role edit form: name field + permission checkbox grid (grouped by resource: Employee, Department, Branch, etc.)
- API: `GET/POST/PUT /api/permissions/roles?service=auth`

**3. Dynamic role dropdown in provision modal**
Replace hardcoded `serviceRoles` object (currently in component state) with:
```ts
const { data: roles } = useFetch(`/permissions/roles?service=${selectedService}`)
```

**4. Per-employee overrides panel**
From the employee row in the table → expand or modal → show assigned roles + permission overrides with add/remove controls.

---

## Caching Strategy

`has_permission()` is called on every authenticated request. Without caching, each call hits the DB for role + override lookups.

**Strategy:** Cache the computed permission set per employee in Redis.

```python
CACHE_KEY = f"perms:{employee.employee_id}"
TTL = 300  # 5 minutes

def get_effective_permissions(employee) -> set[str]:
    cached = cache.get(CACHE_KEY)
    if cached:
        return cached
    perms = _compute_permissions(employee)
    cache.set(CACHE_KEY, perms, TTL)
    return perms
```

Invalidate on: role assignment change, override change, role permission change.

---

## Testing Strategy

### Unit Tests
- `has_permission()` returns True when codename in role
- `has_permission()` returns True when codename NOT in role but allow override exists
- `has_permission()` returns False when codename in role but deny override exists
- `has_permission()` allow + deny override on same codename → deny wins
- SuperAdmin always returns True regardless of codename

### Integration Tests
- `POST /employees` returns 403 with no role assigned
- `POST /employees` returns 201 after `employee.create` role assigned
- `seed_permissions` run twice → no duplicate `Permission` rows

### Regression
- Existing HDMS/VMS login and role assignment flows: unaffected (HdmsRole/VmsRole untouched)

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| N+1 on permission check per request | High | Redis cache (5min TTL) on effective permission set |
| Scope GenericFK adds query complexity in Phase 2 | Medium | Scope always null in MVP; filter by `scope_content_type__isnull=True` for global checks |
| Role with no permissions assigned to all employees | Medium | Validation: warn if assigning a role with zero permissions |
| HdmsRole/VmsRole phase-out breaks HDMS consumers | High | Phase 2 only; HDMS migration is gated behind HDMS-side API update |

---

## Recommendation

Proceed with MVP. Scope is contained to new tables + `/service` page refactor. Zero breaking changes. Phase 2 (HDMS/VMS migration) is independent and can be scheduled separately.

**Estimated effort:** 2–3 weeks (1 backend engineer + 1 frontend engineer in parallel)

---

*Document prepared by Muhammad Ubaid — June 10, 2026*
