import { VercelRequest, VercelResponse } from '@vercel/node';
import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});

const paymentsApi = squareClient.paymentsApi;

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
      token, 
      amount, 
      currency = 'USD', 
      orderId, 
      customerEmail, 
      customerName 
    } = req.body;

    // Validate required fields
    if (!token || !amount || !orderId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: token, amount, orderId' 
      });
    }

    // Create payment request
    const requestBody = {
      sourceId: token,
      amountMoney: {
        amount: BigInt(amount), // Amount in cents
        currency: currency.toUpperCase(),
      },
      idempotencyKey: randomUUID(),
      orderId: orderId,
      buyerEmailAddress: customerEmail,
      note: `SteppersLife Event Ticket Purchase - Order ${orderId}`,
      ...(customerName && {
        shippingAddress: {
          firstName: customerName.split(' ')[0],
          lastName: customerName.split(' ').slice(1).join(' '),
        }
      })
    };

    // Process payment with Square
    const { result, statusCode } = await paymentsApi.createPayment(requestBody);

    if (statusCode === 200 && result.payment) {
      const payment = result.payment;
      
      return res.status(200).json({
        success: true,
        paymentId: payment.id,
        transactionId: payment.id,
        status: payment.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        receipt: {
          receiptNumber: payment.receiptNumber || payment.id,
          receiptUrl: payment.receiptUrl || `https://squareup.com/receipt/${payment.id}`,
        },
        details: {
          amount: payment.amountMoney?.amount?.toString(),
          currency: payment.amountMoney?.currency,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        }
      });
    } else {
      // Handle Square API errors
      const errors = result.errors || [];
      const errorMessage = errors.length > 0 
        ? errors.map(e => e.detail).join(', ')
        : 'Payment processing failed';

      console.error('Square payment failed:', errors);
      
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        errorMessage,
        errors
      });
    }

  } catch (error) {
    console.error('Square payment processing error:', error);
    
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}