import React from 'react';
import { TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FinancialReport } from '@/services/financialReportsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface RevenueAnalyticsSectionProps {
  report: FinancialReport;
}

export const RevenueAnalyticsSection: React.FC<RevenueAnalyticsSectionProps> = ({ report }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare chart data
  const ticketTypeData = report.revenueBreakdown.ticketTypeRevenue.map(item => ({
    name: item.ticketType,
    revenue: item.revenue,
    quantity: item.quantity,
    averagePrice: item.averagePrice,
    percentage: item.percentage,
  }));

  const salesChannelData = report.revenueBreakdown.salesChannelRevenue.map(item => ({
    name: item.channel,
    revenue: item.revenue,
    transactions: item.transactions,
    percentage: item.percentage,
  }));

  const pricingTierData = report.revenueBreakdown.pricingTierRevenue.map(item => ({
    name: item.tier,
    revenue: item.revenue,
    quantity: item.quantity,
    averagePrice: item.averagePrice,
  }));

  const totalTickets = report.revenueBreakdown.ticketTypeRevenue.reduce((sum, type) => sum + type.quantity, 0);
  const totalTransactions = report.revenueBreakdown.salesChannelRevenue.reduce((sum, channel) => sum + channel.transactions, 0);

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(report.summary.totalRevenue)}</p>
                <p className="text-sm text-green-600">100% of total</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold">{totalTickets.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Sold to date</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Ticket Price</p>
                <p className="text-2xl font-bold">{formatCurrency(report.summary.totalRevenue / totalTickets)}</p>
                <p className="text-sm text-gray-600">Per ticket</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">All channels</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Ticket Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Ticket Type</CardTitle>
            <CardDescription>Breakdown of revenue by different ticket categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : name === 'quantity' ? 'Quantity' : 'Avg Price'
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                <Bar dataKey="quantity" fill="#00C49F" name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Type Distribution</CardTitle>
            <CardDescription>Percentage breakdown of ticket sales</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {ticketTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sales Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Channel Performance</CardTitle>
          <CardDescription>Revenue and transaction analysis by sales channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesChannelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" tickFormatter={formatCurrency} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : 'Transactions'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#0088FE" name="Revenue" />
                <Bar yAxisId="right" dataKey="transactions" fill="#FF8042" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>

            {/* Channel Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {salesChannelData.map((channel, index) => (
                <Card key={channel.name} className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{channel.name}</h4>
                        <span className="text-sm text-gray-600">{channel.percentage}%</span>
                      </div>
                      <Progress value={channel.percentage} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium">{formatCurrency(channel.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Transactions:</span>
                        <span className="font-medium">{channel.transactions}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg/Transaction:</span>
                        <span className="font-medium">{formatCurrency(channel.revenue / channel.transactions)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tier Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Tier Analysis</CardTitle>
          <CardDescription>Performance analysis across different pricing tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pricingTierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'averagePrice' ? formatCurrency(value) : 
                    name === 'revenue' ? formatCurrency(value) : value.toLocaleString(),
                    name === 'revenue' ? 'Revenue' : 
                    name === 'quantity' ? 'Quantity' : 'Average Price'
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                <Bar dataKey="averagePrice" fill="#FFBB28" name="Average Price" />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingTierData.map((tier, index) => (
                <Card key={tier.name} className="border-l-4" style={{ borderLeftColor: COLORS[index % COLORS.length] }}>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold text-lg mb-3">{tier.name}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium">{formatCurrency(tier.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{tier.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Price:</span>
                        <span className="font-medium">{formatCurrency(tier.averagePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">% of Total:</span>
                        <span className="font-medium">
                          {((tier.revenue / report.summary.totalRevenue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Insights</CardTitle>
          <CardDescription>Key takeaways from revenue analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Top Performers</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">Best Ticket Type:</span>
                  <span className="font-medium">
                    {ticketTypeData.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current).name}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Best Sales Channel:</span>
                  <span className="font-medium">
                    {salesChannelData.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current).name}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm">Best Pricing Tier:</span>
                  <span className="font-medium">
                    {pricingTierData.reduce((prev, current) => (prev.revenue > current.revenue) ? prev : current).name}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Opportunities</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Consider increasing marketing for {ticketTypeData.find(t => t.percentage < 20)?.name || 'lower-performing'} tickets</p>
                <p>• {salesChannelData.find(c => c.name === 'Online')?.percentage || 0 > 80 ? 'Strong online presence' : 'Improve online sales channel'}</p>
                <p>• Average ticket price suggests {report.summary.totalRevenue / totalTickets > 100 ? 'premium' : 'value-oriented'} positioning</p>
                <p>• Transaction volume indicates {totalTransactions > 250 ? 'high' : 'moderate'} customer engagement</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 