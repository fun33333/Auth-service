"""
Employees API endpoints for Auth Service.

Provides REST API for employee management including creation,
retrieval, and updates for integration with HDMS frontend.
"""
from ninja import Router, File, Form
from ninja.files import UploadedFile
import requests
import os
from typing import Optional, List
from pydantic import BaseModel, validator
from datetime import date, datetime
from employees.models import Employee, Organization, Institution, Department, Designation, EmployeeAssignment
from django.db import transaction
from django.shortcuts import get_object_or_404
import re
import logging

router = Router(tags=["employees"])
logger = logging.getLogger(__name__)


# Pydantic Schemas
class EducationSchema(BaseModel):
    """Education record from frontend"""
    degree: str
    institute: str
    passingYear: str


class ExperienceSchema(BaseModel):
    """Work experience record from frontend"""
    employer: str
    jobTitle: str
    startDate: str
    endDate: str
    responsibilities: str


class EmployeeCreateSchema(BaseModel):
    """Schema for creating employee from frontend form"""
    # Personal Information
    fullName: str
    dob: Optional[str] = None
    cnic: str
    gender: str
    maritalStatus: Optional[str] = None
    nationality: Optional[str] = 'Pakistani'
    religion: Optional[str] = None
    
    # Contact Information
    personalEmail: str
    mobile: str
    orgEmail: Optional[str] = None
    orgPhone: Optional[str] = None
    emergencyName: Optional[str] = None
    emergencyPhone: Optional[str] = None
    residentialAddress: str
    permanentAddress: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    # resumeUrl is handled via multipart file now
    
    # Assignment Details (Mapped to primary assignment)
    organizationCode: str = 'IAK'  # Default for NGO
    institutionCode: Optional[str] = None
    departmentCode: str 
    designationCode: str
    joiningDate: Optional[str] = None
    shift: Optional[str] = 'general'
    
    # Bank Information
    bankName: Optional[str] = None
    accountNumber: Optional[str] = None
    
    # Additional Data
    education: Optional[List[EducationSchema]] = None
    experience: Optional[List[ExperienceSchema]] = None

    @validator('cnic')
    def validate_cnic(cls, v):
        if not re.match(r'^\d{5}-?\d{7}-?\d{1}$', v):
            raise ValueError('Invalid Pakistani CNIC format (XXXXX-XXXXXXX-X)')
        return v.replace('-', '')

    @validator('mobile', 'emergencyPhone', 'orgPhone')
    def validate_phone(cls, v):
        if v and not re.match(r'^(\+92|92|0|0092)?3\d{2}-?\d{7}$', v):
            raise ValueError('Invalid Pakistani Mobile number format')
        return v

    @validator('personalEmail', 'orgEmail')
    def validate_email(cls, v):
        if v and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
            raise ValueError('Invalid email format')
        return v


class EmployeeResponseSchema(BaseModel):
    """Response schema after employee creation"""
    message: str
    employee_id: str
    employee_code: str
    
    class Config:
        from_attributes = True


class ErrorResponseSchema(BaseModel):
    """Error response schema"""
    error: str

class DepartmentCreateSchema(BaseModel):  # Changed from Schema to BaseModel
    """Schema for creating a department"""
    dept_code: str
    dept_name: str
    dept_sector: Optional[str] = 'other'  # Optional, not stored in DB
    description: Optional[str] = None

class DepartmentUpdateSchema(BaseModel):  # Changed from Schema to BaseModel
    """Schema for updating a department"""
    dept_name: Optional[str] = None
    dept_sector: Optional[str] = None  # Optional, not stored in DB
    description: Optional[str] = None

class DepartmentDetailSchema(BaseModel):  # Changed from Schema to BaseModel
    """Schema for department detail response"""
    department_id: str
    dept_code: str
    dept_name: str
    dept_sector: Optional[str] = 'other'  # Default fallback
    description: Optional[str] = None
    employee_count: int
    designations: list

class DesignationCreateSchema(BaseModel):
    """Schema for creating a designation"""
    department_code: str  # dept_code of the department
    position_code: str
    position_name: str
    description: str = None

class DesignationUpdateSchema(BaseModel):
    """Schema for updating a designation"""
    position_name: str = None
    description: str = None

from authentication.api import AuthBearer

