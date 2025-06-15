import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any, List
from app.core.config import settings

# Import SendGrid dependencies
try:
    import sendgrid
    from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

class EmailService:
    @staticmethod
    def _send_email_sendgrid(to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        """
        Send email using SendGrid API.
        Returns True if email was sent successfully, False otherwise.
        """
        if not SENDGRID_AVAILABLE:
            print("SendGrid package not installed. Falling back to SMTP.")
            return EmailService._send_email_smtp(to_email, subject, body, html_body)
            
        if not settings.SENDGRID_API_KEY:
            print("SendGrid API key not configured. Falling back to SMTP.")
            return EmailService._send_email_smtp(to_email, subject, body, html_body)
            
        try:
            sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
            from_email = Email(settings.SMTP_FROM_EMAIL, settings.SMTP_FROM_NAME)
            to_email = To(to_email)
            
            # Plain text content
            text_content = Content("text/plain", body)
            
            # Create message with required parts
            message = Mail(from_email, to_email, subject, text_content)
            
            # Add HTML content if provided
            if html_body:
                html_content = HtmlContent(html_body)
                message.add_content(html_content)
                
            # Send the email
            response = sg.send(message)
            
            # Check if the email was sent successfully
            if response.status_code >= 200 and response.status_code < 300:
                return True
            else:
                print(f"Failed to send email via SendGrid. Status code: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Failed to send email via SendGrid: {str(e)}")
            # Fallback to SMTP if SendGrid fails
            return EmailService._send_email_smtp(to_email, subject, body, html_body)

    @staticmethod
    def _send_email_smtp(to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        """
        Send email using SMTP configuration.
        Returns True if email was sent successfully, False otherwise.
        """
        # If SMTP is not configured, use mock implementation
        if not settings.SMTP_SERVER or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            print(f"[MOCK EMAIL] To: {to_email}")
            print(f"[MOCK EMAIL] Subject: {subject}")
            print(f"[MOCK EMAIL] Body: {body}")
            if html_body:
                print(f"[MOCK EMAIL] HTML Body: {html_body}")
            return True

        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg['To'] = to_email

            # Add text body
            text_part = MIMEText(body, 'plain')
            msg.attach(text_part)

            # Add HTML body if provided
            if html_body:
                html_part = MIMEText(html_body, 'html')
                msg.attach(html_part)

            # Send email
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)

            return True

        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    @staticmethod
    def _send_email(to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        """
        Send email using the preferred method (SendGrid or SMTP).
        """
        # Use SendGrid if available and configured
        if SENDGRID_AVAILABLE and settings.SENDGRID_API_KEY:
            return EmailService._send_email_sendgrid(to_email, subject, body, html_body)
        else:
            return EmailService._send_email_smtp(to_email, subject, body, html_body)
    
    @staticmethod
    def send_bulk_email(
        to_emails: List[str], 
        subject: str, 
        body: str, 
        html_body: Optional[str] = None, 
        personalization: Optional[Dict[str, Dict[str, Any]]] = None
    ) -> bool:
        """
        Send bulk email to multiple recipients using SendGrid.
        personalization is a dictionary where the key is the email address and the value is a dict of template variables.
        Returns True if all emails were sent successfully, False otherwise.
        """
        if not SENDGRID_AVAILABLE or not settings.SENDGRID_API_KEY:
            # Fall back to sending individual emails via SMTP
            success = True
            for email in to_emails:
                # Get personalization for this email if available
                email_vars = personalization.get(email, {}) if personalization else {}
                
                # Apply personalization to body and html_body
                personalized_body = body
                personalized_html = html_body
                
                for var_name, var_value in email_vars.items():
                    placeholder = f"{{{{{var_name}}}}}"
                    personalized_body = personalized_body.replace(placeholder, str(var_value))
                    if personalized_html:
                        personalized_html = personalized_html.replace(placeholder, str(var_value))
                
                # Send individual email
                if not EmailService._send_email_smtp(email, subject, personalized_body, personalized_html):
                    success = False
                    
            return success
        
        try:
            sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
            from_email = Email(settings.SMTP_FROM_EMAIL, settings.SMTP_FROM_NAME)
            
            # Create base message
            message = Mail()
            message.from_email = from_email
            message.subject = subject
            message.content = [Content("text/plain", body)]
            
            if html_body:
                message.content.append(HtmlContent(html_body))
            
            # Add each recipient with personalization if provided
            for email in to_emails:
                personalization = sendgrid.Personalization()
                personalization.add_to(To(email))
                
                # Add custom personalization variables if provided
                if personalization and email in personalization:
                    for var_name, var_value in personalization[email].items():
                        personalization.add_substitution(f"{{{{{var_name}}}}}", str(var_value))
                
                message.add_personalization(personalization)
            
            # Send the email
            response = sg.send(message)
            
            # Check if the email was sent successfully
            return response.status_code >= 200 and response.status_code < 300
                
        except Exception as e:
            print(f"Failed to send bulk email via SendGrid: {str(e)}")
            return False

    @staticmethod
    def send_verification_email(email: str, token: str) -> bool:
        """Send email verification email."""
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        subject = "Verify Your SteppersLife Account"
        body = f"""
Welcome to SteppersLife!

Please verify your email address by clicking the link below:
{verification_url}

This verification link will expire in 24 hours.

If you didn't create an account with SteppersLife, please ignore this email.

Best regards,
The SteppersLife Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Welcome to SteppersLife!</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="{verification_url}" 
               style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Verify Email Address
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p>{verification_url}</p>
            <p><small>This verification link will expire in 24 hours.</small></p>
            <hr>
            <p><small>If you didn't create an account with SteppersLife, please ignore this email.</small></p>
        </body>
        </html>
        """
        
        return EmailService._send_email(email, subject, body, html_body)

    @staticmethod
    def send_password_reset_email(email: str, token: str) -> bool:
        """Send password reset email."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        subject = "Reset Your SteppersLife Password"
        body = f"""
We received a request to reset your SteppersLife password.

Click the link below to reset your password:
{reset_url}

This reset link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

Best regards,
The SteppersLife Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your SteppersLife password.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_url}" 
               style="background-color: #f44336; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Reset Password
            </a>
            <p>Or copy and paste this link into your browser:</p>
            <p>{reset_url}</p>
            <p><small>This reset link will expire in 1 hour.</small></p>
            <hr>
            <p><small>If you didn't request a password reset, please ignore this email.</small></p>
        </body>
        </html>
        """
        
        return EmailService._send_email(email, subject, body, html_body)

    @staticmethod
    def send_welcome_email(email: str, first_name: str) -> bool:
        """Send welcome email after email verification."""
        subject = "Welcome to SteppersLife!"
        body = f"""
Hi {first_name}!

Welcome to SteppersLife! Your account has been successfully verified.

You can now:
- Discover amazing fitness events in your area
- Book tickets for classes and workshops
- Connect with fitness instructors and enthusiasts
- Track your wellness journey

Start exploring: {settings.FRONTEND_URL}/events

Best regards,
The SteppersLife Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Welcome to SteppersLife, {first_name}!</h2>
            <p>Your account has been successfully verified and you're ready to start your fitness journey with us!</p>
            
            <h3>What you can do now:</h3>
            <ul>
                <li>🔍 Discover amazing fitness events in your area</li>
                <li>🎫 Book tickets for classes and workshops</li>
                <li>🤝 Connect with fitness instructors and enthusiasts</li>
                <li>📊 Track your wellness journey</li>
            </ul>
            
            <a href="{settings.FRONTEND_URL}/events" 
               style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
               Start Exploring Events
            </a>
            
            <p>Thank you for joining our community!</p>
            <p>Best regards,<br>The SteppersLife Team</p>
        </body>
        </html>
        """
        
        return EmailService._send_email(email, subject, body, html_body)

    @staticmethod
    def send_ticket_confirmation_email(email: str, first_name: str, event_data: Dict[str, Any], ticket_data: Dict[str, Any]) -> bool:
        """Send ticket confirmation email after purchase."""
        subject = f"Your tickets for {event_data['name']}"
        
        body = f"""
Hi {first_name},

Your tickets for {event_data['name']} have been confirmed!

Event Details:
- Event: {event_data['name']}
- Date: {event_data['date']}
- Time: {event_data['time']}
- Venue: {event_data['venue']}
- Tickets: {ticket_data['count']} x {ticket_data['type']}
- Total: ${ticket_data['total']}

Your tickets are available in your account. Please bring them to the event.

View your tickets: {settings.FRONTEND_URL}/tickets/history

Best regards,
The SteppersLife Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Ticket Confirmation</h2>
            <p>Hi {first_name},</p>
            <p>Your tickets for <strong>{event_data['name']}</strong> have been confirmed!</p>
            
            <div style="background: #F3F4F6; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <h3>Event Details</h3>
                <p><strong>Event:</strong> {event_data['name']}</p>
                <p><strong>Date:</strong> {event_data['date']}</p>
                <p><strong>Time:</strong> {event_data['time']}</p>
                <p><strong>Venue:</strong> {event_data['venue']}</p>
                <p><strong>Tickets:</strong> {ticket_data['count']} x {ticket_data['type']}</p>
                <p><strong>Total:</strong> ${ticket_data['total']}</p>
            </div>
            
            <p>Your tickets are available in your account. Please bring them to the event.</p>
            
            <a href="{settings.FRONTEND_URL}/tickets/history" 
               style="background-color: #10B981; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
               View Tickets
            </a>
            
            <p>Thank you for your purchase!</p>
            <p>Best regards,<br>The SteppersLife Team</p>
        </body>
        </html>
        """
        
        return EmailService._send_email(email, subject, body, html_body) 