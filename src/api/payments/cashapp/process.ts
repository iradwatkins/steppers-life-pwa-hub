import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Environment } from 'square';
import { randomUUID } from 'crypto';

// Initialize Square client (CashApp Pay is part of Square)
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});

const paymentsApi = squareClient.paymentsApi;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      description = 'SteppersLife Event Tickets'
    } = req.body;

    // Validate required fields
    if (!token || !amount || !orderId) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: token, amount, orderId' 
      });
    }

    // Create payment request for Cash App Pay
    const requestBody = {
      sourceId: token,
      amountMoney: {
        amount: BigInt(amount), // Amount in cents
        currency: currency.toUpperCase(),
      },
      idempotencyKey: randomUUID(),
      orderId: orderId,
      buyerEmailAddress: customerEmail,
      note: description,
      // Cash App Pay specific configurations
      cashDetails: {
        buyerFullName: customerEmail ? customerEmail.split('@')[0] : undefined,
      },
      // Additional metadata for Cash App Pay
      applicationDetails: {
        squareProduct: 'ECOMMERCE_API',
        applicationId: process.env.SQUARE_APPLICATION_ID,
      },
    };

    // Process payment with Square (Cash App Pay)
    const { result, statusCode } = await paymentsApi.createPayment(requestBody);

    if (statusCode === 200 && result.payment) {
      const payment = result.payment;
      
      // Extract Cash App Pay specific details
      const cashAppDetails = payment.cashDetails;
      
      return res.status(200).json({
        success: true,
        paymentId: payment.id,
        cashAppPayId: cashAppDetails?.buyerFullName || payment.id,
        status: payment.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
        amount: payment.amountMoney?.amount?.toString(),
        currency: payment.amountMoney?.currency,
        cashAppDetails: {
          buyerFullName: cashAppDetails?.buyerFullName,
          buyerCountryCode: cashAppDetails?.buyerCountryCode,
          buyerPhone: cashAppDetails?.buyerPhone,
        },
        details: {
          orderId: payment.orderId,
          locationId: payment.locationId,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          receiptNumber: payment.receiptNumber,
          receiptUrl: payment.receiptUrl,
        }
      });
    } else {
      // Handle Square API errors
      const errors = result.errors || [];
      const errorMessage = errors.length > 0 
        ? errors.map(e => e.detail).join(', ')
        : 'Cash App Pay processing failed';

      console.error('Cash App Pay payment failed:', errors);
      
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        errorMessage,
        errors
      });
    }

  } catch (error) {
    console.error('Cash App Pay processing error:', error);
    
    return res.status(500).json({
      success: false,
      status: 'FAILED',
      errorMessage: error instanceof Error ? error.message : 'Internal server error'
    });
  }
} 