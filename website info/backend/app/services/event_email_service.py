"""Event Email Service for SteppersLife

This service handles event-related emails, including:
- Ticket purchase confirmations
- Event reminders
- Check-in confirmations
- Event updates and changes
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import base64
import qrcode
from io import BytesIO

from app.models.email import EmailLog
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)


class EventEmailService:
    """Service for sending event-related emails"""
    
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailService()
    
    def send_ticket_confirmation(self, ticket_data: Dict[str, Any]) -> bool:
        """Send ticket purchase confirmation email"""
        try:
            # Extract ticket details
            customer_email = ticket_data.get("customer_email")
            customer_name = ticket_data.get("customer_name", "Customer")
            order_id = ticket_data.get("order_id", "")
            event_name = ticket_data.get("event_name", "")
            event_date = ticket_data.get("event_date", "")
            event_time = ticket_data.get("event_time", "")
            event_venue = ticket_data.get("event_venue", "")
            event_address = ticket_data.get("event_address", "")
            ticket_type = ticket_data.get("ticket_type", "")
            ticket_count = ticket_data.get("ticket_count", 1)
            ticket_total = ticket_data.get("total", 0)
            ticket_id = ticket_data.get("ticket_id", "")
            
            # Create QR code
            qr_data = f"TICKET:{ticket_id}"
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Create QR code image
            img = qr.make_image(fill_color="black", back_color="white")
            buffered = BytesIO()
            img.save(buffered)
            qr_img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # Create email subject and content
            subject = f"Your Tickets for {event_name}"
            
            # Create plain text email body
            text_body = f"""
Hello {customer_name},

Thank you for your ticket purchase! Your tickets for {event_name} have been confirmed.

Event Details:
- Event: {event_name}
- Date: {event_date}
- Time: {event_time}
- Venue: {event_venue}
- Address: {event_address}

Ticket Details:
- Ticket Type: {ticket_type}
- Quantity: {ticket_count}
- Total: ${ticket_total}

Your e-tickets are attached to this email. Please bring them to the event for check-in.

For any questions or assistance, please contact us at support@stepperslife.com.

Best regards,
The SteppersLife Team
"""
            
            # Create HTML email body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Your Tickets are Confirmed!</h1>
        </div>
        
        <p>Hello {customer_name},</p>
        
        <p>Thank you for your ticket purchase! Your tickets for <strong>{event_name}</strong> have been confirmed.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Event Details</h2>
            <p><strong>Event:</strong> {event_name}</p>
            <p><strong>Date:</strong> {event_date}</p>
            <p><strong>Time:</strong> {event_time}</p>
            <p><strong>Venue:</strong> {event_venue}</p>
            <p><strong>Address:</strong> {event_address}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Ticket Details</h2>
            <p><strong>Ticket Type:</strong> {ticket_type}</p>
            <p><strong>Quantity:</strong> {ticket_count}</p>
            <p><strong>Total:</strong> ${ticket_total}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Your E-Ticket</h2>
            <p><strong>Ticket ID:</strong> {ticket_id}</p>
            <img src="data:image/png;base64,{qr_img_base64}" style="max-width: 200px; margin: 10px auto;" alt="QR Code" />
            <p style="font-size: 12px; color: #666;">Please present this QR code at the event for check-in.</p>
        </div>
        
        <p>For any questions or assistance, please contact us at support@stepperslife.com.</p>
        
        <p>Best regards,<br>The SteppersLife Team</p>
    </div>
</body>
</html>
"""
            
            # Send email
            result = self.email_service._send_email(
                to_email=customer_email,
                subject=subject,
                body=text_body,
                html_body=html_body
            )
            
            # Log email
            if result:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="transactional",
                    status="sent",
                    metadata={"event_name": event_name, "ticket_id": ticket_id}
                )
            else:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="transactional",
                    status="failed",
                    error_message="Failed to send ticket confirmation email",
                    metadata={"event_name": event_name, "ticket_id": ticket_id}
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending ticket confirmation email: {str(e)}")
            return False
    
    def send_event_reminder(self, event_data: Dict[str, Any]) -> bool:
        """Send event reminder email"""
        try:
            # Extract event details
            customer_email = event_data.get("customer_email")
            customer_name = event_data.get("customer_name", "Customer")
            event_name = event_data.get("event_name", "")
            event_date = event_data.get("event_date", "")
            event_time = event_data.get("event_time", "")
            event_venue = event_data.get("event_venue", "")
            event_address = event_data.get("event_address", "")
            ticket_id = event_data.get("ticket_id", "")
            time_until = event_data.get("time_until", "soon")
            
            # Create email subject and content
            subject = f"Reminder: {event_name} is {time_until}"
            
            # Create plain text email body
            text_body = f"""
Hello {customer_name},

This is a friendly reminder that {event_name} is coming up {time_until}!

Event Details:
- Event: {event_name}
- Date: {event_date}
- Time: {event_time}
- Venue: {event_venue}
- Address: {event_address}

Please remember to bring your tickets or have them ready on your mobile device.

We're looking forward to seeing you there!

Best regards,
The SteppersLife Team
"""
            
            # Create HTML email body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Event Reminder</h1>
        </div>
        
        <p>Hello {customer_name},</p>
        
        <p>This is a friendly reminder that <strong>{event_name}</strong> is coming up {time_until}!</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Event Details</h2>
            <p><strong>Event:</strong> {event_name}</p>
            <p><strong>Date:</strong> {event_date}</p>
            <p><strong>Time:</strong> {event_time}</p>
            <p><strong>Venue:</strong> {event_venue}</p>
            <p><strong>Address:</strong> {event_address}</p>
        </div>
        
        <p>Please remember to bring your tickets or have them ready on your mobile device.</p>
        
        <div style="margin: 30px 0; text-align: center;">
            <a href="#" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Ticket</a>
        </div>
        
        <p>We're looking forward to seeing you there!</p>
        
        <p>Best regards,<br>The SteppersLife Team</p>
    </div>
</body>
</html>
"""
            
            # Send email
            result = self.email_service._send_email(
                to_email=customer_email,
                subject=subject,
                body=text_body,
                html_body=html_body
            )
            
            # Log email
            if result:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="notification",
                    status="sent",
                    metadata={"event_name": event_name, "ticket_id": ticket_id}
                )
            else:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="notification",
                    status="failed",
                    error_message="Failed to send event reminder email",
                    metadata={"event_name": event_name, "ticket_id": ticket_id}
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending event reminder email: {str(e)}")
            return False
    
    def send_checkin_confirmation(self, checkin_data: Dict[str, Any]) -> bool:
        """Send check-in confirmation email"""
        try:
            # Extract check-in details
            customer_email = checkin_data.get("customer_email")
            customer_name = checkin_data.get("customer_name", "Customer")
            event_name = checkin_data.get("event_name", "")
            checkin_time = checkin_data.get("checkin_time", datetime.utcnow().strftime("%Y-%m-%d %H:%M"))
            
            # Create email subject and content
            subject = f"Check-in Confirmation - {event_name}"
            
            # Create plain text email body
            text_body = f"""
Hello {customer_name},

Thank you for checking in to {event_name} at {checkin_time}.

We hope you enjoy the event!

Best regards,
The SteppersLife Team
"""
            
            # Create HTML email body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Check-in Confirmation</h1>
        </div>
        
        <p>Hello {customer_name},</p>
        
        <p>Thank you for checking in to <strong>{event_name}</strong> at {checkin_time}.</p>
        
        <p>We hope you enjoy the event!</p>
        
        <p>Best regards,<br>The SteppersLife Team</p>
    </div>
</body>
</html>
"""
            
            # Send email
            result = self.email_service._send_email(
                to_email=customer_email,
                subject=subject,
                body=text_body,
                html_body=html_body
            )
            
            # Log email
            if result:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="notification",
                    status="sent",
                    metadata={"event_name": event_name, "checkin_time": checkin_time}
                )
            else:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="notification",
                    status="failed",
                    error_message="Failed to send check-in confirmation email",
                    metadata={"event_name": event_name, "checkin_time": checkin_time}
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending check-in confirmation email: {str(e)}")
            return False
    
    def send_event_update(self, update_data: Dict[str, Any]) -> bool:
        """Send event update email"""
        try:
            # Extract update details
            customer_email = update_data.get("customer_email")
            customer_name = update_data.get("customer_name", "Customer")
            event_name = update_data.get("event_name", "")
            update_type = update_data.get("update_type", "Important Update")
            update_message = update_data.get("update_message", "")
            event_date = update_data.get("event_date", "")
            event_time = update_data.get("event_time", "")
            event_venue = update_data.get("event_venue", "")
            
            # Create email subject and content
            subject = f"Important update about {event_name}"
            
            # Create plain text email body
            text_body = f"""
Hello {customer_name},

We have an important update about {event_name}:

{update_type}
{update_message}

"""
            
            if all([event_date, event_time, event_venue]):
                text_body += f"""
Updated Event Details:
- Date: {event_date}
- Time: {event_time}
- Venue: {event_venue}
"""
            
            text_body += f"""
If you have any questions, please contact us at support@stepperslife.com.

Best regards,
The SteppersLife Team
"""
            
            # Create HTML email body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Event Update</h1>
        </div>
        
        <p>Hello {customer_name},</p>
        
        <p>We have an important update about <strong>{event_name}</strong>:</p>
        
        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">{update_type}</h3>
            <p>{update_message}</p>
        </div>
"""
            
            if all([event_date, event_time, event_venue]):
                html_body += f"""
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Updated Event Details</h2>
            <p><strong>Date:</strong> {event_date}</p>
            <p><strong>Time:</strong> {event_time}</p>
            <p><strong>Venue:</strong> {event_venue}</p>
        </div>
"""
            
            html_body += f"""
        <p>If you have any questions, please contact us at support@stepperslife.com.</p>
        
        <p>Best regards,<br>The SteppersLife Team</p>
    </div>
</body>
</html>
"""
            
            # Send email
            result = self.email_service._send_email(
                to_email=customer_email,
                subject=subject,
                body=text_body,
                html_body=html_body
            )
            
            # Log email
            if result:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="notification",
                    status="sent",
                    metadata={"event_name": event_name, "update_type": update_type}
                )
            else:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="notification",
                    status="failed",
                    error_message="Failed to send event update email",
                    metadata={"event_name": event_name, "update_type": update_type}
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending event update email: {str(e)}")
            return False
    
    def send_event_digest(self, digest_data: Dict[str, Any]) -> bool:
        """Send weekly event digest email"""
        try:
            # Extract digest details
            customer_email = digest_data.get("customer_email")
            customer_name = digest_data.get("customer_name", "Customer")
            events = digest_data.get("events", [])
            period = digest_data.get("period", "this week")
            unsubscribe_url = digest_data.get("unsubscribe_url", "#")
            
            # Create email subject and content
            subject = f"Discover events happening {period}"
            
            # Create plain text email body
            text_body = f"""
Hello {customer_name},

Check out these amazing events happening {period}:

"""
            for event in events:
                text_body += f"""
{event.get('name', 'Event')}
Date: {event.get('date', '')} at {event.get('time', '')}
Location: {event.get('venue', '')}
{event.get('description', '')}

"""
            
            text_body += f"""
Don't want to receive these emails? Unsubscribe here: {unsubscribe_url}

Best regards,
The SteppersLife Team
"""
            
            # Create HTML email body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">This Week's Featured Events</h1>
        </div>
        
        <p>Hello {customer_name},</p>
        
        <p>Check out these amazing events happening {period}:</p>
"""
            
            for event in events:
                html_body += f"""
        <div style="border: 1px solid #E5E7EB; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">{event.get('name', 'Event')}</h3>
            <p><strong>Date:</strong> {event.get('date', '')} at {event.get('time', '')}</p>
            <p><strong>Location:</strong> {event.get('venue', '')}</p>
            <p>{event.get('description', '')}</p>
            <div style="margin-top: 10px;">
                <a href="{event.get('url', '#')}" style="background-color: #4CAF50; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px;">Learn More</a>
            </div>
        </div>
"""
            
            html_body += f"""
        <p style="font-size: 12px; color: #666; margin-top: 30px; text-align: center;">
            Don't want to receive these emails? <a href="{unsubscribe_url}" style="color: #666;">Unsubscribe here</a>
        </p>
        
        <p>Best regards,<br>The SteppersLife Team</p>
    </div>
</body>
</html>
"""
            
            # Send email
            result = self.email_service._send_email(
                to_email=customer_email,
                subject=subject,
                body=text_body,
                html_body=html_body
            )
            
            # Log email
            if result:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="marketing",
                    status="sent",
                    metadata={"event_count": len(events), "period": period}
                )
            else:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="marketing",
                    status="failed",
                    error_message="Failed to send event digest email",
                    metadata={"event_count": len(events), "period": period}
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending event digest email: {str(e)}")
            return False
    
    # Helper methods
    
    def _log_email(self, to_email: str, subject: str, category: str, status: str, 
                   error_message: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> EmailLog:
        """Log an email send"""
        db_log = EmailLog(
            to_email=to_email,
            from_email=self.email_service.config.SMTP_FROM_EMAIL,
            subject=subject,
            template_id=None,
            campaign_id=None,
            category=category,
            status=status,
            error_message=error_message,
            metadata=metadata,
        )
        self.db.add(db_log)
        self.db.commit()
        self.db.refresh(db_log)
        return db_log
