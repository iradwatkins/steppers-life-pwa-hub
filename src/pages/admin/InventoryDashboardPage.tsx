import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Download,
  TrendingUp,
  Users,
  Timer,
  Database,
  Activity,
  Search,
  Filter
} from 'lucide-react';
import { InventoryService } from '@/services/inventoryService';
import type { 
  TicketInventory, 
  InventoryHold, 
  InventoryStatusSummary,
  InventoryAuditEntry,
  PurchaseChannel 
} from '@/types/inventory';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const InventoryDashboardPage = () => {
  const { toast } = useToast();
  const [inventoryService] = useState(() => InventoryService.getInstance());
  const [inventoryData, setInventoryData] = useState<TicketInventory[]>([]);
  const [activeHolds, setActiveHolds] = useState<InventoryHold[]>([]);
  const [auditLog, setAuditLog] = useState<InventoryAuditEntry[]>([]);
  const [statusSummary, setStatusSummary] = useState<InventoryStatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<PurchaseChannel | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const unsubscribe = inventoryService.addUpdateListener((event) => {
      // Refresh data when inventory changes
      loadDashboardData();
      
      toast({
        title: "Inventory Updated",
        description: `${event.type} for ${event.ticketTypeId}`,
        duration: 3000,
      });
    });

    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all inventory data
      const [inventory, holds, audit, summary] = await Promise.all([
        inventoryService.getAllInventory(),
        inventoryService.getActiveHolds(),
        inventoryService.getAuditLog(),
        inventoryService.getInventoryStatusSummary()
      ]);

      setInventoryData(inventory);
      setActiveHolds(holds);
      setAuditLog(audit);
      setStatusSummary(summary);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkRelease = async (eventId?: string) => {
    try {
      if (eventId) {
        await inventoryService.releaseEventHolds(eventId);
        toast({
          title: "Success",
          description: `Released all holds for event ${eventId}`,
        });
      } else {
        await inventoryService.releaseExpiredHolds();
        toast({
          title: "Success",
          description: "Released all expired holds",
        });
      }
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to release holds",
        variant: "destructive",
      });
    }
  };

  const handleManualAdjustment = async (ticketTypeId: string, adjustment: number) => {
    try {
      await inventoryService.adjustInventory(ticketTypeId, adjustment, 'manual_adjustment');
      toast({
        title: "Success",
        description: `Adjusted inventory by ${adjustment}`,
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to adjust inventory",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (inventory: TicketInventory) => {
    const availablePercent = (inventory.availableQuantity / inventory.totalQuantity) * 100;
    if (availablePercent === 0) return 'destructive';
    if (availablePercent < 10) return 'destructive';
    if (availablePercent < 25) return 'secondary';
    return 'default';
  };

  const getStatusIcon = (inventory: TicketInventory) => {
    const availablePercent = (inventory.availableQuantity / inventory.totalQuantity) * 100;
    if (availablePercent === 0) return <AlertTriangle className="h-4 w-4" />;
    if (availablePercent < 25) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.ticketTypeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.eventId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEvent = selectedEvent === 'all' || item.eventId === selectedEvent;
    return matchesSearch && matchesEvent;
  });

  const filteredHolds = activeHolds.filter(hold => {
    const matchesChannel = filterChannel === 'all' || hold.channel === filterChannel;
    const matchesEvent = selectedEvent === 'all' || hold.eventId === selectedEvent;
    return matchesChannel && matchesEvent;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
          <p className="text-muted-foreground">Real-time inventory management and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleBulkRelease()} variant="outline">
            <Timer className="h-4 w-4 mr-2" />
            Release Expired
          </Button>
        </div>
      </div>

      {/* Status Summary Cards */}
      {statusSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusSummary.totalEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Holds</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusSummary.activeHolds}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusSummary.lowStockEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold Out Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusSummary.soldOutEvents}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by event or ticket type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event">Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {Array.from(new Set(inventoryData.map(item => item.eventId))).map(eventId => (
                    <SelectItem key={eventId} value={eventId}>{eventId}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select value={filterChannel} onValueChange={(value) => setFilterChannel(value as PurchaseChannel | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          <TabsTrigger value="holds">Active Holds</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Inventory Status</CardTitle>
              <CardDescription>
                Real-time view of ticket availability across all events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInventory.map((inventory) => (
                  <div key={`${inventory.eventId}-${inventory.ticketTypeId}`} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{inventory.eventId}</h3>
                        <p className="text-sm text-muted-foreground">{inventory.ticketTypeId}</p>
                      </div>
                      <Badge variant={getStatusColor(inventory)} className="flex items-center gap-1">
                        {getStatusIcon(inventory)}
                        {inventory.availableQuantity === 0 ? 'Sold Out' : 
                         inventory.availableQuantity < inventory.totalQuantity * 0.25 ? 'Low Stock' : 'Available'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Total</Label>
                        <div className="text-lg font-semibold">{inventory.totalQuantity}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Available</Label>
                        <div className="text-lg font-semibold text-green-600">{inventory.availableQuantity}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Sold</Label>
                        <div className="text-lg font-semibold text-blue-600">{inventory.soldQuantity}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Held</Label>
                        <div className="text-lg font-semibold text-orange-600">{inventory.heldQuantity}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Last updated: {format(inventory.lastUpdated, 'PPp')}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleManualAdjustment(inventory.ticketTypeId, 1)}
                        >
                          +1
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleManualAdjustment(inventory.ticketTypeId, -1)}
                        >
                          -1
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Inventory Holds</CardTitle>
              <CardDescription>
                Current holds on ticket inventory across all channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredHolds.map((hold) => (
                  <div key={hold.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{hold.eventId}</h3>
                        <p className="text-sm text-muted-foreground">{hold.ticketTypeId}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {hold.channel}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          Qty: {hold.quantity}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Created</Label>
                        <div className="text-sm">{format(hold.createdAt, 'PPp')}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Expires</Label>
                        <div className="text-sm">{format(hold.expiresAt, 'PPp')}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Session: {hold.sessionId}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => inventoryService.releaseHold(hold.id)}
                      >
                        Release Hold
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredHolds.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Holds</h3>
                    <p className="text-muted-foreground">
                      No inventory holds are currently active
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Audit Log</CardTitle>
              <CardDescription>
                Complete history of all inventory changes and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLog.slice(0, 50).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b">
                    <div className="flex-1">
                      <div className="font-medium">{entry.action}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.eventId} - {entry.ticketTypeId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{entry.quantity > 0 ? '+' : ''}{entry.quantity}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(entry.timestamp, 'MMM d, HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
                
                {auditLog.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Audit Entries</h3>
                    <p className="text-muted-foreground">
                      No inventory changes have been recorded yet
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryDashboardPage;