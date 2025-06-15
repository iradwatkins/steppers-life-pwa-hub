import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  DollarSign, 
  Target, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Plus,
  RefreshCw,
  Download,
  MessageSquare,
  Calendar,
  Award,
  CreditCard,
  BarChart3,
  UserPlus,
  Share2
} from 'lucide-react';
import { useSalesAgent, useQuickSaleForm } from '../../hooks/useSalesAgent';
import { QuickSaleDialog } from '../../components/QuickSaleDialog';
import { AddCustomerDialog } from '../../components/AddCustomerDialog';
import { ShareLeadDialog } from '../../components/ShareLeadDialog';
import { ExportReportDialog } from '../../components/ExportReportDialog';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface SalesAgentDashboardPageProps {
  className?: string;
}

const SalesAgentDashboardPage: React.FC<SalesAgentDashboardPageProps> = ({
  className = ""
}) => {
  const navigate = useNavigate();
  
  // Mock agent ID - in real app would come from auth context
  const agentId = 'agent-1';
  
  const {
    data,
    isLoading,
    error,
    isRefreshing,
    isProcessingSale,
    lastUpdated,
    refreshData,
    processQuickSale,
    updateSalesTarget,
    addCustomer,
    shareLeadWithTeam,
    exportSalesReport,
    agentInfo,
    assignedEvents,
    salesMetrics,
    commissionData,
    customerDatabase,
    salesTargets,
    recentActivity,
    teamCollaboration,
    totalCommissionsPending,
    totalCommissionsEarned,
    conversionRate,
    performanceScore,
    activeTargetsCount,
    completedTargetsCount,
    lowInventoryEvents,
    isTopPerformer,
    hasRecentActivity,
    vipCustomers,
    followUpRequired
  } = useSalesAgent(agentId);

  const quickSaleForm = useQuickSaleForm();
  const [showAddCustomer, setShowAddCustomer] = React.useState(false);
  const [showShareLead, setShowShareLead] = React.useState(false);
  const [showExportReport, setShowExportReport] = React.useState(false);

  const handleQuickSale = async () => {
    const saleRequest = quickSaleForm.createSaleRequest();
    if (saleRequest) {
      const result = await processQuickSale(saleRequest);
      if (result) {
        quickSaleForm.closeForm();
      }
    }
  };

  const handleAddCustomer = async (customerData: any) => {
    const result = await addCustomer(customerData);
    if (result) {
      setShowAddCustomer(false);
    }
  };

  const handleShareLead = async (leadData: any) => {
    await shareLeadWithTeam(leadData.customerId, leadData.targetAgentId, leadData.eventId, leadData.notes);
    setShowShareLead(false);
  };

  const handleExportReport = async (format: 'csv' | 'pdf' | 'excel', dateRange: { start: Date; end: Date }) => {
    await exportSalesReport(format, dateRange);
    setShowExportReport(false);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Dashboard</h1>
          <p className="text-gray-600 mb-6">{error || 'Sales agent data not available'}</p>
          <Button onClick={() => refreshData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Sales Agent Dashboard</h1>
              {isTopPerformer && (
                <Badge className="ml-3 bg-yellow-500">
                  <Award className="w-3 h-3 mr-1" />
                  Top Performer
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={quickSaleForm.openForm}>
                <Plus className="w-4 h-4 mr-2" />
                Quick Sale
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agent Info */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{agentInfo?.name}</h2>
                <p className="text-gray-600">{agentInfo?.email}</p>
                <p className="text-sm text-gray-500">Working for {agentInfo?.organizerName}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Performance Rating</div>
                <div className={`text-2xl font-bold ${getPerformanceColor(performanceScore)}`}>
                  {Math.round(performanceScore)}%
                </div>
                <div className="text-sm text-gray-500">Rank #{salesMetrics?.rankAmongPeers}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        {(lowInventoryEvents.length > 0 || followUpRequired.length > 0) && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowInventoryEvents.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-orange-800 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Low Inventory Alert
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-700 mb-2">
                      {lowInventoryEvents.length} event(s) have low ticket inventory
                    </p>
                    <div className="space-y-1">
                      {lowInventoryEvents.slice(0, 2).map(event => (
                        <div key={event.eventId} className="text-sm text-orange-600">
                          {event.eventName}: {event.inventory.totalAvailable} tickets left
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {followUpRequired.length > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-blue-800 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Follow-ups Needed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700 mb-2">
                      {followUpRequired.length} customer(s) need follow-up
                    </p>
                    <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                      View Customers
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesMetrics?.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                {salesMetrics?.salesToday} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCommissionsEarned)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalCommissionsPending)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(conversionRate)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(salesMetrics?.averageOrderValue || 0)} avg. order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTargetsCount}</div>
              <p className="text-xs text-muted-foreground">
                {completedTargetsCount} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="targets">Targets</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Last updated: {lastUpdated?.toLocaleTimeString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1 text-sm">
                          <div className="font-medium">{activity.description}</div>
                          <div className="text-gray-500">
                            {activity.timestamp.toLocaleString()}
                          </div>
                        </div>
                        {activity.amount && (
                          <div className="text-sm font-medium text-green-600">
                            {formatCurrency(activity.amount)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="flex flex-col h-20 space-y-2"
                      onClick={quickSaleForm.openForm}
                      disabled={isProcessingSale}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs">Quick Sale</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-20 space-y-2"
                      onClick={() => setShowAddCustomer(true)}
                    >
                      <UserPlus className="w-5 h-5" />
                      <span className="text-xs">Add Customer</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-20 space-y-2"
                      onClick={() => setShowShareLead(true)}
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-xs">Share Lead</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col h-20 space-y-2"
                      onClick={() => setShowExportReport(true)}
                    >
                      <Download className="w-5 h-5" />
                      <span className="text-xs">Export Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {assignedEvents.map((event) => (
                <Card key={event.eventId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{event.eventName}</CardTitle>
                    <CardDescription>
                      {event.eventDate.toLocaleDateString()} • {event.venue}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Sales Progress</span>
                          <span>{Math.round((event.salesProgress / event.salesTarget) * 100)}%</span>
                        </div>
                        <Progress value={(event.salesProgress / event.salesTarget) * 100} />
                        <div className="text-xs text-gray-500 mt-1">
                          {event.salesProgress} / {event.salesTarget} tickets
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Available</div>
                          <div className="font-medium">{event.inventory.totalAvailable}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Commission</div>
                          <div className="font-medium">{event.commissionRate}%</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {event.ticketTypes.map((ticketType) => (
                          <div key={ticketType.typeId} className="flex justify-between text-sm">
                            <span>{ticketType.name}</span>
                            <span>{formatCurrency(ticketType.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Customer Database</h3>
              <Button onClick={() => setShowAddCustomer(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {customerDatabase.slice(0, 9).map((customer) => (
                <Card key={customer.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{customer.name}</CardTitle>
                    <CardDescription>{customer.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Spent:</span>
                        <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Purchases:</span>
                        <span className="font-medium">{customer.totalPurchases}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Purchase:</span>
                        <span className="font-medium">{customer.lastPurchaseDate.toLocaleDateString()}</span>
                      </div>
                      {customer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {customer.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Earned</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(commissionData?.totalEarned || 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pending Payout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{formatCurrency(commissionData?.pendingPayout || 0)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Next payout: {commissionData?.nextPayoutDate.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(commissionData?.currentPeriodEarnings || 0)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {commissionData?.payoutSchedule} schedule
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commissionData?.commissionHistory.slice(0, 10).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{commission.eventName}</div>
                        <div className="text-sm text-gray-500">
                          {commission.customerName} • {commission.saleDate.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(commission.commissionAmount)}</div>
                        <Badge className={getStatusBadgeColor(commission.status)}>
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="targets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {salesTargets.map((target) => (
                <Card key={target.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {target.eventName}
                      <Badge className={getStatusBadgeColor(target.status)}>
                        {target.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Target: {target.targetValue} {target.targetType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.round((target.currentValue / target.targetValue) * 100)}%</span>
                        </div>
                        <Progress value={(target.currentValue / target.targetValue) * 100} />
                        <div className="text-xs text-gray-500 mt-1">
                          {target.currentValue} / {target.targetValue}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Deadline:</span>
                        <span>{target.endDate.toLocaleDateString()}</span>
                      </div>
                      
                      {target.reward && (
                        <div className="flex justify-between text-sm">
                          <span>Reward:</span>
                          <span className="font-medium text-green-600">{target.reward}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Team Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Team Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamCollaboration?.teamMessages.map((message) => (
                      <div key={message.id} className="border-l-2 border-blue-200 pl-4">
                        <div className="font-medium">{message.from}</div>
                        <div className="text-sm text-gray-600">{message.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {message.timestamp.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Peer Comparisons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Team Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamCollaboration?.peerComparisons.map((peer) => (
                      <div key={peer.agentId} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">#{peer.rank} {peer.agentName}</div>
                          <div className="text-sm text-gray-500">
                            {peer.salesThisMonth} sales • {formatPercentage(peer.conversionRate)} conversion
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(peer.commissionsThisMonth)}</div>
                          <div className="text-xs text-gray-500">commissions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Collaborative Goals */}
            {teamCollaboration?.collaborativeGoals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle>{goal.title}</CardTitle>
                  <CardDescription>{goal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Team Progress</span>
                        <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                      </div>
                      <Progress value={(goal.currentValue / goal.targetValue) * 100} />
                      <div className="text-xs text-gray-500 mt-1">
                        {goal.currentValue} / {goal.targetValue}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Deadline:</span>
                      <span>{goal.deadline.toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Reward:</span>
                      <span className="font-medium text-green-600">{goal.reward}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <QuickSaleDialog
        isOpen={quickSaleForm.isOpen}
        onClose={quickSaleForm.closeForm}
        assignedEvents={assignedEvents}
        form={quickSaleForm}
        onSubmit={handleQuickSale}
        isProcessing={isProcessingSale}
      />

      <AddCustomerDialog
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onSubmit={handleAddCustomer}
      />

      <ShareLeadDialog
        isOpen={showShareLead}
        onClose={() => setShowShareLead(false)}
        onSubmit={handleShareLead}
        customers={customerDatabase}
        events={assignedEvents}
      />

      <ExportReportDialog
        isOpen={showExportReport}
        onClose={() => setShowExportReport(false)}
        onSubmit={handleExportReport}
      />
    </div>
  );
};

export default SalesAgentDashboardPage; 