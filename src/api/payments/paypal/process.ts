import { NextApiRequest, NextApiResponse } from 'next';

// PayPal API configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
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
}

// Create PayPal order
async function createPayPalOrder(orderData: any, accessToken: string) {
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`PayPal order creation failed: ${data.message || 'Unknown error'}`);
  }

  return data;
}

// Capture PayPal order
async function capturePayPalOrder(orderId: string, accessToken: string) {
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`PayPal capture failed: ${data.message || 'Unknown error'}`);
  }

  return data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      action = 'create', // 'create' or 'capture'
      orderId, 
      amount, 
      currency = 'USD', 
      customerEmail, 
      description = 'SteppersLife Event Tickets',
      items = []
    } = req.body;

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    if (action === 'create') {
      // Validate required fields for order creation
      if (!amount) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing required field: amount' 
        });
      }

      // Create PayPal order
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: orderId || `order_${Date.now()}`,
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency.toUpperCase(),
                value: amount.toFixed(2),
              },
            },
          },
          items: items.length > 0 ? items.map((item: any) => ({
            name: item.name || 'Event Ticket',
            quantity: item.quantity?.toString() || '1',
            unit_amount: {
              currency_code: currency.toUpperCase(),
              value: item.price?.toFixed(2) || amount.toFixed(2),
            },
          })) : [{
            name: 'Event Tickets',
            quantity: '1',
            unit_amount: {
              currency_code: currency.toUpperCase(),
              value: amount.toFixed(2),
            },
          }],
          description: description,
        }],
        ...(customerEmail && {
          payer: {
            email_address: customerEmail,
          }
        }),
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/confirmation`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/payment`,
          brand_name: 'SteppersLife',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
        },
      };

      const paypalOrder = await createPayPalOrder(orderData, accessToken);

      return res.status(200).json({
        success: true,
        orderId: paypalOrder.id,
        status: paypalOrder.status,
        links: paypalOrder.links,
        approvalUrl: paypalOrder.links?.find((link: any) => link.rel === 'approve')?.href,
      });

    } else if (action === 'capture') {
      // Validate required fields for order capture
      if (!orderId) {
        return res.status(400).json({ 
          success: false,
          error: 'Missing required field: orderId' 
        });
      }

      // Capture PayPal order
      const captureResult = await capturePayPalOrder(orderId, accessToken);
      const captureDetails = captureResult.purchase_units[0].payments.captures[0];

      return res.status(200).json({
        success: true,
        paymentId: captureDetails.id,
        orderId: captureResult.id,
        payerId: captureResult.payer?.payer_id,
        status: captureDetails.status,
        amount: captureDetails.amount?.value,
        currency: captureDetails.amount?.currency_code,
        details: captureResult,
      });

    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Must be "create" or "capture"'
      });
    }

  } catch (error) {
    console.error('PayPal processing error:', error);
    
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 