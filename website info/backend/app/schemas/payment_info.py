from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

from app.models.user_payment_info import PaymentMethodType

class UserPaymentInfoBase(BaseModel):
    # CashApp Information
    cashapp_tag: Optional[str] = Field(None, description="CashApp username/tag (e.g., $username)")
    cashapp_phone: Optional[str] = Field(None, description="Phone number associated with CashApp")
    cashapp_email: Optional[EmailStr] = Field(None, description="Email associated with CashApp")
    
    # Zelle Information
    zelle_phone: Optional[str] = Field(None, description="Phone number for Zelle transfers")
    zelle_email: Optional[EmailStr] = Field(None, description="Email for Zelle transfers")
    zelle_bank_name: Optional[str] = Field(None, description="Bank name for Zelle")
    
    # Bank Transfer Information
    bank_name: Optional[str] = Field(None, description="Bank name")
    bank_routing_number: Optional[str] = Field(None, description="Bank routing number")
    bank_account_number: Optional[str] = Field(None, description="Bank account number (will be encrypted)")
    bank_account_type: Optional[str] = Field(None, description="Account type (checking/savings)")
    bank_account_holder_name: Optional[str] = Field(None, description="Account holder name")
    
    # PayPal Information
    paypal_email: Optional[EmailStr] = Field(None, description="PayPal email address")
    
    # Preferred payment method
    preferred_method: Optional[PaymentMethodType] = Field(None, description="Preferred payment method")
    
    # Additional information
    notes: Optional[str] = Field(None, description="Additional notes or instructions")

class UserPaymentInfoCreate(UserPaymentInfoBase):
    pass

class UserPaymentInfoUpdate(BaseModel):
    # All fields optional for updates
    cashapp_tag: Optional[str] = None
    cashapp_phone: Optional[str] = None
    cashapp_email: Optional[EmailStr] = None
    
    zelle_phone: Optional[str] = None
    zelle_email: Optional[EmailStr] = None
    zelle_bank_name: Optional[str] = None
    
    bank_name: Optional[str] = None
    bank_routing_number: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_account_type: Optional[str] = None
    bank_account_holder_name: Optional[str] = None
    
    paypal_email: Optional[EmailStr] = None
    
    preferred_method: Optional[PaymentMethodType] = None
    notes: Optional[str] = None

class UserPaymentInfo(UserPaymentInfoBase):
    id: int
    user_id: int
    
    # Verification status
    cashapp_verified: bool = False
    zelle_verified: bool = False
    bank_verified: bool = False
    paypal_verified: bool = False
    
    # KYC and compliance
    kyc_verified: bool = False
    tax_id_provided: bool = False
    w9_submitted: bool = False
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PaymentMethodVerification(BaseModel):
    method_type: PaymentMethodType
    verification_code: Optional[str] = Field(None, description="Verification code if needed")
    documents: Optional[List[str]] = Field(None, description="Document URLs for verification")

class PaymentMethodStatus(BaseModel):
    method_type: PaymentMethodType
    is_verified: bool
    is_available: bool
    display_info: str 