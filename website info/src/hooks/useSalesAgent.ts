import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  salesAgentService, 
  SalesAgentData, 
  QuickSaleRequest, 
  QuickSaleResponse,
  Customer,
  SalesTarget
} from '../services/salesAgentService';
import { toast } from '../hooks/use-toast';

interface UseSalesAgentOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableRealTimeUpdates?: boolean;
}

export const useSalesAgent = (
  agentId: string,
  options: UseSalesAgentOptions = {}
) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true
  } = options;

  const [data, setData] = useState<SalesAgentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchSalesAgentData = useCallback(async (showLoading = false) => {
    if (!agentId) return;

    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const salesAgentData = await salesAgentService.getSalesAgentData(agentId);
      
      if (mountedRef.current) {
        setData(salesAgentData);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales agent data';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [agentId]);

  const refreshData = useCallback(() => {
    fetchSalesAgentData(false);
  }, [fetchSalesAgentData]);

  const processQuickSale = useCallback(async (saleRequest: QuickSaleRequest): Promise<QuickSaleResponse | null> => {
    if (!agentId || isProcessingSale) return null;

    try {
      setIsProcessingSale(true);
      setError(null);

      const saleResponse = await salesAgentService.processQuickSale(agentId, saleRequest);
      
      // Refresh data to show updated inventory and sales metrics
      await fetchSalesAgentData(false);

      toast({
        title: "Sale Successful",
        description: `Sold ${saleRequest.quantity} ticket(s) for $${saleResponse.totalAmount.toFixed(2)}. Commission: $${saleResponse.commissionAmount.toFixed(2)}`,
      });

      return saleResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sale processing failed';
      toast({
        title: "Sale Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsProcessingSale(false);
    }
  }, [agentId, isProcessingSale, fetchSalesAgentData]);

  const updateSalesTarget = useCallback(async (targetId: string, newTargetValue: number) => {
    if (!agentId) return;

    try {
      await salesAgentService.updateSalesTarget(agentId, targetId, newTargetValue);
      await fetchSalesAgentData(false);

      toast({
        title: "Target Updated",
        description: `Sales target updated to ${newTargetValue}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update target';
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [agentId, fetchSalesAgentData]);

  const addCustomer = useCallback(async (customerData: Partial<Customer>) => {
    if (!agentId) return null;

    try {
      const newCustomer = await salesAgentService.addCustomer(agentId, customerData);
      await fetchSalesAgentData(false);

      toast({
        title: "Customer Added",
        description: `${newCustomer.name} has been added to your customer database`,
      });

      return newCustomer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add customer';
      toast({
        title: "Add Customer Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  }, [agentId, fetchSalesAgentData]);

  const shareLeadWithTeam = useCallback(async (customerId: string, targetAgentId: string, eventId: string, notes: string) => {
    if (!agentId) return;

    try {
      await salesAgentService.shareLeadWithTeam(agentId, customerId, targetAgentId, eventId, notes);
      await fetchSalesAgentData(false);

      toast({
        title: "Lead Shared",
        description: "Lead has been shared with team member successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share lead';
      toast({
        title: "Share Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [agentId, fetchSalesAgentData]);

  const exportSalesReport = useCallback(async (format: 'csv' | 'pdf' | 'excel', dateRange: { start: Date; end: Date }) => {
    if (!agentId) return;

    try {
      const blob = await salesAgentService.exportSalesReport(agentId, format, dateRange);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-report-${agentId}-${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Sales report exported as ${format.toUpperCase()}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [agentId]);

  // Initial data fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchSalesAgentData(true);

    return () => {
      mountedRef.current = false;
    };
  }, [fetchSalesAgentData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !enableRealTimeUpdates) return;

    intervalRef.current = setInterval(() => {
      if (mountedRef.current && !isLoading && !isProcessingSale) {
        refreshData();
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, enableRealTimeUpdates, refreshInterval, refreshData, isLoading, isProcessingSale]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      mountedRef.current = false;
    };
  }, []);

  return {
    // State
    data,
    isLoading,
    error,
    isRefreshing,
    isProcessingSale,
    lastUpdated,

    // Actions
    refreshData,
    processQuickSale,
    updateSalesTarget,
    addCustomer,
    shareLeadWithTeam,
    exportSalesReport,

    // Computed values for easy access
    agentInfo: data?.agentInfo || null,
    assignedEvents: data?.assignedEvents || [],
    salesMetrics: data?.salesMetrics || null,
    commissionData: data?.commissionData || null,
    customerDatabase: data?.customerDatabase || [],
    salesTargets: data?.salesTargets || [],
    recentActivity: data?.recentActivity || [],
    teamCollaboration: data?.teamCollaboration || null,

    // Utility computed values
    totalCommissionsPending: data?.commissionData.pendingPayout || 0,
    totalCommissionsEarned: data?.commissionData.totalEarned || 0,
    conversionRate: data?.salesMetrics.conversionRate || 0,
    performanceScore: data?.salesMetrics.performanceScore || 0,
    activeTargetsCount: data?.salesTargets.filter(t => t.status === 'active').length || 0,
    completedTargetsCount: data?.salesTargets.filter(t => t.status === 'completed').length || 0,
    
    // Inventory status
    lowInventoryEvents: data?.assignedEvents.filter(event => 
      event.inventory.totalAvailable <= event.inventory.criticalLowThreshold
    ) || [],
    
    // Performance indicators
    isTopPerformer: data ? data.salesMetrics.rankAmongPeers <= 3 : false,
    hasRecentActivity: data ? data.recentActivity.some(activity => 
      Date.now() - activity.timestamp.getTime() < 24 * 60 * 60 * 1000
    ) : false,
    
    // Customer insights
    vipCustomers: data?.customerDatabase.filter(customer => 
      customer.tags.includes('VIP') || customer.totalSpent > 500
    ) || [],
    followUpRequired: data?.customerDatabase.filter(customer => 
      customer.followUpDate && customer.followUpDate <= new Date()
    ) || [],
  };
};

// Hook for managing quick sale form state
export const useQuickSaleForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'agent_processed'>('card');

  const resetForm = useCallback(() => {
    setSelectedEvent('');
    setSelectedTicketType('');
    setQuantity(1);
    setCustomerInfo({ name: '', email: '', phone: '' });
    setNotes('');
    setPaymentMethod('card');
  }, []);

  const openForm = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsOpen(false);
    resetForm();
  }, [resetForm]);

  const createSaleRequest = useCallback((): QuickSaleRequest | null => {
    if (!selectedEvent || !selectedTicketType || !customerInfo.name || !customerInfo.email) {
      return null;
    }

    return {
      eventId: selectedEvent,
      ticketTypeId: selectedTicketType,
      quantity,
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone || undefined
      },
      notes: notes || undefined,
      paymentMethod
    };
  }, [selectedEvent, selectedTicketType, quantity, customerInfo, notes, paymentMethod]);

  return {
    // Form state
    isOpen,
    selectedEvent,
    selectedTicketType,
    quantity,
    customerInfo,
    notes,
    paymentMethod,

    // Form actions
    setSelectedEvent,
    setSelectedTicketType,
    setQuantity,
    setCustomerInfo,
    setNotes,
    setPaymentMethod,
    resetForm,
    openForm,
    closeForm,
    createSaleRequest,

    // Validation
    isValid: selectedEvent && selectedTicketType && customerInfo.name && customerInfo.email,
  };
};

// Hook for managing sales target state
export const useSalesTargets = (agentId: string) => {
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [newTargetValue, setNewTargetValue] = useState<number>(0);

  const startEditing = useCallback((targetId: string, currentValue: number) => {
    setEditingTargetId(targetId);
    setNewTargetValue(currentValue);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingTargetId(null);
    setNewTargetValue(0);
  }, []);

  const saveTarget = useCallback(async (updateFunction: (targetId: string, value: number) => Promise<void>) => {
    if (editingTargetId && newTargetValue > 0) {
      await updateFunction(editingTargetId, newTargetValue);
      setEditingTargetId(null);
      setNewTargetValue(0);
    }
  }, [editingTargetId, newTargetValue]);

  return {
    editingTargetId,
    newTargetValue,
    setNewTargetValue,
    startEditing,
    cancelEditing,
    saveTarget,
    isEditing: editingTargetId !== null,
  };
}; 