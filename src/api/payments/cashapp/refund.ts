import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

// Initialize Square client (CashApp Pay refunds are handled through Square)
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

    // Create refund request for Cash App Pay transaction
    const requestBody = {
      idempotencyKey: randomUUID(),
      paymentId: paymentId,
      reason: reason,
      ...(amount && {
        amountMoney: {
          amount: BigInt(amount), // Amount in cents for partial refund
          currency: 'USD',
        }
      }),
      // Cash App Pay specific refund configurations
      cashDetails: {
        changeBackMoney: amount ? {
          amount: BigInt(amount),
          currency: 'USD',
        } : undefined,
      },
    };

    // Process refund with Square (Cash App Pay)
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
        cashAppDetails: {
          changeBackMoney: refund.cashDetails?.changeBackMoney,
        },
        processingDetails: {
          processingFee: refund.processingFee,
          effectiveAt: refund.processingFee?.[0]?.effectiveAt,
        },
        createdAt: refund.createdAt,
        updatedAt: refund.updatedAt,
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