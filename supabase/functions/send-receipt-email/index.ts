import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define allowed origins for CORS
const allowedOrigins = [
  'https://stepperslife.com',
  'https://www.stepperslife.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://stepperslife.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  };
};

interface EmailRequest {
  orderId: string;
  userId: string;
  customerEmail: string;
  customerName: string;
}

interface OrderWithDetails {
  id: string;
  order_number: string;
  total_amount: number;
  discount_amount: number;
  fees_amount: number;
  final_amount: number;
  status: string;
  created_at: string;
  billing_details: any;
  events: {
    title: string;
    start_date: string;
    venues?: {
      name: string;
      address: string;
      city: string;
      state: string;
    };
  };
  order_items: Array<{
    id: string;
    price: number;
    attendee_name: string;
  }>;
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { orderId, userId, customerEmail, customerName }: EmailRequest = await req.json();

    if (!orderId || !userId || !customerEmail || !customerName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch order details from database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (*),
        events!inner (
          title,
          start_date,
          venues (
            name,
            address,
            city,
            state
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderDetails = order as OrderWithDetails;

    // Format order details for email
    const eventDate = new Date(orderDetails.events.start_date);
    const billingDetails = orderDetails.billing_details as any;

    const orderItems = orderDetails.order_items.map(item => ({
      name: `Ticket #${item.id.slice(-8)}`,
      quantity: 1,
      price: `$${item.price.toFixed(2)}`,
      total: `$${item.price.toFixed(2)}`
    }));

    // Generate HTML email template
    const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - ${orderDetails.order_number}</title>
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
        .footer { background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 8px 8px; color: #6b7280; font-size: 14px; }
        @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎟️ Order Confirmed!</h1>
        <p>Your tickets for ${orderDetails.events.title} are ready</p>
    </div>
    
    <div class="content">
        <div class="success-badge">✓ Payment Successful</div>
        
        <div class="section">
            <h2>Order Details</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Order Number</strong>
                    ${orderDetails.order_number}
                </div>
                <div class="info-item">
                    <strong>Total Paid</strong>
                    $${orderDetails.final_amount.toFixed(2)}
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Event Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Event</strong>
                    ${orderDetails.events.title}
                </div>
                <div class="info-item">
                    <strong>Date & Time</strong>
                    ${eventDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}<br>
                    ${eventDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                </div>
                <div class="info-item">
                    <strong>Venue</strong>
                    ${orderDetails.events.venues ? 
                      `${orderDetails.events.venues.name}, ${orderDetails.events.venues.city}, ${orderDetails.events.venues.state}` : 
                      'Venue TBD'
                    }
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
                    ${orderItems.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>${item.price}</td>
                            <td>${item.total}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td colspan="3"><strong>Total Paid</strong></td>
                        <td><strong>$${orderDetails.final_amount.toFixed(2)}</strong></td>
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
    </div>

    <div class="footer">
        <p>Thank you for choosing SteppersLife Events!</p>
        <p>
            This email was sent to ${customerEmail}<br>
            Order placed on ${new Date(orderDetails.created_at).toLocaleDateString()}
        </p>
    </div>
</body>
</html>
    `;

    // Send email using SendGrid
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    
    if (!sendGridApiKey) {
      console.warn('SendGrid API key not configured, skipping email send');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sending skipped - SendGrid not configured',
          orderId,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailData = {
      personalizations: [
        {
          to: [{ email: customerEmail, name: customerName }],
          subject: `Order Confirmation - ${orderDetails.order_number}`,
        },
      ],
      from: {
        email: Deno.env.get('SENDGRID_FROM_EMAIL') || 'noreply@stepperslife.com',
        name: 'SteppersLife Events',
      },
      content: [
        {
          type: 'text/html',
          value: emailHTML,
        },
      ],
    };

    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text();
      console.error('SendGrid error:', errorBody);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send email',
          details: errorBody,
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Receipt email sent successfully',
        orderId,
        customerEmail,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Email function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});