@router.post(
    "/employees",
    response={201: dict, 400: dict},
    summary="Create New Employee",
    description="Create employee from frontend form. If a resume is provided, it is renamed based on ID and Name before being uploaded to file-service.",
    auth=AuthBearer()
)
def create_employee(request, payload: EmployeeCreateSchema = Form(...), resume: UploadedFile = File(None)):
    token = request.auth_token if hasattr(request, 'auth_token') else None
    # Alternatively, get it from request headers if not using custom auth wrapper logic for token storage
    if not token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
    field_errors = {}
    
    try:
        # === VALIDATION PHASE ===
        cnic_clean = payload.cnic.replace('-', '').replace(' ', '')
        if Employee.objects.filter(cnic=cnic_clean, is_deleted=False).exists():
            field_errors['cnic'] = ['An employee with this CNIC already exists']
        
        # Check for Detailed Duplicate Warning for Personal Email
        existing_emp = Employee.objects.filter(personal_email=payload.personalEmail, is_deleted=False).first()
        warning = None
        if existing_emp:
            warning = f"Notice: This email already exists and belongs to {existing_emp.full_name} (Code: {existing_emp.employee_code}, ID: {existing_emp.employee_id})."
        
        # Org/Inst/Dept/Designation Validation
        org = Organization.objects.filter(org_code=payload.organizationCode).first()
        if not org:
            field_errors['organizationCode'] = ["Organization not found"]
            
        inst = None
        if payload.institutionCode:
            inst = Institution.objects.filter(inst_code=payload.institutionCode).first()
            if not inst:
                field_errors['institutionCode'] = ["Institution not found"]
        
        dept = Department.objects.filter(dept_code=payload.departmentCode).first()
        if not dept:
            field_errors['departmentCode'] = ["Department not found"]
            
        designation = None
        if dept:
            designation = Designation.objects.filter(department=dept, position_code=payload.designationCode).first()
            if not designation:
                field_errors['designationCode'] = ["Designation not found for this department"]

        if field_errors:
            return 400, {"error": "Validation failed", "field_errors": field_errors}

        # Date Parsing
        dob = datetime.strptime(payload.dob, '%Y-%m-%d').date() if payload.dob else date(1990, 1, 1)
        joining_date = datetime.strptime(payload.joiningDate, '%Y-%m-%d').date() if payload.joiningDate else date.today()

        with transaction.atomic():
            # Create Employee
            employee = Employee.objects.create(
                organization=org,
                full_name=payload.fullName,
                cnic=cnic_clean,
                personal_phone=payload.mobile,
                personal_email=payload.personalEmail,
                resume_url=None, # Managed by proxy logic after ID generation
                org_email=payload.orgEmail,
                org_phone=payload.orgPhone,
                dob=dob,
                gender=payload.gender,
                marital_status=payload.maritalStatus,
                nationality=payload.nationality or 'Pakistani',
                religion=payload.religion,
                residential_address=payload.residentialAddress,
                permanent_address=payload.permanentAddress,
                city=payload.city,
                state=payload.state,
                emergency_contact_name=payload.emergencyName,
                emergency_contact_phone=payload.emergencyPhone,
                bank_name=payload.bankName,
                account_number=payload.accountNumber,
                education_history=[e.dict() for e in payload.education or []],
                work_experience=[e.dict() for e in payload.experience or []],
            )

            # Create Primary Assignment
            EmployeeAssignment.objects.create(
                employee=employee,
                institution=inst,
                department=dept,
                designation=designation,
                joining_date=joining_date,
                is_primary=True,
                shift=payload.shift or 'general'
            )

        # === RESUME UPLOAD PROXY (After ID generation) ===
        if resume:
            try:
                # Rename the file: [ID]_[Name].[ext]
                ext = os.path.splitext(resume.name)[1]
                safe_name = payload.fullName.replace(" ", "_")
                new_filename = f"{employee.employee_id}_{safe_name}{ext}"
                
                # Forward to File Service
                file_service_url = os.environ.get('FILE_SERVICE_URL', 'http://file-service:8005')
                upload_endpoint = f"{file_service_url}/api/v1/files/upload" 
                
                headers = {}
                if token:
                    headers['Authorization'] = f'Bearer {token}'
                
                params = {
                    'category': 'resumes',
                    'uploaded_by_id': str(employee.id)
                }
                files = {'file': (new_filename, resume.read(), resume.content_type)}
                r = requests.post(upload_endpoint, files=files, params=params, headers=headers, timeout=10)
                
                if r.status_code in [200, 201]:
                    file_data = r.json()
                    file_key = file_data.get('file_key')
                    if file_key:
                        # Construct a URL that the browser can access
                        # Use PUBLIC_GATEWAY_URL if set, fallback to localhost for dev
                        gateway_url = os.environ.get('PUBLIC_GATEWAY_URL', 'http://localhost')
                        employee.resume_url = f"{gateway_url}/api/v1/files/{file_key}/download"
                        employee.save(update_fields=['resume_url'])
                else:
                    warning = f"{warning + ' ' if warning else ''}Resume upload failed ({r.status_code}). Please attach it manually later."
            except Exception as upload_err:
                logger.error(f"Resume proxy failed: {str(upload_err)}")
                warning = f"{warning + ' ' if warning else ''}Resume proxy error. Employee saved without resume."

        return 201, {
            "message": "Employee created successfully",
            "warning": warning,
            "employee_id": employee.employee_id,
            "employee_code": employee.employee_code
        }
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return 400, {"error": f"Server error: {str(e)}"}


