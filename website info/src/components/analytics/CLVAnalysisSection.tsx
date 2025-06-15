import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerLifetimeValue, BehavioralData } from '@/services/customerAnalyticsService';

interface CLVAnalysisSectionProps {
  clvData: CustomerLifetimeValue[];
  behavioralData: BehavioralData[];
}

export function CLVAnalysisSection({ clvData, behavioralData }: CLVAnalysisSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Lifetime Value Analysis</CardTitle>
        <CardDescription>CLV insights and value segmentation coming soon</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          This section will contain CLV analysis including value segments, 
          predicted lifetime value, and value-based customer ranking.
        </p>
      </CardContent>
    </Card>
  );
} 