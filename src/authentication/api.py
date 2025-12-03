"""
Authentication API endpoints using Django Ninja.

Endpoints:
- POST /api/auth/login - Login with employee_code + password
- POST /api/auth/logout - Logout (blacklist token)
- POST /api/auth/refresh - Refresh access token
- GET /api/auth/me - Get current user info
"""
from django.http import HttpRequest
from ninja import Router, Schema
from ninja.security import HttpBearer
from datetime import datetime, timedelta
from django.utils import timezone
from employees.models import Employee
from .models import UserCredentials, RefreshToken, BlacklistedToken
from .jwt_utils import (
    generate_access_token,
    generate_refresh_token,
    decode_token,
    verify_access_token,
    verify_refresh_token,
    get_token_expiry
)

router = Router(tags=["Authentication"])


# ================== Schemas ==================

class LoginRequest(Schema):
    employee_code: str
    password: str


class LoginResponse(Schema):
    access_token: str
    refresh_token: str
    expires_in: int  # seconds
    employee: dict


class RefreshRequest(Schema):
    refresh_token: str


class RefreshResponse(Schema):
    access_token: str
    expires_in: int


class LogoutRequest(Schema):
    access_token: str


class MessageResponse(Schema):
    message: str


class EmployeeInfoResponse(Schema):
    employee_id: str
    employee_code: str
    full_name: str
    email: str
    department: str
    designation: str
    is_superadmin: bool
    is_active: bool


class ErrorResponse(Schema):
    error: str
    detail: str = None


# ================== Bearer Token Authentication ==================

class AuthBearer(HttpBearer):
    """Bearer token authentication for protected endpoints"""
    
    def authenticate(self, request: HttpRequest, token: str):
        # Check if token is blacklisted
        if BlacklistedToken.is_blacklisted(token):
            return None
        
        # Verify token
        employee_id = verify_access_token(token)
        if not employee_id:
            return None
        
        # Get employee
        try:
            employee = Employee.objects.get(employee_id=employee_id, is_active=True, is_deleted=False)
            return employee
        except Employee.DoesNotExist:
            return None


# ================== Endpoints ==================

@router.post("/login", response={200: LoginResponse, 401: ErrorResponse, 423: ErrorResponse})
def login(request: HttpRequest, payload: LoginRequest):
    """
    Login with employee_code and password.
    
    Returns access token (1 hour) and refresh token (7 days).
    """
    try:
        # Get employee by employee_code
        employee = Employee.objects.get(
            employee_code=payload.employee_code,
            is_active=True,
            is_deleted=False
        )
    except Employee.DoesNotExist:
        return 401, {
            "error": "Invalid credentials",
            "detail": "Employee code not found or account inactive"
        }
    
    # Get user credentials
    try:
        credentials = UserCredentials.objects.get(employee=employee, is_deleted=False)
    except UserCredentials.DoesNotExist:
        return 401, {
            "error": "Invalid credentials",
            "detail": "No credentials found for this employee"
        }
    
    # Check if account is locked
    if credentials.is_locked():
        return 423, {
            "error": "Account locked",
            "detail": f"Too many failed attempts. Try again after {credentials.locked_until}"
        }
    
    # Verify password
    if not credentials.check_password(payload.password):
        credentials.record_failed_login()
        return 401, {
            "error": "Invalid credentials",
            "detail": "Incorrect password"
        }
    
    # Get client IP
    client_ip = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    # Record successful login
    credentials.record_successful_login(ip_address=client_ip)
    
    # Generate tokens
    access_token = generate_access_token(employee)
    refresh_token_str = generate_refresh_token(employee)
    
    # Store refresh token in database
    refresh_token_obj = RefreshToken.objects.create(
        employee=employee,
        token=refresh_token_str,
        expires_at=timezone.now() + timedelta(days=7),
        device_info=user_agent[:255],
        ip_address=client_ip
    )
    
    return 200, {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "expires_in": 3600,  # 1 hour
        "employee": {
            "employee_id": employee.employee_id,
            "employee_code": employee.employee_code,
            "full_name": employee.full_name,
            "department": employee.department.dept_name,
            "designation": employee.designation.position_name,
            "is_superadmin": employee.is_superadmin
        }
    }


@router.post("/logout", response={200: MessageResponse, 401: ErrorResponse}, auth=AuthBearer())
def logout(request: HttpRequest, payload: LogoutRequest):
    """
    Logout by blacklisting access token.
    
    Requires: Bearer token in Authorization header
    """
    try:
        # Get token expiry
        expires_at = get_token_expiry(payload.access_token)
        if not expires_at:
            expires_at = timezone.now() + timedelta(hours=1)
        
        # Blacklist the access token
        BlacklistedToken.objects.create(
            token=payload.access_token,
            expires_at=expires_at,
            reason='logout'
        )
        
        # Revoke all refresh tokens for this employee
        RefreshToken.objects.filter(
            employee=request.auth,
            is_revoked=False
        ).update(is_revoked=True)
        
        return 200, {"message": "Logged out successfully"}
    
    except Exception as e:
        return 401, {
            "error": "Logout failed",
            "detail": str(e)
        }


@router.post("/refresh", response={200: RefreshResponse, 401: ErrorResponse})
def refresh_token(request: HttpRequest, payload: RefreshRequest):
    """
    Refresh access token using refresh token.
    
    Returns new access token (1 hour).
    """
    try:
        # Verify refresh token
        employee_id = verify_refresh_token(payload.refresh_token)
        if not employee_id:
            return 401, {
                "error": "Invalid refresh token",
                "detail": "Token is invalid or expired"
            }
        
        # Check if refresh token exists in database and is valid
        try:
            refresh_token_obj = RefreshToken.objects.get(
                token=payload.refresh_token,
                employee__employee_id=employee_id
            )
        except RefreshToken.DoesNotExist:
            return 401, {
                "error": "Invalid refresh token",
                "detail": "Token not found in database"
            }
        
        # Check if token is valid
        if not refresh_token_obj.is_valid():
            return 401, {
                "error": "Invalid refresh token",
                "detail": "Token has been revoked or expired"
            }
        
        # Get employee
        employee = Employee.objects.get(
            employee_id=employee_id,
            is_active=True,
            is_deleted=False
        )
        
        # Generate new access token
        new_access_token = generate_access_token(employee)
        
        return 200, {
            "access_token": new_access_token,
            "expires_in": 3600
        }
    
    except Employee.DoesNotExist:
        return 401, {
            "error": "Employee not found",
            "detail": "Employee is inactive or deleted"
        }
    except Exception as e:
        return 401, {
            "error": "Refresh failed",
            "detail": str(e)
        }


@router.get("/me", response={200: EmployeeInfoResponse, 401: ErrorResponse}, auth=AuthBearer())
def get_current_user(request: HttpRequest):
    """
    Get current authenticated user info.
    
    Requires: Bearer token in Authorization header
    """
    employee = request.auth  # Set by AuthBearer
    
    return 200, {
        "employee_id": employee.employee_id,
        "employee_code": employee.employee_code,
        "full_name": employee.full_name,
        "email": employee.email or "",
        "department": employee.department.dept_name,
        "designation": employee.designation.position_name,
        "is_superadmin": employee.is_superadmin,
        "is_active": employee.is_active
    }
