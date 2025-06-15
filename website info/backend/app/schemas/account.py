from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal

from app.models.user_account import TransactionType

class AccountBalance(BaseModel):
    user_id: int
    balance: float = Field(..., description="Current account balance")
    available_balance: float = Field(..., description="Available balance (excluding pending)")
    pending_balance: float = Field(0.0, description="Pending balance")
    total_earned: float = Field(0.0, description="Total lifetime earnings")
    total_withdrawn: float = Field(0.0, description="Total withdrawals")
    is_active: bool = Field(True, description="Account is active")
    is_frozen: bool = Field(False, description="Account is frozen")
    min_withdrawal_amount: float = Field(10.0, description="Minimum withdrawal amount")

class TransferRequest(BaseModel):
    to_user_id: int = Field(..., description="ID of recipient user")
    amount: float = Field(..., gt=0, description="Amount to transfer (must be positive)")
    description: Optional[str] = Field(None, max_length=500, description="Transfer description")

class WithdrawalRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to withdraw (must be positive)")
    payment_method: Optional[str] = Field(None, description="Preferred payment method")
    description: Optional[str] = Field(None, max_length=500, description="Withdrawal description")

class AccountTransactionSchema(BaseModel):
    id: int
    transaction_type: TransactionType
    amount: float
    description: Optional[str]
    reference_type: Optional[str]
    reference_id: Optional[str]
    balance_before: float
    balance_after: float
    created_at: datetime
    from_user_id: Optional[int] = None
    to_user_id: Optional[int] = None

    class Config:
        from_attributes = True

class AccountStatistics(BaseModel):
    account_info: AccountBalance
    transaction_stats: Dict[str, Dict[str, Any]] = Field(
        default_factory=dict,
        description="Transaction statistics by type"
    )

class CreditRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to credit")
    description: str = Field(..., max_length=500, description="Credit description")
    transaction_type: TransactionType = Field(TransactionType.CREDIT, description="Type of credit transaction")

class TransferResponse(BaseModel):
    success: bool
    message: str
    amount: float
    from_user_id: int
    to_user_id: int
    from_new_balance: float
    to_new_balance: float
    debit_transaction_id: int
    credit_transaction_id: int

class WithdrawalResponse(BaseModel):
    success: bool
    message: str
    disbursement_id: int
    transaction_id: int
    amount: float
    new_balance: float
    status: str 