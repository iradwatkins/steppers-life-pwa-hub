# 🚀 Edge Functions Deployment Guide - CRITICAL

## 🚨 IMMEDIATE ACTIONS REQUIRED

### Step 1: Deploy Database Schema FIRST
1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/sql)
2. Copy and paste the ENTIRE content of `CRITICAL-PRODUCTION-SCHEMA-FIX.sql`
3. Click "Run" and wait for completion
4. Verify you see "SUCCESS: All critical tables deployed!"

### Step 2: Deploy Edge Functions
Go to [Supabase Edge Functions](https://supabase.com/dashboard/project/voaxyetbqhmgbvcxsttf/functions)

#### Create Function 1: `process-square-payment`
1. Click "New Function"
2. Name: `process-square-payment`
3. Copy and paste this EXACT code:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Client, Environment, ApiError } from 'https://esm.sh/squareup@14.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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
```

#### Create Function 2: `process-paypal-payment`
1. Click "New Function"
2. Name: `process-paypal-payment`
3. Copy and paste this EXACT code:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'create';

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
      const { orderData, orderId, userId }: PayPalPaymentRequest = await req.json();

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
      const { paypalOrderId, orderId, userId }: PayPalCaptureRequest = await req.json();

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
```

### Step 3: Verify Environment Variables
In Supabase Dashboard → Settings → Environment Variables, ensure these are set:

**Square Variables:**
- `SQUARE_ACCESS_TOKEN` = (your production access token)
- `SQUARE_APPLICATION_ID` = sq0idp-XG8irNWHf98C62-iqOwH6Q
- `SQUARE_LOCATION_ID` = L0Q2YC1SPBGD8
- `SQUARE_ENVIRONMENT` = production

**PayPal Variables:**
- `PAYPAL_CLIENT_ID` = (your production client ID)
- `PAYPAL_CLIENT_SECRET` = (your production client secret)
- `PAYPAL_ENVIRONMENT` = production

**Supabase Variables (should exist):**
- `SUPABASE_URL` = https://voaxyetbqhmgbvcxsttf.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)

## ✅ Verification Steps

1. **Database:** Run the health check SQL and confirm 15+ tables exist
2. **Edge Functions:** Visit the functions in dashboard and see them listed
3. **Test Payment:** Try a small payment to verify CORS errors are gone
4. **Check Logs:** Monitor Edge Function logs for any errors

## 🚨 Critical Success Indicators

- **No more CORS errors** in browser console
- **No more "null event ID"** errors  
- **No more 404 on classes table**
- **Edge Functions show up** in Supabase dashboard
- **Payment processing works** without "Failed to send request" errors

The moment you deploy both the schema and Edge Functions, all the current errors should disappear immediately.