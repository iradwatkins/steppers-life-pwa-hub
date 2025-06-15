import os
import json
from typing import Optional, Dict, Any
import httpx
import jwt
from jwt.algorithms import RSAAlgorithm
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from app.core.config import settings
from app.models.user import UserRole, UserStatus
from app.schemas.user import UserResponse

# Supabase configuration
SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_KEY = settings.SUPABASE_KEY
SUPABASE_JWT_SECRET = settings.SUPABASE_JWT_SECRET

# Security scheme for Supabase JWT
security = HTTPBearer()

# Cache for JWKS
jwks_cache = None
jwks_last_updated = None


class SupabaseUser(BaseModel):
    id: str
    email: str
    user_metadata: Dict[str, Any] = {}
    app_metadata: Dict[str, Any] = {}
    role: Optional[str] = None


class SupabaseService:
    @staticmethod
    async def get_jwks() -> Dict[str, Any]:
        """Fetch JSON Web Key Set from Supabase for JWT verification."""
        global jwks_cache, jwks_last_updated
        
        # Use cached JWKS if available
        if jwks_cache is not None:
            return jwks_cache
        
        async with httpx.AsyncClient() as client:
            jwk_url = f"{SUPABASE_URL}/auth/v1/jwks"
            response = await client.get(jwk_url)
            response.raise_for_status()
            jwks = response.json()
            jwks_cache = jwks
            return jwks

    @staticmethod
    async def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify a Supabase JWT token and return the payload."""
        try:
            # For secure JWT verification, get the JWKS
            jwks = await SupabaseService.get_jwks()
            
            # Get the header without verification
            header = jwt.get_unverified_header(token)
            
            # Find the key that matches the header's key ID
            key = None
            for jwk in jwks.get('keys', []):
                if jwk.get('kid') == header.get('kid'):
                    key = jwk
                    break
            
            if key is None:
                return None
            
            # Create a public key from the JWK
            public_key = RSAAlgorithm.from_jwk(json.dumps(key))
            
            # Verify and decode the token
            payload = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience='authenticated',
                options={"verify_exp": True}
            )
            
            return payload
        except (jwt.PyJWTError, json.JSONDecodeError) as e:
            print(f"Token verification error: {str(e)}")
            return None

    @staticmethod
    async def get_user_role(user_id: str) -> Optional[str]:
        """Get user role from Supabase database."""
        try:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{SUPABASE_URL}/rest/v1/user_roles?user_id=eq.{user_id}&select=role",
                    headers=headers
                )
                
                if response.status_code != 200:
                    print(f"Error fetching user role: {response.text}")
                    return None
                
                data = response.json()
                if not data or len(data) == 0:
                    return None
                
                return data[0].get('role')
        except Exception as e:
            print(f"Error fetching user role: {str(e)}")
            return None


async def get_supabase_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> SupabaseUser:
    """Get authenticated Supabase user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = await SupabaseService.verify_token(token)
        
        if payload is None:
            raise credentials_exception
        
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user role
        role = await SupabaseService.get_user_role(user_id)
        
        # Create Supabase user
        email = payload.get("email", "")
        user_metadata = payload.get("user_metadata", {})
        app_metadata = payload.get("app_metadata", {})
        
        supabase_user = SupabaseUser(
            id=user_id,
            email=email,
            user_metadata=user_metadata,
            app_metadata=app_metadata,
            role=role
        )
        
        return supabase_user
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        raise credentials_exception


def get_current_active_user(
    supabase_user: SupabaseUser = Depends(get_supabase_user),
) -> UserResponse:
    """Convert Supabase user to application user model."""
    if not supabase_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Map Supabase role to application role
    role_mapping = {
        "buyer": UserRole.USER,
        "organizer": UserRole.ORGANIZER,
        "admin": UserRole.ADMIN,
        "instructor": UserRole.INSTRUCTOR,
        "event_staff": UserRole.STAFF,
        "sales_agent": UserRole.STAFF
    }
    
    app_role = role_mapping.get(supabase_user.role, UserRole.USER)
    
    # Create user response
    user_response = UserResponse(
        id=int(supabase_user.id) if supabase_user.id.isdigit() else 0,  # Convert if possible
        email=supabase_user.email,
        username=supabase_user.user_metadata.get("username", ""),
        first_name=supabase_user.user_metadata.get("first_name", ""),
        last_name=supabase_user.user_metadata.get("last_name", ""),
        phone_number=supabase_user.user_metadata.get("phone_number", ""),
        role=app_role,
        status=UserStatus.ACTIVE,  # Assuming active
        is_verified=True,  # Assuming verified through Supabase
        is_active=True,
        created_at=supabase_user.user_metadata.get("created_at", ""),
        last_login=supabase_user.user_metadata.get("last_login", "")
    )
    
    return user_response


# Permissions helpers
def has_role(required_roles: list[UserRole]):
    """Dependency to check if user has one of the required roles."""
    async def role_checker(user: UserResponse = Depends(get_current_active_user)):
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user
    return role_checker


def is_admin(user: UserResponse = Depends(get_current_active_user)):
    """Check if user is an admin."""
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    return user


def is_organizer(user: UserResponse = Depends(get_current_active_user)):
    """Check if user is an organizer."""
    if user.role != UserRole.ORGANIZER and user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organizer role required"
        )
    return user 