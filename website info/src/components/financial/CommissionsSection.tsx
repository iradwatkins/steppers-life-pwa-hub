import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialReport } from '@/services/financialReportsService';

interface CommissionsSectionProps {
  report: FinancialReport;
}

export const CommissionsSection: React.FC<CommissionsSectionProps> = ({ report }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission Tracking</CardTitle>
        <CardDescription>Sales agent and affiliate commissions</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Commission tracking will be displayed here.</p>
      </CardContent>
    </Card>
  );
}; 