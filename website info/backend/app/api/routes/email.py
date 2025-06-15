"""Email API endpoints for SteppersLife

This module provides API endpoints for email-related operations including:
- Creating and managing email templates
- Sending email campaigns
- Sending transactional emails
- Email preferences management
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.core.auth import get_current_user
from app.schemas.email import (
    EmailTemplate, EmailSegment, EmailCampaign, 
    EmailPreferences, AutomatedEmailReport, EmailStats
)
from app.services.email_marketing_service import EmailMarketingService
from app.services.ecommerce_email_service import EcommerceEmailService
from app.services.event_email_service import EventEmailService

router = APIRouter(prefix="/emails", tags=["Email"])


# Email Templates

@router.get("/templates", response_model=List[EmailTemplate])
def get_templates(
    skip: int = 0, 
    limit: int = 100,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all email templates"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access email templates")
    
    email_service = EmailMarketingService(db)
    return email_service.get_templates(skip=skip, limit=limit)


@router.post("/templates", response_model=EmailTemplate, status_code=status.HTTP_201_CREATED)
def create_template(
    template: EmailTemplate,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new email template"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create email templates")
    
    email_service = EmailMarketingService(db)
    return email_service.create_template(template)


@router.get("/templates/{template_id}", response_model=EmailTemplate)
def get_template(
    template_id: str,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get an email template by ID"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access email templates")
    
    email_service = EmailMarketingService(db)
    template = email_service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/templates/{template_id}", response_model=EmailTemplate)
def update_template(
    template_id: str,
    template: EmailTemplate,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an email template"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update email templates")
    
    email_service = EmailMarketingService(db)
    updated_template = email_service.update_template(template_id, template)
    if not updated_template:
        raise HTTPException(status_code=404, detail="Template not found")
    return updated_template


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(
    template_id: str,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an email template"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete email templates")
    
    email_service = EmailMarketingService(db)
    result = email_service.delete_template(template_id)
    if not result:
        raise HTTPException(status_code=404, detail="Template not found")
    return {}


# Email Campaigns

@router.get("/campaigns", response_model=List[EmailCampaign])
def get_campaigns(
    skip: int = 0, 
    limit: int = 100,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all email campaigns"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access email campaigns")
    
    email_service = EmailMarketingService(db)
    return email_service.get_campaigns(skip=skip, limit=limit)


@router.post("/campaigns", response_model=EmailCampaign, status_code=status.HTTP_201_CREATED)
def create_campaign(
    campaign: EmailCampaign,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new email campaign"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create email campaigns")
    
    email_service = EmailMarketingService(db)
    return email_service.create_campaign(campaign)


@router.get("/campaigns/{campaign_id}", response_model=EmailCampaign)
def get_campaign(
    campaign_id: str,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get an email campaign by ID"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access email campaigns")
    
    email_service = EmailMarketingService(db)
    campaign = email_service.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.put("/campaigns/{campaign_id}", response_model=EmailCampaign)
def update_campaign(
    campaign_id: str,
    campaign: EmailCampaign,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an email campaign"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update email campaigns")
    
    email_service = EmailMarketingService(db)
    updated_campaign = email_service.update_campaign(campaign_id, campaign)
    if not updated_campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return updated_campaign


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(
    campaign_id: str,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an email campaign"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete email campaigns")
    
    email_service = EmailMarketingService(db)
    result = email_service.delete_campaign(campaign_id)
    if not result:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {}


@router.post("/campaigns/{campaign_id}/send", status_code=status.HTTP_202_ACCEPTED)
def send_campaign(
    campaign_id: str,
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an email campaign"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to send email campaigns")
    
    email_service = EmailMarketingService(db)
    campaign = email_service.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Send campaign in background task
    background_tasks.add_task(email_service.send_campaign_email, campaign_id)
    
    return {"message": "Campaign sending has been scheduled"}


@router.get("/campaigns/{campaign_id}/stats", response_model=EmailStats)
def get_campaign_stats(
    campaign_id: str,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics for an email campaign"""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access email campaign statistics")
    
    email_service = EmailMarketingService(db)
    campaign = email_service.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return email_service.get_campaign_stats(campaign_id)


# E-commerce Emails

