import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialReport } from '@/services/financialReportsService';

interface ProfitLossSectionProps {
  report: FinancialReport;
}

export const ProfitLossSection: React.FC<ProfitLossSectionProps> = ({ report }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit & Loss Statement</CardTitle>
        <CardDescription>Comprehensive P&L analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Gross Revenue:</span>
            <span className="font-bold">{formatCurrency(report.profitLoss.grossRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Net Revenue:</span>
            <span className="font-bold">{formatCurrency(report.profitLoss.netRevenue)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Expenses:</span>
            <span className="font-bold text-red-600">{formatCurrency(report.profitLoss.totalExpenses)}</span>
          </div>
          <div className="flex justify-between text-lg border-t pt-2">
            <span>Net Profit:</span>
            <span className={`font-bold ${report.profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(report.profitLoss.netProfit)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Profit Margin:</span>
            <span className="font-bold">{report.profitLoss.profitMargin.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 