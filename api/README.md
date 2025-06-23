# Payment API - Vercel Functions

This directory contains serverless payment processing functions deployed on Vercel.

## Endpoints

### Square Payment Gateway
- `POST /api/payments/square/process` - Process credit card payments
- `POST /api/payments/square/refund` - Process refunds

### PayPal Payment Gateway  
- `POST /api/payments/paypal/process` - Create/capture PayPal orders
- `POST /api/payments/paypal/refund` - Process PayPal refunds

### CashApp Pay Gateway
- `POST /api/payments/cashapp/process` - Process CashApp Pay payments
- `POST /api/payments/cashapp/refund` - Process CashApp Pay refunds

## Environment Variables Required

### Square
```
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_APPLICATION_ID=your_app_id
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=sandbox|production
```

### PayPal
```
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=sandbox|production
```

### General
```
VITE_APP_URL=https://your-domain.com
```

## Security Features

- CORS headers configured for secure cross-origin requests
- Environment-based configuration (sandbox/production)
- Proper error handling and logging
- Input validation on all endpoints
- PCI DSS compliant payment processing

## Deployment

These functions are automatically deployed when you push to your connected Git repository. Vercel handles:

- Automatic scaling
- SSL/TLS encryption
- Global edge deployment
- Environment variable management
- Monitoring and logging