@router.post("/ecommerce/order-confirmation", status_code=status.HTTP_202_ACCEPTED)
def send_order_confirmation(
    order_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an order confirmation email"""
    # Allow admin or user who owns the order
    if current_user.get("role") != "admin" and current_user.get("id") != order_data.get("user_id"):
        raise HTTPException(status_code=403, detail="Not authorized to send order confirmation email")
    
    email_service = EcommerceEmailService(db)
    
    # Send email in background task
    background_tasks.add_task(email_service.send_order_confirmation, order_data)
    
    return {"message": "Order confirmation email will be sent shortly"}


@router.post("/ecommerce/shipping-confirmation", status_code=status.HTTP_202_ACCEPTED)
def send_shipping_confirmation(
    order_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a shipping confirmation email"""
    # Only admin can send shipping confirmation
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to send shipping confirmation email")
    
    email_service = EcommerceEmailService(db)
    
    # Send email in background task
    background_tasks.add_task(email_service.send_shipping_confirmation, order_data)
    
    return {"message": "Shipping confirmation email will be sent shortly"}


@router.post("/ecommerce/delivery-confirmation", status_code=status.HTTP_202_ACCEPTED)
def send_delivery_confirmation(
    order_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a delivery confirmation email"""
    # Only admin can send delivery confirmation
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to send delivery confirmation email")
    
    email_service = EcommerceEmailService(db)
    
    # Send email in background task
    background_tasks.add_task(email_service.send_delivery_confirmation, order_data)
    
    return {"message": "Delivery confirmation email will be sent shortly"}


@router.post("/ecommerce/abandoned-cart", status_code=status.HTTP_202_ACCEPTED)
def send_abandoned_cart_reminder(
    cart_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an abandoned cart reminder email"""
    # Only admin can send abandoned cart reminders
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to send abandoned cart reminder email")
    
    email_service = EcommerceEmailService(db)
    
    # Send email in background task
    background_tasks.add_task(email_service.send_abandoned_cart_reminder, cart_data)
    
    return {"message": "Abandoned cart reminder email will be sent shortly"}


# Event Emails

@router.post("/events/ticket-confirmation", status_code=status.HTTP_202_ACCEPTED)
def send_ticket_confirmation(
    ticket_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a ticket confirmation email"""
    # Allow admin or user who owns the ticket
    if current_user.get("role") != "admin" and current_user.get("id") != ticket_data.get("user_id"):
        raise HTTPException(status_code=403, detail="Not authorized to send ticket confirmation email")
    
    email_service = EventEmailService(db)
    
    # Send email in background task
    background_tasks.add_task(email_service.send_ticket_confirmation, ticket_data)
    
    return {"message": "Ticket confirmation email will be sent shortly"}


@router.post("/events/reminder", status_code=status.HTTP_202_ACCEPTED)
def send_event_reminder(
    event_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an event reminder email"""
    # Only admin or event organizer can send event reminders
    if current_user.get("role") not in ["admin", "organizer"]:
        raise HTTPException(status_code=403, detail="Not authorized to send event reminder email")
    
    email_service = EventEmailService(db)
    
    # Send email in background task
    background_tasks.add_task(email_service.send_event_reminder, event_data)
    
    return {"message": "Event reminder email will be sent shortly"}


@router.post("/events/checkin-confirmation", status_code=status.HTTP_202_ACCEPTED)
def send_checkin_confirmation(
    checkin_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a check-in confirmation email"""
    # Only admin or event staff can send check-in confirmation
    if current_user.get("role") not in ["admin", "event_staff"]:
        raise HTTPException(status_code=403, detail="Not authorized to send check-in confirmation email")
    
    email_service = EventEmailService(db)
    
    # Send email in background task
    background_tasks.add_task(email_service.send_checkin_confirmation, checkin_data)
    
    return {"message": "Check-in confirmation email will be sent shortly"}


@router.post("/events/update", status_code=status.HTTP_202_ACCEPTED)
def send_event_update(
    update_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an event update email"""
    # Only admin or event organizer can send event updates
    if current_user.get("role") not in ["admin", "organizer"]:
        raise HTTPException(status_code=403, detail="Not authorized to send event update email")
    
    email_service = EventEmailService(db)
    
    # Send email in background task
    background_tasks.add_task(email_service.send_event_update, update_data)
    
    return {"message": "Event update email will be sent shortly"}


@router.post("/events/digest", status_code=status.HTTP_202_ACCEPTED)
def send_event_digest(
    digest_data: Dict[str, Any],
    background_tasks: BackgroundTasks,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send an event digest email"""
    # Only admin can send event digest emails
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to send event digest email")
    
    email_service = EventEmailService(db)
    
    # Send email in background task
    background_tasks.add_task(email_service.send_event_digest, digest_data)
    
    return {"message": "Event digest email will be sent shortly"}


# Email Preferences

@router.get("/preferences", response_model=EmailPreferences)
def get_email_preferences(
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get email preferences for the current user"""
    # Implementation would retrieve email preferences for the current user
    pass


@router.put("/preferences", response_model=EmailPreferences)
def update_email_preferences(
    preferences: EmailPreferences,
    current_user: Dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update email preferences for the current user"""
    # Implementation would update email preferences for the current user
    pass 