import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinancialReporting } from '@/hooks/useFinancialReporting';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  CreditCard,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Target,
  Calculator,
  FileText,
  Calendar,
  Percent
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5A2B'];

const FinancialReportPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const {
    revenueBreakdown,
    paymentMethodAnalytics,
    ticketPricingAnalysis,
    profitLossStatement,
    revenueTrends,
    taxReport,
    financialForecast,
    financialAlerts,
    loading,
    error,
    lastRefresh,
    refreshData,
    exportData,
    acknowledgeAlert,
    forecastMonths,
    setForecastMonths,
    trendDays,
    setTrendDays,
    autoRefresh,
    setAutoRefresh
  } = useFinancialReporting(eventId!);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !revenueBreakdown) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              {error || 'Failed to load financial report data'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profitMargin = revenueBreakdown.totalRevenue > 0 
    ? ((revenueBreakdown.netRevenue / revenueBreakdown.totalRevenue) * 100) 
    : 0;

  const totalFees = revenueBreakdown.platformFees + revenueBreakdown.paymentProcessingFees;

  const revenueGrowth = revenueTrends.length >= 2
    ? revenueTrends[revenueTrends.length - 1].growthRate
    : 0;

  const unacknowledgedAlerts = financialAlerts.filter(alert => !alert.acknowledged);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Financial Report</h1>
            <p className="text-muted-foreground">
              Revenue analytics and financial insights
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh">Auto-refresh</Label>
          </div>
          
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => exportData('csv', 'revenue')}>
                Revenue Report (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('csv', 'pl_statement')}>
                P&L Statement (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportData('csv', 'tax_report')}>
                Tax Report (CSV)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => exportData('csv', 'full_report')}>
                Full Report (CSV)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {lastRefresh && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastRefresh.toLocaleString()}
        </p>
      )}

      {/* Financial Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="space-y-2">
          {unacknowledgedAlerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>{alert.message}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => acknowledgeAlert(financialAlerts.indexOf(alert))}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueBreakdown.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              {Math.abs(revenueGrowth).toFixed(1)}% vs previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueBreakdown.netRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {profitMargin.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Platform + Processing fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueBreakdown.refunds.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {revenueBreakdown.totalRevenue > 0 ? ((revenueBreakdown.refunds / revenueBreakdown.totalRevenue) * 100).toFixed(1) : 0}% of total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="profitloss">P&L</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="taxes">Taxes</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
                <div className="flex gap-2">
                  <Select value={trendDays.toString()} onValueChange={(value) => setTrendDays(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="netRevenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Breakdown</CardTitle>
                <CardDescription>Revenue by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={paymentMethodAnalytics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percentage }) => `${method} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalAmount"
                    >
                      {paymentMethodAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Detailed financial breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Gross Revenue</div>
                  <div className="text-lg font-semibold">${revenueBreakdown.totalRevenue.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Platform Fees</div>
                  <div className="text-lg font-semibold text-red-600">-${revenueBreakdown.platformFees.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Processing Fees</div>
                  <div className="text-lg font-semibold text-red-600">-${revenueBreakdown.paymentProcessingFees.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Taxes</div>
                  <div className="text-lg font-semibold text-red-600">-${revenueBreakdown.taxes.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Refunds</div>
                  <div className="text-lg font-semibold text-red-600">-${revenueBreakdown.refunds.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Discounts</div>
                  <div className="text-lg font-semibold text-red-600">-${revenueBreakdown.discounts.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Net Revenue</div>
                  <div className="text-lg font-semibold text-green-600">${revenueBreakdown.netRevenue.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                  <div className="text-lg font-semibold">{profitMargin.toFixed(1)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Daily transaction count and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="transactions" fill="#8B5CF6" name="Transactions" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Average Order Value */}
            <Card>
              <CardHeader>
                <CardTitle>Average Order Value</CardTitle>
                <CardDescription>AOV trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value.toFixed(2)}`, 'AOV']} />
                    <Line type="monotone" dataKey="averageOrderValue" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Analytics</CardTitle>
              <CardDescription>Detailed breakdown by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Method</th>
                      <th className="text-right p-2">Transactions</th>
                      <th className="text-right p-2">Total Amount</th>
                      <th className="text-right p-2">Avg Amount</th>
                      <th className="text-right p-2">Processing Fees</th>
                      <th className="text-right p-2">Failure Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethodAnalytics.map((method, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 capitalize">{method.method}</td>
                        <td className="text-right p-2">{method.transactionCount}</td>
                        <td className="text-right p-2">${method.totalAmount.toLocaleString()}</td>
                        <td className="text-right p-2">${method.averageAmount.toFixed(2)}</td>
                        <td className="text-right p-2">${method.processingFees.toFixed(2)}</td>
                        <td className="text-right p-2">{method.failureRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitloss" className="space-y-6">
          {profitLossStatement && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profit & Loss Statement</CardTitle>
                  <CardDescription>Financial performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Revenue Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Revenue</h3>
                      <div className="grid grid-cols-2 gap-4 ml-4">
                        <div className="flex justify-between">
                          <span>Ticket Sales</span>
                          <span>${profitLossStatement.revenue.ticketSales.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t">
                          <span>Total Revenue</span>
                          <span>${profitLossStatement.revenue.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Costs Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Costs</h3>
                      <div className="grid grid-cols-2 gap-4 ml-4">
                        <div className="flex justify-between">
                          <span>Venue Costs</span>
                          <span>${profitLossStatement.costs.venueCosts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Marketing Costs</span>
                          <span>${profitLossStatement.costs.marketingCosts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Staff Costs</span>
                          <span>${profitLossStatement.costs.staffCosts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fees</span>
                          <span>${profitLossStatement.costs.platformFees.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Fees</span>
                          <span>${profitLossStatement.costs.paymentFees.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Insurance</span>
                          <span>${profitLossStatement.costs.insurance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equipment</span>
                          <span>${profitLossStatement.costs.equipment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Other</span>
                          <span>${profitLossStatement.costs.other.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t col-span-2">
                          <span>Total Costs</span>
                          <span>${profitLossStatement.costs.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Profit Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Profit</h3>
                      <div className="grid grid-cols-2 gap-4 ml-4">
                        <div className="flex justify-between">
                          <span>Gross Profit</span>
                          <span className={profitLossStatement.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${profitLossStatement.grossProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Net Profit</span>
                          <span className={profitLossStatement.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${profitLossStatement.netProfit.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profit Margin</span>
                          <span className={profitLossStatement.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {profitLossStatement.profitMargin.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: 'Venue', value: profitLossStatement.costs.venueCosts },
                          { name: 'Marketing', value: profitLossStatement.costs.marketingCosts },
                          { name: 'Staff', value: profitLossStatement.costs.staffCosts },
                          { name: 'Platform Fees', value: profitLossStatement.costs.platformFees },
                          { name: 'Payment Fees', value: profitLossStatement.costs.paymentFees },
                          { name: 'Other', value: profitLossStatement.costs.other }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[1,2,3,4,5,6].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Cost']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Pricing Analysis</CardTitle>
              <CardDescription>Pricing optimization insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Ticket Type</th>
                      <th className="text-right p-2">Current Price</th>
                      <th className="text-right p-2">Avg Price</th>
                      <th className="text-right p-2">Sold</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Conversion</th>
                      <th className="text-right p-2">Recommended</th>
                      <th className="text-right p-2">Potential</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketPricingAnalysis.map((ticket, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{ticket.ticketType}</td>
                        <td className="text-right p-2">${ticket.currentPrice.toFixed(2)}</td>
                        <td className="text-right p-2">${ticket.averagePrice.toFixed(2)}</td>
                        <td className="text-right p-2">{ticket.soldCount}</td>
                        <td className="text-right p-2">${ticket.revenuePerType.toLocaleString()}</td>
                        <td className="text-right p-2">{ticket.conversionRate.toFixed(1)}%</td>
                        <td className="text-right p-2">${ticket.recommendedPrice.toFixed(2)}</td>
                        <td className="text-right p-2">
                          <span className={ticket.potentialIncrease >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {ticket.potentialIncrease >= 0 ? '+' : ''}{ticket.potentialIncrease.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Ticket Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ticketPricingAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ticketType" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenuePerType" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ticketPricingAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ticketType" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Conversion Rate']} />
                    <Bar dataKey="conversionRate" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-6">
          {taxReport && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Tax Report</CardTitle>
                  <CardDescription>Tax collected and jurisdictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Total Sales</div>
                      <div className="text-lg font-semibold">${taxReport.totalSales.toLocaleString()}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Taxable Amount</div>
                      <div className="text-lg font-semibold">${taxReport.taxableAmount.toLocaleString()}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Tax Collected</div>
                      <div className="text-lg font-semibold">${taxReport.totalTaxCollected.toLocaleString()}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Tax Rate</div>
                      <div className="text-lg font-semibold">{taxReport.taxRate.toFixed(2)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tax by Jurisdiction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Jurisdiction</th>
                          <th className="text-right p-2">Sales</th>
                          <th className="text-right p-2">Tax Rate</th>
                          <th className="text-right p-2">Tax Collected</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxReport.transactionsByJurisdiction.map((jurisdiction, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{jurisdiction.jurisdiction}</td>
                            <td className="text-right p-2">${jurisdiction.sales.toLocaleString()}</td>
                            <td className="text-right p-2">{jurisdiction.taxRate.toFixed(2)}%</td>
                            <td className="text-right p-2">${jurisdiction.taxCollected.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="forecast" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Financial Forecast</h3>
            <Select value={forecastMonths.toString()} onValueChange={(value) => setForecastMonths(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 month</SelectItem>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue & Profit Forecast</CardTitle>
              <CardDescription>Projected financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={financialForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="projectedRevenue" fill="#8B5CF6" name="Projected Revenue" />
                  <Line type="monotone" dataKey="projectedProfit" stroke="#10B981" name="Projected Profit" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {financialForecast.map((forecast, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Forecast: {new Date(forecast.period).toLocaleDateString()}</span>
                    <Badge variant="outline">{forecast.confidenceLevel}% confidence</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                        <div className="font-semibold">${forecast.projectedRevenue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Costs</div>
                        <div className="font-semibold">${forecast.projectedCosts.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Profit</div>
                        <div className={`font-semibold ${forecast.projectedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${forecast.projectedProfit.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Key Assumptions</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {forecast.assumptions.map((assumption, i) => (
                          <li key={i}>• {assumption}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Risk Factors</div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {forecast.riskFactors.map((risk, i) => (
                          <li key={i}>• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReportPage;