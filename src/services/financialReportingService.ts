import { supabase } from '@/integrations/supabase/client';

export interface RevenueBreakdown {
  totalRevenue: number;
  netRevenue: number;
  platformFees: number;
  paymentProcessingFees: number;
  taxes: number;
  refunds: number;
  chargebacks: number;
  discounts: number;
  commissions: number;
}

export interface PaymentMethodAnalytics {
  method: string;
  transactionCount: number;
  totalAmount: number;
  averageAmount: number;
  percentage: number;
  processingFees: number;
  failureRate: number;
}

export interface TicketPricingAnalysis {
  ticketType: string;
  currentPrice: number;
  averagePrice: number;
  revenuePerType: number;
  soldCount: number;
  conversionRate: number;
  priceElasticity: number;
  recommendedPrice: number;
  potentialIncrease: number;
}

export interface ProfitLossStatement {
  period: string;
  revenue: {
    ticketSales: number;
    merchandiseSales: number;
    sponsorships: number;
    other: number;
    total: number;
  };
  costs: {
    venueCosts: number;
    marketingCosts: number;
    staffCosts: number;
    platformFees: number;
    paymentFees: number;
    insurance: number;
    equipment: number;
    other: number;
    total: number;
  };
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  transactions: number;
  averageOrderValue: number;
  refunds: number;
  netRevenue: number;
  growthRate: number;
}

export interface TaxReport {
  period: string;
  totalSales: number;
  taxableAmount: number;
  salesTax: number;
  serviceTax: number;
  totalTaxCollected: number;
  taxRate: number;
  exemptSales: number;
  transactionsByJurisdiction: {
    jurisdiction: string;
    sales: number;
    taxRate: number;
    taxCollected: number;
  }[];
}

export interface FinancialForecast {
  period: string;
  projectedRevenue: number;
  projectedCosts: number;
  projectedProfit: number;
  confidenceLevel: number;
  assumptions: string[];
  riskFactors: string[];
}

export interface CurrencyAnalytics {
  baseCurrency: string;
  foreignTransactions: {
    currency: string;
    amount: number;
    convertedAmount: number;
    exchangeRate: number;
    transactionCount: number;
  }[];
  conversionFees: number;
  totalForeignRevenue: number;
}

export interface FinancialAlerts {
  type: 'revenue_drop' | 'high_refunds' | 'unusual_activity' | 'milestone_reached';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
  acknowledged: boolean;
}

export class FinancialReportingService {
  static async getRevenueBreakdown(eventId: string): Promise<RevenueBreakdown> {
    try {
      // Get all ticket purchases for the event
      const { data: purchases, error } = await supabase
        .from('ticket_purchases')
        .select(`
          *,
          ticket_types(*)
        `)
        .eq('event_id', eventId);

      if (error) throw error;

      // Get refunds
      const { data: refunds } = await supabase
        .from('refunds')
        .select('*')
        .eq('event_id', eventId);

      let totalRevenue = 0;
      let totalRefunds = 0;

      purchases?.forEach(purchase => {
        totalRevenue += purchase.total_amount || 0;
      });

      refunds?.forEach(refund => {
        totalRefunds += refund.amount || 0;
      });

      // Calculate fees (mock calculations)
      const platformFees = totalRevenue * 0.05; // 5% platform fee
      const paymentProcessingFees = totalRevenue * 0.029; // 2.9% payment processing
      const taxes = totalRevenue * 0.0875; // 8.75% sales tax
      const discounts = purchases?.reduce((sum, p) => sum + (p.discount_amount || 0), 0) || 0;

      const netRevenue = totalRevenue - platformFees - paymentProcessingFees - taxes - totalRefunds - discounts;

      return {
        totalRevenue,
        netRevenue,
        platformFees,
        paymentProcessingFees,
        taxes,
        refunds: totalRefunds,
        chargebacks: 0, // Would come from payment processor
        discounts,
        commissions: 0 // Would come from partner agreements
      };
    } catch (error) {
      console.error('Error fetching revenue breakdown:', error);
      throw error;
    }
  }

  static async getPaymentMethodAnalytics(eventId: string): Promise<PaymentMethodAnalytics[]> {
    try {
      const { data: purchases, error } = await supabase
        .from('ticket_purchases')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;

      const methodMap = new Map<string, {
        count: number;
        amount: number;
        fees: number;
      }>();

      purchases?.forEach(purchase => {
        const method = purchase.payment_method || 'online';
        if (!methodMap.has(method)) {
          methodMap.set(method, { count: 0, amount: 0, fees: 0 });
        }
        const data = methodMap.get(method)!;
        data.count += 1;
        data.amount += purchase.total_amount || 0;
        data.fees += (purchase.total_amount || 0) * 0.029; // Mock processing fee
      });

      const totalAmount = purchases?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

      return Array.from(methodMap.entries()).map(([method, data]) => ({
        method,
        transactionCount: data.count,
        totalAmount: data.amount,
        averageAmount: data.count > 0 ? data.amount / data.count : 0,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        processingFees: data.fees,
        failureRate: Math.random() * 5 // Mock failure rate 0-5%
      }));
    } catch (error) {
      console.error('Error fetching payment method analytics:', error);
      throw error;
    }
  }

