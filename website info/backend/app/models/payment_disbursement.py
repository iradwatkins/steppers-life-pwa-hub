from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from decimal import Decimal

from app.core.database import Base

class DisbursementStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class DisbursementType(enum.Enum):
    COMMISSION = "commission"
    BONUS = "bonus"
    REFUND = "refund"
    MANUAL = "manual"
    EVENT_PAYOUT = "event_payout"

class PaymentDisbursement(Base):
    __tablename__ = "payment_disbursements"

    id = Column(Integer, primary_key=True, index=True)
    
    # Recipient information
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Payment details
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    disbursement_type = Column(Enum(DisbursementType), nullable=False)
    status = Column(Enum(DisbursementStatus), default=DisbursementStatus.PENDING, nullable=False)
    
    # Payment method used
    payment_method = Column(String(50), nullable=False)  # cashapp, zelle, bank_transfer, paypal
    payment_account_info = Column(String(255), nullable=True)  # Masked account info for display
    
    # External transaction tracking
    external_transaction_id = Column(String(255), nullable=True)  # ID from payment provider
    provider_reference = Column(String(255), nullable=True)  # Additional provider reference
    
    # Description and metadata
    description = Column(Text, nullable=True)
    reference_type = Column(String(50), nullable=True)  # event, ticket, manual
    reference_id = Column(String(100), nullable=True)  # ID of related object
    
    # Processing information
    initiated_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who initiated
    processed_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    
    # Fees and net amounts
    gross_amount = Column(Numeric(10, 2), nullable=True)  # Before fees
    fee_amount = Column(Numeric(10, 2), nullable=True)  # Platform fees
    net_amount = Column(Numeric(10, 2), nullable=True)  # Amount actually sent
    
    # Tax information
    is_taxable = Column(Boolean, default=True, nullable=False)
    tax_year = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="disbursements")
    initiated_by_user = relationship("User", foreign_keys=[initiated_by])

    def __repr__(self):
        return f"<PaymentDisbursement(id={self.id}, recipient_id={self.recipient_id}, amount={self.amount}, status='{self.status.value}')>"
    
    def calculate_net_amount(self, fee_percentage: float = 0.0):
        """Calculate net amount after fees"""
        if self.gross_amount:
            fee = self.gross_amount * Decimal(str(fee_percentage / 100))
            self.fee_amount = fee
            self.net_amount = self.gross_amount - fee
        else:
            self.net_amount = self.amount
        return self.net_amount
    
    def is_processable(self):
        """Check if disbursement can be processed"""
        return self.status in [DisbursementStatus.PENDING, DisbursementStatus.FAILED] and self.retry_count < 3
    
    def mark_completed(self, external_transaction_id: str = None):
        """Mark disbursement as completed"""
        self.status = DisbursementStatus.COMPLETED
        self.completed_at = func.now()
        if external_transaction_id:
            self.external_transaction_id = external_transaction_id
    
    def mark_failed(self, error_message: str):
        """Mark disbursement as failed"""
        self.status = DisbursementStatus.FAILED
        self.error_message = error_message
        self.retry_count += 1 