// Commission Payment Service - Epic F.004
// Payment tracking, automated payouts, and staff management

export interface CommissionPayment {
  id: string;
  agent_id: string;
  agent_name: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  commission_amount: number;
  tax_amount?: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'paid' | 'disputed' | 'cancelled';
  payment_method: 'bank_transfer' | 'paypal' | 'check' | 'digital_wallet';
  payment_reference?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  audit_trail: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  action: string;
  performed_by: string;
  performed_at: string;
  details: Record<string, any>;
  notes?: string;
}

export interface PaymentBatch {
  id: string;
  batch_name: string;
  payment_method: 'bank_transfer' | 'paypal' | 'check';
  total_amount: number;
  payment_count: number;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  created_by: string;
  created_at: string;
  processed_at?: string;
  payments: CommissionPayment[];
  processing_notes?: string;
}

export interface PaymentDispute {
  id: string;
  payment_id: string;
  agent_id: string;
  dispute_type: 'amount_incorrect' | 'missing_sales' | 'calculation_error' | 'payment_not_received' | 'other';
  description: string;
  amount_disputed: number;
  evidence_files: string[];
  status: 'open' | 'investigating' | 'resolved' | 'rejected';
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  resolution_amount?: number;
}

export interface EventStaffInfo {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'event_staff' | 'scanner' | 'coordinator' | 'security';
  assigned_events: string[];
  permissions: StaffPermission[];
  status: 'active' | 'inactive' | 'suspended';
  pwa_access_token?: string;
  token_expires_at?: string;
  created_at: string;
  last_active?: string;
}

export interface StaffPermission {
  id: string;
  event_id: string;
  areas: string[];
  start_time: string;
  end_time: string;
  capabilities: string[];
}

export interface StaffActivity {
  id: string;
  staff_id: string;
  event_id: string;
  activity_type: 'check_in' | 'scan_ticket' | 'manual_entry' | 'report_issue' | 'break_start' | 'break_end' | 'shift_end';
  timestamp: string;
  location?: string;
  device_info: string;
  details: Record<string, any>;
  performance_impact: number; // -100 to 100
}

export interface StaffPerformanceMetrics {
  staff_id: string;
  period_start: string;
  period_end: string;
  shifts_worked: number;
  total_hours: number;
  tickets_scanned: number;
  scanning_speed: number; // tickets per minute
  accuracy_rate: number;
  punctuality_score: number;
  reliability_score: number;
  customer_feedback_score: number;
  achievements: Achievement[];
  incidents: Incident[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  points: number;
}

export interface Incident {
  id: string;
  type: 'late_arrival' | 'early_departure' | 'scanning_error' | 'customer_complaint' | 'equipment_issue';
  severity: 'low' | 'medium' | 'high';
  description: string;
  occurred_at: string;
  resolved: boolean;
  impact_score: number;
}

export interface TaxDocument {
  id: string;
  agent_id: string;
  year: number;
  document_type: '1099' | 'summary' | 'quarterly';
  total_earnings: number;
  total_tax_withheld: number;
  file_path: string;
  generated_at: string;
  sent_at?: string;
}

class CommissionPaymentService {
  // Get commission payments for organizer
  async getCommissionPayments(organizerId: string, filters?: {
    status?: string;
    agent_id?: string;
    date_range?: { start: string; end: string };
  }): Promise<CommissionPayment[]> {
    try {
      // Generate mock payment data
      const mockPayments: CommissionPayment[] = [];
      
      const agents = ['Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Kim'];
      const statuses: CommissionPayment['status'][] = ['pending', 'processing', 'paid', 'disputed'];
      
      for (let i = 0; i < 15; i++) {
        const agentName = agents[i % agents.length];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const grossAmount = 150 + Math.random() * 850; // $150-$1000
        const taxAmount = status === 'paid' ? grossAmount * 0.12 : undefined;
        const netAmount = grossAmount - (taxAmount || 0);
        const daysAgo = Math.floor(Math.random() * 60);
        
        mockPayments.push({
          id: `payment_${String(i).padStart(3, '0')}`,
          agent_id: `agent_${String(i % agents.length).padStart(3, '0')}`,
          agent_name: agentName,
          period_start: new Date(Date.now() - (daysAgo + 30) * 24 * 60 * 60 * 1000).toISOString(),
          period_end: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          total_sales: grossAmount * 15, // Assuming ~6.7% commission rate
          commission_amount: grossAmount,
          tax_amount: taxAmount,
          net_amount: Math.round(netAmount * 100) / 100,
          status,
          payment_method: ['bank_transfer', 'paypal', 'check'][Math.floor(Math.random() * 3)] as any,
          payment_reference: status === 'paid' ? `TXN${Date.now().toString().slice(-8)}` : undefined,
          paid_at: status === 'paid' ? new Date(Date.now() - (daysAgo - 3) * 24 * 60 * 60 * 1000).toISOString() : undefined,
          created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - Math.floor(daysAgo / 2) * 24 * 60 * 60 * 1000).toISOString(),
          audit_trail: this.generateMockAuditTrail(status)
        });
      }

      // Apply filters
      let filteredPayments = mockPayments;
      if (filters?.status) {
        filteredPayments = filteredPayments.filter(p => p.status === filters.status);
      }
      if (filters?.agent_id) {
        filteredPayments = filteredPayments.filter(p => p.agent_id === filters.agent_id);
      }

      return filteredPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('Error fetching commission payments:', error);
      throw error;
    }
  }

