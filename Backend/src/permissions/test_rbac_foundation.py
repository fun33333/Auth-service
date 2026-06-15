import pytest
from permissions.models import Permission


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
