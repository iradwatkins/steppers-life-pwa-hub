import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Client, Environment, ApiError } from 'https://esm.sh/squareup@14.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://stepperslife.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
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

    // Initialize Square client
    const client = new Client({
      accessToken: squareToken,
      environment: squareEnv === 'production' ? Environment.Production : Environment.Sandbox,
    });

    const paymentsApi = client.paymentsApi;

    // Convert amount to cents (Square uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    try {
      // Create payment request
      const paymentRequest = {
        sourceId,
        idempotencyKey,
        amountMoney: {
          amount: BigInt(amountInCents),
          currency: currency.toUpperCase() as 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY' | 'AUD',
        },
        locationId: locationId || Deno.env.get('SQUARE_LOCATION_ID'),
        note: `Payment for order ${orderId}`,
        referenceId: orderId,
      };

      // Process payment
      const { result, statusCode } = await paymentsApi.createPayment(paymentRequest);

      if (statusCode !== 200 || !result.payment) {
        throw new Error('Payment failed');
      }

      const payment = result.payment;

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
          amount: payment.amountMoney?.amount ? Number(payment.amountMoney.amount) / 100 : amount,
          currency: payment.amountMoney?.currency || currency,
          receiptNumber: payment.receiptNumber,
          receiptUrl: payment.receiptUrl,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (squareError) {
      console.error('Square API Error:', squareError);
      
      let errorMessage = 'Payment processing failed';
      let errorCode = 'PAYMENT_FAILED';

      if (squareError instanceof ApiError) {
        errorMessage = squareError.errors?.[0]?.detail || errorMessage;
        errorCode = squareError.errors?.[0]?.code || errorCode;
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          errorCode,
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