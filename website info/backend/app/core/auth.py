from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
import secrets
import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
from app.core.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS

# Security scheme
security = HTTPBearer()

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password."""
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create a JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

    @staticmethod
    def generate_verification_token() -> str:
        """Generate a secure verification token."""
        return secrets.token_urlsafe(32)

    @staticmethod
    def generate_reset_token() -> str:
        """Generate a secure password reset token."""
        return secrets.token_urlsafe(32)

    @staticmethod
    def create_email_verification_token(email: str) -> str:
        """Create an email verification token."""
        data = {"email": email, "type": "email_verification"}
        expire = datetime.utcnow() + timedelta(hours=24)  # 24 hour expiry
        data.update({"exp": expire})
        return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def verify_email_verification_token(token: str) -> Optional[str]:
        """Verify email verification token and return email."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "email_verification":
                return None
            return payload.get("email")
        except JWTError:
            return None

    @staticmethod
    def create_password_reset_token(email: str) -> str:
        """Create a password reset token."""
        data = {"email": email, "type": "password_reset"}
        expire = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
        data.update({"exp": expire})
        return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def verify_password_reset_token(token: str) -> Optional[str]:
        """Verify password reset token and return email."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "password_reset":
                return None
            return payload.get("email")
        except JWTError:
            return None


# Authentication dependency functions
def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Extract and verify user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = AuthService.verify_token(token)
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        return {"user_id": int(user_id), "email": payload.get("email")}
    except (JWTError, ValueError):
        raise credentials_exception


def get_current_user(
    token_data: dict = Depends(get_current_user_from_token),
    db: Session = Depends(lambda: None)  # Will be replaced with actual db dependency
) -> 'User':
    """Get current user from database."""
    # Import here to avoid circular imports
    from app.core.database import get_db
    from app.models.user import User
    
    # Get actual database session
    if db is None:
        db = next(get_db())
    
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user


def get_current_active_user(current_user: 'User' = Depends(get_current_user)) -> 'User':
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


# Updated get_current_user function that properly handles database dependency
def get_current_user_with_db(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(lambda: None)
) -> 'User':
    """Get current user with proper database handling."""
    # Import here to avoid circular imports
    from app.core.database import get_db
    from app.models.user import User
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = AuthService.verify_token(token)
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get actual database session if not provided
        if db is None:
            db = next(get_db())
            
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        return user
        
    except (JWTError, ValueError):
        raise credentials_exception


# Override the functions to use the proper database handling
get_current_user = get_current_user_with_db

def get_current_active_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(lambda: None)
) -> 'User':
    """Get current active user with proper database handling."""
    # Import here to avoid circular imports  
    from app.core.database import get_db
    
    # Get actual database session if not provided
    if db is None:
        db = next(get_db())
    
    current_user = get_current_user_with_db(credentials, db)
    
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user 