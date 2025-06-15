import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DirectUserAd } from '@/types/advertising';
import { Eye, MousePointer, DollarSign, TrendingUp } from 'lucide-react';

interface AdPerformanceCardProps {
  ad: DirectUserAd;
}

export const AdPerformanceCard: React.FC<AdPerformanceCardProps> = ({ ad }) => {
  const performance = ad.performance;

  if (!performance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{ad.title}</CardTitle>
          <CardDescription>No performance data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">
            Performance data will appear once your ad starts running.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{ad.title}</CardTitle>
        <CardDescription>{ad.description || 'No description'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{performance.impressions.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Impressions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MousePointer className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{performance.clicks.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Clicks</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{performance.clickThroughRate.toFixed(2)}%</p>
              <p className="text-sm text-gray-500">CTR</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">${performance.totalRevenue}</p>
              <p className="text-sm text-gray-500">Spent</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 