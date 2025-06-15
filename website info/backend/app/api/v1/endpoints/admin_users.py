from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User, UserRole, UserStatus
from app.models.user_account import UserAccount
from app.models.user_payment_info import UserPaymentInfo
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema, UserInDB
from app.services.account_service import account_service
from app.core.security import get_password_hash

router = APIRouter()

# User Management Endpoints

@router.get("/", response_model=List[UserSchema])
async def list_users(
    skip: int = Query(0, description="Number of users to skip"),
    limit: int = Query(100, le=1000, description="Number of users to return"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    status: Optional[UserStatus] = Query(None, description="Filter by user status"),
    search: Optional[str] = Query(None, description="Search by email or name"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all users (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    
    if status:
        query = query.filter(User.status == status)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_term)) |
            (User.first_name.ilike(search_term)) |
            (User.last_name.ilike(search_term)) |
            (User.username.ilike(search_term))
        )
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=UserSchema)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if user_data.username:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        role=user_data.role or UserRole.USER,
        status=user_data.status or UserStatus.ACTIVE,
        is_verified=True,  # Admin created users are auto-verified
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create account for the user
    account_service.get_or_create_account(db, db_user.id)
    
    return db_user

@router.get("/{user_id}", response_model=UserInDB)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user details (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user details (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "password" and value:
            # Hash new password
            setattr(user, "hashed_password", get_password_hash(value))
        else:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    if current_user.role != UserRole.ADMIN:  # Only full admins can delete
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    
    return {"success": True, "message": f"User {user.email} deleted successfully"}

# Role Management Endpoints

@router.get("/roles/list")
async def list_roles(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all available user roles"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    roles = [
        {
            "name": role.value,
            "display_name": role.value.replace("_", " ").title(),
            "description": get_role_description(role)
        }
        for role in UserRole
    ]
    
    return {"roles": roles}

@router.get("/roles/statistics")
async def get_role_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get statistics about user roles"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    from sqlalchemy import func
    
    role_stats = db.query(
        User.role,
        func.count(User.id).label('count')
    ).group_by(User.role).all()
    
    total_users = db.query(func.count(User.id)).scalar()
    
    statistics = {
        "total_users": total_users,
        "by_role": {
            stat.role.value: {
                "count": stat.count,
                "percentage": round((stat.count / total_users) * 100, 2) if total_users > 0 else 0
            }
            for stat in role_stats
        }
    }
    
    return statistics

@router.post("/{user_id}/role")
async def assign_role(
    user_id: int,
    role_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Assign role to user"""
    if current_user.role != UserRole.ADMIN:  # Only full admins can assign roles
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        new_role = UserRole(role_data["role"])
    except (KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role specified"
        )
    
    old_role = user.role
    user.role = new_role
    db.commit()
    
    return {
        "success": True,
        "message": f"User role changed from {old_role.value} to {new_role.value}",
        "user_id": user_id,
        "old_role": old_role.value,
        "new_role": new_role.value
    }

@router.get("/{user_id}/permissions")
async def get_user_permissions(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get user permissions based on role"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    permissions = get_role_permissions(user.role)
    
    return {
        "user_id": user_id,
        "role": user.role.value,
        "permissions": permissions
    }

# User Status Management

@router.post("/{user_id}/activate")
async def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Activate user account"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.status = UserStatus.ACTIVE
    user.is_active = True
    db.commit()
    
    return {"success": True, "message": f"User {user.email} activated"}

@router.post("/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Deactivate user account"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user.status = UserStatus.INACTIVE
    user.is_active = False
    db.commit()
    
    return {"success": True, "message": f"User {user.email} deactivated"}

@router.post("/{user_id}/suspend")
async def suspend_user(
    user_id: int,
    suspension_data: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Suspend user account"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend your own account"
        )
    
    user.status = UserStatus.SUSPENDED
    user.is_active = False
    db.commit()
    
    reason = suspension_data.get("reason", "No reason provided")
    
    return {
        "success": True, 
        "message": f"User {user.email} suspended",
        "reason": reason
    }

# Helper Functions

def get_role_description(role: UserRole) -> str:
    """Get description for user role"""
    descriptions = {
        UserRole.USER: "Regular user with basic access",
        UserRole.ORGANIZER: "Can create and manage events",
        UserRole.PROMOTER: "Can promote events and earn commissions",
        UserRole.INSTRUCTOR: "Can conduct classes and workshops",
        UserRole.MODERATOR: "Can moderate content and users",
        UserRole.ADMIN: "Full administrative access"
    }
    return descriptions.get(role, "Unknown role")

def get_role_permissions(role: UserRole) -> List[str]:
    """Get permissions for user role"""
    permissions = {
        UserRole.USER: [
            "view_events",
            "purchase_tickets",
            "manage_profile",
            "view_account_balance"
        ],
        UserRole.ORGANIZER: [
            "view_events",
            "create_events",
            "manage_own_events",
            "purchase_tickets",
            "manage_profile",
            "view_account_balance",
            "withdraw_funds",
            "transfer_funds"
        ],
        UserRole.PROMOTER: [
            "view_events",
            "promote_events",
            "purchase_tickets",
            "manage_profile",
            "view_account_balance",
            "withdraw_funds",
            "transfer_funds",
            "view_commissions"
        ],
        UserRole.INSTRUCTOR: [
            "view_events",
            "create_classes",
            "manage_own_classes",
            "purchase_tickets",
            "manage_profile",
            "view_account_balance",
            "withdraw_funds"
        ],
        UserRole.MODERATOR: [
            "view_events",
            "moderate_content",
            "manage_users",
            "view_reports",
            "manage_profile",
            "view_account_balance"
        ],
        UserRole.ADMIN: [
            "view_events",
            "create_events",
            "manage_all_events",
            "moderate_content",
            "manage_users",
            "manage_roles",
            "view_reports",
            "manage_payments",
            "manage_disbursements",
            "system_administration",
            "full_access"
        ]
    }
    return permissions.get(role, []) 