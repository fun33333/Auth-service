"""
Permissions API endpoints using Django Ninja.

Endpoints:
- GET /api/permissions/services - Get employee's available services
- GET /api/permissions/check/{service} - Check access to specific service
- GET /api/permissions/hdms-role - Get HDMS role info
- GET /api/permissions/sis-role - Get SIS role info
"""
from django.http import HttpRequest
from ninja import Router, Schema
from ninja.security import HttpBearer
from authentication.api import AuthBearer
from permissions.utils import (
    get_service_accesses,
    has_service_access,
    get_hdms_role,
    get_sis_role,
    get_employee_permissions
)

router = Router(tags=["Permissions"])


from typing import Optional

# ================== Schemas ==================

class ServiceListResponse(Schema):
    employee_id: str
    employee_code: str
    full_name: str
    available_services: list


class ServiceAccessResponse(Schema):
    has_access: bool
    service: str
    role_info: Optional[dict] = None


class HdmsRoleResponse(Schema):
    has_access: bool
    role_type: Optional[str] = None
    can_view_all_tickets: bool = False
    can_assign_tickets: bool = False
    can_close_tickets: bool = False


class SisRoleResponse(Schema):
    has_access: bool
    designation: Optional[str] = None
    designation_code: Optional[str] = None
    department: Optional[str] = None


class ErrorResponse(Schema):
    error: str
    detail: str = None


# ================== Endpoints ==================

@router.get("/services", response={200: ServiceListResponse, 401: ErrorResponse}, auth=AuthBearer())
def get_available_services(request: HttpRequest):
    """
    Get list of services the authenticated employee can access.
    
    Returns list of service names (SIS, HDMS, etc.)
    """
    employee = request.auth
    services = get_service_accesses(employee)
    
    return 200, {
        "employee_id": employee.employee_id,
        "employee_code": employee.employee_code,
        "full_name": employee.full_name,
        "available_services": services
    }


@router.get("/check/{service}", response={200: ServiceAccessResponse, 401: ErrorResponse}, auth=AuthBearer())
def check_service_access(request: HttpRequest, service: str):
    """
    Check if employee has access to a specific service.
    
    Returns access status and role information if applicable.
    """
    employee = request.auth
    
    # Validate service name
    valid_services = ['sis', 'hdms', 'finance', 'hr', 'procurement']
    if service not in valid_services:
        return 401, {
            "error": "Invalid service",
            "detail": f"Service must be one of: {', '.join(valid_services)}"
        }
    
    # Get permissions
    perms = get_employee_permissions(employee, service)
    
    role_info = None
    if perms.get('has_access'):
        if service == 'hdms' and 'hdms_role' in perms:
            role_info = perms['hdms_role']
        elif service == 'sis' and 'sis_role' in perms:
            role_info = perms['sis_role']
    
    return 200, {
        "has_access": perms.get('has_access', False),
        "service": service,
        "role_info": role_info
    }


@router.get("/hdms-role", response={200: HdmsRoleResponse, 401: ErrorResponse}, auth=AuthBearer())
def get_hdms_role_info(request: HttpRequest):
    """
    Get HDMS role information for authenticated employee.
    
    Returns role type and permissions.
    """
    employee = request.auth
    role = get_hdms_role(employee)
    
    if not role:
        return 200, {
            "has_access": False
        }
    
    return 200, {
        "has_access": True,
        **role
    }


@router.get("/sis-role", response={200: SisRoleResponse, 401: ErrorResponse}, auth=AuthBearer())
def get_sis_role_info(request: HttpRequest):
    """
    Get SIS role information for authenticated employee.
    
    SIS role is based on designation - no separate role assignment!
    """
    employee = request.auth
    role = get_sis_role(employee)
    
    if not role:
        return 200, {
            "has_access": False
        }
    
    return 200, {
        "has_access": True,
        "designation": role['designation'],
        "designation_code": role['designation_code'],
        "department": role['department']
    }
