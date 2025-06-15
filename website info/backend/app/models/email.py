from sqlalchemy import Column, String, Text, Boolean, Integer, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class EmailTemplate(Base):
    """Database model for email templates"""
    __tablename__ = "email_templates"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False)
    html_content = Column(Text, nullable=False)
    text_content = Column(Text, nullable=True)
    category = Column(String, nullable=False, default="marketing")
    is_active = Column(Boolean, default=True)
    variables = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    campaigns = relationship("EmailCampaign", back_populates="template")
    logs = relationship("EmailLog", back_populates="template")


class EmailSegment(Base):
    """Database model for email segments (groups of recipients)"""
    __tablename__ = "email_segments"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    filter_criteria = Column(JSON, nullable=True)
    recipient_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    campaigns = relationship("EmailCampaign", back_populates="segment")


class EmailCampaign(Base):
    """Database model for email campaigns"""
    __tablename__ = "email_campaigns"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    template_id = Column(String, ForeignKey("email_templates.id"), nullable=False)
    segment_id = Column(String, ForeignKey("email_segments.id"), nullable=True)
    event_id = Column(String, nullable=True)  # Reference to events table
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    status = Column(String, default="draft")  # draft, scheduled, sending, sent, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    template = relationship("EmailTemplate", back_populates="campaigns")
    segment = relationship("EmailSegment", back_populates="campaigns")
    logs = relationship("EmailLog", back_populates="campaign")


class EmailLog(Base):
    """Database model for email logs"""
    __tablename__ = "email_logs"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    to_email = Column(String, nullable=False)
    from_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    template_id = Column(String, ForeignKey("email_templates.id"), nullable=True)
    campaign_id = Column(String, ForeignKey("email_campaigns.id"), nullable=True)
    category = Column(String, nullable=False)
    status = Column(String, nullable=False)  # sent, delivered, opened, clicked, bounced, failed
    sent_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)
    clicked_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    email_metadata = Column(JSON, nullable=True)
    
    # Relationships
    template = relationship("EmailTemplate", back_populates="logs")
    campaign = relationship("EmailCampaign", back_populates="logs")


class EmailPreferences(Base):
    """Database model for user email preferences"""
    __tablename__ = "email_preferences"
    
    user_id = Column(String, primary_key=True, index=True)
    marketing_emails = Column(Boolean, default=True)
    event_reminders = Column(Boolean, default=True)
    ticket_confirmations = Column(Boolean, default=True)
    newsletter = Column(Boolean, default=True)
    promotions = Column(Boolean, default=True)
    account_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AutomatedEmailReport(Base):
    """Database model for automated email reports"""
    __tablename__ = "automated_email_reports"
    
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    recipients = Column(JSON, nullable=False)  # List of recipient objects
    report_type = Column(String, nullable=False)  # sales, attendance, performance, etc.
    frequency = Column(String, nullable=False)  # daily, weekly, monthly
    next_run = Column(DateTime, nullable=True)
    last_run = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 