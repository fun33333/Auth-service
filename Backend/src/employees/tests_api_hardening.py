"""Regression tests for API hardening work (2026-04-22)."""
import json
import pytest
from employees.models import Department, Designation, Institution, Organization


@pytest.fixture
def org(db):
    return Organization.objects.create(org_code="IAK", name="Alkhair")


@pytest.fixture
def institution(db, org):
    return Institution.objects.create(
        organization=org, inst_code="T-INST", name="Test Institution", inst_type="educational"
    )


@pytest.fixture
def department(db, institution):
    return Department.objects.create(
        institution=institution, dept_code="TDEPT", dept_name="Test Dept"
    )


@pytest.fixture
def designation(db, department):
    return Designation.objects.create(
        department=department, position_code="TPOS", position_name="Test Position"
    )


class TestOptionalNullUpdates:
    """Pydantic schemas must accept explicit null for optional fields."""

    @pytest.mark.django_db
    def test_designation_update_accepts_null_description(self, api_client, designation):
        response = api_client.put(
            f"/api/employees/designations/{designation.id}",
            data=json.dumps({"position_name": "Renamed", "description": None}),
            content_type="application/json",
        )
        assert response.status_code == 200, response.content
        designation.refresh_from_db()
        assert designation.position_name == "Renamed"
        assert designation.description is None

    @pytest.mark.django_db
    def test_department_update_accepts_null_description(self, api_client, department):
        response = api_client.put(
            f"/api/employees/departments/{department.dept_code}",
            data=json.dumps({"dept_name": "Renamed", "description": None, "institution_code": None}),
            content_type="application/json",
        )
        assert response.status_code == 200, response.content
