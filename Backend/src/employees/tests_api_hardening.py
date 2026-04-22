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


class TestBodySchemaRouting:
    """Endpoints accept JSON bodies, validate required fields, and surface per-field errors."""

    @pytest.mark.django_db
    def test_create_institution_rejects_missing_name(self, api_client, org):
        response = api_client.post(
            "/api/employees/institutions",
            data=json.dumps({"organization_code": "IAK", "inst_code": "X-INST"}),
            content_type="application/json",
        )
        assert response.status_code == 422, response.content
        body = response.json()
        assert "detail" in body
        locs = [".".join(str(p) for p in err.get("loc", [])) for err in body["detail"]]
        assert any("name" in loc for loc in locs), locs

    @pytest.mark.django_db
    def test_create_institution_success(self, api_client, org):
        response = api_client.post(
            "/api/employees/institutions",
            data=json.dumps({
                "organization_code": "IAK",
                "inst_code": "X-INST",
                "name": "X Institution",
                "inst_type": "educational",
            }),
            content_type="application/json",
        )
        assert response.status_code == 201, response.content
        assert response.json()["inst_code"] == "X-INST"

    @pytest.mark.django_db
    def test_create_branch_rejects_missing_branch_name(self, api_client, institution):
        response = api_client.post(
            "/api/employees/branches",
            data=json.dumps({"branch_code": "X-BR", "institution_code": institution.inst_code}),
            content_type="application/json",
        )
        assert response.status_code == 422, response.content
        locs = [".".join(str(p) for p in err.get("loc", [])) for err in response.json()["detail"]]
        assert any("branch_name" in loc for loc in locs), locs

    @pytest.mark.django_db
    def test_update_branch_accepts_partial_payload(self, api_client, institution):
        from employees.models import Branch
        branch = Branch.objects.create(
            institution=institution, branch_code="X-BR", branch_name="Before"
        )
        response = api_client.put(
            f"/api/employees/branches/{branch.branch_code}",
            data=json.dumps({"branch_name": "After"}),
            content_type="application/json",
        )
        assert response.status_code == 200, response.content
        branch.refresh_from_db()
        assert branch.branch_name == "After"
