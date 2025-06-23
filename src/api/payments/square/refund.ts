import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});

const refundsApi = squareClient.refundsApi;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, amount, reason = 'Customer requested refund' } = req.body;

    // Validate required fields
    if (!paymentId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required field: paymentId' 
      });
    }

    // Create refund request
    const requestBody = {
      idempotencyKey: randomUUID(),
      paymentId: paymentId,
      reason: reason,
      ...(amount && {
        amountMoney: {
          amount: BigInt(amount), // Amount in cents for partial refund
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
        refundAmount: refund.amountMoney?.amount?.toString(),
        currency: refund.amountMoney?.currency,
        reason: refund.reason,
        createdAt: refund.createdAt,
        updatedAt: refund.updatedAt,
      });
    } else {
      // Handle Square API errors
      const errors = result.errors || [];
      const errorMessage = errors.length > 0 
        ? errors.map(e => e.detail).join(', ')
        : 'Refund processing failed';

      console.error('Square refund failed:', errors);
      
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        errorMessage,
        errors
      });
    }

  } catch (error) {
    console.error('Square refund processing error:', error);
    
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 