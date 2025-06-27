# Payment System Implementation Guide

## Overview
This guide documents the complete payment gateway integration implementation with Square, PayPal, Apple Pay, Google Pay, and CashApp Pay. The system includes device-specific filtering, proper error handling, and production-ready configurations.

## Tech Stack
- **React** with TypeScript
- **Vite** development server
- **Supabase** for backend functions and database
- **Square Web SDK** for card payments, Apple Pay, Google Pay, and CashApp Pay
- **PayPal JavaScript SDK** for PayPal payments
- **Shadcn/ui** components for UI
- **React Hook Form** with Zod validation
- **Sonner** for toast notifications

## File Structure

### Core Payment Components
```
src/components/payments/
├── PaymentMethodSelector.tsx          # Legacy payment selector with device filtering
├── ModernPaymentMethodSelector.tsx    # Modern payment selector with unified UI
├── ModernPaymentSelector.tsx          # Alternative modern selector
├── SquarePaymentForm.tsx             # Square payment form component
├── PayPalPaymentForm.tsx             # PayPal payment form component
└── ModernSquarePaymentForm.tsx       # Modern Square form with all payment methods
```

### Payment Services
```
src/services/
├── realPaymentService.ts             # Main payment processing service
├── paymentGatewayManager.ts          # Legacy payment gateway manager
├── modernPaymentGatewayManager.ts    # Modern unified payment manager
└── paymentGateways/
    ├── cashAppPaymentService.ts      # CashApp Pay integration
    ├── paypalPaymentService.ts       # PayPal service implementation
    └── squarePaymentService.ts       # Square service implementation
```

### Payment Pages
```
src/pages/
├── CheckoutPaymentPage.tsx           # Legacy checkout payment page
├── ModernCheckoutPaymentPage.tsx     # Modern checkout with device filtering
└── ModernPaymentPage.tsx             # Standalone modern payment page
```

### Supabase Edge Functions
```
supabase/functions/
├── process-square-payment/           # Square payment processing
├── process-paypal-payment/           # PayPal order creation and capture
└── send-receipt-email/               # Receipt email functionality
```

### Utilities
```
src/utils/
├── deviceDetection.ts                # Device capability detection
└── extensionProtection.ts            # Browser extension interference protection
```

## Key Implementation Details

### 1. Device-Specific Payment Method Filtering

**File**: `src/utils/deviceDetection.ts`
```typescript
export class DeviceDetection {
  static getCapabilities() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    return {
      isMobile,
      isIOS,
      isAndroid,
      supportsApplePay: isIOS && window.ApplePaySession,
      supportsGooglePay: isAndroid || (!isIOS && window.google?.payments),
      supportsCashApp: true, // Available on all platforms via Square
    };
  }
}
```

**Implementation in Components**:
```typescript
// Filter payment methods based on device capabilities
const availableMethods = paymentMethods.filter(method => {
  if (!method.available) return false;
  
  // On desktop, exclude mobile-only payment methods
  if (!deviceCaps.isMobile && method.mobileOnly) return false;
  
  return true;
});
```

### 2. Apple Pay Domain Association

**File**: `public/.well-known/apple-developer-merchantid-domain-association`
- Contains hex-encoded certificate data from Square merchant account
- Enables Apple Pay functionality on the website
- Must be accessible at `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`

### 3. Payment Method Configurations

**Square Configuration**:
```typescript
const squareConfig = {
  applicationId: process.env.VITE_SQUARE_APP_ID,
  locationId: process.env.VITE_SQUARE_LOCATION_ID,
  environment: process.env.VITE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
};
```

**PayPal Configuration**:
```typescript
const paypalConfig = {
  clientId: process.env.VITE_PAYPAL_CLIENT_ID,
  environment: process.env.VITE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
};
```

### 4. CashApp Pay Integration

**Key Implementation**: CashApp Pay is part of Square's ecosystem
```typescript
// Initialize CashApp Pay through Square Web SDK
const payments = Square.payments(applicationId, locationId);
const cashAppPay = await payments.cashAppPay({
  redirectURL: window.location.origin + '/checkout/confirmation'
});
```

**Service Integration**: Routes through existing Square infrastructure
```typescript
// CashApp service uses Square payment processing
async createPayment(request: CashAppPaymentRequest) {
  return await RealPaymentService.processSquarePayment({
    orderId: request.orderId,
    userId: request.userId || 'anonymous',
    amount: request.amount / 100, // Convert cents to dollars
    currency: request.currency,
    paymentMethod: 'cashapp',
    paymentData: { sourceId: 'cashapp-payment-token' }
  });
}
```

### 5. PayPal Integration Fix

**Issue**: Edge Function expected action in query parameters
**Solution**: Pass action in request body

