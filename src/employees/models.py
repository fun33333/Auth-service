"""
Employee models for the Auth Service.

This module contains the core Employee model with dual identifier system:
- employee_id: Simple organization-wide ID (IAK-0001) - AUTO-GENERATED
- employee_code: Detailed department-specific code (C06-M-24-T-0001) - AUTO-GENERATED

All models inherit from SoftDeleteModel for soft delete functionality.
"""
import uuid, re
from django.db import models
from django.core.exceptions import ValidationError
# ObjectDoesNotExist
from .utils import SoftDeleteModel
from django.contrib.auth.models import AbstractUser, BaseUserManager

# class UserManager(BaseUserManager):
#     def create_user(self, email, password=None, **extra_fields):
#         if not email:
#             raise ValueError('The Email field must be set')
#         email = self.normalize_email(email)
#         user = self.model(email=email, **extra_fields)
#         user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, email, password=None, **extra_fields):
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)
#         return self.create_user(email, password, **extra_fields)

# class User(AbstractUser):
#     username = None
#     email = models.EmailField(unique=True)
    
#     # Link to Employee
#     employee = models.OneToOneField(
#         'Employee', 
#         on_delete=models.SET_NULL, 
#         null=True, 
#         blank=True,
#         related_name='user_account'
#     )

#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = []

#     objects = UserManager()

#     def __str__(self):
#         return self.email

class Organization(SoftDeleteModel):
    """
    The root entity (NGO or Company). 
    Centralizes global settings and basic info.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Organization Name (e.g., Al-Khidmat Foundation)")
    org_code = models.CharField(max_length=10, unique=True, help_text="Short code for the organization (e.g., AKF)")
    website = models.URLField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"
    def __str__(self):
        return f"{self.name} ({self.org_code})"


class Institution(SoftDeleteModel):
    """
    Specific entities under the Organization (Schools, Hospitals, Kitchens).
    Replaces AcademicInstitutionInformation with a more generic structure.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='institutions', null=True, blank=True)
    
    inst_id = models.CharField(max_length=50, unique=True, editable=False, help_text="Auto-generated serial ID")
    inst_code = models.CharField(max_length=20, unique=True, help_text="Unique code (e.g., AIT01, AMC01)")
    name = models.CharField(max_length=255)
    
    INST_TYPE_CHOICES = [
        ('educational', 'Educational (School, College, University)'),
        ('healthcare', 'Healthcare (Hospital, Clinic, Lab)'),
        ('social_welfare', 'Social Welfare (Kitchen, Shelter, Center)'),
        ('administrative', 'Administrative (Office, branch)'),
        ('technical', 'Technical / Vocational'),
        ('operational', 'Operational / Project Site'),
        ('other', 'Other'),
    ]
    inst_type = models.CharField(max_length=30, choices=INST_TYPE_CHOICES)
    
    # 🔗 For syncing with existing SIS Campuses
    legacy_campus_id = models.UUIDField(null=True, blank=True, help_text="Link to existing SIS Campus UUID")
    
    # 🆕 DYNAMIC SCHEMA FOR INSTITUTION
    # For School: capacity, principal_name, established_year
    # For Hospital: num_beds, md_name, registration_no
    attribute_schema = models.JSONField(
        default=list, 
        blank=True, 
        help_text="JSON schema for institution-specific attributes"
    )
    
    # Values stored here matching the schema
    extra_data = models.JSONField(default=dict, blank=True)

    # Address/Contact remains common
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        verbose_name = "Institution"
        verbose_name_plural = "Institutions"

    def save(self, *args, **kwargs):
        if not self.inst_id:
            last = Institution.all_objects.all().order_by('inst_id').last()
            if last and last.inst_id:
                try:
                    num_part = last.inst_id.split('-')[-1]
                    new_num = int(num_part) + 1
                except (ValueError, IndexError):
                    new_num = 1
            else:
                new_num = 1
            self.inst_id = f"INST-{new_num:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.inst_code})"

class Department(SoftDeleteModel):
    """
    Departments can be Global (linked to Org) or Local (linked to Institution).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='global_departments', null=True, blank=True)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, null=True, blank=True, related_name='local_departments')
    
    dept_code = models.CharField(max_length=10, help_text="e.g., HR, FIN, ACAD")
    dept_name = models.CharField(max_length=200)
    
    # Removed dept_sector as requested - the dept itself defines its nature
    description = models.TextField(blank=True, null=True)
    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        unique_together = [['institution', 'dept_code'], ['organization', 'dept_code']]
    @property
    def is_global(self):
        return self.institution is None
    def __str__(self):
        scope = "Global" if self.is_global else self.institution.inst_code
        return f"{self.dept_name} [{scope}]"

class Designation(SoftDeleteModel):
    """
    Position types within a Department.
    Includes a JSON Schema for role-specific dynamic data.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='designations')
    
    position_name = models.CharField(max_length=100, help_text="e.g., Teacher, Surgeon, Manager")
    position_code = models.CharField(max_length=10, help_text="Short code for ID generation (e.g., T, D, M)")
    
    # 🆕 DYNAMIC SCHEMA
    # Defines what extra data is required for this specific designation
    # format: [{"name": "field_id", "label": "Label", "type": "text|number|date|choice|entity_link", "target": "service.Model"}]
    attribute_schema = models.JSONField(
        default=list, 
        blank=True, 
        help_text="JSON schema for designation-specific attributes (Google Form style)"
    )

    class Meta:
        verbose_name = "Designation"
        verbose_name_plural = "Designations"
        unique_together = [['department', 'position_code']]

    def __str__(self):
        scope = "Global" if self.department.is_global else self.department.institution.inst_code
        return f"{self.position_name} ({self.department.dept_name} - {scope})"

