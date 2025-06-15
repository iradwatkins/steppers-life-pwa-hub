import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialReport } from '@/services/financialReportsService';

interface CashFlowSectionProps {
  report: FinancialReport;
}

export const CashFlowSection: React.FC<CashFlowSectionProps> = ({ report }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Analysis</CardTitle>
        <CardDescription>Cash flow projections and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Cash flow analysis will be displayed here.</p>
      </CardContent>
    </Card>
  );
}; 