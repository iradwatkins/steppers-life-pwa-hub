from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from decimal import Decimal

from app.core.database import Base

class TransactionType(enum.Enum):
    CREDIT = "credit"           # Money added to account
    DEBIT = "debit"            # Money removed from account
    TRANSFER_IN = "transfer_in"   # Money received from another user
    TRANSFER_OUT = "transfer_out" # Money sent to another user
    COMMISSION = "commission"     # Commission earned
    WITHDRAWAL = "withdrawal"     # Money withdrawn via disbursement
    REFUND = "refund"            # Refund received
    PENALTY = "penalty"          # Penalty deducted

class UserAccount(Base):
    __tablename__ = "user_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Balance information
    balance = Column(Numeric(10, 2), default=0.00, nullable=False)
    pending_balance = Column(Numeric(10, 2), default=0.00, nullable=False)  # Pending transactions
    total_earned = Column(Numeric(10, 2), default=0.00, nullable=False)     # Lifetime earnings
    total_withdrawn = Column(Numeric(10, 2), default=0.00, nullable=False)  # Total withdrawals
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_frozen = Column(Boolean, default=False, nullable=False)
    
    # Minimum withdrawal threshold
    min_withdrawal_amount = Column(Numeric(10, 2), default=10.00, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="account")
    transactions = relationship("AccountTransaction", back_populates="account")

    def __repr__(self):
        return f"<UserAccount(user_id={self.user_id}, balance=${self.balance})>"
    
    def available_balance(self):
        """Get available balance (total - pending)"""
        return self.balance - self.pending_balance
    
    def can_withdraw(self, amount: Decimal):
        """Check if user can withdraw the specified amount"""
        return (self.is_active and 
                not self.is_frozen and 
                amount <= self.available_balance() and 
                amount >= self.min_withdrawal_amount)
    
    def can_transfer(self, amount: Decimal):
        """Check if user can transfer the specified amount"""
        return (self.is_active and 
                not self.is_frozen and 
                amount <= self.available_balance() and 
                amount > 0)

class AccountTransaction(Base):
    __tablename__ = "account_transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("user_accounts.id"), nullable=False)
    
    # Transaction details
    transaction_type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    
    # Reference information
    reference_type = Column(String(50), nullable=True)  # event, ticket, disbursement, transfer
    reference_id = Column(String(100), nullable=True)   # ID of related object
    
    # Transfer information (if applicable)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # For transfers
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)    # For transfers
    
    # Balance tracking
    balance_before = Column(Numeric(10, 2), nullable=False)
    balance_after = Column(Numeric(10, 2), nullable=False)
    
    # External references
    external_transaction_id = Column(String(255), nullable=True)  # Disbursement ID, payment ID, etc.
    
    # Processing information
    processed_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin who processed
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    account = relationship("UserAccount", back_populates="transactions")
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])
    processed_by_user = relationship("User", foreign_keys=[processed_by])

    def __repr__(self):
        return f"<AccountTransaction(id={self.id}, type={self.transaction_type.value}, amount=${self.amount})>" 