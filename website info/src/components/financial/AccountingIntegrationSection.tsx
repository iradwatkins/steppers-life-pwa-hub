import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialReport } from '@/services/financialReportsService';

interface AccountingIntegrationSectionProps {
  report: FinancialReport;
  onSyncQuickBooks: () => void;
  onSyncXero: () => void;
  syncing: boolean;
}

export const AccountingIntegrationSection: React.FC<AccountingIntegrationSectionProps> = ({ 
  report, 
  onSyncQuickBooks, 
  onSyncXero, 
  syncing 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounting Integration</CardTitle>
        <CardDescription>Sync status and transaction data</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Accounting integration status will be displayed here.</p>
      </CardContent>
    </Card>
  );
}; 