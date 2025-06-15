// SteppersLife Payment Processing Edge Function
// Handles payment creation for multiple providers: Square, PayPal, CashApp

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  ticket_id: string
  amount: number
  currency: string
  provider: 'square' | 'paypal' | 'cashapp' | 'cash'
  payment_method_data?: any
  return_url?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { ticket_id, amount, currency, provider, payment_method_data, return_url }: PaymentRequest = await req.json()

    // Validate required fields
    if (!ticket_id || !amount || !provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: ticket_id, amount, provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get ticket details and validate ownership
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('tickets')
      .select('*, events(*)')
      .eq('id', ticket_id)
      .eq('user_id', user.id)
      .single()

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({ error: 'Ticket not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate payment amount matches ticket total
    if (Math.abs(amount - ticket.total_amount) > 0.01) {
      return new Response(
        JSON.stringify({ error: 'Payment amount does not match ticket total' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Process payment based on provider
    let paymentResult
    switch (provider) {
      case 'square':
        paymentResult = await processSquarePayment(amount, currency, payment_method_data)
        break
      case 'paypal':
        paymentResult = await processPayPalPayment(amount, currency, return_url)
        break
      case 'cashapp':
        paymentResult = await processCashAppPayment(amount, currency, payment_method_data)
        break
      case 'cash':
        paymentResult = await processCashPayment(amount, currency)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported payment provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Create payment record in database
    const { data: payment, error: paymentDbError } = await supabaseClient
      .from('payments')
      .insert({
        ticket_id,
        user_id: user.id,
        amount,
        currency: currency || 'USD',
        provider,
        provider_payment_id: paymentResult.payment_id,
        status: paymentResult.status,
        metadata: paymentResult.metadata || {}
      })
      .select()
      .single()

    if (paymentDbError) {
      console.error('Database error:', paymentDbError)
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update ticket payment status if payment completed immediately
    if (paymentResult.status === 'completed') {
      await supabaseClient
        .from('tickets')
        .update({ 
          payment_status: 'paid',
          status: 'confirmed'
        })
        .eq('id', ticket_id)
    }

    return new Response(
      JSON.stringify({
        payment_id: payment.id,
        status: paymentResult.status,
        provider_payment_id: paymentResult.payment_id,
        approval_url: paymentResult.approval_url,
        next_action: paymentResult.next_action
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Square Payment Processing
async function processSquarePayment(amount: number, currency: string, paymentMethodData: any) {
  const SQUARE_ACCESS_TOKEN = Deno.env.get('SQUARE_ACCESS_TOKEN')
  const SQUARE_APPLICATION_ID = Deno.env.get('SQUARE_APPLICATION_ID')
  const SQUARE_ENVIRONMENT = Deno.env.get('SQUARE_ENVIRONMENT') || 'sandbox'

  if (!SQUARE_ACCESS_TOKEN || !SQUARE_APPLICATION_ID) {
    throw new Error('Square credentials not configured')
  }

  const baseUrl = SQUARE_ENVIRONMENT === 'production' 
    ? 'https://connect.squareup.com' 
    : 'https://connect.squareupsandbox.com'

  const response = await fetch(`${baseUrl}/v2/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': '2023-10-18'
    },
    body: JSON.stringify({
      source_id: paymentMethodData.source_id,
      amount_money: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || 'USD'
      },
      idempotency_key: crypto.randomUUID()
    })
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(`Square payment failed: ${result.errors?.[0]?.detail || 'Unknown error'}`)
  }

  return {
    payment_id: result.payment.id,
    status: result.payment.status === 'COMPLETED' ? 'completed' : 'pending',
    metadata: result
  }
}

// PayPal Payment Processing
async function processPayPalPayment(amount: number, currency: string, returnUrl?: string) {
  const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
  const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET')
  const PAYPAL_ENVIRONMENT = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox'

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured')
  }

  const baseUrl = PAYPAL_ENVIRONMENT === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

  // Get access token
  const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  const authResult = await authResponse.json()
  const accessToken = authResult.access_token

  // Create payment
  const paymentResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency || 'USD',
          value: amount.toFixed(2)
        }
      }],
      application_context: {
        return_url: returnUrl || `${Deno.env.get('FRONTEND_URL')}/payment/success`,
        cancel_url: `${Deno.env.get('FRONTEND_URL')}/payment/cancel`
      }
    })
  })

  const paymentResult = await paymentResponse.json()

  if (!paymentResponse.ok) {
    throw new Error(`PayPal payment failed: ${paymentResult.message || 'Unknown error'}`)
  }

  const approvalUrl = paymentResult.links.find((link: any) => link.rel === 'approve')?.href

  return {
    payment_id: paymentResult.id,
    status: 'pending',
    approval_url: approvalUrl,
    metadata: paymentResult,
    next_action: { type: 'redirect', url: approvalUrl }
  }
}

// Cash App Payment Processing (via Square)
async function processCashAppPayment(amount: number, currency: string, paymentMethodData: any) {
  // Cash App payments go through Square's Cash App Pay integration
  return await processSquarePayment(amount, currency, paymentMethodData)
}

// Cash Payment Processing (manual verification)
async function processCashPayment(amount: number, currency: string) {
  return {
    payment_id: `cash_${crypto.randomUUID()}`,
    status: 'pending', // Requires manual verification
    metadata: {
      amount,
      currency,
      payment_method: 'cash',
      requires_manual_verification: true
    }
  }
}