import { OrderWithItems } from './orderService';

export interface EmailReceiptData {
  order: OrderWithItems;
  customerEmail: string;
  customerName: string;
}

export class EmailService {
  // Format order details for email
  static formatOrderForEmail(order: OrderWithItems): {
    orderNumber: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    totalAmount: string;
    orderItems: Array<{
      name: string;
      quantity: number;
      price: string;
      total: string;
    }>;
  } {
    const eventDate = new Date(order.event.start_date);
    const orderItems = order.order_items.map(item => ({
      name: `Ticket #${item.id.slice(-8)}`,
      quantity: 1,
      price: `$${item.price.toFixed(2)}`,
      total: `$${item.price.toFixed(2)}`
    }));

    return {
      orderNumber: order.order_number,
      eventTitle: order.event.title,
      eventDate: eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      eventTime: eventDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      venue: order.event.venue ? 
        `${order.event.venue.name}, ${order.event.venue.city}, ${order.event.venue.state}` : 
        'Venue TBD',
      totalAmount: `$${order.final_amount.toFixed(2)}`,
      orderItems
    };
  }

  // Generate HTML email template
  static generateReceiptEmailHTML(data: EmailReceiptData): string {
    const orderDetails = this.formatOrderForEmail(data.order);
    const billingDetails = data.order.billing_details as any;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${orderDetails.orderNumber}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; }
        .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: 500; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #374151; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .info-item { background: #f9fafb; padding: 15px; border-radius: 6px; }
        .info-item strong { color: #374151; display: block; margin-bottom: 5px; }
        .tickets-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .tickets-table th, .tickets-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .tickets-table th { background: #f9fafb; font-weight: 600; color: #374151; }
        .total-row { background: #f3f4f6; font-weight: 600; }
        .important-info { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .important-info h3 { color: #92400e; margin-top: 0; }
        .important-info ul { margin: 10px 0; color: #92400e; }
        .cta-buttons { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 12px 24px; margin: 0 10px; border-radius: 6px; text-decoration: none; font-weight: 500; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-secondary { background: #6b7280; color: white; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 14px; }
        .footer a { color: #3b82f6; text-decoration: none; }
        @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
            .btn { display: block; margin: 10px 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎟️ Order Confirmed!</h1>
        <p>Your tickets for ${orderDetails.eventTitle} are ready</p>
    </div>
    
    <div class="content">
        <div class="success-badge">✓ Payment Successful</div>
        
        <div class="section">
            <h2>Order Details</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Order Number</strong>
                    ${orderDetails.orderNumber}
                </div>
                <div class="info-item">
                    <strong>Total Paid</strong>
                    ${orderDetails.totalAmount}
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Event Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Event</strong>
                    ${orderDetails.eventTitle}
                </div>
                <div class="info-item">
                    <strong>Date & Time</strong>
                    ${orderDetails.eventDate}<br>
                    ${orderDetails.eventTime}
                </div>
                <div class="info-item">
                    <strong>Venue</strong>
                    ${orderDetails.venue}
                </div>
                <div class="info-item">
                    <strong>Attendee</strong>
                    ${billingDetails.firstName} ${billingDetails.lastName}
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Your Tickets</h2>
            <table class="tickets-table">
                <thead>
                    <tr>
                        <th>Ticket</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${orderDetails.orderItems.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price}</td>
                            <td>${item.total}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="3"><strong>Total Paid</strong></td>
                        <td><strong>${orderDetails.totalAmount}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="important-info">
            <h3>Important Information</h3>
            <ul>
                <li>Please bring a valid photo ID to the event</li>
                <li>Tickets are non-refundable but transferable</li>
                <li>Doors open 30 minutes before event start time</li>
                <li>Contact support for any questions or changes</li>
            </ul>
        </div>

        <div class="cta-buttons">
            <a href="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:8080'}/dashboard" class="btn btn-primary">View My Events</a>
            <a href="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:8080'}/events" class="btn btn-secondary">Browse More Events</a>
        </div>
    </div>

    <div class="footer">
        <p>Thank you for choosing SteppersLife Events!</p>
        <p>
            <a href="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:8080'}/support">Need Help?</a> | 
            <a href="${process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:8080'}/contact">Contact Us</a>
        </p>
        <p style="margin-top: 15px; font-size: 12px;">
            This email was sent to ${data.customerEmail}<br>
            Order placed on ${new Date(data.order.created_at).toLocaleDateString()}
        </p>
    </div>
</body>
</html>
    `;
  }

  // Send receipt email (mock implementation - in production you'd use a service like SendGrid, AWS SES, etc.)
  static async sendReceiptEmail(data: EmailReceiptData): Promise<boolean> {
    try {
      console.log('📧 EMAIL RECEIPT SENT TO:', data.customerEmail);
      console.log('📧 ORDER NUMBER:', data.order.order_number);
      console.log('📧 EVENT:', data.order.event.title);
      
      // In production, you would integrate with an email service:
      /*
      const emailHTML = this.generateReceiptEmailHTML(data);
      
      await emailProvider.send({
        to: data.customerEmail,
        subject: `Order Confirmation - ${data.order.order_number}`,
        html: emailHTML,
        from: 'noreply@stepperslife.com'
      });
      */

      // For now, we'll simulate successful email sending
      return true;
    } catch (error) {
      console.error('Error sending receipt email:', error);
      return false;
    }
  }

  // Generate plain text version for better deliverability
  static generateReceiptEmailText(data: EmailReceiptData): string {
    const orderDetails = this.formatOrderForEmail(data.order);
    const billingDetails = data.order.billing_details as any;

    return `
ORDER CONFIRMATION - ${orderDetails.orderNumber}

Thank you for your purchase! Your tickets for ${orderDetails.eventTitle} are confirmed.

EVENT DETAILS:
- Event: ${orderDetails.eventTitle}
- Date: ${orderDetails.eventDate}
- Time: ${orderDetails.eventTime}
- Venue: ${orderDetails.venue}
- Attendee: ${billingDetails.firstName} ${billingDetails.lastName}

TICKETS:
${orderDetails.orderItems.map(item => 
  `- ${item.name} x${item.quantity} - ${item.total}`
).join('\n')}

TOTAL PAID: ${orderDetails.totalAmount}

IMPORTANT INFORMATION:
• Please bring a valid photo ID to the event
• Tickets are non-refundable but transferable
• Doors open 30 minutes before event start time
• Contact support for any questions or changes

Need help? Visit our support page or contact us directly.

Thank you for choosing SteppersLife Events!
    `;
  }
}