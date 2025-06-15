// SteppersLife Email Service Edge Function
// Handles all email notifications: registration, tickets, payments, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'welcome' | 'ticket_confirmation' | 'payment_success' | 'event_reminder' | 'password_reset'
  to: string
  user_id?: string
  data?: any
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

    // Get user from JWT token (optional for some email types)
    const authHeader = req.headers.get('Authorization')
    let user = null
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user: authUser } } = await supabaseClient.auth.getUser(token)
      user = authUser
    }

    // Parse request body
    const { type, to, user_id, data }: EmailRequest = await req.json()

    // Validate required fields
    if (!type || !to) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, to' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get email template and send email based on type
    let emailResult
    switch (type) {
      case 'welcome':
        emailResult = await sendWelcomeEmail(to, data)
        break
      case 'ticket_confirmation':
        emailResult = await sendTicketConfirmationEmail(to, data, supabaseClient)
        break
      case 'payment_success':
        emailResult = await sendPaymentSuccessEmail(to, data, supabaseClient)
        break
      case 'event_reminder':
        emailResult = await sendEventReminderEmail(to, data, supabaseClient)
        break
      case 'password_reset':
        emailResult = await sendPasswordResetEmail(to, data)
        break
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported email type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Log email in database
    await supabaseClient
      .from('email_tracking')
      .insert({
        user_id: user_id || user?.id,
        email: to,
        status: 'sent',
        metadata: {
          type,
          provider: 'sendgrid',
          message_id: emailResult.message_id
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        message_id: emailResult.message_id,
        status: 'sent'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// SendGrid Email Service
async function sendEmailWithSendGrid(to: string, subject: string, htmlContent: string, textContent?: string) {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@stepperslife.com'
  const FROM_NAME = Deno.env.get('FROM_NAME') || 'SteppersLife'

  if (!SENDGRID_API_KEY) {
    throw new Error('SendGrid API key not configured')
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        subject: subject
      }],
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      content: [
        {
          type: 'text/html',
          value: htmlContent
        },
        ...(textContent ? [{
          type: 'text/plain',
          value: textContent
        }] : [])
      ]
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid error: ${error}`)
  }

  return {
    message_id: response.headers.get('x-message-id') || 'unknown'
  }
}

// Welcome Email
async function sendWelcomeEmail(to: string, data: any) {
  const subject = 'Welcome to SteppersLife!'
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Welcome to SteppersLife!</h1>
      <p>Hi ${data?.name || 'there'},</p>
      <p>Welcome to the SteppersLife community! We're excited to have you join our platform for stepping events, classes, and community.</p>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>What's Next?</h3>
        <ul>
          <li>Browse upcoming stepping events in your area</li>
          <li>Join classes and workshops</li>
          <li>Connect with fellow steppers</li>
          <li>Create your own events</li>
        </ul>
      </div>
      <p>Ready to get started? <a href="${Deno.env.get('FRONTEND_URL')}/events" style="color: #2563eb;">Browse Events</a></p>
      <p>Best regards,<br>The SteppersLife Team</p>
    </div>
  `
  
  return await sendEmailWithSendGrid(to, subject, htmlContent)
}

// Ticket Confirmation Email
async function sendTicketConfirmationEmail(to: string, data: any, supabase: any) {
  // Get ticket and event details
  const { data: ticket } = await supabase
    .from('tickets')
    .select('*, events(*), user_profiles(*)')
    .eq('id', data.ticket_id)
    .single()

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  const subject = `Ticket Confirmation - ${ticket.events.title}`
  const eventDate = new Date(ticket.events.start_datetime).toLocaleDateString()
  const eventTime = new Date(ticket.events.start_datetime).toLocaleTimeString()

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Ticket Confirmed!</h1>
      <p>Hi ${ticket.user_profiles.first_name},</p>
      <p>Your ticket for <strong>${ticket.events.title}</strong> has been confirmed!</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Event Details</h3>
        <p><strong>Event:</strong> ${ticket.events.title}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Time:</strong> ${eventTime}</p>
        <p><strong>Ticket #:</strong> ${ticket.ticket_number}</p>
        <p><strong>Quantity:</strong> ${ticket.quantity}</p>
        <p><strong>Total:</strong> $${ticket.total_amount}</p>
      </div>

      <div style="background: #10b981; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0;">QR Code for Check-in</h3>
        <p style="margin: 5px 0; font-size: 12px;">Show this at the event</p>
        <p style="font-family: monospace; font-size: 18px; margin: 10px 0;">${ticket.verification_token}</p>
      </div>

      <p>Save this email and show your QR code at the event for check-in.</p>
      <p>See you at the event!<br>The SteppersLife Team</p>
    </div>
  `
  
  return await sendEmailWithSendGrid(to, subject, htmlContent)
}

// Payment Success Email
async function sendPaymentSuccessEmail(to: string, data: any, supabase: any) {
  const { data: payment } = await supabase
    .from('payments')
    .select('*, tickets(*, events(*)), user_profiles(*)')
    .eq('id', data.payment_id)
    .single()

  if (!payment) {
    throw new Error('Payment not found')
  }

  const subject = `Payment Confirmation - $${payment.amount}`
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">Payment Successful!</h1>
      <p>Hi ${payment.user_profiles.first_name},</p>
      <p>Your payment has been processed successfully!</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Payment Details</h3>
        <p><strong>Amount:</strong> $${payment.amount}</p>
        <p><strong>Payment Method:</strong> ${payment.provider}</p>
        <p><strong>Transaction ID:</strong> ${payment.provider_payment_id}</p>
        <p><strong>Event:</strong> ${payment.tickets.events.title}</p>
      </div>

      <p>Your tickets are confirmed and ready! Check your email for ticket details.</p>
      <p>Thank you for your purchase!<br>The SteppersLife Team</p>
    </div>
  `
  
  return await sendEmailWithSendGrid(to, subject, htmlContent)
}

// Event Reminder Email
async function sendEventReminderEmail(to: string, data: any, supabase: any) {
  const { data: ticket } = await supabase
    .from('tickets')
    .select('*, events(*), user_profiles(*)')
    .eq('id', data.ticket_id)
    .single()

  if (!ticket) {
    throw new Error('Ticket not found')
  }

  const subject = `Reminder: ${ticket.events.title} is Tomorrow!`
  const eventDate = new Date(ticket.events.start_datetime).toLocaleDateString()
  const eventTime = new Date(ticket.events.start_datetime).toLocaleTimeString()

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #f59e0b;">Event Reminder</h1>
      <p>Hi ${ticket.user_profiles.first_name},</p>
      <p>Don't forget! <strong>${ticket.events.title}</strong> is coming up!</p>
      
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Tomorrow's Event</h3>
        <p><strong>Event:</strong> ${ticket.events.title}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        <p><strong>Time:</strong> ${eventTime}</p>
        <p><strong>Your Ticket #:</strong> ${ticket.ticket_number}</p>
      </div>

      <p><strong>Remember to bring:</strong></p>
      <ul>
        <li>This email for check-in</li>
        <li>Comfortable stepping shoes</li>
        <li>Water bottle</li>
        <li>Good vibes!</li>
      </ul>

      <p>We can't wait to see you there!<br>The SteppersLife Team</p>
    </div>
  `
  
  return await sendEmailWithSendGrid(to, subject, htmlContent)
}

// Password Reset Email
async function sendPasswordResetEmail(to: string, data: any) {
  const subject = 'Reset Your SteppersLife Password'
  const resetUrl = `${Deno.env.get('FRONTEND_URL')}/auth/reset-password?token=${data.token}`
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Reset Your Password</h1>
      <p>Hi there,</p>
      <p>We received a request to reset your SteppersLife password.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>

      <p>If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
      <p>This link will expire in 1 hour for security.</p>
      
      <p>Best regards,<br>The SteppersLife Team</p>
    </div>
  `
  
  return await sendEmailWithSendGrid(to, subject, htmlContent)
}