  static async getTicketPricingAnalysis(eventId: string): Promise<TicketPricingAnalysis[]> {
    try {
      const { data: purchases, error } = await supabase
        .from('ticket_purchases')
        .select(`
          *,
          ticket_types(*)
        `)
        .eq('event_id', eventId);

      if (error) throw error;

      const typeMap = new Map<string, {
        purchases: any[];
        totalRevenue: number;
        soldCount: number;
      }>();

      purchases?.forEach(purchase => {
        const typeName = purchase.ticket_types?.name || 'General';
        if (!typeMap.has(typeName)) {
          typeMap.set(typeName, { purchases: [], totalRevenue: 0, soldCount: 0 });
        }
        const data = typeMap.get(typeName)!;
        data.purchases.push(purchase);
        data.totalRevenue += purchase.total_amount || 0;
        data.soldCount += purchase.quantity || 1;
      });

      return Array.from(typeMap.entries()).map(([typeName, data]) => {
        const averagePrice = data.soldCount > 0 ? data.totalRevenue / data.soldCount : 0;
        const currentPrice = data.purchases[0]?.ticket_types?.price || 0;
        
        // Mock analysis values
        const conversionRate = 65 + Math.random() * 30; // 65-95%
        const priceElasticity = -0.5 - Math.random() * 1; // -0.5 to -1.5
        const recommendedPrice = currentPrice * (1 + (Math.random() * 0.2 - 0.1)); // ±10%
        const potentialIncrease = ((recommendedPrice - currentPrice) / currentPrice) * 100;

        return {
          ticketType: typeName,
          currentPrice,
          averagePrice,
          revenuePerType: data.totalRevenue,
          soldCount: data.soldCount,
          conversionRate,
          priceElasticity,
          recommendedPrice,
          potentialIncrease
        };
      });
    } catch (error) {
      console.error('Error fetching ticket pricing analysis:', error);
      throw error;
    }
  }

  static async getProfitLossStatement(eventId: string): Promise<ProfitLossStatement> {
    try {
      const revenueBreakdown = await this.getRevenueBreakdown(eventId);
      
      // Mock cost data - in production, this would come from expense tracking
      const revenue = {
        ticketSales: revenueBreakdown.totalRevenue,
        merchandiseSales: 0,
        sponsorships: 0,
        other: 0,
        total: revenueBreakdown.totalRevenue
      };

      const costs = {
        venueCosts: revenue.total * 0.15, // 15% venue cost
        marketingCosts: revenue.total * 0.08, // 8% marketing
        staffCosts: revenue.total * 0.12, // 12% staff
        platformFees: revenueBreakdown.platformFees,
        paymentFees: revenueBreakdown.paymentProcessingFees,
        insurance: revenue.total * 0.02, // 2% insurance
        equipment: revenue.total * 0.05, // 5% equipment
        other: revenue.total * 0.03, // 3% other
        total: 0
      };

      costs.total = Object.values(costs).reduce((sum, cost) => sum + cost, 0) - costs.total; // Exclude the total itself

      const grossProfit = revenue.total - costs.total;
      const netProfit = grossProfit - revenueBreakdown.taxes;
      const profitMargin = revenue.total > 0 ? (netProfit / revenue.total) * 100 : 0;

      return {
        period: new Date().toISOString().split('T')[0],
        revenue,
        costs,
        grossProfit,
        netProfit,
        profitMargin
      };
    } catch (error) {
      console.error('Error generating P&L statement:', error);
      throw error;
    }
  }

