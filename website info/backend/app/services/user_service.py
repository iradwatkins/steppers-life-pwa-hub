from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Optional, List
from datetime import datetime, timedelta

from app.models.user import User, UserRole, UserStatus
from app.schemas.user import UserRegistration, UserProfileUpdate
from app.core.auth import AuthService

class UserService:
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email address."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username."""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def create_user(db: Session, user_data: UserRegistration) -> User:
        """Create a new user."""
        # Check if user already exists
        existing_user = UserService.get_user_by_email(db, user_data.email)
        if existing_user:
            raise ValueError("Email already registered")

        # Hash password
        hashed_password = AuthService.get_password_hash(user_data.password)

        # Create verification token
        verification_token = AuthService.create_email_verification_token(user_data.email)

        # Create new user
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone_number=user_data.phone_number,
            role=UserRole.USER,
            status=UserStatus.PENDING,
            verification_token=verification_token
        )

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            return new_user
        except IntegrityError:
            db.rollback()
            raise ValueError("Email already registered")

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password."""
        user = UserService.get_user_by_email(db, email)
        if not user:
            return None
        
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active or user.status == UserStatus.SUSPENDED:
            return None
        
        return user

    @staticmethod
    def verify_email(db: Session, token: str) -> bool:
        """Verify user email with token."""
        email = AuthService.verify_email_verification_token(token)
        if not email:
            return False

        user = UserService.get_user_by_email(db, email)
        if not user:
            return False

        user.is_verified = True
        user.email_verified_at = datetime.utcnow()
        user.status = UserStatus.ACTIVE
        user.verification_token = None
        
        db.commit()
        return True

    @staticmethod
    def update_last_login(db: Session, user: User) -> None:
        """Update user's last login timestamp."""
        user.last_login = datetime.utcnow()
        db.commit()

    @staticmethod
    def update_profile(db: Session, user: User, profile_data: UserProfileUpdate) -> User:
        """Update user profile information."""
        if profile_data.first_name is not None:
            user.first_name = profile_data.first_name
        if profile_data.last_name is not None:
            user.last_name = profile_data.last_name
        if profile_data.phone_number is not None:
            user.phone_number = profile_data.phone_number
        if profile_data.username is not None:
            # Check if username is already taken
            existing_user = UserService.get_user_by_username(db, profile_data.username)
            if existing_user and existing_user.id != user.id:
                raise ValueError("Username already taken")
            user.username = profile_data.username

        user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def create_password_reset_token(db: Session, email: str) -> Optional[str]:
        """Create password reset token for user."""
        user = UserService.get_user_by_email(db, email)
        if not user:
            return None  # Don't reveal if email exists

        reset_token = AuthService.create_password_reset_token(email)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        
        db.commit()
        return reset_token

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> bool:
        """Reset user password with token."""
        email = AuthService.verify_password_reset_token(token)
        if not email:
            return False

        user = UserService.get_user_by_email(db, email)
        if not user or not user.reset_token or user.reset_token != token:
            return False

        # Check if token has expired
        if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
            return False

        # Update password
        user.hashed_password = AuthService.get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        user.updated_at = datetime.utcnow()

        db.commit()
        return True

    @staticmethod
    def get_users_list(
        db: Session, 
        skip: int = 0, 
        limit: int = 100, 
        role: Optional[UserRole] = None,
        status: Optional[UserStatus] = None
    ) -> List[User]:
        """Get list of users with pagination and filtering."""
        query = db.query(User)
        
        if role:
            query = query.filter(User.role == role)
        if status:
            query = query.filter(User.status == status)
        
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_users_count(
        db: Session, 
        role: Optional[UserRole] = None,
        status: Optional[UserStatus] = None
    ) -> int:
        """Get total count of users with filtering."""
        query = db.query(User)
        
        if role:
            query = query.filter(User.role == role)
        if status:
            query = query.filter(User.status == status)
        
        return query.count()

    @staticmethod
    def update_user_status(db: Session, user_id: int, status: UserStatus) -> Optional[User]:
        """Update user status (for admin use)."""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None

        user.status = status
        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user_role(db: Session, user_id: int, role: UserRole) -> Optional[User]:
        """Update user role (for admin use)."""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            return None

        user.role = role
        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)
        return user 