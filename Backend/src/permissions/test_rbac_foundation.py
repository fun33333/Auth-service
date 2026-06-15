import pytest
from permissions.models import Permission, Role


@pytest.mark.django_db
class TestPermissionModel:
    def test_create_permission(self):
        perm = Permission.objects.create(
            codename="employee.create",
            name="Create Employee",
            service="auth",
        )
        assert perm.pk is not None
        assert str(perm) == "auth / employee.create"

    def test_codename_is_unique(self):
        Permission.objects.create(codename="employee.create", name="Create Employee", service="auth")
        with pytest.raises(Exception):
            Permission.objects.create(codename="employee.create", name="Duplicate", service="auth")

    def test_default_description_is_empty(self):
        perm = Permission.objects.create(codename="employee.edit", name="Edit Employee", service="auth")
        assert perm.description == ""


@pytest.mark.django_db
class TestRoleModel:
    def test_create_role(self):
        role = Role.objects.create(name="HR Manager", service="auth")
        assert role.pk is not None
        assert str(role) == "auth / HR Manager"

    def test_role_permissions_m2m(self):
        perm1 = Permission.objects.create(codename="employee.create", name="Create Employee", service="auth")
        perm2 = Permission.objects.create(codename="employee.edit", name="Edit Employee", service="auth")
        role = Role.objects.create(name="HR Manager", service="auth")
        role.permissions.set([perm1, perm2])
        assert role.permissions.count() == 2

    def test_role_unique_per_service(self):
        Role.objects.create(name="HR Manager", service="auth")
        with pytest.raises(Exception):
            Role.objects.create(name="HR Manager", service="auth")

    def test_role_soft_delete(self):
        role = Role.objects.create(name="HR Manager", service="auth")
        role.soft_delete()
        assert Role.objects.filter(pk=role.pk).count() == 0
        assert Role.all_objects.filter(pk=role.pk).count() == 1

    def test_is_default_false_by_default(self):
        role = Role.objects.create(name="Viewer", service="auth")
        assert role.is_default is False
