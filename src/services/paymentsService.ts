import { supabase } from '@/lib/supabase';
import type { 
  VODPurchase, 
  InstructorPayout, 
  PayoutSchedule, 
  VODAccessControl, 
  PaymentIntent, 
  RefundRequest,
  RevenueReport,
  CreateVODPurchaseData,
  ProcessPaymentData,
  PayoutEarnings
} from '@/types/payments';

export class PaymentsService {
  // VOD Purchase Management
  async createVODPurchase(data: CreateVODPurchaseData): Promise<{
    success: boolean;
    data?: { payment_intent: PaymentIntent; purchase_id: string };
    error?: string;
  }> {
    try {
      // Get VOD class details for pricing
      const { data: vodClass, error: classError } = await supabase
        .from('vod_classes')
        .select('id, title, price, instructor_id, instructor_name')
        .eq('id', data.vod_class_id)
        .single();

      if (classError || !vodClass) {
        return { success: false, error: 'VOD class not found' };
      }

      // Calculate pricing breakdown
      const purchasePrice = vodClass.price;
      const platformFeeRate = 30; // 30% platform fee
      const instructorCommissionRate = 70; // 70% to instructor
      
      const platformFee = purchasePrice * (platformFeeRate / 100);
      const instructorCommission = purchasePrice * (instructorCommissionRate / 100);
      const processingFee = purchasePrice * 0.029 + 0.30; // Stripe fees

      // Create payment intent with Stripe
      const paymentIntent = await this.createPaymentIntent({
        amount: Math.round(purchasePrice * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          vod_class_id: data.vod_class_id,
          instructor_id: vodClass.instructor_id,
          purchase_type: data.purchase_type
        }
      });

      if (!paymentIntent.success) {
        return { success: false, error: paymentIntent.error };
      }

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('vod_purchases')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          vod_class_id: data.vod_class_id,
          vod_class_title: vodClass.title,
          instructor_id: vodClass.instructor_id,
          instructor_name: vodClass.instructor_name,
          purchase_price: purchasePrice,
          instructor_commission: instructorCommission,
          instructor_commission_rate: instructorCommissionRate,
          platform_fee: platformFee,
          platform_fee_rate: platformFeeRate,
          processing_fee: processingFee,
          payment_intent_id: paymentIntent.data!.id,
          payment_status: 'pending',
          purchase_type: data.purchase_type
        })
        .select()
        .single();

      if (purchaseError) {
        return { success: false, error: 'Failed to create purchase record' };
      }