@router.get("/departments", response=List[dict])
def list_departments(request):
    """Get all active departments for dropdown"""
    departments = Department.objects.filter(is_deleted=False).values(
        'id', 'dept_code', 'dept_name'
    )
    # Manually add department_id (from id) and dept_sector (default)
    return [
        {
            'id': str(d['id']),
            'department_id': str(d['id']),
            'dept_code': d['dept_code'],
            'dept_name': d['dept_name'],
            'dept_sector': 'other',  # Default fallback since field was removed
        }
        for d in departments
    ]

@router.post("/departments", response={201: dict, 400: ErrorResponseSchema})
def create_department(request, payload: DepartmentCreateSchema):
    """Create a new department"""
    import re
    
    # Validate dept_code length
    if len(payload.dept_code) > 6:
        return 400, {"error": "Department code must be 6 characters or less"}
    
    # Validate alphanumeric
    if not re.match(r'^[A-Za-z0-9]+$', payload.dept_code):
        return 400, {"error": "Department code must be alphanumeric only"}
    
    # Check uniqueness
    if Department.objects.filter(dept_code=payload.dept_code).exists():
        return 400, {"error": f"Department code '{payload.dept_code}' already exists"}
    
    try:
        dept = Department.objects.create(
            dept_code=payload.dept_code.upper(),
            dept_name=payload.dept_name,
            description=payload.description
        )
        return 201, {
            "message": "Department created successfully",
            "department_id": str(dept.id),
            "dept_code": dept.dept_code
        }
    except Exception as e:
        return 400, {"error": str(e)}


@router.get("/departments/{dept_code}", response={200: dict, 404: ErrorResponseSchema})
def get_department(request, dept_code: str):
    """Get single department with employee count and designations"""
    try:
        dept = Department.objects.get(dept_code=dept_code)
        return 200, {
            "department_id": str(dept.id),
            "dept_code": dept.dept_code,
            "dept_name": dept.dept_name,
            "dept_sector": "other",  # Default fallback
            "description": dept.description,
            "employee_count": dept.assignments.filter(is_deleted=False).count(),
            "designations": [
                {"position_code": d.position_code, "position_name": d.position_name}
                for d in dept.designations.filter(is_deleted=False)
            ]
        }
    except Department.DoesNotExist:
        return 404, {"error": f"Department '{dept_code}' not found"}


@router.put("/departments/{dept_code}", response={200: dict, 400: ErrorResponseSchema, 404: ErrorResponseSchema})
def update_department(request, dept_code: str, payload: DepartmentUpdateSchema):
    """Update department details"""
    try:
        dept = Department.objects.get(dept_code=dept_code)
        
        if payload.dept_name is not None:
            dept.dept_name = payload.dept_name
        # dept_sector is no longer stored in DB, ignore it
        if payload.description is not None:
            dept.description = payload.description
        
        dept.save()
        return 200, {
            "message": "Department updated successfully",
            "dept_code": dept.dept_code
        }
    except Department.DoesNotExist:
        return 404, {"error": f"Department '{dept_code}' not found"}
    except Exception as e:
        return 400, {"error": str(e)}


@router.delete("/departments/{dept_code}", response={200: dict, 400: ErrorResponseSchema, 404: ErrorResponseSchema})
def delete_department(request, dept_code: str):
    """Soft delete a department (only if no active employees)"""
    try:
        dept = Department.objects.get(dept_code=dept_code)
        
        # Check for active employees via assignments
        active_employees = dept.assignments.filter(is_deleted=False).count()
        if active_employees > 0:
            return 400, {"error": f"Cannot delete department with {active_employees} active employees"}
        
        dept.soft_delete()  # Use soft_delete method
        return 200, {"message": f"Department '{dept_code}' deleted successfully"}
    except Department.DoesNotExist:
        return 404, {"error": f"Department '{dept_code}' not found"}

