import { VercelRequest, VercelResponse } from '@vercel/node';

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

// Process PayPal refund
async function processPayPalRefund(captureId: string, refundData: any, accessToken: string) {
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/payments/captures/${captureId}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(refundData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`PayPal refund failed: ${data.message || 'Unknown error'}`);
  }

  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.VITE_APP_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      captureId, 
      amount, 
      currency = 'USD',
      note = 'Refund requested by customer'
    } = req.body;

    // Validate required fields
    if (!captureId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required field: captureId' 
      });
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();

    // Prepare refund data
    const refundData = {
      note_to_payer: note,
      ...(amount && {
        amount: {
          value: amount.toFixed(2),
          currency_code: currency.toUpperCase(),
        }
      })
    };

    // Process refund
    const refundResult = await processPayPalRefund(captureId, refundData, accessToken);

    return res.status(200).json({
      success: true,
      refundId: refundResult.id,
      status: refundResult.status,
      amount: refundResult.amount?.value,
      currency: refundResult.amount?.currency_code,
      noteToPlayer: refundResult.note_to_payer,
      createTime: refundResult.create_time,
      updateTime: refundResult.update_time,
      details: refundResult,
    });

  } catch (error) {
    console.error('PayPal refund processing error:', error);
    
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}