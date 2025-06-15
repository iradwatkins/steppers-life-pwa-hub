from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, EmailStr, HttpUrl, validator


class EmailRecipient(BaseModel):
    """Schema for email recipient"""
    email: EmailStr
    name: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None


class EmailAttachment(BaseModel):
    """Schema for email attachment"""
    filename: str
    content: str  # Base64 encoded content
    type: str  # MIME type
    disposition: Optional[str] = "attachment"


class EmailTemplate(BaseModel):
    """Schema for email template"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    subject: str
    html_content: str
    text_content: Optional[str] = None
    category: str = "marketing"  # marketing, transactional, notification
    is_active: bool = True
    variables: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class EmailCampaign(BaseModel):
    """Schema for email campaign"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    template_id: str
    segment_id: Optional[str] = None
    event_id: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    status: str = "draft"  # draft, scheduled, sending, sent, cancelled
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class EmailSegment(BaseModel):
    """Schema for email segment (group of recipients)"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    filter_criteria: Optional[Dict[str, Any]] = None
    recipient_count: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class EmailLog(BaseModel):
    """Schema for email log"""
    id: Optional[str] = None
    to_email: EmailStr
    from_email: EmailStr
    subject: str
    template_id: Optional[str] = None
    campaign_id: Optional[str] = None
    category: str
    status: str  # sent, delivered, opened, clicked, bounced, failed
    sent_at: datetime
    delivered_at: Optional[datetime] = None
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None
    error_message: Optional[str] = None
    
    class Config:
        orm_mode = True


class EmailRequest(BaseModel):
    """Schema for sending an email"""
    to: Union[EmailStr, List[EmailRecipient]]
    subject: str
    template_id: Optional[str] = None
    html_content: Optional[str] = None
    text_content: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    attachments: Optional[List[EmailAttachment]] = None
    category: str = "transactional"
    

class BulkEmailRequest(BaseModel):
    """Schema for sending bulk emails"""
    template_id: str
    segment_id: Optional[str] = None
    recipients: Optional[List[EmailRecipient]] = None
    scheduled_at: Optional[datetime] = None
    

class EmailStats(BaseModel):
    """Schema for email statistics"""
    total_sent: int = 0
    total_delivered: int = 0
    total_opened: int = 0
    total_clicked: int = 0
    total_bounced: int = 0
    total_failed: int = 0
    delivery_rate: float = 0.0
    open_rate: float = 0.0
    click_rate: float = 0.0
    bounce_rate: float = 0.0
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


class EmailPreferences(BaseModel):
    """Schema for user email preferences"""
    user_id: str
    marketing_emails: bool = True
    event_reminders: bool = True
    ticket_confirmations: bool = True
    newsletter: bool = True
    promotions: bool = True
    account_notifications: bool = True
    
    class Config:
        orm_mode = True


class AutomatedEmailReport(BaseModel):
    """Schema for automated email reports"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    recipients: List[EmailRecipient]
    report_type: str  # sales, attendance, performance, etc.
    frequency: str  # daily, weekly, monthly
    next_run: Optional[datetime] = None
    last_run: Optional[datetime] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True 