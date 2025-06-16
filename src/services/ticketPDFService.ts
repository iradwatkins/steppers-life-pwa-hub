import { OrderWithItems } from './orderService';

export interface TicketPDFData {
  order: OrderWithItems;
  qrCodeData?: string;
}

export class TicketPDFService {
  // Generate QR code data for ticket
  static generateQRCodeData(orderId: string, itemId: string): string {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:8080';
    
    return `${baseUrl}/ticket/verify/${orderId}/${itemId}`;
  }

  // Generate ticket data for PDF
  static generateTicketData(order: OrderWithItems): Array<{
    ticketId: string;
    orderNumber: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    attendeeName: string;
    price: string;
    qrCode: string;
    seatInfo?: string;
  }> {
    const eventDate = new Date(order.event.start_date);
    const billingDetails = order.billing_details as any;

    return order.order_items.map(item => ({
      ticketId: item.id.slice(-8).toUpperCase(),
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
        `${order.event.venue.name}\n${order.event.venue.address}\n${order.event.venue.city}, ${order.event.venue.state}` : 
        'Venue TBD',
      attendeeName: item.attendee_name || `${billingDetails.firstName} ${billingDetails.lastName}`,
      price: `$${item.price.toFixed(2)}`,
      qrCode: this.generateQRCodeData(order.id, item.id),
      seatInfo: 'General Admission' // Could be enhanced with actual seat data
    }));
  }

