from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ORGANIZER = "organizer"
    PROMOTER = "promoter"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"
    MODERATOR = "moderator"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

# User Registration Schema
class UserRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)

# User Login Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# User Profile Update Schema
class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    username: Optional[str] = Field(None, max_length=50)

# Admin User Creation Schema
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    username: Optional[str] = Field(None, max_length=50)
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    role: Optional[UserRole] = UserRole.USER
    status: Optional[UserStatus] = UserStatus.ACTIVE

# Admin User Update Schema
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    username: Optional[str] = Field(None, max_length=50)
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    is_verified: Optional[bool] = None
    is_active: Optional[bool] = None

# User Response Schema
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    phone_number: Optional[str]
    role: UserRole
    status: UserStatus
    is_verified: bool
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True

# User Schema (alias for UserResponse)
User = UserResponse

# User with all details including sensitive data (for admin use)
class UserInDB(UserResponse):
    email_verified_at: Optional[datetime]
    updated_at: datetime
    verification_token: Optional[str]
    reset_token: Optional[str]
    reset_token_expires: Optional[datetime]

# User Admin Response (includes more sensitive data for admin use)
class UserAdminResponse(UserResponse):
    email_verified_at: Optional[datetime]
    updated_at: datetime

# Authentication Token Response
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

# Password Reset Request
class PasswordResetRequest(BaseModel):
    email: EmailStr

# Password Reset Confirmation
class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

# Email Verification
class EmailVerificationRequest(BaseModel):
    token: str

# User List Response (for admin)
class UserListResponse(BaseModel):
    users: list[UserAdminResponse]
    total: int
    page: int
    per_page: int

# Role Assignment Schema
class RoleAssignment(BaseModel):
    role: UserRole

# User Account Summary (includes account balance)
class UserAccountSummary(UserResponse):
    account_balance: Optional[float] = 0.0
    total_earned: Optional[float] = 0.0
    total_withdrawn: Optional[float] = 0.0 