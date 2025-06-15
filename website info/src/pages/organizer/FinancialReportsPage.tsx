import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, RefreshCcw, AlertCircle, TrendingUp, DollarSign, PieChart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinancialReports } from '@/hooks/useFinancialReports';
import { FinancialOverviewSection } from '@/components/financial/FinancialOverviewSection';
import { RevenueAnalyticsSection } from '@/components/financial/RevenueAnalyticsSection';
import { ExpenseAnalyticsSection } from '@/components/financial/ExpenseAnalyticsSection';
import { ProfitLossSection } from '@/components/financial/ProfitLossSection';
import { PaymentFeesSection } from '@/components/financial/PaymentFeesSection';
import { ForecastingSection } from '@/components/financial/ForecastingSection';
import { CashFlowSection } from '@/components/financial/CashFlowSection';
import { CommissionsSection } from '@/components/financial/CommissionsSection';
import { TaxComplianceSection } from '@/components/financial/TaxComplianceSection';
import { AccountingIntegrationSection } from '@/components/financial/AccountingIntegrationSection';
import { ExportDialog } from '@/components/financial/ExportDialog';

const FinancialReportsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    report,
    loading,
    error,
    exporting,
    syncing,
    lastUpdated,
    refreshReport,
    exportReport,
    syncWithQuickBooks,
    syncWithXero,
    clearError,
    formatDateRange,
    getCashFlowStatus,
    getRevenueGrowth,
    getProfitTrend,
    formatCurrency,
    formatPercentage,
  } = useFinancialReports(eventId);

  if (!eventId) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No event selected. Please select an event to view financial reports.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleExport = async (config: any) => {
    try {
      const downloadUrl = await exportReport(config);
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `financial-report-${eventId}.${config.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusBadge = () => {
    const cashFlowStatus = getCashFlowStatus();
    const profitTrend = getProfitTrend();
    
    if (cashFlowStatus === 'critical' || profitTrend === 'decreasing') {
      return <Badge variant="destructive">Needs Attention</Badge>;
    }
    if (cashFlowStatus === 'warning') {
      return <Badge variant="secondary">Monitor</Badge>;
    }
    return <Badge variant="default">Healthy</Badge>;
  };

  const getQuickStats = () => {
    if (!report) return null;
    
    const revenueGrowth = getRevenueGrowth();
    
    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(report.summary.totalRevenue),
        change: revenueGrowth ? `${formatPercentage(revenueGrowth)} projected growth` : undefined,
        icon: DollarSign,
        trend: revenueGrowth && revenueGrowth > 0 ? 'up' : revenueGrowth && revenueGrowth < 0 ? 'down' : 'stable'
      },
      {
        title: 'Net Profit',
        value: formatCurrency(report.summary.netProfit),
        change: `${formatPercentage(report.summary.profitMargin)} margin`,
        icon: TrendingUp,
        trend: getProfitTrend() === 'increasing' ? 'up' : getProfitTrend() === 'decreasing' ? 'down' : 'stable'
      },
      {
        title: 'Cash Flow',
        value: formatCurrency(report.cashFlow.currentCashFlow),
        change: getCashFlowStatus(),
        icon: PieChart,
        trend: getCashFlowStatus() === 'healthy' ? 'up' : getCashFlowStatus() === 'critical' ? 'down' : 'stable'
      }
    ];
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/organizer/events')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-gray-600">
              Comprehensive financial analytics and reporting
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Report Info */}
      {report && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Report Period: {formatDateRange()}</span>
                </CardTitle>
                <CardDescription>
                  {lastUpdated && `Last updated: ${lastUpdated.toLocaleString()}`}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshReport}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportDialog(true)}
                  disabled={exporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncWithQuickBooks}
                  disabled={syncing}
                >
                  <RefreshCcw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && !report && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            <p className="text-gray-600">Loading financial report...</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {report && getQuickStats() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getQuickStats()?.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && (
                      <p className={`text-sm ${
                        stat.trend === 'up' ? 'text-green-600' :
                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <stat.icon className={`h-8 w-8 ${
                    stat.trend === 'up' ? 'text-green-600' :
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      {report && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs px-2 py-2">Overview</TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs px-2 py-2">Revenue</TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs px-2 py-2">Expenses</TabsTrigger>
            <TabsTrigger value="profitloss" className="text-xs px-2 py-2">P&L</TabsTrigger>
            <TabsTrigger value="fees" className="text-xs px-2 py-2">Fees</TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs px-2 py-2">Forecast</TabsTrigger>
            <TabsTrigger value="cashflow" className="text-xs px-2 py-2">Cash Flow</TabsTrigger>
            <TabsTrigger value="commissions" className="text-xs px-2 py-2">Commissions</TabsTrigger>
            <TabsTrigger value="tax" className="text-xs px-2 py-2">Tax</TabsTrigger>
            <TabsTrigger value="accounting" className="text-xs px-2 py-2">Accounting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FinancialOverviewSection report={report} />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueAnalyticsSection report={report} />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <ExpenseAnalyticsSection report={report} />
          </TabsContent>

          <TabsContent value="profitloss" className="space-y-6">
            <ProfitLossSection report={report} />
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <PaymentFeesSection report={report} />
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <ForecastingSection report={report} />
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-6">
            <CashFlowSection report={report} />
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <CommissionsSection report={report} />
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            <TaxComplianceSection report={report} />
          </TabsContent>

          <TabsContent value="accounting" className="space-y-6">
            <AccountingIntegrationSection 
              report={report} 
              onSyncQuickBooks={syncWithQuickBooks}
              onSyncXero={syncWithXero}
              syncing={syncing}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
        exporting={exporting}
      />
    </div>
  );
};

export default FinancialReportsPage; 