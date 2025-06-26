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

interface PaymentRequest {
  amount: number;
  currency: string;
  sourceId: string;
  locationId?: string;
  orderId: string;
  userId: string;
  idempotencyKey: string;
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Check environment variables first
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const squareToken = Deno.env.get('SQUARE_ACCESS_TOKEN');
    const squareEnv = Deno.env.get('SQUARE_ENVIRONMENT');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!squareToken || !squareEnv) {
      console.error('Missing Square credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Parse request body with error handling
    let requestBody: PaymentRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, currency, sourceId, locationId, orderId, userId, idempotencyKey } = requestBody;

    // Validate required fields
    if (!amount || !currency || !sourceId || !orderId || !userId || !idempotencyKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert amount to cents (Square uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Determine Square API base URL based on environment
    const squareBaseUrl = squareEnv === 'production' 
      ? 'https://connect.squareup.com' 
      : 'https://connect.squareupsandbox.com';

    try {
      // Create payment request using Square API directly
      const paymentRequest = {
        source_id: sourceId,
        idempotency_key: idempotencyKey,
        amount_money: {
          amount: amountInCents,
          currency: currency.toUpperCase(),
        },
        location_id: locationId || Deno.env.get('SQUARE_LOCATION_ID'),
        note: `Payment for order ${orderId}`,
        reference_id: orderId,
      };

      // Process payment using Square API
      const squareResponse = await fetch(`${squareBaseUrl}/v2/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${squareToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-01-17',
        },
        body: JSON.stringify(paymentRequest),
      });

      const squareResult = await squareResponse.json();

      if (!squareResponse.ok) {
        throw new Error(squareResult.errors?.[0]?.detail || 'Payment failed');
      }

      const payment = squareResult.payment;

      // Update order in database with payment details
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          payment_intent_id: payment.id,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Failed to update order:', updateError);
        // Note: In production, you might want to implement compensation logic here
      }

      // Return successful response
      return new Response(
        JSON.stringify({
          success: true,
          paymentId: payment.id,
          status: payment.status,
          orderId,
          amount: payment.amount_money?.amount ? payment.amount_money.amount / 100 : amount,
          currency: payment.amount_money?.currency || currency,
          receipt_number: payment.receipt_number,
          receipt_url: payment.receipt_url,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (squareError) {
      console.error('Square API Error:', squareError);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: squareError.message || 'Payment processing failed',
          orderId,
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Function error:', error);
    
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