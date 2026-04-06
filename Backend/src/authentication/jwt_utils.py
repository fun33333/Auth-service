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


def generate_access_token(user, **kwargs):
    """
    Generate JWT access token for employee or superadmin.
    
    Token contains:
    - user_id (UUID)
    - code (employee_code or superadmin_code)
    - full_name
    - is_superadmin flag
    - expiry timestamp
    """
    is_superadmin = getattr(user, 'is_superadmin', False)
    
    payload = {
        'user_id': str(user.id),
        'code': getattr(user, 'superadmin_code', None) or getattr(user, 'employee_code', None),
        'full_name': user.full_name,
        'email': user.email,
        'is_superadmin': is_superadmin,
        'is_active': user.is_active,
        'exp': datetime.utcnow() + ACCESS_TOKEN_EXPIRY,
        'iat': datetime.utcnow(),
        'token_type': 'access',
        'sub': str(user.id),
        'jti': str(uuid.uuid4()),
    }
    
    # Add employee-specific fields if it's an employee
    # Add employee-specific fields if available (even for superadmins who are employees)
    if hasattr(user, 'employee_code'):
        payload['employee_code'] = user.employee_code
        
        # Fetch from primary_assignment if available
        dept = getattr(user, 'department', None)
        pos = getattr(user, 'designation', None)
        
        payload.update({
            'employee_id': getattr(user, 'employee_id', None),
            'department_id': str(dept.id) if dept else None,
            'department_name': dept.dept_name if dept else "N/A",
            'designation': pos.position_name if pos else "N/A",
        })
    
    # Add any extra claims (e.g. role from HDMS login)
    payload.update(kwargs)
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def generate_refresh_token(user):
    """
    Generate JWT refresh token for employee or superadmin.
    """
    is_superadmin = getattr(user, 'is_superadmin', False)
    
    payload = {
        'user_id': str(user.id),
        'code': getattr(user, 'superadmin_code', None) or getattr(user, 'employee_code', None),
        'exp': datetime.utcnow() + REFRESH_TOKEN_EXPIRY,
        'iat': datetime.utcnow(),
        'token_type': 'refresh',
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
    Verify access token and return user identity data.
    
    Returns (user_id, is_superadmin) if valid, None if invalid.
    """
    try:
        payload = decode_token(token)
        
        # Check token type
        if payload.get('token_type') != 'access':
            return None
        
        return payload.get('user_id'), payload.get('is_superadmin', False)
    except:
        return None


def verify_refresh_token(token):
    """
    Verify refresh token and return user identity data.
    
    Returns (user_id, is_superadmin) if valid, None if invalid.
    """
    try:
        payload = decode_token(token)
        
        # Check token type
        if payload.get('token_type') != 'refresh':
            return None
        
        return payload.get('user_id'), payload.get('is_superadmin', False)
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
