export interface CommissionPayment {
  id: string;
  agentId: string;
  agentName: string;
  eventId: string;
  eventTitle: string;
  commissionAmount: number;
  salesCount: number;
  periodStart: Date;
  periodEnd: Date;
  status: 'pending' | 'processing' | 'paid' | 'disputed' | 'cancelled';
  paymentMethod: 'manual' | 'automated' | 'bank_transfer' | 'paypal' | 'check';
  paymentDate?: Date;
  paymentReference?: string;
  taxAmount: number;
  netAmount: number;
  notes?: string;
  processedBy?: string;
  auditTrail: CommissionAuditEntry[];
  disputes?: CommissionDispute[];
  taxDocuments: TaxDocument[];
}

export interface CommissionAuditEntry {
  id: string;
  timestamp: Date;
  action: 'created' | 'updated' | 'paid_manually' | 'paid_automated' | 'disputed' | 'resolved' | 'cancelled';
  userId: string;
  userName: string;
  previousStatus?: string;
  newStatus: string;
  changes: Record<string, any>;
  notes?: string;
  ipAddress?: string;
}

export interface CommissionDispute {
  id: string;
  disputeType: 'incorrect_amount' | 'missing_sales' | 'duplicate_payment' | 'other';
  description: string;
  submittedBy: string;
  submittedDate: Date;
  status: 'open' | 'investigating' | 'resolved' | 'rejected';
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: Date;
  originalAmount: number;
  adjustedAmount?: number;
  supportingDocuments: string[];
}

export interface TaxDocument {
  id: string;
  type: '1099' | 'summary' | 'detailed_statement';
  year: number;
  quarter?: number;
  filePath: string;
  generatedDate: Date;
  totalCommissions: number;
  totalTax: number;
}

export interface PayoutBatch {
  id: string;
  batchDate: Date;
  totalAmount: number;
  paymentCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'bank_transfer' | 'paypal' | 'manual';
  payments: CommissionPayment[];
  processedBy: string;
  completedDate?: Date;
  failureReason?: string;
}

export interface CommissionSummary {
  totalPending: number;
  totalPaid: number;
  totalDisputed: number;
  pendingCount: number;
  paidCount: number;
  disputedCount: number;
  averageCommission: number;
  topEarners: Array<{
    agentId: string;
    agentName: string;
    totalEarnings: number;
    paymentCount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    totalPaid: number;
    paymentCount: number;
  }>;
}

export interface PaymentConfiguration {
  id: string;
  organizerId: string;
  paymentSchedule: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly';
  minimumPayout: number;
  taxRate: number;
  defaultPaymentMethod: 'bank_transfer' | 'paypal' | 'check';
  autoPayEnabled: boolean;
  requireApproval: boolean;
  paymentDay: number; // Day of week/month
  bankingDetails?: {
    accountName: string;
    routingNumber: string;
    accountNumber: string;
  };
  paypalDetails?: {
    clientId: string;
    sandboxMode: boolean;
  };
}

class CommissionPaymentService {
  // Mock data storage
  private payments: CommissionPayment[] = [];
  private payoutBatches: PayoutBatch[] = [];
  private configurations: PaymentConfiguration[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Generate mock commission payments
    this.payments = this.generateMockPayments();
    this.payoutBatches = this.generateMockPayoutBatches();
    this.configurations = this.generateMockConfigurations();
  }

