from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.schemas.user import (
    UserRegistration, UserLogin, TokenResponse, UserResponse, 
    PasswordResetRequest, PasswordResetConfirm, EmailVerificationRequest
)
from app.models.user import User, UserRole, UserStatus
from app.core.auth import AuthService
from app.core.database import get_db
from app.services.user_service import UserService
from app.services.email_service import EmailService
from app.core.supabase import get_current_active_user

router = APIRouter()
security = HTTPBearer()

# Database and email services are now imported above

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserRegistration,
    db: Session = Depends(get_db)
):
    """Register a new user account."""
    try:
        # Create new user using the service
        new_user = UserService.create_user(db, user_data)
        
        # Send verification email
        EmailService.send_verification_email(new_user.email, new_user.verification_token)
        
        # Return user response
        return UserResponse(
            id=new_user.id,
            email=new_user.email,
            username=new_user.username,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            phone_number=new_user.phone_number,
            role=UserRole(new_user.role.value),
            status=UserStatus(new_user.status.value),
            is_verified=new_user.is_verified,
            is_active=new_user.is_active,
            created_at=new_user.created_at,
            last_login=new_user.last_login
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/login", response_model=TokenResponse)
async def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Authenticate user and return access token."""
    # Authenticate user
    user = UserService.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    token_data = {"sub": user.email, "user_id": user.id}
    access_token = AuthService.create_access_token(token_data)
    
    # Update last login
    UserService.update_last_login(db, user)
    
    # Create user response
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        role=UserRole(user.role.value),
        status=UserStatus(user.status.value),
        is_verified=user.is_verified,
        is_active=user.is_active,
        created_at=user.created_at,
        last_login=user.last_login
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=1800,  # 30 minutes
        user=user_response
    )

@router.post("/verify-email")
async def verify_email(
    verification_data: EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    """Verify user email address."""
    success = UserService.verify_email(db, verification_data.token)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Get the verified user's email to send welcome email
    email = AuthService.verify_email_verification_token(verification_data.token)
    if email:
        user = UserService.get_user_by_email(db, email)
        if user and user.first_name:
            EmailService.send_welcome_email(email, user.first_name)
    
    return {"message": "Email verified successfully"}

@router.post("/password-reset-request")
async def request_password_reset(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request password reset email."""
    # Create password reset token (this also checks if user exists)
    reset_token = UserService.create_password_reset_token(db, reset_request.email)
    
    # Send reset email if user exists (service returns None for non-existent users)
    if reset_token:
        EmailService.send_password_reset_email(reset_request.email, reset_token)
    
    # Always return the same message for security (don't reveal if email exists)
    return {"message": "If email exists, password reset instructions have been sent"}

@router.post("/password-reset-confirm")
async def confirm_password_reset(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Confirm password reset with new password."""
    success = UserService.reset_password(db, reset_data.token, reset_data.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return {"message": "Password reset successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user information."""
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Get user from database
    user = UserService.get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        role=UserRole(user.role.value),
        status=UserStatus(user.status.value),
        is_verified=user.is_verified,
        is_active=user.is_active,
        created_at=user.created_at,
        last_login=user.last_login
    )

@router.get("/supabase/me", response_model=UserResponse)
async def get_supabase_user(
    user: UserResponse = Depends(get_current_active_user)
):
    """Get the current authenticated Supabase user."""
    return user 