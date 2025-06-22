// Sales Agent Service - Epic F.002
// Comprehensive ticket sales interface and commission tracking

export interface SalesAgentData {
  id: string;
  user_id: string;
  organizer_id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'sales_agent' | 'lead_agent' | 'senior_agent';
  status: 'active' | 'inactive' | 'suspended';
  commission_rate: number;
  target_commission_rate?: number;
  created_at: string;
  last_active: string;
}

export interface AssignedEvent {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  venue: string;
  ticket_types: TicketTypeInfo[];
  sales_target?: number;
  commission_rate: number;
  status: 'active' | 'ended' | 'cancelled';
  sales_start_date: string;
  sales_end_date: string;
}

export interface TicketTypeInfo {
  id: string;
  name: string;
  price: number;
  available_quantity: number;
  total_quantity: number;
  commission_rate?: number;
}

export interface SalesMetrics {
  total_sales: number;
  total_revenue: number;
  total_commission: number;
  tickets_sold: number;
  conversion_rate: number;
  average_sale_value: number;
  sales_this_week: number;
  sales_this_month: number;
  ranking: number;
  goal_progress: number;
}

export interface QuickSale {
  id: string;
  agent_id: string;
  event_id: string;
  customer: CustomerInfo;
  tickets: SoldTicket[];
  total_amount: number;
  commission_amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet';
  sale_date: string;
  reference_code: string;
  status: 'completed' | 'pending' | 'refunded';
}

export interface CustomerInfo {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tags: string[];
  notes?: string;
  source: 'direct' | 'referral' | 'social_media' | 'advertisement' | 'repeat';
  last_contact: string;
}

export interface SoldTicket {
  ticket_type_id: string;
  ticket_type_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  commission_rate: number;
}

export interface CommissionData {
  id: string;
  agent_id: string;
  sale_id: string;
  event_id: string;
  amount: number;
  rate: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  earned_date: string;
  paid_date?: string;
  payout_reference?: string;
}

export interface SalesTarget {
  id: string;
  agent_id: string;
  event_id?: string;
  target_type: 'revenue' | 'tickets' | 'commission';
  target_value: number;
  current_value: number;
  period: 'daily' | 'weekly' | 'monthly' | 'event';
  start_date: string;
  end_date: string;
  reward?: string;
  status: 'active' | 'completed' | 'failed';
}

export interface TeamCollaboration {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  customer_id: string;
  event_id: string;
  type: 'lead_share' | 'referral' | 'collaboration';
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  shared_date: string;
  commission_split?: number;
}

