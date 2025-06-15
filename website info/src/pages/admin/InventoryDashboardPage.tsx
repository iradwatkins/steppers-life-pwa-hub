// Admin Inventory Dashboard Page
// Created for B-011: Real-time Inventory Management System

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Users, 
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import inventoryService from '@/services/inventoryService';
import {
  InventoryStatus,
  InventoryTransaction,
  InventoryAlert,
  InventoryHold,
  TicketAvailabilityStatus
} from '@/types/inventory';

const InventoryDashboardPage = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('evt987');
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [activeHolds, setActiveHolds] = useState<InventoryHold[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedTransactionFilter, setSelectedTransactionFilter] = useState<string>('all');

  // Mock events for selection
  const mockEvents = [
    { id: 'evt987', name: 'Grand Steppers Ball 2025' },
    { id: 'evt988', name: 'Summer Dance Festival' },
    { id: 'evt989', name: 'Holiday Gala 2025' }
  ];

  // Load inventory data
  const loadInventoryData = async () => {
    setIsLoading(true);
    try {
      const status = inventoryService.getInventoryStatus(selectedEventId);
      const allTransactions = inventoryService.getTransactions(selectedEventId);
      const allAlerts = inventoryService.getAlerts(selectedEventId);
      
      setInventoryStatus(status);
      setTransactions(allTransactions);
      setAlerts(allAlerts);
      setActiveHolds(status.activeHolds);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time updates
  useEffect(() => {
    loadInventoryData();

    const inventoryListener = (event: string, data: any) => {
      if (event === 'inventory-updated' && data.inventory.eventId === selectedEventId) {
        loadInventoryData();
      } else if (event === 'alert-created' && data.alert.eventId === selectedEventId) {
        setAlerts(prev => [data.alert, ...prev]);
      }
    };

    inventoryService.addEventListener(inventoryListener);

    // Set up auto-refresh
    const interval = setInterval(loadInventoryData, 30000); // Refresh every 30 seconds
    setRefreshInterval(interval);

    return () => {
      inventoryService.removeEventListener(inventoryListener);
      if (interval) clearInterval(interval);
    };
  }, [selectedEventId]);

  // Get status color for badges
  const getStatusBadgeVariant = (status: TicketAvailabilityStatus['status']) => {
    switch (status) {
      case 'sold-out': return 'destructive';
      case 'critical-stock': return 'destructive';
      case 'low-stock': return 'secondary';
      default: return 'default';
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    if (selectedTransactionFilter === 'all') return true;
    return txn.transactionType === selectedTransactionFilter;
  });

  // Handle manual inventory adjustment
  const handleInventoryAdjustment = async (ticketTypeId: string, adjustment: number, reason: string) => {
    try {
      if (adjustment > 0) {
        // Increase inventory (admin adjustment)
        const request = {
          eventId: selectedEventId,
          ticketTypeId,
          requestType: 'refund' as const,
          quantity: adjustment,
          userId: 'admin-user',
          reason: `Admin adjustment: ${reason}`
        };
        
        // This would be handled by an admin-specific endpoint in real implementation
        console.log('Admin inventory adjustment:', request);
        alert('Inventory adjustment logged (demo mode)');
      }
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      alert('Error adjusting inventory');
    }
  };

  // Export audit trail
  const exportAuditTrail = () => {
    const csvContent = transactions.map(txn => 
      `${txn.createdAt.toISOString()},${txn.transactionType},${txn.ticketTypeId},${txn.quantity},${txn.previousAvailable},${txn.newAvailable},${txn.reason || ''}`
    ).join('\n');
    
    const header = 'Timestamp,Type,Ticket Type,Quantity,Previous Available,New Available,Reason\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-audit-${selectedEventId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Inventory Dashboard</h1>
            <p className="text-text-secondary">Real-time inventory monitoring and management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                {mockEvents.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={loadInventoryData} disabled={isLoading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {inventoryStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryStatus.totalTickets}</div>
                <p className="text-xs text-muted-foreground">Across all ticket types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sold</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{inventoryStatus.totalSold}</div>
                <p className="text-xs text-muted-foreground">
                  {((inventoryStatus.totalSold / inventoryStatus.totalTickets) * 100).toFixed(1)}% sold
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{inventoryStatus.totalHeld}</div>
                <p className="text-xs text-muted-foreground">{activeHolds.length} active holds</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{inventoryStatus.totalAvailable}</div>
                <p className="text-xs text-muted-foreground">Ready for purchase</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ticket Type Breakdown */}
        {inventoryStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Ticket Type Inventory</CardTitle>
              <CardDescription>Real-time availability by ticket type</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Held</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryStatus.ticketTypes.map(ticket => {
                    const status = inventoryService.getTicketAvailabilityStatus(selectedEventId, ticket.ticketTypeId);
                    return (
                      <TableRow key={ticket.ticketTypeId}>
                        <TableCell className="font-medium">{ticket.ticketTypeName}</TableCell>
                        <TableCell>{ticket.totalQuantity}</TableCell>
                        <TableCell>{ticket.soldQuantity}</TableCell>
                        <TableCell>{ticket.heldQuantity}</TableCell>
                        <TableCell>{ticket.availableQuantity}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(status.status)}>
                            {status.status.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const adjustment = prompt('Enter inventory adjustment (+/- quantity):');
                              const reason = prompt('Reason for adjustment:');
                              if (adjustment && reason) {
                                handleInventoryAdjustment(ticket.ticketTypeId, parseInt(adjustment), reason);
                              }
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Active Holds */}
        {activeHolds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Holds ({activeHolds.length})</CardTitle>
              <CardDescription>Tickets currently held for checkout</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hold ID</TableHead>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeHolds.map(hold => (
                    <TableRow key={hold.id}>
                      <TableCell className="font-mono text-sm">{hold.id.substring(0, 12)}...</TableCell>
                      <TableCell>{hold.ticketTypeId}</TableCell>
                      <TableCell>{hold.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{hold.holdType}</Badge>
                      </TableCell>
                      <TableCell>{hold.createdAt.toLocaleString()}</TableCell>
                      <TableCell>{hold.expiresAt.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Release this hold?')) {
                              inventoryService.releaseHold(hold.id, 'Admin manual release');
                            }
                          }}
                        >
                          Release
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Recent inventory alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 10).map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${
                    alert.severity === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                    alert.severity === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                    alert.severity === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                    'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <span>{alert.message}</span>
                      </div>
                      <span className="text-xs opacity-75">{alert.timestamp.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Audit Trail</span>
              <div className="flex items-center space-x-2">
                <Select value={selectedTransactionFilter} onValueChange={setSelectedTransactionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="purchase">Purchases</SelectItem>
                    <SelectItem value="hold-create">Hold Created</SelectItem>
                    <SelectItem value="hold-release">Hold Released</SelectItem>
                    <SelectItem value="refund">Refunds</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportAuditTrail} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardTitle>
            <CardDescription>Complete transaction history and audit log</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Before/After</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, 50).map(txn => (
                  <TableRow key={txn.id}>
                    <TableCell className="text-sm">{txn.createdAt.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{txn.transactionType}</Badge>
                    </TableCell>
                    <TableCell>{txn.ticketTypeId}</TableCell>
                    <TableCell>{txn.quantity}</TableCell>
                    <TableCell className="text-sm">
                      {txn.previousAvailable} → {txn.newAvailable}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{txn.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryDashboardPage; 