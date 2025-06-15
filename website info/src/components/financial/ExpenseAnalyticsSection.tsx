import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialReport } from '@/services/financialReportsService';

interface ExpenseAnalyticsSectionProps {
  report: FinancialReport;
}

export const ExpenseAnalyticsSection: React.FC<ExpenseAnalyticsSectionProps> = ({ report }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Analytics</CardTitle>
          <CardDescription>Detailed breakdown of event expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.expenses.map((expense) => (
              <div key={expense.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{expense.name}</h3>
                  <span className="font-bold">{formatCurrency(expense.amount)}</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {expense.percentage}% of total expenses
                </div>
                <div className="space-y-2">
                  {expense.subcategories.map((sub, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{sub.name}</span>
                      <span>{formatCurrency(sub.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 