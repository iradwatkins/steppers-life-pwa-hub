import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Target, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FinancialReport } from '@/services/financialReportsService';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface FinancialOverviewSectionProps {
  report: FinancialReport;
}

export const FinancialOverviewSection: React.FC<FinancialOverviewSectionProps> = ({ report }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Prepare chart data
  const revenueVsExpensesData = [
    {
      name: 'Revenue vs Expenses',
      revenue: report.summary.totalRevenue,
      expenses: report.summary.totalExpenses,
      profit: report.summary.netProfit,
    }
  ];

  const expensePieData = report.expenses.map(expense => ({
    name: expense.name,
    value: expense.amount,
    percentage: expense.percentage,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const profitMarginStatus = () => {
    const margin = report.summary.profitMargin;
    if (margin >= 20) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle };
    if (margin >= 10) return { status: 'good', color: 'text-blue-600', icon: TrendingUp };
    if (margin >= 0) return { status: 'marginal', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'loss', color: 'text-red-600', icon: TrendingDown };
  };

  const getProfitMarginBadge = () => {
    const { status, color } = profitMarginStatus();
    const variants: Record<string, any> = {
      excellent: 'default',
      good: 'secondary',
      marginal: 'outline',
      loss: 'destructive',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Key Insights Alert */}
      {report.summary.keyInsights.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Key Insights:</strong> {report.summary.keyInsights[0]}
          </AlertDescription>
        </Alert>
      )}

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Overall financial performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueVsExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
                <Bar dataKey="profit" fill="#00C49F" name="Net Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Breakdown of expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profit Margin */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold">{formatPercentage(report.summary.profitMargin)}</p>
                {getProfitMarginBadge()}
              </div>
              <DollarSign className={`h-8 w-8 ${profitMarginStatus().color}`} />
            </div>
          </CardContent>
        </Card>

        {/* Total Attendees (from commissions data) */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sales Agents</p>
                <p className="text-2xl font-bold">{report.commissions.salesAgents.length}</p>
                <p className="text-sm text-gray-600">Active agents</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Revenue per Ticket */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Revenue/Ticket</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    report.summary.totalRevenue / 
                    report.revenueBreakdown.ticketTypeRevenue.reduce((sum, type) => sum + type.quantity, 0)
                  )}
                </p>
                <p className="text-sm text-gray-600">Per ticket sold</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Days to Event */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Report Period</p>
                <p className="text-2xl font-bold">
                  {Math.ceil((report.reportPeriod.end.getTime() - report.reportPeriod.start.getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-sm text-gray-600">Days covered</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Indicators</CardTitle>
          <CardDescription>Key metrics to monitor your event's financial performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cash Flow Health */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cash Flow Health</span>
              <span className="text-sm text-gray-600">
                {formatCurrency(report.cashFlow.currentCashFlow)} available
              </span>
            </div>
            <Progress 
              value={Math.min((report.cashFlow.currentCashFlow / report.summary.totalRevenue) * 100, 100)} 
              className="h-2" 
            />
            <p className="text-xs text-gray-600">
              {((report.cashFlow.currentCashFlow / report.summary.totalRevenue) * 100).toFixed(1)}% of total revenue
            </p>
          </div>

          {/* Revenue Growth Projection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Revenue Growth (Next Month)</span>
              <span className="text-sm text-gray-600">
                {formatCurrency(report.forecast.nextMonth.projectedRevenue)}
              </span>
            </div>
            <Progress 
              value={Math.min(((report.forecast.nextMonth.projectedRevenue / report.summary.totalRevenue) - 1) * 100 + 50, 100)} 
              className="h-2" 
            />
            <p className="text-xs text-gray-600">
              {((report.forecast.nextMonth.projectedRevenue / report.summary.totalRevenue - 1) * 100).toFixed(1)}% projected growth
            </p>
          </div>

          {/* Commission Obligations */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Commission Obligations</span>
              <span className="text-sm text-gray-600">
                {formatCurrency(report.commissions.totalCommissions.owed)} owed
              </span>
            </div>
            <Progress 
              value={(report.commissions.totalCommissions.owed / report.commissions.totalCommissions.earned) * 100} 
              className="h-2" 
            />
            <p className="text-xs text-gray-600">
              {((report.commissions.totalCommissions.owed / report.commissions.totalCommissions.earned) * 100).toFixed(1)}% of total earned commissions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      {report.summary.actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>Priority items to improve financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.summary.actionItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-800">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Insights */}
      {report.summary.keyInsights.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Insights</CardTitle>
            <CardDescription>Further analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.summary.keyInsights.slice(1).map((insight, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 