  // Generate HTML for PDF conversion
  static generateTicketHTML(ticketData: ReturnType<typeof TicketPDFService.generateTicketData>[0]): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Ticket - ${ticketData.ticketId}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: #f8fafc;
            color: #1e293b;
        }
        
        .ticket {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 600px;
            margin: 0 auto;
            position: relative;
        }
        
        .ticket::before {
            content: '';
            position: absolute;
            top: 50%;
            left: -10px;
            width: 20px;
            height: 20px;
            background: #f8fafc;
            border-radius: 50%;
            transform: translateY(-50%);
        }
        
        .ticket::after {
            content: '';
            position: absolute;
            top: 50%;
            right: -10px;
            width: 20px;
            height: 20px;
            background: #f8fafc;
            border-radius: 50%;
            transform: translateY(-50%);
        }
        
        .ticket-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .ticket-header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
        }
        
        .ticket-header p {
            margin: 0;
            opacity: 0.9;
            font-size: 16px;
        }
        
        .ticket-body {
            padding: 40px;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
            align-items: center;
        }
        
        .event-details {
            space-y: 25px;
        }
        
        .detail-group {
            margin-bottom: 25px;
        }
        
        .detail-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            display: block;
        }
        
        .detail-value {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            line-height: 1.4;
        }
        
        .qr-section {
            text-align: center;
        }
        
        .qr-placeholder {
            width: 140px;
            height: 140px;
            background: #f1f5f9;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
            font-size: 12px;
            color: #64748b;
            text-align: center;
        }
        
        .ticket-id {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            font-weight: 600;
            color: #475569;
            background: #f1f5f9;
            padding: 8px 12px;
            border-radius: 6px;
            display: inline-block;
            margin-top: 10px;
        }
        
        .perforated-line {
            border-top: 2px dashed #e2e8f0;
            margin: 0 40px;
            position: relative;
        }
        
        .ticket-footer {
            padding: 25px 40px;
            background: #f8fafc;
            text-align: center;
        }
        
        .terms {
            font-size: 11px;
            color: #64748b;
            line-height: 1.5;
            margin-bottom: 15px;
        }
        
        .order-info {
            font-size: 12px;
            color: #475569;
            font-family: 'Courier New', monospace;
        }
        
        .price-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }
        
        @media print {
            body {
                background: white;
                padding: 20px;
            }
            
            .ticket {
                box-shadow: none;
                border: 1px solid #e2e8f0;
            }
            
            .ticket::before,
            .ticket::after {
                background: white;
            }
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="ticket-header">
            <div class="price-badge">${ticketData.price}</div>
            <h1>🎟️ Event Ticket</h1>
            <p>SteppersLife Events</p>
        </div>
        
        <div class="ticket-body">
            <div class="event-details">
                <div class="detail-group">
                    <span class="detail-label">Event</span>
                    <div class="detail-value">${ticketData.eventTitle}</div>
                </div>
                
                <div class="detail-group">
                    <span class="detail-label">Date & Time</span>
                    <div class="detail-value">
                        ${ticketData.eventDate}<br>
                        ${ticketData.eventTime}
                    </div>
                </div>
                
                <div class="detail-group">
                    <span class="detail-label">Venue</span>
                    <div class="detail-value">${ticketData.venue.replace(/\n/g, '<br>')}</div>
                </div>
                
                <div class="detail-group">
                    <span class="detail-label">Attendee</span>
                    <div class="detail-value">${ticketData.attendeeName}</div>
                </div>
                
                <div class="detail-group">
                    <span class="detail-label">Seat/Section</span>
                    <div class="detail-value">${ticketData.seatInfo}</div>
                </div>
            </div>
            
            <div class="qr-section">
                <div class="qr-placeholder">
                    QR Code<br>
                    (Scan at Entry)
                </div>
                <div class="ticket-id">
                    #${ticketData.ticketId}
                </div>
            </div>
        </div>
        
        <div class="perforated-line"></div>
        
        <div class="ticket-footer">
            <div class="terms">
                Please bring this ticket and a valid photo ID to the event. Ticket is non-refundable but transferable. 
                Doors open 30 minutes before start time. For questions, contact support.
            </div>
            <div class="order-info">
                Order: ${ticketData.orderNumber} | Generated: ${new Date().toLocaleDateString()}
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Generate PDF blob (mock implementation)
  static async generateTicketPDF(order: OrderWithItems): Promise<Blob | null> {
    try {
      const tickets = this.generateTicketData(order);
      
      // In production, you would use a PDF generation library like:
      // - jsPDF
      // - PDFKit
      // - Puppeteer (server-side)
      // - html2pdf.js (client-side)
      
      // For now, we'll create a mock PDF blob
      const ticketHTML = tickets.map(ticket => this.generateTicketHTML(ticket)).join('');
      
      console.log('🎫 PDF TICKET GENERATED FOR ORDER:', order.order_number);
      console.log('🎫 TICKETS COUNT:', tickets.length);
      
      // Create a simple text blob as placeholder
      const pdfContent = `
EVENT TICKET - ${order.order_number}

${tickets.map(ticket => `
Ticket ID: ${ticket.ticketId}
Event: ${ticket.eventTitle}
Date: ${ticket.eventDate}
Time: ${ticket.eventTime}
Attendee: ${ticket.attendeeName}
Venue: ${ticket.venue}
Price: ${ticket.price}
QR Code: ${ticket.qrCode}
`).join('\n---\n')}

Generated: ${new Date().toISOString()}
      `;
      
      return new Blob([pdfContent], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error generating ticket PDF:', error);
      return null;
    }
  }

  // Download tickets as PDF
  static async downloadTickets(order: OrderWithItems): Promise<boolean> {
    try {
      const pdfBlob = await this.generateTicketPDF(order);
      if (!pdfBlob) return false;

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tickets-${order.order_number}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error downloading tickets:', error);
      return false;
    }
  }

  // Verify ticket QR code
  static async verifyTicket(orderId: string, itemId: string): Promise<{
    isValid: boolean;
    ticket?: {
      eventTitle: string;
      attendeeName: string;
      eventDate: string;
      ticketId: string;
    };
    error?: string;
  }> {
    try {
      // In production, this would verify against the database
      // For now, we'll return mock verification
      return {
        isValid: true,
        ticket: {
          eventTitle: 'Sample Event',
          attendeeName: 'John Doe',
          eventDate: new Date().toLocaleDateString(),
          ticketId: itemId.slice(-8).toUpperCase()
        }
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to verify ticket'
      };
    }
  }
}