      return {
        success: true,
        data: {
          payment_intent: paymentIntent.data!,
          purchase_id: purchase.id
        }
      };
    } catch (error) {
      console.error('Error creating VOD purchase:', error);
      return { success: false, error: 'Failed to create purchase' };
    }
  }

  async processPayment(data: ProcessPaymentData): Promise<{
    success: boolean;
    data?: VODPurchase;
    error?: string;
  }> {
    try {
      // Confirm payment with Stripe
      const paymentResult = await this.confirmPaymentIntent(data.payment_intent_id, data.payment_method_id);
      
      if (!paymentResult.success) {
        return { success: false, error: paymentResult.error };
      }

      // Update purchase status
      const { data: purchase, error: updateError } = await supabase
        .from('vod_purchases')
        .update({
          payment_status: 'completed',
          access_granted_at: new Date().toISOString()
        })
        .eq('payment_intent_id', data.payment_intent_id)
        .select()
        .single();

      if (updateError) {
        return { success: false, error: 'Failed to update purchase status' };
      }

      // Grant access to VOD
      await this.grantVODAccess(purchase);

      // Schedule instructor payout
      await this.schedulePayout(purchase.instructor_id, purchase.instructor_commission);

      return { success: true, data: purchase };
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: 'Payment processing failed' };
    }
  }

  async grantVODAccess(purchase: VODPurchase): Promise<void> {
    const accessExpiry = purchase.purchase_type === 'rental' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days for rental
      : undefined; // Lifetime access

    await supabase
      .from('vod_access_control')
      .insert({
        user_id: purchase.user_id,
        vod_class_id: purchase.vod_class_id,
        purchase_id: purchase.id,
        access_type: purchase.purchase_type,
        access_granted_at: new Date().toISOString(),
        access_expires_at: accessExpiry,
        download_enabled: purchase.purchase_type === 'lifetime',
        max_downloads: purchase.purchase_type === 'lifetime' ? 3 : 0,
        sharing_enabled: false,
        quality_access: [
          { resolution: '720p', bitrate: 2500, file_size_mb: 1500, available: true },
          { resolution: '1080p', bitrate: 5000, file_size_mb: 3000, available: purchase.purchase_type === 'lifetime' }
        ]
      });
  }

  // Access Control
  async checkVODAccess(userId: string, vodClassId: string): Promise<{
    hasAccess: boolean;
    accessControl?: VODAccessControl;
    accessExpiry?: string;
  }> {
    const { data: access, error } = await supabase
      .from('vod_access_control')
      .select('*')
      .eq('user_id', userId)
      .eq('vod_class_id', vodClassId)
      .eq('access_type', 'lifetime')
      .or('access_expires_at.is.null,access_expires_at.gt.' + new Date().toISOString())
      .single();

    if (error || !access) {
      return { hasAccess: false };
    }

    return {
      hasAccess: true,
      accessControl: access,
      accessExpiry: access.access_expires_at
    };
  }

  async recordWatchSession(userId: string, vodClassId: string, watchData: {
    session_start: string;
    session_end?: string;
    watch_duration_seconds: number;
    video_position_seconds: number;
    device_type: string;
  }): Promise<void> {
    await supabase
      .from('watch_sessions')
      .insert({
        user_id: userId,
        vod_class_id: vodClassId,
        ...watchData,
        completed_percentage: Math.min(100, (watchData.video_position_seconds / watchData.watch_duration_seconds) * 100),
        ip_address: 'tracking_disabled', // Privacy-focused
        user_agent: navigator.userAgent.substring(0, 100)
      });

    // Update total watch time in access control
    await supabase.rpc('update_watch_time', {
      user_id: userId,
      vod_class_id: vodClassId,
      additional_seconds: watchData.watch_duration_seconds
    });
  }

  // Instructor Payout System
  async schedulePayout(instructorId: string, commissionAmount: number): Promise<void> {
    // Add commission to instructor's pending earnings
    const { data: existingEarnings } = await supabase
      .from('instructor_earnings')
      .select('*')
      .eq('instructor_id', instructorId)
      .single();

    if (existingEarnings) {
      await supabase
        .from('instructor_earnings')
        .update({
          pending_amount: existingEarnings.pending_amount + commissionAmount,
          total_lifetime_earnings: existingEarnings.total_lifetime_earnings + commissionAmount
        })
        .eq('instructor_id', instructorId);
    } else {
      await supabase
        .from('instructor_earnings')
        .insert({
          instructor_id: instructorId,
          pending_amount: commissionAmount,
          available_amount: 0,
          total_lifetime_earnings: commissionAmount
        });
    }
  }

  async processAutomaticPayouts(): Promise<{
    processed: number;
    failed: number;
    total_amount: number;
  }> {
    try {
      // Get all instructors eligible for payout
      const { data: payoutSchedules } = await supabase
        .from('payout_schedules')
        .select(`
          *,
          instructor_earnings(*)
        `)
        .eq('auto_payout_enabled', true);

      let processed = 0;
      let failed = 0;
      let totalAmount = 0;

      for (const schedule of payoutSchedules || []) {
        const earnings = schedule.instructor_earnings;
        
        if (earnings?.available_amount >= schedule.minimum_payout_amount) {
          const payoutResult = await this.createInstructorPayout({
            instructor_id: schedule.instructor_id,
            amount: earnings.available_amount,
            payout_method: schedule.payout_method,
            payout_account_id: schedule.payout_account_details.account_id
          });

          if (payoutResult.success) {
            processed++;
            totalAmount += earnings.available_amount;
          } else {
            failed++;
          }
        }
      }

      return { processed, failed, total_amount: totalAmount };
    } catch (error) {
      console.error('Error processing automatic payouts:', error);
      return { processed: 0, failed: 0, total_amount: 0 };
    }
  }

  async createInstructorPayout(data: {
    instructor_id: string;
    amount: number;
    payout_method: string;
    payout_account_id: string;
  }): Promise<{ success: boolean; payout_id?: string; error?: string }> {
    try {
      // Create payout record
      const { data: payout, error: payoutError } = await supabase
        .from('instructor_payouts')
        .insert({
          instructor_id: data.instructor_id,
          net_payout_amount: data.amount,
          payout_method: data.payout_method,
          payout_account_id: data.payout_account_id,
          payout_status: 'processing',
          period_start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          period_end_date: new Date().toISOString()
        })
        .select()
        .single();

      if (payoutError) {
        return { success: false, error: 'Failed to create payout record' };
      }

      // Process payout through payment provider
      const payoutResult = await this.processPayoutToInstructor(data.payout_account_id, data.amount);

      if (payoutResult.success) {
        // Update payout status
        await supabase
          .from('instructor_payouts')
          .update({
            payout_status: 'completed',
            processed_at: new Date().toISOString(),
            payout_reference: payoutResult.reference
          })
          .eq('id', payout.id);

        // Update instructor earnings
        await supabase
          .from('instructor_earnings')
          .update({
            available_amount: 0,
            last_payout_amount: data.amount,
            last_payout_date: new Date().toISOString()
          })
          .eq('instructor_id', data.instructor_id);

        return { success: true, payout_id: payout.id };
      } else {
        // Update payout status to failed
        await supabase
          .from('instructor_payouts')
          .update({
            payout_status: 'failed',
            failure_reason: payoutResult.error
          })
          .eq('id', payout.id);

        return { success: false, error: payoutResult.error };
      }
    } catch (error) {
      console.error('Error creating instructor payout:', error);
      return { success: false, error: 'Payout creation failed' };
    }
  }

  // Revenue Reporting
  async getInstructorRevenueReport(instructorId: string, period: string): Promise<{
    success: boolean;
    data?: RevenueReport;
    error?: string;
  }> {
    try {
      const [year, month] = period.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);

      // Get purchases for the period
      const { data: purchases, error: purchasesError } = await supabase
        .from('vod_purchases')
        .select('*')
        .eq('instructor_id', instructorId)
        .eq('payment_status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (purchasesError) {
        return { success: false, error: 'Failed to fetch revenue data' };
      }

      // Calculate totals
      const totalRevenue = purchases.reduce((sum, p) => sum + p.purchase_price, 0);
      const totalCommission = purchases.reduce((sum, p) => sum + p.instructor_commission, 0);
      const platformFees = purchases.reduce((sum, p) => sum + p.platform_fee, 0);
      const processingFees = purchases.reduce((sum, p) => sum + p.processing_fee, 0);

      // Get refunds
      const { data: refunds } = await supabase
        .from('refund_requests')
        .select('refund_amount')
        .eq('instructor_id', instructorId)
        .eq('status', 'processed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const refundsAmount = refunds?.reduce((sum, r) => sum + r.refund_amount, 0) || 0;

      // Top selling classes
      const classStats = purchases.reduce((acc, purchase) => {
        const key = purchase.vod_class_id;
        if (!acc[key]) {
          acc[key] = {
            vod_class_id: purchase.vod_class_id,
            title: purchase.vod_class_title,
            purchases: 0,
            revenue: 0
          };
        }
        acc[key].purchases++;
        acc[key].revenue += purchase.purchase_price;
        return acc;
      }, {} as Record<string, any>);

      const topSellingClasses = Object.values(classStats)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      // Get payout summary
      const { data: payouts } = await supabase
        .from('instructor_payouts')
        .select('net_payout_amount, payout_status')
        .eq('instructor_id', instructorId)
        .gte('period_start_date', startDate.toISOString())
        .lte('period_end_date', endDate.toISOString());

      const completedPayouts = payouts?.filter(p => p.payout_status === 'completed') || [];
      const pendingPayouts = payouts?.filter(p => p.payout_status === 'pending') || [];

      const report: RevenueReport = {
        instructor_id: instructorId,
        report_period: period,
        total_purchases: purchases.length,
        total_revenue: totalRevenue,
        total_commission: totalCommission,
        platform_fees: platformFees,
        processing_fees: processingFees,
        refunds_amount: refundsAmount,
        net_earnings: totalCommission - refundsAmount,
        top_selling_classes: topSellingClasses,
        daily_breakdown: [], // Would implement daily aggregation
        payout_summary: {
          payouts_received: completedPayouts.length,
          total_payout_amount: completedPayouts.reduce((sum, p) => sum + p.net_payout_amount, 0),
          pending_payout_amount: pendingPayouts.reduce((sum, p) => sum + p.net_payout_amount, 0)
        }
      };

      return { success: true, data: report };
    } catch (error) {
      console.error('Error generating revenue report:', error);
      return { success: false, error: 'Failed to generate report' };
    }
  }

  // Payment Provider Integration (Stripe)
  private async createPaymentIntent(data: {
    amount: number;
    currency: string;
    metadata: Record<string, string>;
  }): Promise<{ success: boolean; data?: PaymentIntent; error?: string }> {
    try {
      // In production, this would call Stripe API
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        vod_class_id: data.metadata.vod_class_id,
        amount: data.amount / 100, // Convert back to dollars
        currency: data.currency as 'usd',
        payment_method_types: ['card'],
        status: 'requires_payment_method',
        client_secret: `pi_${Date.now()}_secret`,
        metadata: data.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { success: true, data: paymentIntent };
    } catch (error) {
      return { success: false, error: 'Failed to create payment intent' };
    }
  }

  private async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // In production, this would confirm payment with Stripe
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Payment confirmation failed' };
    }
  }

  private async processPayoutToInstructor(accountId: string, amount: number): Promise<{
    success: boolean;
    reference?: string;
    error?: string;
  }> {
    try {
      // In production, this would create a payout via Stripe Connect or similar
      const reference = `payout_${Date.now()}`;
      return { success: true, reference };
    } catch (error) {
      return { success: false, error: 'Payout processing failed' };
    }
  }

  // User Purchase History
  async getUserVODPurchases(userId: string): Promise<VODPurchase[]> {
    const { data: purchases, error } = await supabase
      .from('vod_purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return purchases || [];
  }

  // Instructor Earnings
  async getInstructorEarnings(instructorId: string): Promise<PayoutEarnings | null> {
    const { data: earnings, error } = await supabase
      .from('instructor_earnings')
      .select('*')
      .eq('instructor_id', instructorId)
      .single();

    if (error || !earnings) return null;

    // Calculate next payout date based on schedule
    const { data: schedule } = await supabase
      .from('payout_schedules')
      .select('*')
      .eq('instructor_id', instructorId)
      .single();

    const nextPayoutDate = this.calculateNextPayoutDate(schedule);

    return {
      instructor_id: instructorId,
      total_pending_amount: earnings.pending_amount,
      total_available_amount: earnings.available_amount,
      next_payout_date: nextPayoutDate,
      last_payout_amount: earnings.last_payout_amount,
      last_payout_date: earnings.last_payout_date,
      current_period_earnings: earnings.pending_amount,
      current_period_purchases: 0, // Would calculate from recent purchases
      lifetime_earnings: earnings.total_lifetime_earnings,
      lifetime_purchases: 0 // Would calculate from all purchases
    };
  }

  private calculateNextPayoutDate(schedule: PayoutSchedule | null): string {
    if (!schedule) {
      // Default to weekly payout on Fridays
      const nextFriday = new Date();
      nextFriday.setDate(nextFriday.getDate() + (5 - nextFriday.getDay() + 7) % 7);
      return nextFriday.toISOString();
    }

    const now = new Date();
    let nextPayout = new Date();

    switch (schedule.payout_frequency) {
      case 'weekly':
        nextPayout.setDate(now.getDate() + (schedule.payout_day - now.getDay() + 7) % 7);
        break;
      case 'biweekly':
        nextPayout.setDate(now.getDate() + 14);
        break;
      case 'monthly':
        nextPayout.setMonth(now.getMonth() + 1, schedule.payout_day);
        break;
    }

    return nextPayout.toISOString();
  }
}

export const paymentsService = new PaymentsService();