class Employee(SoftDeleteModel):
    """
    Central Employee identity. Stores ALL common personal & HR data.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # NGO-wide ID (IAK-0001 -> IAK-10000)
    employee_id = models.CharField(
        max_length=20, unique=True, editable=False, blank=True, db_index=True,
        help_text="Central Organization ID"
    )
    
    # Derived from Primary Assignment
    employee_code = models.CharField(
        max_length=50, unique=True, editable=False, blank=True, db_index=True,
        help_text="Generated from Primary Assignment"
    )
    
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT, related_name='employees', null=True, blank=True)
    
    # Core Personal Data
    full_name = models.CharField(max_length=200)
    cnic = models.CharField(max_length=15, unique=True)
    personal_phone = models.CharField(max_length=20, blank=True, null=True)
    personal_email = models.EmailField(blank=True, null=True, unique=True) # Renamed 
    dob = models.DateField()
    
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    
    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'), ('married', 'Married'), 
        ('divorced', 'Divorced'), ('widowed', 'Widowed')
    ]
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True, null=True)
    nationality = models.CharField(max_length=100, default='Pakistani')
    religion = models.CharField(max_length=100, blank=True, null=True)
    
    # Address Details
    residential_address = models.TextField(blank=True, null=True)
    permanent_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)

    # Organization Contact
    org_email = models.EmailField(blank=True, null=True, unique=True, help_text="Official Organization Email")
    org_phone = models.CharField(max_length=20, blank=True, null=True, help_text="Official Mobile/Extension")
    
    # Bank Information
    bank_name = models.CharField(max_length=200, blank=True, null=True)
    account_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Education & Work Experience (Comprehensive HR History)
    education_history = models.JSONField(default=list, blank=True, help_text="[{degree, institute, passingYear, grade}]")
    work_experience = models.JSONField(default=list, blank=True, help_text="[{employer, jobTitle, startDate, endDate, responsibilities}]")
    
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"

    def save(self, *args, **kwargs):
        if not self.employee_id:
            last = Employee.all_objects.all().order_by('employee_id').last()
            num = (int(last.employee_id.split('-')[-1]) + 1) if last and last.employee_id else 1
            padding = 4 if num < 10000 else len(str(num))
            self.employee_id = f"IAK-{num:0{padding}d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.employee_id})"


class EmployeeAssignment(SoftDeleteModel):
    """
    Handles multiple roles for an Employee across Institutions/Departments.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='assignments')
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, null=True, blank=True, related_name='assignments')
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='assignments')
    designation = models.ForeignKey(Designation, on_delete=models.PROTECT, related_name='assignments')
    
    joining_date = models.DateField()
    is_primary = models.BooleanField(default=True, help_text="Determines the central Employee Code")
    is_active = models.BooleanField(default=True)
    
    SHIFT_CHOICES = [
        ('morning', 'Morning'), ('afternoon', 'Afternoon'), ('night', 'Night'),
        ('general', 'General/Office'), ('hourly', 'Hourly Base')
    ]
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='general')
    
    # Dynamic Role Data (Designation specific)
    role_data = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "Employee Assignment"
        verbose_name_plural = "Employee Assignments"
        unique_together = [['employee', 'department', 'designation']]

    def save(self, *args, **kwargs):
        if self.is_primary:
            EmployeeAssignment.objects.filter(employee=self.employee).exclude(pk=self.pk).update(is_primary=False)
        
        super().save(*args, **kwargs)
        
        if self.is_primary:
            # Prefix logic: Use Department Code if Global, otherwise Institution Code
            if self.department.is_global:
                prefix = self.department.dept_code
            else:
                prefix = self.institution.inst_code if self.institution else self.department.organization.org_code
                
            shift_code = self.shift[0].upper() if self.shift != 'general' else 'G'
            year = str(self.joining_date.year)[-2:]
            role = self.designation.position_code
            seq = self.employee.employee_id.split('-')[-1]
            
            new_code = f"{prefix}-{shift_code}-{year}-{role}-{seq}"
            old_code = self.employee.employee_code

            if old_code != new_code:
                self.employee.employee_code = new_code
                self.employee.save(update_fields=['employee_code'])
                
                # Trigger Notification
                from .notifications import send_employee_code_notification
                send_employee_code_notification(self.employee, old_code, new_code)

    def __str__(self):
        scope = self.institution.inst_code if self.institution else "Global"
        return f"{self.employee.full_name} - {self.designation.position_name} ({scope})"