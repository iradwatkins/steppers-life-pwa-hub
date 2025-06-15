# Payment Integration Setup Guide

## 🚀 **SteppersLife Payment Integration**

This guide covers setting up Square, PayPal, Cash App, and Cash payment options for the SteppersLife platform.

## 📋 **Available Payment Methods**

### 1. **Square / Cash App**
- **Features**: Credit/debit cards, Cash App, Apple Pay, Google Pay
- **Processing**: Instant
- **Fees**: 2.9% + 30¢ per transaction

### 2. **PayPal**  
- **Features**: PayPal balance, bank accounts, cards via PayPal
- **Processing**: Instant
- **Fees**: 2.9% + fixed fee
- **Payouts**: Send money to event organizers and users

### 3. **Cash App (Direct)**
- **Features**: Direct Cash App payments via $cashtag
- **Processing**: Instant
- **Fees**: 2.75% per transaction
- **Payouts**: Send money directly to $cashtags

### 4. **Cash Payment**
- **Features**: Event location pickup
- **Processing**: At event check-in
- **Fees**: No processing fees

## 🔧 **Environment Configuration**

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Square Payment Settings
SQUARE_ACCESS_TOKEN=your_square_access_token_here
SQUARE_APPLICATION_ID=your_square_application_id_here
SQUARE_ENVIRONMENT=sandbox  # or "production" for live

# PayPal Payment Settings  
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox  # or "live" for production

# Cash App Payment Settings
CASHAPP_CLIENT_ID=your_cashapp_client_id_here
CASHAPP_CLIENT_SECRET=your_cashapp_client_secret_here
CASHAPP_ENVIRONMENT=sandbox  # or "production" for live

# Frontend URL for redirects
FRONTEND_URL=http://localhost:8082
```

## 🏪 **Square Setup**

1. **Create Square Developer Account**
   - Visit: https://developer.squareup.com/
   - Create a new application

2. **Get Credentials**
   - **Sandbox**: Use sandbox credentials for testing
   - **Production**: Use production credentials for live payments

3. **Configure Webhook** (Optional)
   - Set up webhooks for payment status updates
   - URL: `https://your-domain.com/api/v1/payments/webhook`

## 💰 **PayPal Setup**

1. **Create PayPal Developer Account**
   - Visit: https://developer.paypal.com/
   - Create a new application

2. **Get Credentials**
   - **Sandbox**: Use sandbox credentials for testing
   - **Live**: Use live credentials for production

3. **Configure Return URLs**
   - Return URL: `https://your-domain.com/checkout/paypal-return`
   - Cancel URL: `https://your-domain.com/checkout/paypal-cancel`

4. **Configure PayPal Webhooks**
   - Webhook URL: `https://your-domain.com/api/v1/payments/webhook/paypal`
   - **Required Events**:
     - `PAYMENT.SALE.COMPLETED`
     - `PAYMENT.SALE.DENIED`
     - `PAYMENT.SALE.REFUNDED`
     - `PAYMENT.REFUND.COMPLETED`
     - `CUSTOMER.PAYOUT.COMPLETED`
     - `CUSTOMER.PAYOUT.FAILED`
     - `PAYMENT.PAYOUTS-ITEM.SUCCEEDED`
     - `PAYMENT.PAYOUTS-ITEM.FAILED`
     - `PAYMENT.PAYOUTSBATCH.SUCCESS`
     - `PAYMENT.PAYOUTSBATCH.DENIED`
     - `CUSTOMER.DISPUTE.CREATED`

## 💚 **Cash App Setup**

1. **Create Cash App Business Account**
   - Visit: https://business.cash.app/
   - Apply for Cash App Business API access

2. **Get API Credentials**
   - **Sandbox**: Use sandbox credentials for testing
   - **Production**: Use production credentials for live payments

3. **Configure Business Settings**
   - Set up business verification
   - Configure payout settings
   - Enable API access

