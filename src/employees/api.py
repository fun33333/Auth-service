"""
Employees API endpoints for Auth Service.

Provides REST API for employee management including creation,
retrieval, and updates for integration with HDMS frontend.
"""
from ninja import Router, File
from ninja.files import UploadedFile
from typing import Optional, List
from pydantic import BaseModel
from datetime import date, datetime
from employees.models import Employee, Department, Designation
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
    nationality: Optional[str] = None
    religion: Optional[str] = None
    
    # Contact Information
    personalEmail: str
    mobile: str
    emergencyPhone: Optional[str] = None
    residentialAddress: str
    permanentAddress: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    
    # Employment Details
    department: str  # department code
    designation: str  # position code
    dateOfJoining: Optional[str] = None
    employmentType: Optional[str] = 'Full-time'
    
    # Bank Information
    bankName: str
    accountNumber: str
    
    # Organization Provided
    orgEmail: Optional[str] = None
    orgPhone: Optional[str] = None
    
    # Additional Data
    education: Optional[List[EducationSchema]] = None
    experience: Optional[List[ExperienceSchema]] = None


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
    dept_sector: str = 'other'
    description: str = None

class DepartmentUpdateSchema(BaseModel):  # Changed from Schema to BaseModel
    """Schema for updating a department"""
    dept_name: str = None
    dept_sector: str = None
    description: str = None

class DepartmentDetailSchema(BaseModel):  # Changed from Schema to BaseModel
    """Schema for department detail response"""
    department_id: str
    dept_code: str
    dept_name: str
    dept_sector: str
    description: str = None
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

@router.post(
    "/employees",
    response={201: EmployeeResponseSchema, 400: ErrorResponseSchema},
    summary="Create New Employee",
    description="Create employee from frontend form with comprehensive validation"
)
def create_employee(request, payload: EmployeeCreateSchema):
    """
    Create new employee from HDMS frontend with comprehensive validation.
    
    Args:
        payload: Employee data from frontend form
        
    Returns:
        201: Success with employee_id and employee_code
        400: Validation error with field-level details
    """
    field_errors = {}
    
    try:
        # === VALIDATION PHASE ===
        
        # Validate CNIC format (13 digits)
        if payload.cnic:
            cnic_clean = payload.cnic.replace('-', '').replace(' ', '')
            if not re.match(r'^\d{13}$', cnic_clean):
                field_errors['cnic'] = ['CNIC must be exactly 13 digits']
            else:
                # Check for duplicate CNIC
                if Employee.objects.filter(cnic=cnic_clean, is_deleted=False).exists():
                    field_errors['cnic'] = ['An employee with this CNIC already exists']
        
        # Validate email format and uniqueness
        if payload.personalEmail:
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', payload.personalEmail):
                field_errors['personalEmail'] = ['Invalid email format']
            elif Employee.objects.filter(email=payload.personalEmail, is_deleted=False).exists():
                field_errors['personalEmail'] = ['This email is already registered']
        
        # Validate mobile format
        if payload.mobile:
            mobile_clean = payload.mobile.replace('-', '').replace(' ', '').replace('+', '')
            if not re.match(r'^\d{10,15}$', mobile_clean):
                field_errors['mobile'] = ['Mobile number must be 10-15 digits']
        
        # Validate department exists
        try:
            department = Department.objects.get(dept_code=payload.department, is_deleted=False)
        except Department.DoesNotExist:
            field_errors['department'] = [
                f"Department '{payload.department}' not found. Please create it in admin panel first."
            ]
            department = None
        
        # Validate designation exists for this department
        if department:
            try:
                designation = Designation.objects.get(
                    department=department,
                    position_code=payload.designation,
                    is_deleted=False
                )
            except Designation.DoesNotExist:
                field_errors['designation'] = [
                    f"Designation '{payload.designation}' not found for department '{payload.department}'"
                ]
                designation = None
        else:
            designation = None
        
        # Validate dates
        if payload.dob:
            try:
                dob = datetime.strptime(payload.dob, '%Y-%m-%d').date()
                # Check age range (15-100 years)
                today = date.today()
                age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                if age < 15 or age > 100:
                    field_errors['dob'] = ['Age must be between 15 and 100 years']
            except ValueError:
                field_errors['dob'] = ['Invalid date format. Use YYYY-MM-DD']
                dob = None
        else:
            dob = date(1990, 1, 1)
        
        if payload.dateOfJoining:
            try:
                joining_date = datetime.strptime(payload.dateOfJoining, '%Y-%m-%d').date()
            except ValueError:
                field_errors['dateOfJoining'] = ['Invalid date format. Use YYYY-MM-DD']
                joining_date = None
        else:
            joining_date = date.today()
        
        # If there are validation errors, return them
        if field_errors:
            logger.warning(f"Validation failed for employee creation: {field_errors}")
            return 400, {
                "error": "Validation failed. Please check the highlighted fields.",
                "field_errors": field_errors
            }
        
        # === DATA PROCESSING PHASE ===
        
        # Map employment type
        employment_type_map = {
            'Full-time': 'full_time',
            'Part-time': 'part_time',
            'Contract': 'contract',
            'Intern': 'intern',
        }
        employment_type = employment_type_map.get(
            payload.employmentType,
            'full_time'
        )
        
        # Convert education and experience to list of dicts
        education_history = None
        if payload.education:
            education_history = [
                {
                    'degree': e.degree,
                    'institute': e.institute,
                    'passingYear': e.passingYear
                }
                for e in payload.education if e.degree or e.institute
            ]
        
        work_experience = None
        if payload.experience:
            work_experience = [
                {
                    'employer': e.employer,
                    'jobTitle': e.jobTitle,
                    'startDate': e.startDate,
                    'endDate': e.endDate,
                    'responsibilities': e.responsibilities
                }
                for e in payload.experience if e.employer or e.jobTitle
            ]
        
        # === CREATE EMPLOYEE ===
        
        employee = Employee.objects.create(
            full_name=payload.fullName,
            email=payload.orgEmail or payload.personalEmail,
            phone=payload.mobile,
            cnic=cnic_clean if payload.cnic else '',
            dob=dob,
            gender=payload.gender,
            nationality=payload.nationality,
            religion=payload.religion,
            emergency_contact_phone=payload.emergencyPhone,
            residential_address=payload.residentialAddress,
            permanent_address=payload.permanentAddress,
            city=payload.city,
            state=payload.state,
            department=department,
            designation=designation,
            joining_date=joining_date,
            employment_type=employment_type,
            organization_phone=payload.orgPhone,
            bank_name=payload.bankName,
            account_number=payload.accountNumber,
            education_history=education_history,
            work_experience=work_experience,
        )
        
        logger.info(f"Employee created successfully: {employee.employee_code} - {employee.full_name}")
        
        return 201, {
            "message": "Employee created successfully",
            "employee_id": employee.employee_id,
            "employee_code": employee.employee_code
        }
    
    except Exception as e:
        logger.error(f"Unexpected error creating employee: {str(e)}", exc_info=True)
        return 400, {
            "error": f"Server error: {str(e)}. Please contact administrator if this persists."
        }