@router.get("/designations", response=List[dict])
def list_designations(request, department_code: str = None):
    """Get designations, optionally filtered by department"""
    query = Designation.objects.filter(is_deleted=False)
    
    if department_code:
        query = query.filter(department__dept_code=department_code)
    
    designations = query.values(
        'id', 'position_code', 'position_name', 'department__dept_code'
    )
    return list(designations)

@router.post("/designations", response={201: dict, 400: ErrorResponseSchema})
def create_designation(request, payload: DesignationCreateSchema):
    """Create a new designation for a department"""
    import re
    
    # Validate position_code length
    if len(payload.position_code) > 4:
        return 400, {"error": "Position code must be 4 characters or less"}
    
    # Validate alphanumeric
    if not re.match(r'^[A-Za-z0-9]+$', payload.position_code):
        return 400, {"error": "Position code must be alphanumeric only"}
    
    # Find department
    try:
        department = Department.objects.get(dept_code=payload.department_code, is_deleted=False)
    except Department.DoesNotExist:
        return 400, {"error": f"Department '{payload.department_code}' not found"}
    
    # Check uniqueness within department
    if Designation.objects.filter(department=department, position_code=payload.position_code).exists():
        return 400, {"error": f"Position code '{payload.position_code}' already exists in department '{payload.department_code}'"}
    
    try:
        designation = Designation.objects.create(
            department=department,
            position_code=payload.position_code.upper(),
            position_name=payload.position_name,
            description=payload.description
        )
        return 201, {
            "message": "Designation created successfully",
            "id": str(designation.id),
            "position_code": designation.position_code,
            "department_code": department.dept_code
        }
    except Exception as e:
        return 400, {"error": str(e)}


@router.get("/designations/{designation_id}", response={200: dict, 404: ErrorResponseSchema})
def get_designation(request, designation_id: str):
    """Get single designation details"""
    try:
        designation = Designation.objects.select_related('department').get(id=designation_id)
        return 200, {
            "id": str(designation.id),
            "position_code": designation.position_code,
            "position_name": designation.position_name,
            "description": designation.description,
            "department": {
                "dept_code": designation.department.dept_code,
                "dept_name": designation.department.dept_name
            }
        }
    except Designation.DoesNotExist:
        return 404, {"error": "Designation not found"}


@router.put("/designations/{designation_id}", response={200: dict, 400: ErrorResponseSchema, 404: ErrorResponseSchema})
def update_designation(request, designation_id: str, payload: DesignationUpdateSchema):
    """Update designation details"""
    try:
        designation = Designation.objects.get(id=designation_id)
        
        if payload.position_name is not None:
            designation.position_name = payload.position_name
        if payload.description is not None:
            designation.description = payload.description
        
        designation.save()
        return 200, {
            "message": "Designation updated successfully",
            "position_code": designation.position_code
        }
    except Designation.DoesNotExist:
        return 404, {"error": "Designation not found"}
    except Exception as e:
        return 400, {"error": str(e)}


@router.delete("/designations/{designation_id}", response={200: dict, 400: ErrorResponseSchema, 404: ErrorResponseSchema})
def delete_designation(request, designation_id: str):
    """Soft delete a designation (only if no active employees)"""
    try:
        designation = Designation.objects.get(id=designation_id)
        
        # Check for active employees
        active_employees = designation.employees.filter(is_deleted=False).count()
        if active_employees > 0:
            return 400, {"error": f"Cannot delete designation with {active_employees} active employees"}
        
        designation.soft_delete()  # Use soft_delete method
        return 200, {"message": f"Designation '{designation.position_code}' deleted successfully"}
    except Designation.DoesNotExist:
        return 404, {"error": "Designation not found"}

