"""
JWT token utilities for authentication.

Handles:
- Access token generation (1 hour expiry)
- Refresh token generation (7 days expiry)
- Token validation and decoding
"""
import jwt
import uuid
from datetime import datetime, timedelta
from django.conf import settings
from decouple import config


# JWT Configuration
JWT_SECRET = config('SECRET_KEY')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRY = timedelta(hours=1)
REFRESH_TOKEN_EXPIRY = timedelta(days=7)


def generate_access_token(employee, **kwargs):
    """
    Generate JWT access token for employee.
    
    Token contains:
    - employee_id
    - employee_code 
    - full_name
    - department info
    - is_superadmin flag
    - expiry timestamp
    """
    payload = {
        'employee_id': employee.employee_id,
        'employee_code': employee.employee_code,
        'full_name': employee.full_name,
        'department_id': employee.department.department_id,
        'department_name': employee.department.dept_name,
        'designation': employee.designation.position_name,
        'email': employee.email,
        'is_superadmin': employee.is_superadmin,
        'is_active': employee.is_active,
        'exp': datetime.utcnow() + ACCESS_TOKEN_EXPIRY,
        'iat': datetime.utcnow(),
        'token_type': 'access',
        'sub': str(employee.id),  # Standard subject claim
        'user_id': str(employee.id),
        'jti': str(uuid.uuid4()),
    }
    
    # Add any extra claims (e.g. role from HDMS login)
    payload.update(kwargs)
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def generate_refresh_token(employee):
    """
    Generate JWT refresh token for employee.
    
    Simpler payload - just identifies the employee.
    """
    payload = {
        'employee_id': employee.employee_id,
        'exp': datetime.utcnow() + REFRESH_TOKEN_EXPIRY,
        'iat': datetime.utcnow(),
        'token_type': 'refresh',
        'user_id': str(employee.id),
        'jti': str(uuid.uuid4()),
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token):
    """
    Decode and validate JWT token.
    
    Returns payload if valid, raises exception if invalid/expired.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


def verify_access_token(token):
    """
    Verify access token and return employee data.
    
    Returns employee_id if valid, None if invalid.
    """
    try:
        payload = decode_token(token)
        
        # Check token type
        if payload.get('token_type') != 'access':
            return None
        
        return payload.get('employee_id')
    except:
        return None


def verify_refresh_token(token):
    """
    Verify refresh token and return employee_id.
    
    Returns employee_id if valid, None if invalid.
    """
    try:
        payload = decode_token(token)
        
        # Check token type
        if payload.get('token_type') != 'refresh':
            return None
        
        return payload.get('employee_id')
    except:
        return None


def get_token_expiry(token):
    """Get expiry timestamp from token"""
    try:
        payload = decode_token(token)
        exp_timestamp = payload.get('exp')
        if exp_timestamp:
            return datetime.fromtimestamp(exp_timestamp)
        return None
    except:
        return None
