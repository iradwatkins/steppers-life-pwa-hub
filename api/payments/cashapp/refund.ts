import { VercelRequest, VercelResponse } from '@vercel/node';
import { SquareClient } from 'square';
import { randomUUID } from 'crypto';

// Initialize Square client (CashApp Pay is part of Square)
const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_ACCESS_TOKEN
});

const refundsApi = squareClient.refundsApi;

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
      paymentId, 
      amount, 
      reason = 'Customer requested refund for Cash App Pay transaction'
    } = req.body;

    // Validate required fields
    if (!paymentId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required field: paymentId' 
      });
    }

    // Create refund request for Cash App Pay
    const requestBody = {
      idempotencyKey: randomUUID(),
      paymentId: paymentId,
      reason: reason,
      ...(amount && {
        amountMoney: {
          amount: BigInt(amount), // Amount in cents
          currency: 'USD',
        }
      })
    };

    // Process refund with Square
    const { result, statusCode } = await refundsApi.refundPayment(requestBody);

    if (statusCode === 200 && result.refund) {
      const refund = result.refund;
      
      return res.status(200).json({
        success: true,
        refundId: refund.id,
        paymentId: refund.paymentId,
        status: refund.status,
        amount: refund.amountMoney?.amount?.toString(),
        currency: refund.amountMoney?.currency,
        reason: refund.reason,
        createdAt: refund.createdAt,
        updatedAt: refund.updatedAt,
        cashAppRefundDetails: {
          processingType: 'CASH_APP_PAY',
          refundMethod: 'INSTANT_REFUND',
        }
      });
    } else {
      // Handle Square API errors
      const errors = result.errors || [];
      const errorMessage = errors.length > 0 
        ? errors.map(e => e.detail).join(', ')
        : 'Cash App Pay refund processing failed';

      console.error('Cash App Pay refund failed:', errors);
      
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        errorMessage,
        errors
      });
    }

  } catch (error) {
    console.error('Cash App Pay refund processing error:', error);
    
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}