  static async getRevenueTrends(eventId: string, days: number = 30): Promise<RevenueTrend[]> {
    try {
      const { data: purchases, error } = await supabase
        .from('ticket_purchases')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: refunds } = await supabase
        .from('refunds')
        .select('*')
        .eq('event_id', eventId);

      const trendMap = new Map<string, {
        revenue: number;
        transactions: number;
        refunds: number;
      }>();

      purchases?.forEach(purchase => {
        const date = new Date(purchase.created_at).toISOString().split('T')[0];
        if (!trendMap.has(date)) {
          trendMap.set(date, { revenue: 0, transactions: 0, refunds: 0 });
        }
        const trend = trendMap.get(date)!;
        trend.revenue += purchase.total_amount || 0;
        trend.transactions += 1;
      });

      refunds?.forEach(refund => {
        const date = new Date(refund.created_at).toISOString().split('T')[0];
        if (trendMap.has(date)) {
          trendMap.get(date)!.refunds += refund.amount || 0;
        }
      });

      const trends = Array.from(trendMap.entries())
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          transactions: data.transactions,
          averageOrderValue: data.transactions > 0 ? data.revenue / data.transactions : 0,
          refunds: data.refunds,
          netRevenue: data.revenue - data.refunds,
          growthRate: 0 // Will be calculated below
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate growth rates
      for (let i = 1; i < trends.length; i++) {
        const previous = trends[i - 1];
        const current = trends[i];
        if (previous.revenue > 0) {
          current.growthRate = ((current.revenue - previous.revenue) / previous.revenue) * 100;
        }
      }

      return trends;
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
      throw error;
    }
  }

  static async getTaxReport(eventId: string): Promise<TaxReport> {
    try {
      const revenueBreakdown = await this.getRevenueBreakdown(eventId);
      
      // Mock tax data - in production, this would integrate with tax systems
      const taxRate = 8.75; // Chicago sales tax rate
      const taxableAmount = revenueBreakdown.totalRevenue;
      const exemptSales = 0; // Non-profit or educational exemptions
      
      return {
        period: new Date().toISOString().split('T')[0],
        totalSales: revenueBreakdown.totalRevenue,
        taxableAmount,
        salesTax: revenueBreakdown.taxes,
        serviceTax: 0,
        totalTaxCollected: revenueBreakdown.taxes,
        taxRate,
        exemptSales,
        transactionsByJurisdiction: [
          {
            jurisdiction: 'Chicago, IL',
            sales: revenueBreakdown.totalRevenue * 0.8,
            taxRate: 8.75,
            taxCollected: revenueBreakdown.totalRevenue * 0.8 * 0.0875
          },
          {
            jurisdiction: 'Cook County, IL',
            sales: revenueBreakdown.totalRevenue * 0.15,
            taxRate: 7.25,
            taxCollected: revenueBreakdown.totalRevenue * 0.15 * 0.0725
          },
          {
            jurisdiction: 'Other',
            sales: revenueBreakdown.totalRevenue * 0.05,
            taxRate: 6.0,
            taxCollected: revenueBreakdown.totalRevenue * 0.05 * 0.06
          }
        ]
      };
    } catch (error) {
      console.error('Error generating tax report:', error);
      throw error;
    }
  }

  static async getFinancialForecast(eventId: string, months: number = 3): Promise<FinancialForecast[]> {
    try {
      const currentPL = await this.getProfitLossStatement(eventId);
      const trends = await this.getRevenueTrends(eventId);
      
      // Calculate average growth rate
      const recentTrends = trends.slice(-7); // Last 7 days
      const avgGrowthRate = recentTrends.reduce((sum, t) => sum + t.growthRate, 0) / recentTrends.length || 0;
      
      const forecasts: FinancialForecast[] = [];
      
      for (let i = 1; i <= months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        
        const growthFactor = Math.pow(1 + avgGrowthRate / 100, i);
        const projectedRevenue = currentPL.revenue.total * growthFactor;
        const projectedCosts = currentPL.costs.total * growthFactor;
        const projectedProfit = projectedRevenue - projectedCosts;
        
        forecasts.push({
          period: date.toISOString().split('T')[0],
          projectedRevenue,
          projectedCosts,
          projectedProfit,
          confidenceLevel: Math.max(50, 95 - (i * 15)), // Decreasing confidence over time
          assumptions: [
            `${avgGrowthRate.toFixed(1)}% monthly growth rate`,
            'Stable cost structure',
            'No major market changes',
            'Consistent pricing strategy'
          ],
          riskFactors: [
            'Economic downturn',
            'Competitive events',
            'Seasonal variations',
            'Venue availability'
          ]
        });
      }
      
      return forecasts;
    } catch (error) {
      console.error('Error generating financial forecast:', error);
      throw error;
    }
  }

  static async getFinancialAlerts(eventId: string): Promise<FinancialAlerts[]> {
    try {
      const revenueBreakdown = await this.getRevenueBreakdown(eventId);
      const trends = await this.getRevenueTrends(eventId, 7);
      
      const alerts: FinancialAlerts[] = [];
      
      // Revenue drop alert
      const recentRevenue = trends.slice(-3).reduce((sum, t) => sum + t.revenue, 0);
      const previousRevenue = trends.slice(-6, -3).reduce((sum, t) => sum + t.revenue, 0);
      
      if (previousRevenue > 0 && (recentRevenue / previousRevenue) < 0.8) {
        alerts.push({
          type: 'revenue_drop',
          severity: 'high',
          message: 'Revenue has dropped by more than 20% in the last 3 days',
          value: (recentRevenue / previousRevenue) * 100,
          threshold: 80,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }
      
      // High refunds alert
      const refundRate = revenueBreakdown.totalRevenue > 0 ? 
        (revenueBreakdown.refunds / revenueBreakdown.totalRevenue) * 100 : 0;
      
      if (refundRate > 5) {
        alerts.push({
          type: 'high_refunds',
          severity: refundRate > 10 ? 'critical' : 'medium',
          message: `Refund rate is ${refundRate.toFixed(1)}%, above normal threshold`,
          value: refundRate,
          threshold: 5,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }
      
      // Revenue milestone alert
      if (revenueBreakdown.totalRevenue > 10000) {
        alerts.push({
          type: 'milestone_reached',
          severity: 'low',
          message: 'Event revenue has exceeded $10,000',
          value: revenueBreakdown.totalRevenue,
          threshold: 10000,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }
      
      return alerts;
    } catch (error) {
      console.error('Error fetching financial alerts:', error);
      throw error;
    }
  }

  static async exportFinancialData(
    eventId: string, 
    format: 'csv' | 'excel' | 'pdf',
    reportType: 'revenue' | 'pl_statement' | 'tax_report' | 'full_report'
  ): Promise<string> {
    try {
      let data: any;
      
      switch (reportType) {
        case 'revenue':
          data = await this.getRevenueBreakdown(eventId);
          break;
        case 'pl_statement':
          data = await this.getProfitLossStatement(eventId);
          break;
        case 'tax_report':
          data = await this.getTaxReport(eventId);
          break;
        case 'full_report':
          data = {
            revenue: await this.getRevenueBreakdown(eventId),
            profitLoss: await this.getProfitLossStatement(eventId),
            taxReport: await this.getTaxReport(eventId),
            trends: await this.getRevenueTrends(eventId),
            paymentMethods: await this.getPaymentMethodAnalytics(eventId)
          };
          break;
        default:
          throw new Error('Unsupported report type');
      }
      
      switch (format) {
        case 'csv':
          return this.convertToCSV(data, reportType);
        case 'excel':
          return 'Excel export not implemented yet';
        case 'pdf':
          return 'PDF export not implemented yet';
        default:
          throw new Error('Unsupported format');
      }
    } catch (error) {
      console.error('Error exporting financial data:', error);
      throw error;
    }
  }

  private static convertToCSV(data: any, reportType: string): string {
    const rows: string[][] = [];
    
    switch (reportType) {
      case 'revenue':
        rows.push(['Financial Report - Revenue Breakdown']);
        rows.push(['']);
        rows.push(['Metric', 'Amount']);
        rows.push(['Total Revenue', `$${data.totalRevenue.toFixed(2)}`]);
        rows.push(['Net Revenue', `$${data.netRevenue.toFixed(2)}`]);
        rows.push(['Platform Fees', `$${data.platformFees.toFixed(2)}`]);
        rows.push(['Payment Processing Fees', `$${data.paymentProcessingFees.toFixed(2)}`]);
        rows.push(['Taxes', `$${data.taxes.toFixed(2)}`]);
        rows.push(['Refunds', `$${data.refunds.toFixed(2)}`]);
        rows.push(['Discounts', `$${data.discounts.toFixed(2)}`]);
        break;
        
      case 'pl_statement':
        rows.push(['Profit & Loss Statement']);
        rows.push(['']);
        rows.push(['REVENUE']);
        rows.push(['Ticket Sales', `$${data.revenue.ticketSales.toFixed(2)}`]);
        rows.push(['Total Revenue', `$${data.revenue.total.toFixed(2)}`]);
        rows.push(['']);
        rows.push(['COSTS']);
        rows.push(['Venue Costs', `$${data.costs.venueCosts.toFixed(2)}`]);
        rows.push(['Marketing Costs', `$${data.costs.marketingCosts.toFixed(2)}`]);
        rows.push(['Staff Costs', `$${data.costs.staffCosts.toFixed(2)}`]);
        rows.push(['Platform Fees', `$${data.costs.platformFees.toFixed(2)}`]);
        rows.push(['Payment Fees', `$${data.costs.paymentFees.toFixed(2)}`]);
        rows.push(['Total Costs', `$${data.costs.total.toFixed(2)}`]);
        rows.push(['']);
        rows.push(['PROFIT']);
        rows.push(['Gross Profit', `$${data.grossProfit.toFixed(2)}`]);
        rows.push(['Net Profit', `$${data.netProfit.toFixed(2)}`]);
        rows.push(['Profit Margin', `${data.profitMargin.toFixed(2)}%`]);
        break;
        
      default:
        rows.push(['Financial Data Export']);
        rows.push([JSON.stringify(data, null, 2)]);
    }
    
    return rows.map(row => row.join(',')).join('\n');
  }
}