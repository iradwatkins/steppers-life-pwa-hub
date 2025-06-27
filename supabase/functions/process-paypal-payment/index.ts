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

interface PayPalPaymentRequest {
  orderData: {
    intent: 'CAPTURE';
    purchase_units: Array<{
      reference_id: string;
      amount: {
        currency_code: string;
        value: string;
      };
      description?: string;
    }>;
  };
  orderId: string;
  userId: string;
}

interface PayPalCaptureRequest {
  paypalOrderId: string;
  orderId: string;
  userId: string;
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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body to get action parameter
    const requestBody = await req.json();
    const action = requestBody.action || 'create';

    // Get PayPal access token
    const getAccessToken = async (): Promise<string> => {
      const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
      const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
      const environment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';
      
      const baseUrl = environment === 'production' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

      const auth = btoa(`${clientId}:${clientSecret}`);
      
      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`PayPal auth failed: ${data.error_description || data.error}`);
      }

      return data.access_token;
    };

    if (action === 'create') {
      // Create PayPal order
      const { orderData, orderId, userId }: PayPalPaymentRequest = requestBody;

      if (!orderData || !orderId || !userId) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const accessToken = await getAccessToken();
      const environment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';
      const baseUrl = environment === 'production' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

      // Create PayPal order
      const paypalResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `${orderId}-${Date.now()}`, // Idempotency key
        },
        body: JSON.stringify(orderData),
      });

      const paypalOrder = await paypalResponse.json();

      if (!paypalResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'PayPal order creation failed',
            details: paypalOrder,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store PayPal order ID in database
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          payment_intent_id: paypalOrder.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Failed to update order with PayPal ID:', updateError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          orderId: paypalOrder.id,
          status: paypalOrder.status,
          links: paypalOrder.links,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'capture') {
      // Capture PayPal payment
      const { paypalOrderId, orderId, userId }: PayPalCaptureRequest = requestBody;

      if (!paypalOrderId || !orderId || !userId) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields for capture' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const accessToken = await getAccessToken();
      const environment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';
      const baseUrl = environment === 'production' 
        ? 'https://api-m.paypal.com' 
        : 'https://api-m.sandbox.paypal.com';

      // Capture PayPal order
      const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `${orderId}-capture-${Date.now()}`,
        },
      });

      const captureResult = await captureResponse.json();

      if (!captureResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'PayPal capture failed',
            details: captureResult,
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update order status in database
      const { error: updateError } = await supabaseClient
        .from('orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Failed to update order status:', updateError);
      }

      const paymentCapture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];

      return new Response(
        JSON.stringify({
          success: true,
          orderId,
          paypalOrderId,
          captureId: paymentCapture?.id,
          status: captureResult.status,
          amount: paymentCapture?.amount,
          fee: paymentCapture?.seller_receivable_breakdown?.paypal_fee,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('PayPal function error:', error);
    
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