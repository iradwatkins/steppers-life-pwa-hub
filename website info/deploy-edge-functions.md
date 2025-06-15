# Deploy SteppersLife Edge Functions to Supabase

This guide shows you how to deploy the 3 core Edge Functions that replace your Python backend.

## 🎯 What These Functions Do:

1. **create-payment** - Processes payments via Square, PayPal, CashApp, Cash
2. **send-email** - Sends all email notifications (welcome, tickets, reminders)  
3. **manage-account** - Handles account balances, transfers, withdrawals

## ⚙️ Prerequisites:

1. **Supabase CLI** installed: `npm install -g supabase`
2. **Supabase project** already set up
3. **Payment provider accounts** (Square, PayPal, SendGrid)

## 🚀 Deployment Steps:

### Step 1: Login to Supabase CLI

```bash
supabase login
```

### Step 2: Link Your Project

```bash
cd "/Users/irawatkins/Steppers Life V2/steppers-life-2025-v2"
supabase link --project-ref YOUR_PROJECT_ID
```

### Step 3: Set Environment Variables

In your **Supabase Dashboard** → **Settings** → **Environment variables**, add:

**Payment Processing:**
```
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ENVIRONMENT=sandbox  # or 'production'
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_ENVIRONMENT=sandbox  # or 'production'
```

**Email Service:**
```
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@stepperslife.com
FROM_NAME=SteppersLife
```

**General:**
```
FRONTEND_URL=http://localhost:8081  # or your Vercel URL
```

### Step 4: Deploy Functions

Deploy all 3 functions at once:

```bash
supabase functions deploy create-payment
supabase functions deploy send-email  
supabase functions deploy manage-account
```

Or deploy them individually:

```bash
# Payment processing function
supabase functions deploy create-payment --project-ref YOUR_PROJECT_ID

# Email notification function
supabase functions deploy send-email --project-ref YOUR_PROJECT_ID

# Account management function
supabase functions deploy manage-account --project-ref YOUR_PROJECT_ID
```

### Step 5: Test Functions

Test each function in **Supabase Dashboard** → **Edge Functions**:

**Test create-payment:**
```json
{
  "ticket_id": "test-ticket-id",
  "amount": 25.00,
  "currency": "USD",
  "provider": "cash"
}
```

**Test send-email:**
```json
{
  "type": "welcome",
  "to": "test@example.com",
  "data": {
    "name": "Test User"
  }
}
```

**Test manage-account:**
```json
{
  "action": "get_balance"
}
```

## 🔒 Security Features:

- ✅ **JWT Authentication** - All functions require valid user tokens
- ✅ **Row Level Security** - Database access controlled by RLS policies
- ✅ **Input Validation** - All requests validated before processing
- ✅ **Error Handling** - Secure error messages, detailed logs
- ✅ **CORS Headers** - Proper cross-origin request handling

## 📊 Function URLs:

After deployment, your functions will be available at:

```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-payment
https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-email
https://YOUR_PROJECT_ID.supabase.co/functions/v1/manage-account
```

## 🔧 Monitoring:

1. **Function Logs**: Supabase Dashboard → Edge Functions → Logs
2. **Database Activity**: Dashboard → Database → Logs
3. **API Usage**: Dashboard → Reports → API

## 🚨 Troubleshooting:

**Function fails to deploy:**
- Check you have Supabase CLI installed: `supabase --version`
- Verify project link: `supabase status`
- Check function syntax: Look for TypeScript errors

**Function runs but fails:**
- Check environment variables are set correctly
- Review function logs in Supabase Dashboard
- Verify database permissions and RLS policies

**Payment processing fails:**
- Verify payment provider credentials
- Check provider API status (Square/PayPal)
- Review webhook configurations

## ✅ Success Criteria:

After successful deployment:
- ✅ All 3 functions show "Deployed" status
- ✅ Test requests return 200 status codes
- ✅ Database records are created correctly
- ✅ Emails are sent successfully
- ✅ Payment processing works for test amounts

## 🎯 Next Steps:

1. **Update Frontend** - Connect React app to these Edge Functions
2. **Test Real Payments** - Use small amounts to test payment flows
3. **Configure Webhooks** - Set up payment provider webhooks
4. **Go Live** - Switch to production payment credentials

Your Python backend functionality is now fully replicated in Supabase Edge Functions!