class SalesAgentService {
  // Mock data for development and testing
  private generateMockSalesAgent(agentId: string): SalesAgentData {
    const agents = [
      { name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '+1-555-0123' },
      { name: 'Mike Chen', email: 'mike.c@example.com', phone: '+1-555-0124' },
      { name: 'Emily Rodriguez', email: 'emily.r@example.com', phone: '+1-555-0125' },
      { name: 'David Kim', email: 'david.k@example.com', phone: '+1-555-0126' }
    ];
    
    const agent = agents[parseInt(agentId.slice(-1)) % agents.length];
    
    return {
      id: agentId,
      user_id: `user_${agentId}`,
      organizer_id: 'org_001',
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      role: 'sales_agent',
      status: 'active',
      commission_rate: 5.0 + Math.random() * 5, // 5-10%
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_active: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  private generateMockAssignedEvents(): AssignedEvent[] {
    return [
      {
        id: 'assign_001',
        event_id: 'event_001',
        event_name: 'Summer Dance Workshop',
        event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Downtown Studio',
        ticket_types: [
          { id: 'tt_001', name: 'Early Bird', price: 45, available_quantity: 20, total_quantity: 50 },
          { id: 'tt_002', name: 'Regular', price: 60, available_quantity: 35, total_quantity: 100 },
          { id: 'tt_003', name: 'VIP', price: 90, available_quantity: 8, total_quantity: 20 }
        ],
        sales_target: 5000,
        commission_rate: 7.5,
        status: 'active',
        sales_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        sales_end_date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'assign_002',
        event_id: 'event_002',
        event_name: 'Salsa Night Fiesta',
        event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Grand Ballroom',
        ticket_types: [
          { id: 'tt_004', name: 'General Admission', price: 25, available_quantity: 150, total_quantity: 200 },
          { id: 'tt_005', name: 'Premium', price: 40, available_quantity: 45, total_quantity: 80 }
        ],
        sales_target: 8000,
        commission_rate: 6.0,
        status: 'active',
        sales_start_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        sales_end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Get sales agent profile data
  async getSalesAgentData(agentId: string): Promise<SalesAgentData> {
    try {
      // Mock implementation with realistic data
      return this.generateMockSalesAgent(agentId);
    } catch (error) {
      console.error('Error fetching sales agent data:', error);
      throw error;
    }
  }

  // Get assigned events for agent
  async getAssignedEvents(agentId: string): Promise<AssignedEvent[]> {
    try {
      return this.generateMockAssignedEvents();
    } catch (error) {
      console.error('Error fetching assigned events:', error);
      throw error;
    }
  }

  // Get sales metrics for agent
  async getSalesMetrics(agentId: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<SalesMetrics> {
    try {
      // Generate realistic mock metrics
      const baseSales = 15 + Math.random() * 35; // 15-50 sales
      const avgSaleValue = 45 + Math.random() * 55; // $45-$100 average
      const totalRevenue = baseSales * avgSaleValue;
      const commissionRate = 0.065; // 6.5% average
      
      return {
        total_sales: Math.floor(baseSales),
        total_revenue: Math.round(totalRevenue),
        total_commission: Math.round(totalRevenue * commissionRate),
        tickets_sold: Math.floor(baseSales * (1.2 + Math.random() * 0.8)), // 1-2 tickets per sale
        conversion_rate: Math.round((15 + Math.random() * 25) * 10) / 10, // 15-40%
        average_sale_value: Math.round(avgSaleValue),
        sales_this_week: Math.floor(baseSales * 0.3),
        sales_this_month: Math.floor(baseSales),
        ranking: Math.floor(Math.random() * 10) + 1,
        goal_progress: Math.round((60 + Math.random() * 40) * 10) / 10 // 60-100%
      };
    } catch (error) {
      console.error('Error fetching sales metrics:', error);
      throw error;
    }
  }

  // Process quick sale
  async processQuickSale(saleData: Omit<QuickSale, 'id' | 'sale_date' | 'reference_code' | 'status' | 'commission_amount'>): Promise<QuickSale> {
    try {
      const totalAmount = saleData.tickets.reduce((sum, ticket) => sum + ticket.total_price, 0);
      const commissionAmount = saleData.tickets.reduce((sum, ticket) => 
        sum + (ticket.total_price * ticket.commission_rate / 100), 0);
      
      const sale: QuickSale = {
        id: `sale_${Date.now()}`,
        sale_date: new Date().toISOString(),
        reference_code: `REF${Date.now().toString().slice(-8)}`,
        status: 'completed',
        commission_amount: Math.round(commissionAmount * 100) / 100,
        total_amount: Math.round(totalAmount * 100) / 100,
        ...saleData
      };

      // Mock API call
      console.log('Processing quick sale:', sale);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return sale;
    } catch (error) {
      console.error('Error processing quick sale:', error);
      throw error;
    }
  }

  // Get customer data
  async getCustomers(agentId: string): Promise<CustomerInfo[]> {
    try {
      // Generate mock customer data
      const mockCustomers: CustomerInfo[] = [
        {
          id: 'cust_001',
          name: 'Alice Cooper',
          email: 'alice.cooper@email.com',
          phone: '+1-555-0201',
          tags: ['VIP', 'Repeat Customer'],
          source: 'referral',
          last_contact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Prefers evening events, interested in intermediate level classes'
        },
        {
          id: 'cust_002',
          name: 'Bob Martinez',
          email: 'bob.martinez@email.com',
          phone: '+1-555-0202',
          tags: ['New Customer'],
          source: 'social_media',
          last_contact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Found us through Instagram, beginner level'
        },
        {
          id: 'cust_003',
          name: 'Carmen Silva',
          email: 'carmen.silva@email.com',
          phone: '+1-555-0203',
          tags: ['High Value', 'Group Organizer'],
          source: 'direct',
          last_contact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Often brings groups of 5-8 people, good for team events'
        }
      ];

      return mockCustomers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Add new customer
  async addCustomer(customerData: Omit<CustomerInfo, 'id' | 'last_contact'>): Promise<CustomerInfo> {
    try {
      const customer: CustomerInfo = {
        id: `cust_${Date.now()}`,
        last_contact: new Date().toISOString(),
        ...customerData
      };

      console.log('Adding customer:', customer);
      return customer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }

  // Get commission data
  async getCommissionData(agentId: string): Promise<CommissionData[]> {
    try {
      // Generate mock commission data
      const mockCommissions: CommissionData[] = [];
      
      for (let i = 0; i < 10; i++) {
        const amount = 15 + Math.random() * 85; // $15-$100
        const daysAgo = Math.floor(Math.random() * 30);
        
        mockCommissions.push({
          id: `comm_${String(i).padStart(3, '0')}`,
          agent_id: agentId,
          sale_id: `sale_${String(i).padStart(3, '0')}`,
          event_id: `event_${String(Math.floor(i / 3) + 1).padStart(3, '0')}`,
          amount: Math.round(amount * 100) / 100,
          rate: 5 + Math.random() * 5, // 5-10%
          status: ['pending', 'approved', 'paid'][Math.floor(Math.random() * 3)] as any,
          earned_date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          paid_date: Math.random() > 0.5 ? new Date(Date.now() - (daysAgo - 3) * 24 * 60 * 60 * 1000).toISOString() : undefined
        });
      }

      return mockCommissions.sort((a, b) => new Date(b.earned_date).getTime() - new Date(a.earned_date).getTime());
    } catch (error) {
      console.error('Error fetching commission data:', error);
      throw error;
    }
  }

  // Get sales targets
  async getSalesTargets(agentId: string): Promise<SalesTarget[]> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      return [
        {
          id: 'target_001',
          agent_id: agentId,
          target_type: 'revenue',
          target_value: 5000,
          current_value: 3250,
          period: 'monthly',
          start_date: startOfMonth.toISOString(),
          end_date: endOfMonth.toISOString(),
          reward: '$100 bonus',
          status: 'active'
        },
        {
          id: 'target_002',
          agent_id: agentId,
          event_id: 'event_001',
          target_type: 'tickets',
          target_value: 50,
          current_value: 32,
          period: 'event',
          start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          reward: 'Extra 2% commission',
          status: 'active'
        }
      ];
    } catch (error) {
      console.error('Error fetching sales targets:', error);
      throw error;
    }
  }

  // Share lead with team member
  async shareLeadWithTeam(collaborationData: Omit<TeamCollaboration, 'id' | 'shared_date' | 'status'>): Promise<TeamCollaboration> {
    try {
      const collaboration: TeamCollaboration = {
        id: `collab_${Date.now()}`,
        shared_date: new Date().toISOString(),
        status: 'pending',
        ...collaborationData
      };

      console.log('Sharing lead with team:', collaboration);
      return collaboration;
    } catch (error) {
      console.error('Error sharing lead:', error);
      throw error;
    }
  }

  // Export sales data
  async exportSalesData(agentId: string, format: 'csv' | 'excel' | 'pdf', dateRange: { start: string; end: string }): Promise<void> {
    try {
      const sales = await this.generateMockSalesData(agentId, dateRange);
      
      if (format === 'csv') {
        const csvContent = this.generateSalesCSV(sales);
        this.downloadFile(csvContent, `sales-report-${agentId}.csv`, 'text/csv');
      } else if (format === 'excel') {
        // Mock Excel generation
        console.log('Generating Excel export for agent:', agentId);
      } else if (format === 'pdf') {
        // Mock PDF generation
        console.log('Generating PDF export for agent:', agentId);
      }
    } catch (error) {
      console.error('Error exporting sales data:', error);
      throw error;
    }
  }

  private async generateMockSalesData(agentId: string, dateRange: { start: string; end: string }) {
    // Generate mock sales data for export
    return Array.from({ length: 20 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      customer: `Customer ${i + 1}`,
      event: `Event ${Math.floor(i / 5) + 1}`,
      tickets: Math.floor(Math.random() * 3) + 1,
      amount: Math.round((30 + Math.random() * 70) * 100) / 100,
      commission: Math.round((2 + Math.random() * 8) * 100) / 100
    }));
  }

  private generateSalesCSV(sales: any[]): string {
    const headers = ['Date', 'Customer', 'Event', 'Tickets', 'Amount', 'Commission'];
    const rows = sales.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      sale.customer,
      sale.event,
      sale.tickets,
      `$${sale.amount}`,
      `$${sale.commission}`
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

export const salesAgentService = new SalesAgentService();
export default salesAgentService;