@router.get("/departments", response=List[dict])
def list_departments(request):
    """Get all active departments for dropdown"""
    departments = Department.objects.filter(is_deleted=False).values(
        'id', 'department_id', 'dept_code', 'dept_name', 'dept_sector'
    )
    return list(departments)

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
            dept_sector=payload.dept_sector,
            description=payload.description
        )
        return 201, {
            "message": "Department created successfully",
            "department_id": dept.department_id,
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
            "department_id": dept.department_id,
            "dept_code": dept.dept_code,
            "dept_name": dept.dept_name,
            "dept_sector": dept.dept_sector,
            "description": dept.description,
            "employee_count": dept.employees.filter(is_deleted=False).count(),
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
        if payload.dept_sector is not None:
            dept.dept_sector = payload.dept_sector
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
        
        # Check for active employees
        active_employees = dept.employees.filter(is_deleted=False).count()
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
        query = Employee.objects.filter(is_deleted=False).select_related('department', 'designation')
        
        # Apply search filter
        if search:
            from django.db.models import Q
            query = query.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(employee_code__icontains=search) |
                Q(employee_id__icontains=search)
            )
        
        # Apply department filter
        if department:
            query = query.filter(department__dept_code=department)
        
        # Apply designation filter
        if designation:
            query = query.filter(designation__position_code=designation)
        
        # Apply employment type filter
        if employment_type:
            query = query.filter(employment_type=employment_type)
        
        # Get total count
        total = query.count()
        
        # Pagination
        per_page = min(per_page, 100)  # Max 100 items per page
        start = (page - 1) * per_page
        end = start + per_page
        
        employees = query.order_by('-created_at')[start:end]
        
        # Format response
        employee_list = []
        for emp in employees:
            employee_list.append({
                'employee_id': emp.employee_id,
                'employee_code': emp.employee_code,
                'full_name': emp.full_name,
                'email': emp.email,
                'phone': emp.phone,
                'department': {
                    'dept_code': emp.department.dept_code if emp.department else None,
                    'dept_name': emp.department.dept_name if emp.department else None,
                } if emp.department else None,
                'designation': {
                    'position_code': emp.designation.position_code if emp.designation else None,
                    'position_name': emp.designation.position_name if emp.designation else None,
                } if emp.designation else None,
                'employment_type': emp.get_employment_type_display(),
                'employment_type_value': emp.employment_type,
                'joining_date': emp.joining_date.isoformat() if emp.joining_date else None,
                'is_active': True,
                'created_at': emp.created_at.isoformat() if emp.created_at else None,
            })
        
        total_pages = (total + per_page - 1) // per_page
        
        return {
            'employees': employee_list,
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages
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
        employee = Employee.objects.select_related('department', 'designation').get(
            employee_id=employee_id,
            is_deleted=False
        )
        
        return {
            'employee_id': employee.employee_id,
            'employee_code': employee.employee_code,
            'full_name': employee.full_name,
            'email': employee.email,
            'phone': employee.phone,
            'cnic': employee.cnic,
            'dob': employee.dob.isoformat() if employee.dob else None,
            'gender': employee.gender,
            'nationality': employee.nationality,
            'religion': employee.religion,
            'emergency_contact_phone': employee.emergency_contact_phone,
            'residential_address': employee.residential_address,
            'permanent_address': employee.permanent_address,
            'city': employee.city,
            'state': employee.state,
            'department': {
                'dept_code': employee.department.dept_code,
                'dept_name': employee.department.dept_name,
                'dept_sector': employee.department.dept_sector,
            } if employee.department else None,
            'designation': {
                'position_code': employee.designation.position_code,
                'position_name': employee.designation.position_name,
            } if employee.designation else None,
            'joining_date': employee.joining_date.isoformat() if employee.joining_date else None,
            'employment_type': employee.get_employment_type_display(),
            'employment_type_value': employee.employment_type,
            'organization_phone': employee.organization_phone,
            'bank_name': employee.bank_name,
            'account_number': employee.account_number,
            'education_history': employee.education_history,
            'work_experience': employee.work_experience,
            'resume': employee.resume.url if employee.resume else None,
            'created_at': employee.created_at.isoformat() if employee.created_at else None,
            'updated_at': employee.updated_at.isoformat() if employee.updated_at else None,
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