// Utility for generating and downloading ticket PDFs
// Note: This is a mock implementation for development
// In production, this would integrate with a PDF generation library like jsPDF or PDFKit

export interface TicketData {
  id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_address: string;
  ticket_type: string;
  seat_info?: string;
  qr_code: string;
  attendee_name: string;
  attendee_email: string;
  order_number: string;
  purchase_date: string;
}

export const downloadTicketAsPDF = async (ticketData: TicketData): Promise<void> => {
  try {
    // Mock PDF generation - in production, would use actual PDF library
    console.log('Generating PDF for ticket:', ticketData.id);
    
    // Create mock PDF content as a blob for demonstration
    const pdfContent = generatePDFContent(ticketData);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticketData.id}-${ticketData.event_name.replace(/\s+/g, '-')}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    console.log('PDF download initiated for ticket:', ticketData.id);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate ticket PDF');
  }
};

// Generate PDF content (mock implementation)
const generatePDFContent = (ticketData: TicketData): string => {
  // In production, this would generate actual PDF bytes
  // For now, returning mock PDF content as a string
  return `%PDF-1.4
Mock PDF Content for Ticket: ${ticketData.id}

EVENT TICKET
=============

Event: ${ticketData.event_name}
Date: ${ticketData.event_date}
Time: ${ticketData.event_time}

Venue: ${ticketData.venue_name}
Address: ${ticketData.venue_address}

Ticket Type: ${ticketData.ticket_type}
${ticketData.seat_info ? `Seat: ${ticketData.seat_info}` : ''}

Attendee: ${ticketData.attendee_name}
Email: ${ticketData.attendee_email}

Order: ${ticketData.order_number}
Purchased: ${ticketData.purchase_date}

QR Code: ${ticketData.qr_code}

This is a mock PDF for development purposes.
In production, this would be a properly formatted PDF document.`;
};

// Alternative implementation using jsPDF (when library is available)
export const downloadTicketAsPDFWithJsPDF = async (ticketData: TicketData): Promise<void> => {
  try {
    // Dynamic import to avoid bundling if not needed
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('EVENT TICKET', 105, 30, { align: 'center' });
    
    // Event Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Event Information', 20, 50);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Event: ${ticketData.event_name}`, 20, 65);
    doc.text(`Date: ${ticketData.event_date}`, 20, 75);
    doc.text(`Time: ${ticketData.event_time}`, 20, 85);
    
    // Venue Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Venue Information', 20, 105);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Venue: ${ticketData.venue_name}`, 20, 120);
    doc.text(`Address: ${ticketData.venue_address}`, 20, 130);
    
    // Ticket Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Ticket Information', 20, 150);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Type: ${ticketData.ticket_type}`, 20, 165);
    if (ticketData.seat_info) {
      doc.text(`Seat: ${ticketData.seat_info}`, 20, 175);
    }
    
    // Attendee Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendee Information', 20, 195);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${ticketData.attendee_name}`, 20, 210);
    doc.text(`Email: ${ticketData.attendee_email}`, 20, 220);
    
    // Order Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Information', 20, 240);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order Number: ${ticketData.order_number}`, 20, 255);
    doc.text(`Purchase Date: ${ticketData.purchase_date}`, 20, 265);
    
    // QR Code placeholder
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('QR Code', 20, 285);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(ticketData.qr_code, 20, 295);
    
    // Save the PDF
    doc.save(`ticket-${ticketData.id}-${ticketData.event_name.replace(/\s+/g, '-')}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF with jsPDF:', error);
    // Fallback to mock implementation
    return downloadTicketAsPDF(ticketData);
  }
};

// Helper function to format ticket data from various sources
export const formatTicketDataForPDF = (ticket: any, event: any): TicketData => {
  return {
    id: ticket.id || ticket.ticket_id || 'unknown',
    event_name: event?.title || event?.name || 'Unknown Event',
    event_date: event?.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD',
    event_time: event?.start_date ? new Date(event.start_date).toLocaleTimeString() : 'TBD',
    venue_name: event?.venues?.name || event?.venue_name || 'Online Event',
    venue_address: event?.venues?.address || event?.venue_address || 'Virtual',
    ticket_type: ticket.ticket_type || ticket.type || 'General Admission',
    seat_info: ticket.seat_info || ticket.seat || undefined,
    qr_code: ticket.qr_code || `TICKET-${ticket.id}`,
    attendee_name: ticket.attendee_name || ticket.name || 'Unknown',
    attendee_email: ticket.attendee_email || ticket.email || 'unknown@example.com',
    order_number: ticket.order_number || ticket.order_id || `ORD-${Date.now()}`,
    purchase_date: ticket.purchase_date ? new Date(ticket.purchase_date).toLocaleDateString() : new Date().toLocaleDateString(),
  };
};