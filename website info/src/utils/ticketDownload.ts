interface TicketData {
  orderNumber: string;
  eventTitle: string;
  eventDate: string;
  ticketType: string;
  quantity: number;
  tickets: Array<{
    ticketNumber: string;
    seatInfo?: string;
    qrCode: string;
  }>;
}

export const downloadTicketAsPDF = (ticketData: TicketData) => {
  // In a real application, this would use a library like jsPDF or react-pdf
  // For now, we'll create a simple HTML representation and trigger download
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ticket - ${ticketData.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .ticket { border: 2px solid #333; padding: 20px; margin: 20px 0; }
        .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .qr-placeholder { width: 100px; height: 100px; border: 1px solid #ccc; 
                         display: inline-block; text-align: center; line-height: 100px; }
        .ticket-info { margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Steppers Life Ticket</h1>
        <h2>${ticketData.eventTitle}</h2>
        <p>Date: ${ticketData.eventDate}</p>
        <p>Order: ${ticketData.orderNumber}</p>
      </div>
      
      ${ticketData.tickets.map((ticket, index) => `
        <div class="ticket">
          <h3>Ticket ${index + 1} - ${ticketData.ticketType}</h3>
          <div class="ticket-info">
            <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
            ${ticket.seatInfo ? `<p><strong>Seat:</strong> ${ticket.seatInfo}</p>` : ''}
            <p><strong>QR Code:</strong> ${ticket.qrCode}</p>
            <div class="qr-placeholder">QR CODE</div>
          </div>
        </div>
      `).join('')}
      
      <div style="margin-top: 30px; text-align: center; color: #666;">
        <p>Please present this ticket at the venue entrance</p>
        <p>For assistance, contact support@stepperslife.com</p>
      </div>
    </body>
    </html>
  `;
  
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ticket-${ticketData.orderNumber}.html`;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadAllTicketsAsZip = (ticketsData: TicketData[]) => {
  // In a real application, this would create a ZIP file with multiple PDFs
  // For now, we'll create a combined HTML file
  
  const combinedHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>All Tickets Export</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .ticket-group { border: 2px solid #333; padding: 20px; margin: 20px 0; page-break-after: always; }
        .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .qr-placeholder { width: 80px; height: 80px; border: 1px solid #ccc; 
                         display: inline-block; text-align: center; line-height: 80px; font-size: 10px; }
      </style>
    </head>
    <body>
      <h1 style="text-align: center;">Steppers Life - All Tickets Export</h1>
      <p style="text-align: center;">Generated on: ${new Date().toLocaleDateString()}</p>
      
      ${ticketsData.map(ticketData => `
        <div class="ticket-group">
          <div class="header">
            <h2>${ticketData.eventTitle}</h2>
            <p>Order: ${ticketData.orderNumber} | Date: ${ticketData.eventDate}</p>
          </div>
          
          ${ticketData.tickets.map((ticket, index) => `
            <div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd;">
              <p><strong>${ticketData.ticketType} - Ticket ${index + 1}</strong></p>
              <p>Number: ${ticket.ticketNumber}</p>
              ${ticket.seatInfo ? `<p>Seat: ${ticket.seatInfo}</p>` : ''}
              <div class="qr-placeholder">QR</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  const blob = new Blob([combinedHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `all-tickets-${new Date().toISOString().split('T')[0]}.html`;
  link.click();
  URL.revokeObjectURL(url);
}; 