@router.get("/employees", response=dict)
def list_employees(
    request,
    page: int = 1,
    per_page: int = 20,
    search: str = None,
    department: str = None,
    designation: str = None,
    employment_type: str = None
):
    """
    List employees with pagination and filters.
    
    Query params:
    - page: Page number (default 1)
    - per_page: Items per page (default 20, max 100)
    - search: Search in name, email, employee_code
    - department: Filter by department code
    - designation: Filter by designation code
    - employment_type: Filter by employment type
    """
    try:
        # Base query - only non-deleted employees
        query = Employee.objects.filter(is_deleted=False).prefetch_related('assignments', 'assignments__department', 'assignments__designation', 'assignments__institution')
        
        # Apply search filter
        if search:
            from django.db.models import Q
            query = query.filter(
                Q(full_name__icontains=search) |
                Q(personal_email__icontains=search) |
                Q(org_email__icontains=search) |
                Q(employee_code__icontains=search) |
                Q(employee_id__icontains=search)
            )
        
        # Apply department filter (via assignments)
        if department:
            query = query.filter(assignments__department__dept_code=department)
        
        # Apply designation filter (via assignments)
        if designation:
            query = query.filter(assignments__designation__position_code=designation)
        
        # Get total count
        total = query.distinct().count()
        
        # Pagination
        per_page = min(per_page, 100)
        start = (page - 1) * per_page
        employees = query.order_by('-created_at').distinct()[start:start + per_page]
        
        employee_list = []
        for emp in employees:
            primary = emp.assignments.filter(is_primary=True).first()
            employee_list.append({
                'employee_id': emp.employee_id,
                'employee_code': emp.employee_code,
                'full_name': emp.full_name,
                'email': emp.personal_email,
                'phone': emp.personal_phone,
                'primary_assignment': {
                    'department': primary.department.dept_name if primary else None,
                    'designation': primary.designation.position_name if primary else None,
                    'institution': primary.institution.name if primary and primary.institution else "Global",
                } if primary else None,
                'is_active': emp.is_active,
                'created_at': emp.created_at.isoformat()
            })
        
        return {
            'employees': employee_list,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        }
    
    except Exception as e:
        logger.error(f"Error listing employees: {str(e)}", exc_info=True)
        return {
            'employees': [],
            'total': 0,
            'page': 1,
            'per_page': per_page,
            'total_pages': 0,
            'error': str(e)
        }


@router.get("/employees/{employee_id}", response=dict)
def get_employee(request, employee_id: str):
    """
    Get single employee details by employee_id.
    
    Returns complete employee information including education, experience, etc.
    """
    try:
        employee = Employee.objects.prefetch_related(
            'assignments', 'assignments__department', 'assignments__designation', 'assignments__institution'
        ).get(employee_id=employee_id, is_deleted=False)
        
        assignments = []
        for asn in employee.assignments.filter(is_deleted=False):
            assignments.append({
                'institution': asn.institution.name if asn.institution else "Global",
                'department': asn.department.dept_name,
                'designation': asn.designation.position_name,
                'shift': asn.get_shift_display(),
                'joining_date': asn.joining_date.isoformat(),
                'is_primary': asn.is_primary,
                'role_data': asn.role_data
            })

        return {
            'employee_id': employee.employee_id,
            'employee_code': employee.employee_code,
            'full_name': employee.full_name,
            'personal_email': employee.personal_email,
            'personal_phone': employee.personal_phone,
            'org_email': employee.org_email,
            'org_phone': employee.org_phone,
            'cnic': employee.cnic,
            'dob': employee.dob.isoformat() if employee.dob else None,
            'gender': employee.get_gender_display(),
            'marital_status': employee.get_marital_status_display(),
            'nationality': employee.nationality,
            'religion': employee.religion,
            'emergency_contact': {
                'name': employee.emergency_contact_name,
                'phone': employee.emergency_contact_phone
            },
            'address': {
                'residential': employee.residential_address,
                'permanent': employee.permanent_address,
                'city': employee.city,
                'state': employee.state,
            },
            'assignments': assignments,
            'bank_info': {
                'bank_name': employee.bank_name,
                'account_number': employee.account_number,
            },
            'education_history': employee.education_history,
            'work_experience': employee.work_experience,
            'is_active': employee.is_active,
            'created_at': employee.created_at.isoformat(),
        }
    
    except Employee.DoesNotExist:
        return 404, {'error': f'Employee with ID {employee_id} not found'}
    except Exception as e:
        logger.error(f"Error getting employee {employee_id}: {str(e)}", exc_info=True)
        return 400, {'error': str(e)}


@router.delete("/employees/{employee_id}", response=dict)
def delete_employee(request, employee_id: str):
    """
    Soft delete an employee by setting is_deleted=True.
    
    This preserves the employee record but marks it as deleted.
    """
    try:
        employee = Employee.objects.get(employee_id=employee_id, is_deleted=False)
        
        # Soft delete
        employee.is_deleted = True
        employee.save()
        
        logger.info(f"Employee soft deleted: {employee.employee_code} - {employee.full_name}")
        
        return {
            'success': True,
            'message': f'Employee {employee.employee_code} deleted successfully',
            'employee_id': employee.employee_id
        }
    
    except Employee.DoesNotExist:
        return 404, {'error': f'Employee with ID {employee_id} not found'}
    except Exception as e:
        logger.error(f"Error deleting employee {employee_id}: {str(e)}", exc_info=True)
        return 400, {'error': str(e)}