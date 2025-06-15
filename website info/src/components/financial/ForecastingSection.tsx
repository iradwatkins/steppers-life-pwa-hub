import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialReport } from '@/services/financialReportsService';

interface ForecastingSectionProps {
  report: FinancialReport;
}

export const ForecastingSection: React.FC<ForecastingSectionProps> = ({ report }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Forecasting</CardTitle>
        <CardDescription>Future projections and trends</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Financial forecasting will be displayed here.</p>
      </CardContent>
    </Card>
  );
}; 