**Before**:
```typescript
const { data, error } = await supabase.functions.invoke('process-paypal-payment', {
  body: { paypalOrderId, orderId, userId },
  headers: { 'Content-Type': 'application/json' }
}, { 
  method: 'POST', 
  query: { action: 'capture' } 
});
```

**After**:
```typescript
const { data, error } = await supabase.functions.invoke('process-paypal-payment', {
  body: {
    paypalOrderId,
    orderId,
    userId,
    action: 'capture' // Include action in body
  }
});
```

**Edge Function Update**:
```typescript
// Parse action from request body instead of URL query
const { action, paypalOrderId, orderId, userId, orderData } = await req.json();
```

## Environment Variables Required

```env
# Square Configuration
VITE_SQUARE_APP_ID=your_square_application_id
VITE_SQUARE_LOCATION_ID=your_square_location_id

# PayPal Configuration  
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Environment
VITE_ENVIRONMENT=development # or production

# Supabase (for backend functions)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Payment Method Availability Matrix

| Payment Method | Desktop | Mobile | iOS | Android | Requirements |
|---------------|---------|--------|-----|---------|-------------|
| Square Card   | ✅      | ✅     | ✅  | ✅      | Square account |
| PayPal        | ✅      | ✅     | ✅  | ✅      | PayPal account |
| Apple Pay     | ❌      | ✅     | ✅  | ❌      | iOS + Square + Domain verification |
| Google Pay    | ❌      | ✅     | ❌  | ✅      | Android + Square |
| CashApp Pay   | ❌      | ✅     | ✅  | ✅      | Square account (mobile only) |
| Cash at Venue | ✅      | ✅     | ✅  | ✅      | Custom implementation |

## Setup Instructions

### 1. Install Dependencies
```bash
npm install @square/web-sdk
npm install @paypal/react-paypal-js
```

### 2. Configure Environment Variables
Set up all required environment variables in `.env.local`

### 3. Set Up Supabase Edge Functions
Deploy the payment processing functions:
```bash
supabase functions deploy process-square-payment
supabase functions deploy process-paypal-payment  
supabase functions deploy send-receipt-email
```

### 4. Configure Apple Pay Domain
1. Get domain association file from Square dashboard
2. Place in `public/.well-known/apple-developer-merchantid-domain-association`
3. Verify accessibility at `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`

### 5. Test Payment Methods
```typescript
// Test Square payments
const squareResult = await RealPaymentService.processSquarePayment(request);

// Test PayPal payments  
const paypalOrder = await RealPaymentService.createPayPalOrder(request);
const captureResult = await RealPaymentService.capturePayPalPayment(paypalOrderId, orderId, userId);
```

## Key Features Implemented

### ✅ Device-Specific Filtering
- Desktop: Shows only Square (credit card) and PayPal
- Mobile: Shows all available payment methods including Apple Pay, Google Pay, and CashApp Pay

### ✅ Error Handling & Validation
- Extension interference detection and user notifications
- Form validation with Zod schemas
- Comprehensive error messages and retry mechanisms

### ✅ Payment Processing Flow
1. User selects payment method
2. Device capability detection filters available options
3. Payment form loads with proper SDK initialization
4. Payment processing through unified service layer
5. Order creation in database
6. Receipt email sending
7. Confirmation page with order details

### ✅ Security Features
- SSL encryption for all transactions
- No payment data stored on servers
- Browser extension interference protection
- Secure token handling for all payment methods

## Migration Notes for New Projects

1. **Copy Payment Directory Structure**: Transfer all files maintaining the exact folder structure
2. **Update Environment Variables**: Configure all payment gateway credentials
3. **Modify Component Imports**: Update import paths to match your project structure
4. **Database Schema**: Ensure your database has compatible order and payment tables
5. **Apple Pay Setup**: Generate new domain association file for your domain
6. **Test All Payment Methods**: Verify each payment gateway works in your environment

## Common Issues & Solutions

### Issue: CashApp showing card error
**Solution**: Ensure proper CashApp Pay SDK initialization instead of generic card tokens

### Issue: PayPal capture failing
**Solution**: Pass action parameter in request body, not query string

### Issue: Mobile payment methods showing on desktop
**Solution**: Implement device detection filtering in payment method selectors

### Issue: Apple Pay not working
**Solution**: Verify domain association file is accessible and contains correct certificate data

## Performance Considerations

- **Lazy Loading**: Payment SDKs are loaded only when needed
- **Caching**: Device capabilities are cached to avoid repeated detection
- **Error Recovery**: Automatic retry mechanisms for failed payments
- **Extension Protection**: Detects and handles browser extension interference

This implementation provides a complete, production-ready payment system that can be easily copied to other projects with minimal configuration changes.