  private generateMockPayments(): CommissionPayment[] {
    const statuses: CommissionPayment['status'][] = ['pending', 'processing', 'paid', 'disputed'];
    const paymentMethods: CommissionPayment['paymentMethod'][] = ['manual', 'automated', 'bank_transfer', 'paypal'];
    
    return Array.from({ length: 50 }, (_, i) => {
      const commissionAmount = Math.random() * 500 + 50;
      const taxRate = 0.15;
      const taxAmount = commissionAmount * taxRate;
      const netAmount = commissionAmount - taxAmount;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `payment_${i + 1}`,
        agentId: `agent_${Math.floor(Math.random() * 10) + 1}`,
        agentName: `Agent ${Math.floor(Math.random() * 10) + 1}`,
        eventId: `event_${Math.floor(Math.random() * 5) + 1}`,
        eventTitle: `Dance Event ${Math.floor(Math.random() * 5) + 1}`,
        commissionAmount,
        salesCount: Math.floor(Math.random() * 20) + 1,
        periodStart: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        periodEnd: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        status,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentDate: status === 'paid' ? new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
        paymentReference: status === 'paid' ? `TXN_${Math.random().toString(36).substr(2, 9)}` : undefined,
        taxAmount,
        netAmount,
        notes: i % 5 === 0 ? 'Special commission adjustment' : undefined,
        processedBy: status === 'paid' ? 'admin_user' : undefined,
        auditTrail: this.generateMockAuditTrail(status),
        disputes: status === 'disputed' ? [this.generateMockDispute()] : undefined,
        taxDocuments: status === 'paid' ? [this.generateMockTaxDocument()] : []
      };
    });
  }

  private generateMockAuditTrail(status: string): CommissionAuditEntry[] {
    const entries: CommissionAuditEntry[] = [
      {
        id: `audit_${Date.now()}_1`,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        action: 'created',
        userId: 'system',
        userName: 'System',
        newStatus: 'pending',
        changes: { status: 'pending' },
        ipAddress: '127.0.0.1'
      }
    ];

    if (status === 'paid') {
      entries.push({
        id: `audit_${Date.now()}_2`,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        action: 'paid_manually',
        userId: 'admin_user',
        userName: 'Admin User',
        previousStatus: 'pending',
        newStatus: 'paid',
        changes: { status: 'paid', paymentDate: new Date(), paymentMethod: 'manual' },
        notes: 'Manual payment processed',
        ipAddress: '192.168.1.100'
      });
    }

    return entries;
  }

  private generateMockDispute(): CommissionDispute {
    const disputeTypes: CommissionDispute['disputeType'][] = ['incorrect_amount', 'missing_sales', 'duplicate_payment', 'other'];
    
    return {
      id: `dispute_${Date.now()}`,
      disputeType: disputeTypes[Math.floor(Math.random() * disputeTypes.length)],
      description: 'Commission amount seems incorrect based on my sales records',
      submittedBy: 'agent_1',
      submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'open',
      originalAmount: 150.00,
      supportingDocuments: ['sales_report.pdf', 'tracking_screenshot.png']
    };
  }

  private generateMockTaxDocument(): TaxDocument {
    return {
      id: `tax_${Date.now()}`,
      type: '1099',
      year: new Date().getFullYear(),
      filePath: '/documents/tax/1099_2024.pdf',
      generatedDate: new Date(),
      totalCommissions: 5000.00,
      totalTax: 750.00
    };
  }

  private generateMockPayoutBatches(): PayoutBatch[] {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `batch_${i + 1}`,
      batchDate: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      totalAmount: Math.random() * 5000 + 1000,
      paymentCount: Math.floor(Math.random() * 20) + 5,
      status: i < 8 ? 'completed' : 'pending',
      paymentMethod: 'bank_transfer',
      payments: [],
      processedBy: 'admin_user',
      completedDate: i < 8 ? new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000) : undefined
    }));
  }

  private generateMockConfigurations(): PaymentConfiguration[] {
    return [
      {
        id: 'config_1',
        organizerId: 'org_1',
        paymentSchedule: 'monthly',
        minimumPayout: 50.00,
        taxRate: 0.15,
        defaultPaymentMethod: 'bank_transfer',
        autoPayEnabled: true,
        requireApproval: false,
        paymentDay: 1,
        bankingDetails: {
          accountName: 'Steppers Life LLC',
          routingNumber: '123456789',
          accountNumber: '9876543210'
        }
      }
    ];
  }

  // Core payment management methods
  async getCommissionPayments(
    organizerId: string,
    filters?: {
      status?: CommissionPayment['status'];
      agentId?: string;
      eventId?: string;
      dateRange?: { start: Date; end: Date };
      paymentMethod?: string;
    }
  ): Promise<CommissionPayment[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    
    let filtered = [...this.payments];

    if (filters?.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters?.agentId) {
      filtered = filtered.filter(p => p.agentId === filters.agentId);
    }
    if (filters?.eventId) {
      filtered = filtered.filter(p => p.eventId === filters.eventId);
    }
    if (filters?.dateRange) {
      filtered = filtered.filter(p => 
        p.periodStart >= filters.dateRange!.start && 
        p.periodEnd <= filters.dateRange!.end
      );
    }
    if (filters?.paymentMethod) {
      filtered = filtered.filter(p => p.paymentMethod === filters.paymentMethod);
    }

    return filtered.sort((a, b) => b.periodEnd.getTime() - a.periodEnd.getTime());
  }

  async markPaymentAsPaid(
    paymentId: string,
    paymentDetails: {
      paymentMethod: CommissionPayment['paymentMethod'];
      paymentReference?: string;
      notes?: string;
      processedBy: string;
    }
  ): Promise<CommissionPayment> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status === 'paid') {
      throw new Error('Payment is already marked as paid');
    }

    const previousStatus = payment.status;
    
    // Update payment
    payment.status = 'paid';
    payment.paymentMethod = paymentDetails.paymentMethod;
    payment.paymentReference = paymentDetails.paymentReference;
    payment.paymentDate = new Date();
    payment.notes = paymentDetails.notes;
    payment.processedBy = paymentDetails.processedBy;

    // Add audit trail entry
    const auditEntry: CommissionAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      action: 'paid_manually',
      userId: paymentDetails.processedBy,
      userName: 'Admin User',
      previousStatus,
      newStatus: 'paid',
      changes: {
        status: 'paid',
        paymentMethod: paymentDetails.paymentMethod,
        paymentReference: paymentDetails.paymentReference,
        paymentDate: new Date(),
        notes: paymentDetails.notes
      },
      notes: paymentDetails.notes,
      ipAddress: '192.168.1.100'
    };

    payment.auditTrail.push(auditEntry);

    return payment;
  }

  async createDispute(
    paymentId: string,
    disputeData: {
      disputeType: CommissionDispute['disputeType'];
      description: string;
      submittedBy: string;
      supportingDocuments?: string[];
    }
  ): Promise<CommissionDispute> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const dispute: CommissionDispute = {
      id: `dispute_${Date.now()}`,
      disputeType: disputeData.disputeType,
      description: disputeData.description,
      submittedBy: disputeData.submittedBy,
      submittedDate: new Date(),
      status: 'open',
      originalAmount: payment.commissionAmount,
      supportingDocuments: disputeData.supportingDocuments || []
    };

    if (!payment.disputes) {
      payment.disputes = [];
    }
    payment.disputes.push(dispute);

    // Update payment status
    payment.status = 'disputed';

    // Add audit trail entry
    const auditEntry: CommissionAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      action: 'disputed',
      userId: disputeData.submittedBy,
      userName: 'Agent User',
      previousStatus: payment.status,
      newStatus: 'disputed',
      changes: { status: 'disputed', dispute: dispute.id },
      notes: `Dispute created: ${disputeData.description}`,
      ipAddress: '192.168.1.101'
    };

    payment.auditTrail.push(auditEntry);

    return dispute;
  }

  async resolveDispute(
    paymentId: string,
    disputeId: string,
    resolution: {
      resolution: string;
      resolvedBy: string;
      adjustedAmount?: number;
      status: 'resolved' | 'rejected';
    }
  ): Promise<CommissionDispute> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment || !payment.disputes) {
      throw new Error('Payment or dispute not found');
    }

    const dispute = payment.disputes.find(d => d.id === disputeId);
    if (!dispute) {
      throw new Error('Dispute not found');
    }

    dispute.status = resolution.status;
    dispute.resolution = resolution.resolution;
    dispute.resolvedBy = resolution.resolvedBy;
    dispute.resolvedDate = new Date();
    dispute.adjustedAmount = resolution.adjustedAmount;

    // Update payment if resolution affects amount
    if (resolution.adjustedAmount && resolution.status === 'resolved') {
      payment.commissionAmount = resolution.adjustedAmount;
      payment.netAmount = resolution.adjustedAmount - payment.taxAmount;
      payment.status = 'pending'; // Reset to pending for re-processing
    } else if (resolution.status === 'resolved') {
      payment.status = 'pending';
    }

    // Add audit trail entry
    const auditEntry: CommissionAuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date(),
      action: 'resolved',
      userId: resolution.resolvedBy,
      userName: 'Admin User',
      previousStatus: 'disputed',
      newStatus: payment.status,
      changes: {
        dispute: dispute.id,
        resolution: resolution.resolution,
        adjustedAmount: resolution.adjustedAmount
      },
      notes: `Dispute ${resolution.status}: ${resolution.resolution}`,
      ipAddress: '192.168.1.100'
    };

    payment.auditTrail.push(auditEntry);

    return dispute;
  }

  async createPayoutBatch(
    organizerId: string,
    paymentIds: string[],
    batchData: {
      paymentMethod: 'bank_transfer' | 'paypal' | 'manual';
      processedBy: string;
    }
  ): Promise<PayoutBatch> {
    const payments = this.payments.filter(p => paymentIds.includes(p.id) && p.status === 'pending');
    
    if (payments.length !== paymentIds.length) {
      throw new Error('Some payments are not available for batching');
    }

    const totalAmount = payments.reduce((sum, p) => sum + p.netAmount, 0);

    const batch: PayoutBatch = {
      id: `batch_${Date.now()}`,
      batchDate: new Date(),
      totalAmount,
      paymentCount: payments.length,
      status: 'processing',
      paymentMethod: batchData.paymentMethod,
      payments,
      processedBy: batchData.processedBy
    };

    // Update payment statuses
    payments.forEach(payment => {
      payment.status = 'processing';
      
      const auditEntry: CommissionAuditEntry = {
        id: `audit_${Date.now()}`,
        timestamp: new Date(),
        action: 'updated',
        userId: batchData.processedBy,
        userName: 'Admin User',
        previousStatus: 'pending',
        newStatus: 'processing',
        changes: { status: 'processing', batchId: batch.id },
        notes: `Added to payout batch ${batch.id}`,
        ipAddress: '192.168.1.100'
      };

      payment.auditTrail.push(auditEntry);
    });

    this.payoutBatches.push(batch);

    return batch;
  }

  async getCommissionSummary(organizerId: string): Promise<CommissionSummary> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const pendingPayments = this.payments.filter(p => p.status === 'pending');
    const paidPayments = this.payments.filter(p => p.status === 'paid');
    const disputedPayments = this.payments.filter(p => p.status === 'disputed');

    const agentEarnings = new Map<string, { name: string; total: number; count: number }>();
    
    paidPayments.forEach(payment => {
      const existing = agentEarnings.get(payment.agentId) || { name: payment.agentName, total: 0, count: 0 };
      existing.total += payment.netAmount;
      existing.count += 1;
      agentEarnings.set(payment.agentId, existing);
    });

    const topEarners = Array.from(agentEarnings.entries())
      .map(([agentId, data]) => ({
        agentId,
        agentName: data.name,
        totalEarnings: data.total,
        paymentCount: data.count
      }))
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 10);

    // Generate monthly trends (last 6 months)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
      
      const monthPayments = paidPayments.filter(p => 
        p.paymentDate && 
        p.paymentDate.getMonth() === date.getMonth() && 
        p.paymentDate.getFullYear() === date.getFullYear()
      );

      return {
        month: monthStr,
        totalPaid: monthPayments.reduce((sum, p) => sum + p.netAmount, 0),
        paymentCount: monthPayments.length
      };
    }).reverse();

    return {
      totalPending: pendingPayments.reduce((sum, p) => sum + p.netAmount, 0),
      totalPaid: paidPayments.reduce((sum, p) => sum + p.netAmount, 0),
      totalDisputed: disputedPayments.reduce((sum, p) => sum + p.netAmount, 0),
      pendingCount: pendingPayments.length,
      paidCount: paidPayments.length,
      disputedCount: disputedPayments.length,
      averageCommission: paidPayments.length > 0 ? 
        paidPayments.reduce((sum, p) => sum + p.netAmount, 0) / paidPayments.length : 0,
      topEarners,
      monthlyTrends
    };
  }

  async exportCommissionData(
    organizerId: string,
    format: 'csv' | 'excel' | 'pdf',
    filters?: {
      status?: string;
      dateRange?: { start: Date; end: Date };
      agentId?: string;
    }
  ): Promise<Blob> {
    const payments = await this.getCommissionPayments(organizerId, filters);
    
    if (format === 'csv') {
      const csvContent = this.generateCSV(payments);
      return new Blob([csvContent], { type: 'text/csv' });
    } else if (format === 'excel') {
      // In a real implementation, you'd use a library like xlsx
      const csvContent = this.generateCSV(payments);
      return new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    } else {
      // PDF generation would use a library like jsPDF
      const pdfContent = this.generatePDF(payments);
      return new Blob([pdfContent], { type: 'application/pdf' });
    }
  }

  private generateCSV(payments: CommissionPayment[]): string {
    const headers = [
      'Payment ID', 'Agent Name', 'Event Title', 'Commission Amount', 'Tax Amount', 
      'Net Amount', 'Sales Count', 'Status', 'Payment Method', 'Payment Date',
      'Payment Reference', 'Period Start', 'Period End', 'Notes'
    ];

    const rows = payments.map(payment => [
      payment.id,
      payment.agentName,
      payment.eventTitle,
      payment.commissionAmount.toFixed(2),
      payment.taxAmount.toFixed(2),
      payment.netAmount.toFixed(2),
      payment.salesCount.toString(),
      payment.status,
      payment.paymentMethod,
      payment.paymentDate?.toLocaleDateString() || '',
      payment.paymentReference || '',
      payment.periodStart.toLocaleDateString(),
      payment.periodEnd.toLocaleDateString(),
      payment.notes || ''
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }

  private generatePDF(payments: CommissionPayment[]): string {
    // Mock PDF content - in real implementation, use jsPDF
    return `%PDF-1.4
Commission Report
Generated: ${new Date().toLocaleDateString()}
Total Payments: ${payments.length}
Total Amount: $${payments.reduce((sum, p) => sum + p.netAmount, 0).toFixed(2)}
`;
  }

  async getPaymentConfiguration(organizerId: string): Promise<PaymentConfiguration | null> {
    return this.configurations.find(c => c.organizerId === organizerId) || null;
  }

  async updatePaymentConfiguration(
    organizerId: string, 
    config: Partial<PaymentConfiguration>
  ): Promise<PaymentConfiguration> {
    let existing = this.configurations.find(c => c.organizerId === organizerId);
    
    if (!existing) {
      existing = {
        id: `config_${Date.now()}`,
        organizerId,
        paymentSchedule: 'monthly',
        minimumPayout: 50.00,
        taxRate: 0.15,
        defaultPaymentMethod: 'bank_transfer',
        autoPayEnabled: false,
        requireApproval: true,
        paymentDay: 1,
        ...config
      };
      this.configurations.push(existing);
    } else {
      Object.assign(existing, config);
    }

    return existing;
  }
}

export const commissionPaymentService = new CommissionPaymentService(); 