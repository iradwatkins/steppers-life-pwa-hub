from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal

from app.models.payment_disbursement import DisbursementStatus, DisbursementType

class PaymentDisbursementBase(BaseModel):
    amount: Decimal = Field(..., description="Amount to disburse")
    currency: str = Field("USD", description="Currency code")
    disbursement_type: DisbursementType = Field(..., description="Type of disbursement")
    payment_method: Optional[str] = Field(None, description="Preferred payment method")
    description: Optional[str] = Field(None, description="Description of the disbursement")
    reference_type: Optional[str] = Field(None, description="Type of reference (event, ticket, etc.)")
    reference_id: Optional[str] = Field(None, description="ID of related object")

class PaymentDisbursementCreate(PaymentDisbursementBase):
    recipient_id: int = Field(..., description="ID of the recipient user")
    auto_process: bool = Field(False, description="Whether to automatically process the disbursement")

class PaymentDisbursementUpdate(BaseModel):
    status: Optional[DisbursementStatus] = None
    external_transaction_id: Optional[str] = None
    error_message: Optional[str] = None
    description: Optional[str] = None

class PaymentDisbursement(PaymentDisbursementBase):
    id: int
    recipient_id: int
    status: DisbursementStatus
    payment_account_info: Optional[str] = None
    
    # External tracking
    external_transaction_id: Optional[str] = None
    provider_reference: Optional[str] = None
    
    # Processing information
    initiated_by: Optional[int] = None
    processed_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    # Error information
    error_message: Optional[str] = None
    retry_count: int = 0
    
    # Financial details
    gross_amount: Optional[Decimal] = None
    fee_amount: Optional[Decimal] = None
    net_amount: Optional[Decimal] = None
    
    # Tax information
    is_taxable: bool = True
    tax_year: Optional[int] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class DisbursementSummary(BaseModel):
    """Summary view for listing disbursements"""
    id: int
    recipient_id: int
    amount: Decimal
    net_amount: Optional[Decimal]
    status: DisbursementStatus
    disbursement_type: DisbursementType
    payment_method: str
    payment_account_info: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]

class CreateDisbursementRequest(BaseModel):
    recipient_id: int = Field(..., description="ID of the recipient user")
    amount: Decimal = Field(..., gt=0, description="Amount to disburse (must be positive)")
    disbursement_type: DisbursementType = Field(..., description="Type of disbursement")
    payment_method: Optional[str] = Field(None, description="Specific payment method to use")
    description: Optional[str] = Field(None, max_length=500, description="Description of disbursement")
    reference_type: Optional[str] = Field(None, description="Reference type (event, commission, etc.)")
    reference_id: Optional[str] = Field(None, description="Reference ID")
    auto_process: bool = Field(False, description="Auto-process the disbursement")

class ProcessDisbursementRequest(BaseModel):
    disbursement_id: int = Field(..., description="ID of disbursement to process")

class MarkCompletedRequest(BaseModel):
    external_transaction_id: Optional[str] = Field(None, description="External transaction ID")
    notes: Optional[str] = Field(None, description="Additional notes")

class DisbursementStats(BaseModel):
    """Statistics for disbursements"""
    total_disbursements: int
    total_amount: Decimal
    pending_count: int
    pending_amount: Decimal
    completed_count: int
    completed_amount: Decimal
    failed_count: int
    this_month_amount: Decimal
    this_year_amount: Decimal 