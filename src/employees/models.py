"""
Employee models for the Auth Service.

This module contains the core Employee model with dual identifier system:
- employee_id: Simple organization-wide ID (IAK-0001) - AUTO-GENERATED
- employee_code: Detailed department-specific code (C06-M-24-T-0001) - AUTO-GENERATED

All models inherit from SoftDeleteModel for soft delete functionality.
"""
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from .utils import SoftDeleteModel
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    
    # Link to Employee
    employee = models.OneToOneField(
        'Employee', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='user_account'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


class Department(SoftDeleteModel):
    """
    Organizational departments/units with auto-generated department_id.
    
    Department ID Format: IAK-D-001, IAK-D-002, IAK-D-003...
    
    Sectors:
    - Academic: Schools, campuses (SIS)
    - IT: Technology department
    - Finance: Accounting, budgeting
    - Medical: Health facilities
    - HR: Human resources
    - Administration: General admin
    - Other: Miscellaneous
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # 🆕 AUTO-GENERATED DEPARTMENT ID
    department_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        blank=True,
        help_text="Auto-generated department ID (e.g., IAK-D-001)"
    )
    
    dept_code = models.CharField(
        max_length=20, 
        unique=True,
        help_text="Department code used in employee_code (e.g., C06-M, AIT01, FIN)"
    )
    dept_name = models.CharField(
        max_length=200,
        help_text="Full department name"
    )
    
    SECTOR_CHOICES = [
        ('academic', 'Academic (Schools/Campuses)'),
        ('it', 'Information Technology'),
        ('finance', 'Finance & Accounting'),
        ('medical', 'Medical & Health'),
        ('hr', 'Human Resources'),
        ('administration', 'Administration'),
        ('procurement', 'Procurement'),
        ('other', 'Other'),
    ]
    dept_sector = models.CharField(
        max_length=20,
        choices=SECTOR_CHOICES,
        default='other',
        help_text="Organization sector this department belongs to"
    )
    
    description = models.TextField(
        blank=True, 
        null=True,
        help_text="Additional details about department"
    )
    
    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        ordering = ['department_id']
    
    def save(self, *args, **kwargs):
        """Auto-generate department_id if not present"""
        if not self.department_id:
            # Get the last department_id
            last_dept = Department.all_objects.filter(
                department_id__startswith='IAK-D-'
            ).order_by('department_id').last()
            
            if last_dept and last_dept.department_id:
                # Extract number and increment
                last_num = int(last_dept.department_id.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.department_id = f"IAK-D-{new_num:03d}"
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.department_id} - {self.dept_code} ({self.dept_name})"


class Designation(SoftDeleteModel):
    """
    Position types - DEPARTMENT SPECIFIC!
    
    A designation MUST belong to a department.
    When creating employee, only designations for selected department are shown.
    
    Examples:
    - Department: C06-M (Academic) → Designation: Teacher, Principal
    - Department: AIT01 (IT) → Designation: Developer, System Admin
    - Department: FIN (Finance) → Designation: Accountant, Analyst
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # 🆕 REQUIRED: Department FK
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='designations',
        help_text="Department this designation belongs to (REQUIRED)"
    )
    
    position_code = models.CharField(
        max_length=10,
        help_text="Position code used in employee_code (e.g., T, P, DEV, ACC)"
    )
    position_name = models.CharField(
        max_length=100,
        help_text="Full position name (e.g., Teacher, Developer)"
    )
    description = models.TextField(
        blank=True, 
        null=True,
        help_text="Role description and responsibilities"
    )
    
    class Meta:
        verbose_name = "Designation"
        verbose_name_plural = "Designations"
        ordering = ['department__dept_code', 'position_name']
        # Unique together: same position_code allowed for different departments
        unique_together = [['department', 'position_code']]
    
    def __str__(self):
        return f"{self.department.dept_code} - {self.position_name} ({self.position_code})"


