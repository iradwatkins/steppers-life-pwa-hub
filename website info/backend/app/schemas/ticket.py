from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, validator
from enum import Enum
from uuid import UUID

class TicketStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    CHECKED_IN = "checked_in"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class TicketBase(BaseModel):
    event_id: int
    quantity: int = Field(1, ge=1, le=10)
    attendee_name: Optional[str] = None
    attendee_email: Optional[str] = None
    attendee_phone: Optional[str] = None
    notes: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    status: Optional[TicketStatus] = None
    attendee_name: Optional[str] = None
    attendee_email: Optional[str] = None
    attendee_phone: Optional[str] = None
    notes: Optional[str] = None

class TicketPayment(BaseModel):
    payment_method: str = Field(..., description="Payment method (card, paypal, etc.)")
    payment_intent_id: Optional[str] = None

class TicketCheckIn(BaseModel):
    verification_token: str = Field(..., description="Ticket verification token")

class TicketInDBBase(TicketBase):
    id: UUID
    ticket_number: str
    user_id: int
    status: TicketStatus
    unit_price: float
    total_price: float
    currency: str
    payment_status: PaymentStatus
    payment_intent_id: Optional[str]
    payment_method: Optional[str]
    checked_in_at: Optional[datetime]
    checked_in_by: Optional[int]
    qr_code: Optional[str]
    verification_token: str
    metadata: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Ticket(TicketInDBBase):
    pass

class TicketPublic(BaseModel):
    id: UUID
    ticket_number: str
    event_id: int
    status: TicketStatus
    quantity: int
    unit_price: float
    total_price: float
    currency: str
    payment_status: PaymentStatus
    attendee_name: Optional[str]
    attendee_email: Optional[str]
    checked_in_at: Optional[datetime]
    qr_code: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class TicketWithEvent(TicketPublic):
    event: dict  # Basic event info

class TicketSummary(BaseModel):
    total_tickets: int
    confirmed_tickets: int
    checked_in_tickets: int
    total_revenue: float
    currency: str 