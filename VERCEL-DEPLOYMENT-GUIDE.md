# Vercel Deployment Guide - Payment Gateway Setup

## 🚀 Quick Deployment Steps

### 1. Deploy to Vercel
```bash
# If not already connected to Vercel
npx vercel

# For subsequent deployments
vercel --prod
```

### 2. Set Environment Variables in Vercel Dashboard

Go to your project settings in Vercel Dashboard → Environment Variables and add:

#### Square Payment Gateway
```
SQUARE_ACCESS_TOKEN=your_production_access_token
SQUARE_APPLICATION_ID=your_square_app_id  
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_ENVIRONMENT=production
```

#### PayPal Payment Gateway
```
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret
PAYPAL_ENVIRONMENT=production
```

#### Application Settings
```
VITE_APP_URL=https://your-domain.vercel.app
```

### 3. Frontend Environment Variables

Add to your `.env.production` file:
```
REACT_APP_SQUARE_APPLICATION_ID=your_production_square_app_id
REACT_APP_SQUARE_LOCATION_ID=your_production_square_location_id
REACT_APP_PAYPAL_CLIENT_ID=your_production_paypal_client_id
```

## 🧪 Testing Setup (Sandbox)

For testing, use these environment variable values:

#### Square Sandbox
```
SQUARE_ACCESS_TOKEN=your_sandbox_access_token
SQUARE_APPLICATION_ID=your_sandbox_app_id
SQUARE_LOCATION_ID=your_sandbox_location_id
SQUARE_ENVIRONMENT=sandbox
```

#### PayPal Sandbox
```
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

## 📋 Getting Production Credentials

### Square Production Setup
1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. Create a production application
3. Get your production credentials:
   - Application ID
   - Access Token
   - Location ID

### PayPal Production Setup
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create a production app
3. Get your production credentials:
   - Client ID
   - Client Secret

## 🔧 API Endpoints Available

After deployment, these endpoints will be available:

```
https://your-domain.vercel.app/api/payments/square/process
https://your-domain.vercel.app/api/payments/square/refund
https://your-domain.vercel.app/api/payments/paypal/process
https://your-domain.vercel.app/api/payments/paypal/refund
https://your-domain.vercel.app/api/payments/cashapp/process
https://your-domain.vercel.app/api/payments/cashapp/refund
```

## ✅ Verification Steps

1. **Deploy to staging**: Test with sandbox credentials
2. **Test payment flow**: Complete a test transaction
3. **Check logs**: Monitor Vercel Function logs for errors
4. **Production deploy**: Switch to production credentials
5. **Final testing**: Process a real $1 transaction and refund

## 🚨 Security Checklist

- ✅ All sensitive keys are in Vercel environment variables (not in code)
- ✅ CORS headers properly configured
- ✅ HTTPS enforced on all endpoints
- ✅ Input validation on all payment endpoints
- ✅ Error handling doesn't expose sensitive information
- ✅ Environment-based configuration (sandbox vs production)

## 📊 Monitoring

Monitor your payment processing through:
- **Vercel Dashboard**: Function logs and performance
- **Square Dashboard**: Transaction monitoring
- **PayPal Dashboard**: Payment tracking
- **Your Analytics**: Order completion rates

## 🔄 Common Issues & Solutions

### Function Timeout
- Vercel Functions have a 10-second timeout limit
- Payment processing is typically under 3 seconds
- Monitor function execution time in Vercel dashboard

### CORS Errors
- Check that VITE_APP_URL matches your actual domain
- Verify CORS headers in function responses

### Environment Variables Not Working
- Ensure all environment variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new environment variables

### Payment Gateway Errors
- Verify you're using the correct environment (sandbox vs production)
- Check that API keys have proper permissions
- Monitor payment gateway dashboards for error details

Your payment system is now ready for production! 🎉