"""
Pytest fixtures for auth-service tests.
"""
import pytest
from django.test import Client
from employees.models import Department, Designation, Employee
from datetime import date


@pytest.fixture
def api_client():
    """Django test client for API calls"""
    return Client()


@pytest.fixture
def sample_department(db):
    """Create a sample department for testing"""
    dept = Department.objects.create(
        dept_code="TEST",
        dept_name="Test Department",
        dept_sector="other",
        description="Test department for unit tests"
    )
    return dept


@pytest.fixture
def sample_designation(db, sample_department):
    """Create a sample designation for testing"""
    designation = Designation.objects.create(
        department=sample_department,
        position_code="TST",
        position_name="Tester",
        description="Test designation"
    )
    return designation


@pytest.fixture
def sample_employee(db, sample_department, sample_designation):
    """Create a sample employee for testing"""
    employee = Employee.objects.create(
        full_name="Test Employee",
        email="test@example.com",
        phone="1234567890",
        cnic="1234567890123",
        dob=date(1990, 1, 1),
        gender="male",
        residential_address="Test Address",
        department=sample_department,
        designation=sample_designation,
        joining_date=date.today(),
        bank_name="Test Bank",
        account_number="1234567890"
    )
    return employee
