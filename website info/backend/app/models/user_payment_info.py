from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base

class PaymentMethodType(enum.Enum):
    CASHAPP = "cashapp"
    ZELLE = "zelle"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"

class UserPaymentInfo(Base):
    __tablename__ = "user_payment_info"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # CashApp Information
    cashapp_tag = Column(String(100), nullable=True)  # e.g., $username
    cashapp_phone = Column(String(20), nullable=True)
    cashapp_email = Column(String(255), nullable=True)
    cashapp_verified = Column(Boolean, default=False, nullable=False)
    
    # Zelle Information
    zelle_phone = Column(String(20), nullable=True)
    zelle_email = Column(String(255), nullable=True)
    zelle_bank_name = Column(String(100), nullable=True)
    zelle_verified = Column(Boolean, default=False, nullable=False)
    
    # Bank Transfer Information
    bank_name = Column(String(100), nullable=True)
    bank_routing_number = Column(String(20), nullable=True)
    bank_account_number = Column(String(50), nullable=True)  # Encrypted in production
    bank_account_type = Column(String(20), nullable=True)  # checking, savings
    bank_account_holder_name = Column(String(100), nullable=True)
    bank_verified = Column(Boolean, default=False, nullable=False)
    
    # PayPal Information
    paypal_email = Column(String(255), nullable=True)
    paypal_verified = Column(Boolean, default=False, nullable=False)
    
    # Preferred payment method
    preferred_method = Column(Enum(PaymentMethodType), default=PaymentMethodType.CASHAPP, nullable=True)
    
    # Additional information
    notes = Column(Text, nullable=True)
    
    # Verification and security
    kyc_verified = Column(Boolean, default=False, nullable=False)  # Know Your Customer
    tax_id_provided = Column(Boolean, default=False, nullable=False)
    w9_submitted = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="payment_info")

    def __repr__(self):
        return f"<UserPaymentInfo(user_id={self.user_id}, preferred_method='{self.preferred_method}')>"
    
    def get_active_payment_methods(self):
        """Get list of available payment methods for this user"""
        methods = []
        if self.cashapp_tag and self.cashapp_verified:
            methods.append(PaymentMethodType.CASHAPP)
        if (self.zelle_phone or self.zelle_email) and self.zelle_verified:
            methods.append(PaymentMethodType.ZELLE)
        if self.bank_account_number and self.bank_verified:
            methods.append(PaymentMethodType.BANK_TRANSFER)
        if self.paypal_email and self.paypal_verified:
            methods.append(PaymentMethodType.PAYPAL)
        return methods
    
    def can_receive_payments(self):
        """Check if user can receive payments"""
        return len(self.get_active_payment_methods()) > 0 and self.kyc_verified 