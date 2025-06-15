import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerDemographics, SegmentationAnalytics } from '@/services/customerAnalyticsService';

interface DemographicsSectionProps {
  demographics: CustomerDemographics[];
  segmentationAnalytics: SegmentationAnalytics | null;
}

export function DemographicsSection({ demographics, segmentationAnalytics }: DemographicsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Demographics Analysis</CardTitle>
        <CardDescription>Detailed demographic insights coming soon</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          This section will contain detailed demographic analysis including age distribution, 
          location breakdown, income levels, and customer interests.
        </p>
      </CardContent>
    </Card>
  );
} 