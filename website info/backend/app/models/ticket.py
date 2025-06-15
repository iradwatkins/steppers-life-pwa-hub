from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Float, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum
import uuid

from app.core.database import Base

class TicketStatus(enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    CHECKED_IN = "checked_in"

class PaymentStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    
    # References
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Ticket details
    status = Column(Enum(TicketStatus), default=TicketStatus.PENDING, nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    
    # Payment information
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_intent_id = Column(String(255), nullable=True)  # Stripe/PayPal reference
    payment_method = Column(String(50), nullable=True)  # card, paypal, etc.
    
    # Attendee information
    attendee_name = Column(String(255), nullable=True)
    attendee_email = Column(String(255), nullable=True)
    attendee_phone = Column(String(20), nullable=True)
    
    # Check-in information
    checked_in_at = Column(DateTime(timezone=True), nullable=True)
    checked_in_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # QR code and verification
    qr_code = Column(String(255), nullable=True)  # Path to QR code image
    verification_token = Column(String(255), unique=True, nullable=False)
    
    # Notes and metadata
    notes = Column(Text, nullable=True)
    extra_data = Column(Text, nullable=True)  # JSON string for additional data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    event = relationship("Event", back_populates="tickets")
    user = relationship("User", foreign_keys=[user_id], back_populates="tickets")
    checker = relationship("User", foreign_keys=[checked_in_by])

    def __repr__(self):
        return f"<Ticket(id={self.id}, ticket_number='{self.ticket_number}', status='{self.status.value}')>" 