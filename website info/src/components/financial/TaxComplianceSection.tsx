import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialReport } from '@/services/financialReportsService';

interface TaxComplianceSectionProps {
  report: FinancialReport;
}

export const TaxComplianceSection: React.FC<TaxComplianceSectionProps> = ({ report }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Compliance</CardTitle>
        <CardDescription>Tax calculations and compliance status</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Tax compliance information will be displayed here.</p>
      </CardContent>
    </Card>
  );
}; 