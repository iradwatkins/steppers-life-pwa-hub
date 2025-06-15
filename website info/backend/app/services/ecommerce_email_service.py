"""E-commerce Email Service for SteppersLife

This service handles e-commerce related emails, including:
- Order confirmations
- Shipping notifications
- Delivery confirmations
- Order status updates
- Abandoned cart reminders
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.email import EmailLog
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)


class EcommerceEmailService:
    """Service for sending e-commerce related emails"""
    
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailService()
    
    def send_order_confirmation(self, order_data: Dict[str, Any]) -> bool:
        """Send order confirmation email"""
        try:
            # Extract order details
            customer_email = order_data.get("customer_email")
            customer_name = order_data.get("customer_name", "Customer")
            order_id = order_data.get("order_id", "")
            order_total = order_data.get("total", 0)
            order_items = order_data.get("items", [])
            order_date = order_data.get("date", datetime.utcnow().strftime("%Y-%m-%d"))
            
            # Create email subject and content
            subject = f"Your Order Confirmation #{order_id} - SteppersLife"
            
            # Create plain text email body
            text_body = f"""
Hello {customer_name},

Thank you for your order with SteppersLife!

Order Details:
- Order Number: #{order_id}
- Order Date: {order_date}
- Order Total: ${order_total}

Items Ordered:
"""
            for item in order_items:
                text_body += f"- {item.get('quantity', 1)}x {item.get('name', 'Item')} - ${item.get('price', 0)}\n"
            
            text_body += f"""
You can view your order status at any time by visiting your account.

Thank you for shopping with SteppersLife!

Best regards,
The SteppersLife Team
"""
            
            # Create HTML email body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Order Confirmation</h1>
        </div>
        
        <p>Hello {customer_name},</p>
        
        <p>Thank you for your order with SteppersLife!</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Order Details</h2>
            <p><strong>Order Number:</strong> #{order_id}</p>
            <p><strong>Order Date:</strong> {order_date}</p>
            <p><strong>Order Total:</strong> ${order_total}</p>
        </div>
        
        <h2 style="margin-top: 0; color: #333; font-size: 18px;">Items Ordered</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Quantity</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                </tr>
            </thead>
            <tbody>
"""
            
            for item in order_items:
                html_body += f"""
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{item.get('name', 'Item')}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">{item.get('quantity', 1)}</td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${item.get('price', 0)}</td>
                </tr>"""
            
            html_body += f"""
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>Total:</strong></td>
                    <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>${order_total}</strong></td>
                </tr>
            </tfoot>
        </table>
        
        <p>You can view your order status at any time by visiting your account.</p>
        
        <div style="margin: 30px 0; text-align: center;">
            <a href="#" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Order</a>
        </div>
        
        <p>Thank you for shopping with SteppersLife!</p>
        
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
                    metadata={"order_id": order_id}
                )
            else:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="transactional",
                    status="failed",
                    error_message="Failed to send order confirmation email",
                    metadata={"order_id": order_id}
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending order confirmation email: {str(e)}")
            return False
    
    def send_shipping_confirmation(self, order_data: Dict[str, Any]) -> bool:
        """Send shipping confirmation email"""
        try:
            # Extract order details
            customer_email = order_data.get("customer_email")
            customer_name = order_data.get("customer_name", "Customer")
            order_id = order_data.get("order_id", "")
            tracking_number = order_data.get("tracking_number", "")
            tracking_url = order_data.get("tracking_url", "#")
            carrier = order_data.get("carrier", "")
            estimated_delivery = order_data.get("estimated_delivery", "")
            
            # Create email subject and content
            subject = f"Your SteppersLife Order #{order_id} Has Shipped"
            
            # Create plain text email body
            text_body = f"""
Hello {customer_name},

Great news! Your SteppersLife order #{order_id} has been shipped.

Shipping Details:
- Carrier: {carrier}
- Tracking Number: {tracking_number}
- Estimated Delivery: {estimated_delivery}

You can track your package using this link: {tracking_url}

Thank you for shopping with SteppersLife!

