// React Hook for Sales Agent Management - Epic F.002
import { useState, useEffect, useCallback } from 'react';
import { salesAgentService } from '@/services/salesAgentService';
import type {
  SalesAgentData,
  AssignedEvent,
  SalesMetrics,
  QuickSale,
  CustomerInfo,
  CommissionData,
  SalesTarget,
  TeamCollaboration
} from '@/services/salesAgentService';

interface UseSalesAgentResult {
  // Data
  agentData: SalesAgentData | null;
  assignedEvents: AssignedEvent[];
  salesMetrics: SalesMetrics | null;
  customers: CustomerInfo[];
  commissionData: CommissionData[];
  salesTargets: SalesTarget[];
  
  // Loading states
  loading: boolean;
  loadingMetrics: boolean;
  loadingCustomers: boolean;
  loadingCommissions: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  processQuickSale: (saleData: Omit<QuickSale, 'id' | 'sale_date' | 'reference_code' | 'status' | 'commission_amount'>) => Promise<QuickSale>;
  addCustomer: (customerData: Omit<CustomerInfo, 'id' | 'last_contact'>) => Promise<CustomerInfo>;
  shareLeadWithTeam: (collaborationData: Omit<TeamCollaboration, 'id' | 'shared_date' | 'status'>) => Promise<TeamCollaboration>;
  exportSalesData: (format: 'csv' | 'excel' | 'pdf', dateRange: { start: string; end: string }) => Promise<void>;
  
  // Computed values
  totalRevenue: number;
  totalCommission: number;
  conversionRate: number;
  averageSaleValue: number;
  topPerformingEvent: AssignedEvent | null;
  recentSales: QuickSale[];
}

export const useSalesAgent = (agentId: string, autoRefresh = true): UseSalesAgentResult => {
  // State
  const [agentData, setAgentData] = useState<SalesAgentData | null>(null);
  const [assignedEvents, setAssignedEvents] = useState<AssignedEvent[]>([]);
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [commissionData, setCommissionData] = useState<CommissionData[]>([]);
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([]);
  const [recentSales, setRecentSales] = useState<QuickSale[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingCommissions, setLoadingCommissions] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch agent data
  const fetchAgentData = useCallback(async () => {
    try {
      setError(null);
      const data = await salesAgentService.getSalesAgentData(agentId);
      setAgentData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent data');
    }
  }, [agentId]);

  // Fetch assigned events
  const fetchAssignedEvents = useCallback(async () => {
    try {
      const events = await salesAgentService.getAssignedEvents(agentId);
      setAssignedEvents(events);
    } catch (err) {
      console.error('Failed to fetch assigned events:', err);
    }
  }, [agentId]);

  // Fetch sales metrics
  const fetchSalesMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);
      const metrics = await salesAgentService.getSalesMetrics(agentId, 'month');
      setSalesMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch sales metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  }, [agentId]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      const customerList = await salesAgentService.getCustomers(agentId);
      setCustomers(customerList);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  }, [agentId]);

  // Fetch commission data
  const fetchCommissionData = useCallback(async () => {
    try {
      setLoadingCommissions(true);
      const commissions = await salesAgentService.getCommissionData(agentId);
      setCommissionData(commissions);
    } catch (err) {
      console.error('Failed to fetch commission data:', err);
    } finally {
      setLoadingCommissions(false);
    }
  }, [agentId]);

  // Fetch sales targets
  const fetchSalesTargets = useCallback(async () => {
    try {
      const targets = await salesAgentService.getSalesTargets(agentId);
      setSalesTargets(targets);
    } catch (err) {
      console.error('Failed to fetch sales targets:', err);
    }
  }, [agentId]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAgentData(),
        fetchAssignedEvents(),
        fetchSalesMetrics(),
        fetchCustomers(),
        fetchCommissionData(),
        fetchSalesTargets()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [fetchAgentData, fetchAssignedEvents, fetchSalesMetrics, fetchCustomers, fetchCommissionData, fetchSalesTargets]);

  // Process quick sale
  const processQuickSale = useCallback(async (saleData: Omit<QuickSale, 'id' | 'sale_date' | 'reference_code' | 'status' | 'commission_amount'>) => {
    try {
      const sale = await salesAgentService.processQuickSale(saleData);
      
      // Add to recent sales
      setRecentSales(prev => [sale, ...prev.slice(0, 9)]);
      
      // Refresh metrics and commission data
      await Promise.all([
        fetchSalesMetrics(),
        fetchCommissionData()
      ]);
      
      return sale;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process sale');
      throw err;
    }
  }, [fetchSalesMetrics, fetchCommissionData]);

  // Add customer
  const addCustomer = useCallback(async (customerData: Omit<CustomerInfo, 'id' | 'last_contact'>) => {
    try {
      const customer = await salesAgentService.addCustomer(customerData);
      setCustomers(prev => [customer, ...prev]);
      return customer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
      throw err;
    }
  }, []);

  // Share lead with team
  const shareLeadWithTeam = useCallback(async (collaborationData: Omit<TeamCollaboration, 'id' | 'shared_date' | 'status'>) => {
    try {
      const collaboration = await salesAgentService.shareLeadWithTeam(collaborationData);
      return collaboration;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share lead');
      throw err;
    }
  }, []);

  // Export sales data
  const exportSalesData = useCallback(async (format: 'csv' | 'excel' | 'pdf', dateRange: { start: string; end: string }) => {
    try {
      await salesAgentService.exportSalesData(agentId, format, dateRange);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  }, [agentId]);

  // Computed values
  const totalRevenue = salesMetrics?.total_revenue || 0;
  const totalCommission = salesMetrics?.total_commission || 0;
  const conversionRate = salesMetrics?.conversion_rate || 0;
  const averageSaleValue = salesMetrics?.average_sale_value || 0;
  
  const topPerformingEvent = assignedEvents.length > 0 
    ? assignedEvents.reduce((top, event) => {
        // Mock logic - in real implementation, this would be based on actual sales data
        const eventScore = event.sales_target ? Math.random() * event.sales_target : 0;
        const topScore = top?.sales_target ? Math.random() * top.sales_target : 0;
        return eventScore > topScore ? event : top;
      })
    : null;

  // Initial data load
  useEffect(() => {
    if (agentId) {
      refreshData();
    }
  }, [agentId, refreshData]);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!autoRefresh || !agentId) return;

    const interval = setInterval(() => {
      fetchSalesMetrics();
      fetchCommissionData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, agentId, fetchSalesMetrics, fetchCommissionData]);

  return {
    // Data
    agentData,
    assignedEvents,
    salesMetrics,
    customers,
    commissionData,
    salesTargets,
    
    // Loading states
    loading,
    loadingMetrics,
    loadingCustomers,
    loadingCommissions,
    
    // Error state
    error,
    
    // Actions
    refreshData,
    processQuickSale,
    addCustomer,
    shareLeadWithTeam,
    exportSalesData,
    
    // Computed values
    totalRevenue,
    totalCommission,
    conversionRate,
    averageSaleValue,
    topPerformingEvent,
    recentSales
  };
};