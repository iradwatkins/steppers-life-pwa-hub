# Environment Variables Setup Checklist

## 🎯 Quick Setup Summary

You need to configure environment variables in **TWO** places:

1. **Frontend (in `.env.production`)** ✅ - Already configured with placeholders
2. **Backend (in Vercel Dashboard)** ❌ - Needs to be set up

---

## 📋 Frontend Environment Variables (.env.production) ✅

**Status: CONFIGURED** - Update with your actual credentials:

```env
# Payment Gateway Configuration (Frontend)
REACT_APP_SQUARE_APPLICATION_ID=your_production_square_app_id
REACT_APP_SQUARE_LOCATION_ID=your_production_square_location_id  
REACT_APP_PAYPAL_CLIENT_ID=your_production_paypal_client_id
```

---

## 🔧 Backend Environment Variables (Vercel Dashboard) ❌

**Status: NEEDS SETUP** - Add these in Vercel Dashboard → Settings → Environment Variables:

### Square Payment Gateway
```
SQUARE_ACCESS_TOKEN=your_production_access_token
SQUARE_APPLICATION_ID=your_production_square_app_id
SQUARE_LOCATION_ID=your_production_square_location_id
SQUARE_ENVIRONMENT=production
```

### PayPal Payment Gateway
```
PAYPAL_CLIENT_ID=your_production_paypal_client_id
PAYPAL_CLIENT_SECRET=your_production_paypal_client_secret
PAYPAL_ENVIRONMENT=production
```

### Application Settings
```
VITE_APP_URL=https://stepperslife.com
```

---

## 🧪 For Testing (Use These First)

### Square Sandbox Credentials
```
SQUARE_ACCESS_TOKEN=sandbox-access-token
SQUARE_APPLICATION_ID=sandbox-sq0idb-placeholder
SQUARE_LOCATION_ID=sandbox-location-placeholder
SQUARE_ENVIRONMENT=sandbox
```

### PayPal Sandbox Credentials  
```
PAYPAL_CLIENT_ID=sandbox-paypal-client-id
PAYPAL_CLIENT_SECRET=sandbox-paypal-client-secret
PAYPAL_ENVIRONMENT=sandbox
```

---

## 📍 Where to Get Production Credentials

### 🟦 Square Production Setup
1. Go to [Square Developer Dashboard](https://developer.squareup.com/)
2. Create a **Production** application
3. Copy these values:
   - **Application ID** → SQUARE_APPLICATION_ID
   - **Access Token** → SQUARE_ACCESS_TOKEN  
   - **Location ID** → SQUARE_LOCATION_ID

### 🔵 PayPal Production Setup
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create a **Live** application
3. Copy these values:
   - **Client ID** → PAYPAL_CLIENT_ID
   - **Client Secret** → PAYPAL_CLIENT_SECRET

---

## ✅ Setup Verification Steps

### 1. Frontend Variables ✅
- [ ] Update `.env.production` with real credentials
- [ ] Build project: `npm run build`
- [ ] Check no console errors

### 2. Backend Variables (Vercel) ❌  
- [ ] Add all environment variables in Vercel Dashboard
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Test API endpoints respond correctly

### 3. End-to-End Testing
- [ ] Process a $1 test transaction with each payment method
- [ ] Verify payments appear in Square/PayPal dashboards
- [ ] Test refund functionality
- [ ] Check order creation in database

---

## 🚨 Security Reminders

- ✅ **Never commit** production API keys to git
- ✅ **Use sandbox first** for all testing
- ✅ **Set environment** correctly (sandbox vs production)
- ✅ **Monitor transactions** in payment gateway dashboards
- ✅ **Test refunds** before going live

---

## 🎯 Next Steps

1. **Get Production Credentials** from Square & PayPal
2. **Update .env.production** with real frontend values
3. **Set Vercel Environment Variables** in dashboard  
4. **Deploy**: `vercel --prod`
5. **Test**: Process $1 transaction and refund

Your payment system is ready to go live! 🚀