Best regards,
The SteppersLife Team
"""
            
            # Create HTML email body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Your Order Has Shipped</h1>
        </div>
        
        <p>Hello {customer_name},</p>
        
        <p>Great news! Your SteppersLife order #{order_id} has been shipped.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px;">Shipping Details</h2>
            <p><strong>Carrier:</strong> {carrier}</p>
            <p><strong>Tracking Number:</strong> {tracking_number}</p>
            <p><strong>Estimated Delivery:</strong> {estimated_delivery}</p>
        </div>
        
        <div style="margin: 30px 0; text-align: center;">
            <a href="{tracking_url}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Track Your Package</a>
        </div>
        
        <p>Thank you for shopping with SteppersLife!</p>
        
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
                    metadata={"order_id": order_id, "tracking_number": tracking_number}
                )
            else:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="transactional",
                    status="failed",
                    error_message="Failed to send shipping confirmation email",
                    metadata={"order_id": order_id, "tracking_number": tracking_number}
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending shipping confirmation email: {str(e)}")
            return False
    
    def send_delivery_confirmation(self, order_data: Dict[str, Any]) -> bool:
        """Send delivery confirmation email"""
        try:
            # Extract order details
            customer_email = order_data.get("customer_email")
            customer_name = order_data.get("customer_name", "Customer")
            order_id = order_data.get("order_id", "")
            delivery_date = order_data.get("delivery_date", datetime.utcnow().strftime("%Y-%m-%d"))
            
            # Create email subject and content
            subject = f"Your SteppersLife Order #{order_id} Has Been Delivered"
            
            # Create plain text email body
            text_body = f"""
Hello {customer_name},

Your SteppersLife order #{order_id} has been delivered on {delivery_date}.

We hope you enjoy your purchase! If you have any questions or need assistance, please don't hesitate to contact our customer service team.

Thank you for shopping with SteppersLife!

Best regards,
The SteppersLife Team
"""
            
            # Create HTML email body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Your Order Has Been Delivered</h1>
        </div>
        
        <p>Hello {customer_name},</p>
        
        <p>Your SteppersLife order #{order_id} has been delivered on {delivery_date}.</p>
        
        <p>We hope you enjoy your purchase! If you have any questions or need assistance, please don't hesitate to contact our customer service team.</p>
        
        <div style="margin: 30px 0; text-align: center;">
            <a href="#" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Order Details</a>
        </div>
        
        <p>Thank you for shopping with SteppersLife!</p>
        
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
                    metadata={"order_id": order_id, "delivery_date": delivery_date}
                )
            else:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="transactional",
                    status="failed",
                    error_message="Failed to send delivery confirmation email",
                    metadata={"order_id": order_id, "delivery_date": delivery_date}
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending delivery confirmation email: {str(e)}")
            return False
    
    def send_abandoned_cart_reminder(self, cart_data: Dict[str, Any]) -> bool:
        """Send abandoned cart reminder email"""
        try:
            # Extract cart details
            customer_email = cart_data.get("customer_email")
            customer_name = cart_data.get("customer_name", "Customer")
            cart_items = cart_data.get("items", [])
            cart_total = cart_data.get("total", 0)
            recovery_url = cart_data.get("recovery_url", "#")
            
            # Create email subject and content
            subject = "Complete Your SteppersLife Purchase"
            
            # Create plain text email body
            text_body = f"""
Hello {customer_name},

We noticed you left some items in your shopping cart at SteppersLife.

Your Cart:
"""
            for item in cart_items:
                text_body += f"- {item.get('quantity', 1)}x {item.get('name', 'Item')} - ${item.get('price', 0)}\n"
            
            text_body += f"""
Total: ${cart_total}

Complete your purchase here: {recovery_url}

Thank you for considering SteppersLife!

Best regards,
The SteppersLife Team
"""
            
            # Create HTML email body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4CAF50;">Don't Miss Out!</h1>
            <p style="font-size: 18px;">You left some items in your cart</p>
        </div>
        
        <p>Hello {customer_name},</p>
        
        <p>We noticed you left some items in your shopping cart at SteppersLife.</p>
        
        <h2 style="margin-top: 20px; color: #333; font-size: 18px;">Your Cart</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Quantity</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                </tr>
            </thead>
            <tbody>
"""
            
            for item in cart_items:
                html_body += f"""
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{item.get('name', 'Item')}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">{item.get('quantity', 1)}</td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">${item.get('price', 0)}</td>
                </tr>"""
            
            html_body += f"""
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>Total:</strong></td>
                    <td style="padding: 10px; text-align: right; border-top: 2px solid #ddd;"><strong>${cart_total}</strong></td>
                </tr>
            </tfoot>
        </table>
        
        <div style="margin: 30px 0; text-align: center;">
            <a href="{recovery_url}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Complete Your Purchase</a>
        </div>
        
        <p>Thank you for considering SteppersLife!</p>
        
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
                    metadata={"cart_items_count": len(cart_items), "cart_total": cart_total}
                )
            else:
                self._log_email(
                    to_email=customer_email,
                    subject=subject,
                    category="marketing",
                    status="failed",
                    error_message="Failed to send abandoned cart reminder email",
                    metadata={"cart_items_count": len(cart_items), "cart_total": cart_total}
                )
            
            return result
        
        except Exception as e:
            logger.error(f"Error sending abandoned cart reminder email: {str(e)}")
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