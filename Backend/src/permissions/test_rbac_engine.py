import pytest
from django.core.cache import cache
from permissions.models import Permission, Role, EmployeeRole, EmployeePermissionOverride
from permissions.rbac import get_effective_permissions, has_permission, clear_permission_cache, _CACHE_KEY


@pytest.fixture(autouse=True)
def clear_cache_before_each():
    cache.clear()
    yield
    cache.clear()


@pytest.mark.django_db
class TestGetEffectivePermissions:
    def test_no_roles_no_overrides_returns_empty(self, employee):
        assert get_effective_permissions(str(employee.id)) == set()

    def test_role_permissions_included(self, employee):
        perm = Permission.objects.create(codename="employee.view", name="View Employees", service="auth")
        role = Role.objects.create(name="Viewer", service="auth")
        role.permissions.add(perm)
        EmployeeRole.objects.create(employee=employee, role=role)
        assert "employee.view" in get_effective_permissions(str(employee.id))

    def test_allowed_override_grants_extra_permission(self, employee):
        perm = Permission.objects.create(codename="department.create", name="Create Dept", service="auth")
        EmployeePermissionOverride.objects.create(employee=employee, permission=perm, is_allowed=True)
        assert "department.create" in get_effective_permissions(str(employee.id))

    def test_denied_override_blocks_role_permission(self, employee):
        perm = Permission.objects.create(codename="employee.delete", name="Delete Employee", service="auth")
        role = Role.objects.create(name="Admin", service="auth")
        role.permissions.add(perm)
        EmployeeRole.objects.create(employee=employee, role=role)
        EmployeePermissionOverride.objects.create(employee=employee, permission=perm, is_allowed=False)
        assert "employee.delete" not in get_effective_permissions(str(employee.id))

    def test_formula_union_minus_denied(self, employee):
        perm_role = Permission.objects.create(codename="branch.view", name="View Branch", service="auth")
        perm_extra = Permission.objects.create(codename="branch.create", name="Create Branch", service="auth")
        perm_blocked = Permission.objects.create(codename="branch.delete", name="Delete Branch", service="auth")
        role = Role.objects.create(name="Branch Manager", service="auth")
        role.permissions.set([perm_role, perm_blocked])
        EmployeeRole.objects.create(employee=employee, role=role)
        EmployeePermissionOverride.objects.create(employee=employee, permission=perm_extra, is_allowed=True)
        EmployeePermissionOverride.objects.create(employee=employee, permission=perm_blocked, is_allowed=False)
        result = get_effective_permissions(str(employee.id))
        assert "branch.view" in result
        assert "branch.create" in result
        assert "branch.delete" not in result

    def test_result_cached_in_redis(self, employee):
        perm = Permission.objects.create(codename="audit.view", name="View Audit", service="auth")
        role = Role.objects.create(name="Auditor", service="auth")
        role.permissions.add(perm)
        EmployeeRole.objects.create(employee=employee, role=role)
        get_effective_permissions(str(employee.id))
        # Remove DB role — cache should still return it
        EmployeeRole.objects.filter(employee=employee).delete()
        assert "audit.view" in get_effective_permissions(str(employee.id))

    def test_clear_permission_cache_forces_recompute(self, employee):
        perm = Permission.objects.create(codename="audit.view", name="View Audit", service="auth")
        role = Role.objects.create(name="Auditor", service="auth")
        role.permissions.add(perm)
        EmployeeRole.objects.create(employee=employee, role=role)
        get_effective_permissions(str(employee.id))
        EmployeeRole.objects.filter(employee=employee).delete()
        clear_permission_cache(str(employee.id))
        assert "audit.view" not in get_effective_permissions(str(employee.id))


@pytest.mark.django_db
class TestHasPermission:
    def test_employee_without_permission_returns_false(self, employee):
        assert has_permission(employee, "employee.delete") is False

    def test_employee_with_permission_returns_true(self, employee):
        perm = Permission.objects.create(codename="employee.view", name="View Employees", service="auth")
        role = Role.objects.create(name="Viewer", service="auth")
        role.permissions.add(perm)
        EmployeeRole.objects.create(employee=employee, role=role)
        assert has_permission(employee, "employee.view") is True

    def test_superadmin_always_returns_true(self, superadmin):
        assert has_permission(superadmin, "employee.delete") is True
        assert has_permission(superadmin, "nonexistent.permission") is True
