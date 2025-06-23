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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      captureId, 
      amount, 
      currency = 'USD',
      note = 'Refund for SteppersLife event ticket',
      invoiceId 
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
    const refundData: any = {
      note_to_payer: note,
    };

    // Add amount for partial refund
    if (amount) {
      refundData.amount = {
        value: amount.toFixed(2),
        currency_code: currency.toUpperCase(),
      };
    }

    // Add invoice ID if provided
    if (invoiceId) {
      refundData.invoice_id = invoiceId;
    }

    // Process refund with PayPal
    const refundResult = await processPayPalRefund(captureId, refundData, accessToken);

    return res.status(200).json({
      success: true,
      refundId: refundResult.id,
      status: refundResult.status,
      refundAmount: refundResult.amount?.value,
      currency: refundResult.amount?.currency_code,
      captureId: refundResult.links?.find((link: any) => link.rel === 'up')?.href?.split('/').pop(),
      reason: refundResult.note_to_payer,
      createdAt: refundResult.create_time,
      updatedAt: refundResult.update_time,
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