  // Mark payment as paid manually
  async markPaymentAsPaid(paymentId: string, details: {
    payment_method: string;
    reference: string;
    notes?: string;
    marked_by: string;
  }): Promise<CommissionPayment> {
    try {
      const payments = await this.getCommissionPayments('org_001');
      const payment = payments.find(p => p.id === paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      const updatedPayment: CommissionPayment = {
        ...payment,
        status: 'paid',
        payment_reference: details.reference,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        audit_trail: [
          ...payment.audit_trail,
          {
            id: `audit_${Date.now()}`,
            action: 'payment_marked_paid',
            performed_by: details.marked_by,
            performed_at: new Date().toISOString(),
            details: {
              payment_method: details.payment_method,
              reference: details.reference
            },
            notes: details.notes
          }
        ]
      };

      console.log('Marked payment as paid:', updatedPayment);
      return updatedPayment;
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      throw error;
    }
  }

  // Create payment dispute
  async createPaymentDispute(disputeData: Omit<PaymentDispute, 'id' | 'created_at' | 'status'>): Promise<PaymentDispute> {
    try {
      const dispute: PaymentDispute = {
        id: `dispute_${Date.now()}`,
        status: 'open',
        created_at: new Date().toISOString(),
        ...disputeData
      };

      console.log('Created payment dispute:', dispute);
      return dispute;
    } catch (error) {
      console.error('Error creating payment dispute:', error);
      throw error;
    }
  }

  // Resolve payment dispute
  async resolvePaymentDispute(disputeId: string, resolution: {
    status: 'resolved' | 'rejected';
    notes: string;
    amount?: number;
    resolved_by: string;
  }): Promise<PaymentDispute> {
    try {
      const mockDispute: PaymentDispute = {
        id: disputeId,
        payment_id: 'payment_001',
        agent_id: 'agent_001',
        dispute_type: 'amount_incorrect',
        description: 'Commission calculation seems incorrect',
        amount_disputed: 50.00,
        evidence_files: [],
        status: resolution.status,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        resolved_at: new Date().toISOString(),
        resolution_notes: resolution.notes,
        resolution_amount: resolution.amount
      };

      console.log('Resolved payment dispute:', mockDispute);
      return mockDispute;
    } catch (error) {
      console.error('Error resolving payment dispute:', error);
      throw error;
    }
  }

  // Create payment batch
  async createPaymentBatch(batchData: {
    name: string;
    payment_method: PaymentBatch['payment_method'];
    payment_ids: string[];
    created_by: string;
  }): Promise<PaymentBatch> {
    try {
      const payments = await this.getCommissionPayments('org_001');
      const batchPayments = payments.filter(p => batchData.payment_ids.includes(p.id));
      
      const batch: PaymentBatch = {
        id: `batch_${Date.now()}`,
        batch_name: batchData.name,
        payment_method: batchData.payment_method,
        total_amount: batchPayments.reduce((sum, p) => sum + p.net_amount, 0),
        payment_count: batchPayments.length,
        status: 'draft',
        created_by: batchData.created_by,
        created_at: new Date().toISOString(),
        payments: batchPayments
      };

      console.log('Created payment batch:', batch);
      return batch;
    } catch (error) {
      console.error('Error creating payment batch:', error);
      throw error;
    }
  }

  // Process payment batch
  async processPaymentBatch(batchId: string): Promise<PaymentBatch> {
    try {
      const batch = await this.getPaymentBatch(batchId);
      
      const processedBatch: PaymentBatch = {
        ...batch,
        status: 'completed',
        processed_at: new Date().toISOString(),
        processing_notes: 'Batch processed successfully via automated system'
      };

      console.log('Processed payment batch:', processedBatch);
      return processedBatch;
    } catch (error) {
      console.error('Error processing payment batch:', error);
      throw error;
    }
  }

  // Get payment batch
  async getPaymentBatch(batchId: string): Promise<PaymentBatch> {
    try {
      // Mock implementation
      return {
        id: batchId,
        batch_name: 'Weekly Payout - Week 1',
        payment_method: 'bank_transfer',
        total_amount: 2450.00,
        payment_count: 5,
        status: 'draft',
        created_by: 'organizer_001',
        created_at: new Date().toISOString(),
        payments: []
      };
    } catch (error) {
      console.error('Error fetching payment batch:', error);
      throw error;
    }
  }

  // Get event staff
  async getEventStaff(eventId?: string): Promise<EventStaffInfo[]> {
    try {
      const mockStaff: EventStaffInfo[] = [
        {
          id: 'staff_001',
          user_id: 'user_101',
          name: 'Alex Thompson',
          email: 'alex.thompson@example.com',
          phone: '+1-555-0301',
          role: 'scanner',
          assigned_events: ['event_001', 'event_002'],
          permissions: [
            {
              id: 'perm_001',
              event_id: 'event_001',
              areas: ['main_entrance', 'vip_entrance'],
              start_time: '18:00',
              end_time: '23:00',
              capabilities: ['scan_tickets', 'manual_checkin', 'view_attendee_list']
            }
          ],
          status: 'active',
          pwa_access_token: 'token_' + Date.now(),
          token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'staff_002',
          user_id: 'user_102',
          name: 'Maria Garcia',
          email: 'maria.garcia@example.com',
          phone: '+1-555-0302',
          role: 'coordinator',
          assigned_events: ['event_001'],
          permissions: [
            {
              id: 'perm_002',
              event_id: 'event_001',
              areas: ['all_areas'],
              start_time: '17:00',
              end_time: '24:00',
              capabilities: ['scan_tickets', 'manual_checkin', 'view_attendee_list', 'manage_staff', 'handle_issues']
            }
          ],
          status: 'active',
          pwa_access_token: 'token_' + (Date.now() + 1000),
          token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ];

      return eventId ? mockStaff.filter(s => s.assigned_events.includes(eventId)) : mockStaff;
    } catch (error) {
      console.error('Error fetching event staff:', error);
      throw error;
    }
  }

  // Get staff performance metrics
  async getStaffPerformanceMetrics(staffId: string, period?: { start: string; end: string }): Promise<StaffPerformanceMetrics> {
    try {
      return {
        staff_id: staffId,
        period_start: period?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: period?.end || new Date().toISOString(),
        shifts_worked: 8,
        total_hours: 32.5,
        tickets_scanned: 1247,
        scanning_speed: 2.3,
        accuracy_rate: 98.5,
        punctuality_score: 95.0,
        reliability_score: 92.0,
        customer_feedback_score: 4.7,
        achievements: [
          {
            id: 'ach_001',
            title: 'Speed Demon',
            description: 'Scanned 100+ tickets in one hour',
            icon: '⚡',
            earned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            points: 50
          },
          {
            id: 'ach_002',
            title: 'Perfect Attendance',
            description: 'No missed shifts this month',
            icon: '🎯',
            earned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            points: 100
          }
        ],
        incidents: [
          {
            id: 'inc_001',
            type: 'scanning_error',
            severity: 'low',
            description: 'Scanned invalid QR code twice',
            occurred_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            resolved: true,
            impact_score: -5
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching staff performance metrics:', error);
      throw error;
    }
  }

  // Generate tax documents
  async generateTaxDocuments(agentId: string, year: number): Promise<TaxDocument[]> {
    try {
      const documents: TaxDocument[] = [
        {
          id: `tax_${agentId}_${year}_1099`,
          agent_id: agentId,
          year,
          document_type: '1099',
          total_earnings: 15420.50,
          total_tax_withheld: 0,
          file_path: `/documents/tax/${agentId}_1099_${year}.pdf`,
          generated_at: new Date().toISOString()
        },
        {
          id: `tax_${agentId}_${year}_summary`,
          agent_id: agentId,
          year,
          document_type: 'summary',
          total_earnings: 15420.50,
          total_tax_withheld: 0,
          file_path: `/documents/tax/${agentId}_summary_${year}.pdf`,
          generated_at: new Date().toISOString()
        }
      ];

      console.log('Generated tax documents:', documents);
      return documents;
    } catch (error) {
      console.error('Error generating tax documents:', error);
      throw error;
    }
  }

  // Export payment data
  async exportPaymentData(organizerId: string, format: 'csv' | 'excel' | 'pdf', filters?: any): Promise<void> {
    try {
      const payments = await this.getCommissionPayments(organizerId, filters);
      
      if (format === 'csv') {
        const csvContent = this.generatePaymentsCSV(payments);
        this.downloadFile(csvContent, `commission-payments-${organizerId}.csv`, 'text/csv');
      } else {
        console.log(`Generating ${format} export for commission payments`);
      }
    } catch (error) {
      console.error('Error exporting payment data:', error);
      throw error;
    }
  }

  // Private helper methods
  private generateMockAuditTrail(status: CommissionPayment['status']): AuditEntry[] {
    const trail: AuditEntry[] = [
      {
        id: 'audit_001',
        action: 'payment_created',
        performed_by: 'system',
        performed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        details: { automated: true }
      }
    ];

    if (status === 'paid') {
      trail.push({
        id: 'audit_002',
        action: 'payment_marked_paid',
        performed_by: 'organizer_001',
        performed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        details: { method: 'bank_transfer', reference: 'TXN12345' }
      });
    }

    return trail;
  }

  private generatePaymentsCSV(payments: CommissionPayment[]): string {
    const headers = ['Agent', 'Period', 'Sales', 'Commission', 'Net Amount', 'Status', 'Payment Method', 'Paid Date'];
    const rows = payments.map(payment => [
      payment.agent_name,
      `${new Date(payment.period_start).toLocaleDateString()} - ${new Date(payment.period_end).toLocaleDateString()}`,
      `$${payment.total_sales.toFixed(2)}`,
      `$${payment.commission_amount.toFixed(2)}`,
      `$${payment.net_amount.toFixed(2)}`,
      payment.status,
      payment.payment_method,
      payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const commissionPaymentService = new CommissionPaymentService();
export default commissionPaymentService;