4. **Configure Webhooks** (Optional)
   - Webhook URL: `https://your-domain.com/api/v1/payments/webhook/cashapp`
   - Monitor payment and payout status updates

## 🧪 **Testing**

### **Square Testing Cards**
```
Card Number: 4111 1111 1111 1111
CVV: 111
Expiry: Any future date
```

### **PayPal Testing**
- Use PayPal sandbox accounts
- Test buyer account: sb-buyer@business.example.com
- Test password: test1234

### **Cash App Testing**
- Use Cash App sandbox environment
- Test with sandbox $cashtags
- Test $cashtag: $TestCashtag123

## 🚀 **Deployment**

### **Production Settings**
1. **Update Environment Variables**
   - Change `SQUARE_ENVIRONMENT=production`
   - Change `PAYPAL_MODE=live` 
   - Change `CASHAPP_ENVIRONMENT=production`
   - Update `FRONTEND_URL` to your production domain

2. **SSL Required**
   - All payment providers require HTTPS in production
   - Ensure your domain has a valid SSL certificate

3. **Webhook Security**
   - Implement webhook signature verification
   - Use environment variables for webhook secrets

## 📱 **Frontend Integration**

The payment system supports multiple payment methods:

1. **Payment Provider Selection**: Users can choose their preferred payment method
2. **Square Integration**: Credit/debit cards, digital wallets
3. **PayPal Integration**: Redirects to PayPal for authorization
4. **Cash App Integration**: Direct payments via $cashtag
5. **Cash Payments**: Generates verification codes for event pickup

## 💰 **PayPal Payouts**

The platform supports sending payouts to event organizers and users via PayPal.

### **Individual Payouts**
- **Endpoint**: `POST /api/v1/payments/payout/create`
- **Permissions**: Admin/Moderator only
- **Use Case**: Send earnings to event organizers

### **Batch Payouts**
- **Endpoint**: `POST /api/v1/payments/payout/batch`
- **Permissions**: Admin only
- **Use Case**: Send multiple payouts at once

### **Payout Status**
- **Endpoint**: `GET /api/v1/payments/payout/status/{payout_batch_id}`
- **Permissions**: Admin/Moderator only
- **Use Case**: Check payout processing status

## 💚 **Cash App Payouts**

Direct payouts to Cash App users via $cashtag.

### **Cash App Payouts**
- **Endpoint**: `POST /api/v1/payments/payout/cashapp`
- **Permissions**: Admin/Moderator only
- **Use Case**: Send earnings directly to $cashtags

### **Payout Status**
- **Endpoint**: `GET /api/v1/payments/payout/cashapp/status/{payout_id}`
- **Permissions**: Admin/Moderator only
- **Use Case**: Check Cash App payout status

### **Promoter/Organizer Payout Settings**
- Users can configure multiple payout methods in their profile
- Support for PayPal (email), Cash App ($cashtag), and bank accounts
- Automatic payout scheduling and minimum thresholds
- Tax information collection for compliance

## 🛠️ **Development**

### **Start Backend**
```bash
cd backend
source venv/bin/activate
python3 -m uvicorn main:app --reload --port 8000
```

### **Start Frontend**
```bash
npm run dev
```

### **Test Payments**
1. Go to `http://localhost:8082`
2. Create an event and purchase tickets
3. Test different payment methods including Cash App

## 🔒 **Security Notes**

- Never commit `.env` files to version control
- Use different credentials for development/staging/production
- Implement proper error handling and logging
- Validate all payment amounts server-side
- Use HTTPS in production
- Verify webhook signatures from all providers

## 📞 **Support**

For payment integration issues:
- **Square**: https://developer.squareup.com/docs
- **PayPal**: https://developer.paypal.com/docs
- **Cash App**: https://business.cash.app/support
- **SteppersLife**: Contact your development team

---

**Status**: ✅ Multi-provider payment integration complete with Cash App support! 