class AcademicInstitutionInformation(SoftDeleteModel):
    """
    Academic institution details - ONLY for Academic sector departments.
    
    Renamed from CampusInformation to be more specific.
    Only departments with dept_sector='academic' can have this.
    
    This follows the same pattern as TeacherProfile in SIS:
    - Core data in Department
    - Academic-specific details here
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    department = models.OneToOneField(
        Department,
        on_delete=models.CASCADE,
        related_name='academic_info',
        help_text="Academic department this info belongs to"
    )
    
    address = models.TextField(
        blank=True,
        null=True,
        help_text="Physical address of institution"
    )
    principal_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Current principal's name"
    )
    contact_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Institution contact number"
    )
    student_capacity = models.IntegerField(
        blank=True,
        null=True,
        help_text="Total student capacity"
    )
    established_year = models.IntegerField(
        blank=True,
        null=True,
        help_text="Year institution was established"
    )
    
    class Meta:
        verbose_name = "Academic Institution Information"
        verbose_name_plural = "Academic Institution Information"
    
    def clean(self):
        """Validate that department is academic sector"""
        if self.department and self.department.dept_sector != 'academic':
            raise ValidationError(
                'Academic Institution Information can only be created for Academic sector departments.'
            )
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Academic Info: {self.department.dept_name}"


class Employee(SoftDeleteModel):
    """
    Core Employee model with AUTO-GENERATED dual identifiers.
    
    Auto-Generated Fields:
    1. employee_id: IAK-0001, IAK-0002, IAK-0003... (simple, sequential)
    2. employee_code: C06-M-24-T-0001 (detailed, based on department+designation)
    
    Designation Filtering:
    - When department is selected, only that department's designations are available
    
    Notes:
    - NO password here (authentication app handles that)
    - NO shift here (SIS-specific, stored in SIS db)
    """
    
    # Primary Key
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
        help_text="Internal UUID for database relations"
    )
    
    # 🆕 AUTO-GENERATED DUAL IDENTIFIERS
    employee_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        blank=True,
        db_index=True,
        help_text="Auto-generated simple ID (e.g., IAK-0001)"
    )
    employee_code = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        blank=True,
        db_index=True,
        help_text="Auto-generated detailed code (e.g., C06-M-24-T-0001)"
    )
    
    # Personal Information
    full_name = models.CharField(
        max_length=200,
        help_text="Employee's full name"
    )
    cnic = models.CharField(
        max_length=15,
        help_text="National ID card number (CNIC)"
    )
    phone = models.CharField(
        max_length=20,
        help_text="Contact phone number"
    )
    email = models.EmailField(
        blank=True,
        null=True,
        help_text="Email address (optional)"
    )
    dob = models.DateField(
        help_text="Date of birth"
    )
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        help_text="Gender"
    )
    
    # Extended Personal Information
    nationality = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default='Pakistani',
        help_text="Employee's nationality"
    )
    religion = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Employee's religion (optional)"
    )
    emergency_contact_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Emergency contact phone number"
    )
    
    # Address Information
    residential_address = models.TextField(
        blank=True,
        null=True,
        help_text="Current residential address"
    )
    permanent_address = models.TextField(
        blank=True,
        null=True,
        help_text="Permanent home address"
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="City of residence"
    )
    state = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="State/Province"
    )
    
    # Bank Information
    bank_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Bank name for salary account"
    )
    account_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Bank account number"
    )

    
    # Work Assignment
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='employees',
        help_text="Department employee belongs to"
    )
    designation = models.ForeignKey(
        Designation,
        on_delete=models.PROTECT,
        related_name='employees',
        help_text="Employee's position (filtered by department)"
    )
    joining_date = models.DateField(
        help_text="Date employee joined organization"
    )
    
    # Employment Type
    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('contract', 'Contract'),
        ('intern', 'Intern'),
    ]
    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_TYPE_CHOICES,
        default='full_time',
        help_text="Type of employment"
    )
    organization_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Phone number provided by organization"
    )
    
    # Education and Experience (JSON)
    education_history = models.JSONField(
        blank=True,
        null=True,
        help_text="Array of education records: [{degree, institute, passingYear}]"
    )
    work_experience = models.JSONField(
        blank=True,
        null=True,
        help_text="Array of experience records: [{employer, jobTitle, startDate, endDate, responsibilities}]"
    )
    
    # Resume File
    resume = models.FileField(
        upload_to='resumes/%Y/%m/',
        blank=True,
        null=True,
        help_text="Employee resume/CV file"
    )

    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Can this employee access services?"
    )
    is_superadmin = models.BooleanField(
        default=False,
        help_text="Has access to all services and full permissions"
    )
    
    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['employee_code']),
            models.Index(fields=['cnic']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_deleted']),
        ]
    
    def clean(self):
        """Validate that designation belongs to selected department"""
        if self.designation and self.department:
            if self.designation.department != self.department:
                raise ValidationError({
                    'designation': f'This designation belongs to {self.designation.department.dept_code}. '
                                   f'Please select a designation for {self.department.dept_code}.'
                })
    
    def save(self, *args, **kwargs):
        """Auto-generate employee_id and employee_code if not present"""
        # Validate first
        self.full_clean()
        
        # Auto-generate employee_id
        if not self.employee_id:
            last_emp = Employee.all_objects.filter(
                employee_id__startswith='IAK-'
            ).order_by('employee_id').last()
            
            if last_emp and last_emp.employee_id:
                last_num = int(last_emp.employee_id.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.employee_id = f"IAK-{new_num:04d}"
        
        # Auto-generate employee_code
        if not self.employee_code:
            # Format: {DEPT_CODE}-{YEAR}-{POSITION}-{GLOBAL_SEQ}
            year_short = str(self.joining_date.year)[-2:]
            
            # Get global sequence (same as employee_id number)
            seq_num = int(self.employee_id.split('-')[-1])
            
            self.employee_code = f"{self.department.dept_code}-{year_short}-{self.designation.position_code}-{seq_num:04d}"
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.full_name} ({self.employee_id} / {self.employee_code})"
    
    def get_full_name(self):
        """Return full name"""
        return self.full_name
    
    def get_short_name(self):
        """Return employee ID (short identifier)"""
        return self.employee_id
