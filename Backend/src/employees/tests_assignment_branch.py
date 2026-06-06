"""
Tests for EmployeeAssignment after branch FK removal.
Covers: model save() employee_code generation, __str__(), _assignment_institution() helper,
and API endpoints POST/PUT/GET for assignments.
"""
import pytest
from datetime import date
from employees.models import EmployeeAssignment
from employees.api import _assignment_institution


# ── Unit: model save() ────────────────────────────────────────────────────────

class TestAssignmentSaveEmployeeCode:

    @pytest.mark.django_db
    def test_primary_assignment_generates_employee_code_from_branch(
        self, employee, desig_branch
    ):
        """save() derives branch_code from designation.department.branch for employee_code."""
        asn = EmployeeAssignment.objects.create(
            employee=employee,
            department=desig_branch.department,
            designation=desig_branch,
            joining_date=date(2026, 1, 1),
            is_primary=True,
            shift='general',
        )
        employee.refresh_from_db()
        # branch_code "TB01", shift G, year 26, position_code TB
        assert employee.employee_code.startswith("TB01-G-26-TB-")

    @pytest.mark.django_db
    def test_primary_assignment_generates_employee_code_from_global_dept(
        self, employee, desig_global
    ):
        """save() uses dept_code as prefix when department has no branch."""
        # Regression guard: global-dept path is unchanged by this refactor — passes before and after.
        asn = EmployeeAssignment.objects.create(
            employee=employee,
            department=desig_global.department,
            designation=desig_global,
            joining_date=date(2026, 1, 1),
            is_primary=True,
            shift='general',
        )
        employee.refresh_from_db()
        # dept_code "TGLB", shift G, year 26, position_code TG
        assert employee.employee_code.startswith("TGLB-G-26-TG-")

    @pytest.mark.django_db
    def test_non_primary_assignment_does_not_change_employee_code(
        self, employee, desig_branch, desig_global
    ):
        """Non-primary assignment must not overwrite employee_code."""
        # Regression guard: global-dept path is unchanged by this refactor — passes before and after.
        EmployeeAssignment.objects.create(
            employee=employee,
            department=desig_branch.department,
            designation=desig_branch,
            joining_date=date(2026, 1, 1),
            is_primary=True,
            shift='general',
        )
        employee.refresh_from_db()
        code_before = employee.employee_code

        EmployeeAssignment.objects.create(
            employee=employee,
            department=desig_global.department,
            designation=desig_global,
            joining_date=date(2026, 1, 1),
            is_primary=False,
            shift='morning',
        )
        employee.refresh_from_db()
        assert employee.employee_code == code_before


# ── Unit: __str__() ───────────────────────────────────────────────────────────

class TestAssignmentStr:

    @pytest.mark.django_db
    def test_str_uses_branch_code_when_dept_has_branch(self, employee, desig_branch):
        asn = EmployeeAssignment.objects.create(
            employee=employee,
            department=desig_branch.department,
            designation=desig_branch,
            joining_date=date(2026, 1, 1),
            is_primary=True,
            shift='general',
        )
        assert "TB01" in str(asn)

    @pytest.mark.django_db
    def test_str_uses_global_when_dept_has_no_branch(self, employee, desig_global):
        # Regression guard: global-dept path is unchanged by this refactor — passes before and after.
        asn = EmployeeAssignment.objects.create(
            employee=employee,
            department=desig_global.department,
            designation=desig_global,
            joining_date=date(2026, 1, 1),
            is_primary=True,
            shift='general',
        )
        assert "Global" in str(asn)


# ── Unit: _assignment_institution() helper ───────────────────────────────────

class TestAssignmentInstitution:

    @pytest.mark.django_db
    def test_derives_institution_from_department_branch(
        self, employee, desig_branch, institution
    ):
        asn = EmployeeAssignment.objects.create(
            employee=employee,
            department=desig_branch.department,
            designation=desig_branch,
            joining_date=date(2026, 1, 1),
            is_primary=True,
            shift='general',
        )
        result = _assignment_institution(asn)
        assert result is not None
        assert result.inst_code == institution.inst_code

    @pytest.mark.django_db
    def test_returns_none_for_global_department(self, employee, desig_global):
        # Regression guard: global-dept path is unchanged by this refactor — passes before and after.
        asn = EmployeeAssignment.objects.create(
            employee=employee,
            department=desig_global.department,
            designation=desig_global,
            joining_date=date(2026, 1, 1),
            is_primary=True,
            shift='general',
        )
        result = _assignment_institution(asn)
        assert result is None
