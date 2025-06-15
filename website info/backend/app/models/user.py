from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class UserRole(enum.Enum):
    USER = "user"
    ORGANIZER = "organizer"
    PROMOTER = "promoter"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"
    MODERATOR = "moderator"

class UserStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile information
    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)
    phone_number = Column(String(20), nullable=True)
    
    # Account status and roles
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Email verification
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    verification_token = Column(String(255), nullable=True)
    
    # Password reset
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    created_events = relationship("Event", back_populates="creator")
    tickets = relationship("Ticket", foreign_keys="Ticket.user_id", back_populates="user")
    payment_info = relationship("UserPaymentInfo", back_populates="user", uselist=False)
    disbursements = relationship("PaymentDisbursement", back_populates="recipient")
    account = relationship("UserAccount", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>" 