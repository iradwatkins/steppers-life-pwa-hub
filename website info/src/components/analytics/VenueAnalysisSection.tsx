import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, MapPin, Star, TrendingUp } from 'lucide-react';
import { VenuePerformanceData } from '@/services/comparativeAnalyticsService';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface VenueAnalysisSectionProps {
  venuePerformanceData: VenuePerformanceData[];
  loading: boolean;
}

const VenueAnalysisSection: React.FC<VenueAnalysisSectionProps> = ({
  venuePerformanceData,
  loading,
}) => {
  if (loading) {
    return <Card className="p-8 text-center">Loading Venue Analysis...</Card>;
  }

  if (!venuePerformanceData.length) {
    return <Card className="p-8 text-center">No venue analysis data available. Select events to analyze or add venue data.</Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Venue Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {venuePerformanceData.map((venue, index) => (
              <Card key={index} className="p-4">
                <h3 className="text-lg font-semibold mb-2">{venue.venueName}</h3>
                <p className="text-sm text-muted-foreground">Total Events Hosted: <span className="font-bold text-foreground">{venue.totalEventsHosted}</span></p>
                <p className="text-sm text-muted-foreground">Avg Attendance: <span className="font-bold text-foreground">{venue.avgAttendancePerEvent}</span></p>
                <p className="text-sm text-muted-foreground">Avg Revenue per Event: <span className="font-bold text-foreground">${venue.avgRevenuePerEvent.toFixed(2)}</span></p>
                <p className="text-sm text-muted-foreground">Utilization Rate: <span className="font-bold text-foreground">{venue.utilizationRate}%</span></p>
                <p className="text-sm text-muted-foreground">Satisfaction Score: <span className="font-bold text-foreground flex items-center">{venue.attendeeSatisfactionScore} <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" /></span></p>
                <p className="text-sm text-muted-foreground">Efficiency Score: <span className="font-bold text-foreground">{venue.operationalEfficiencyScore}%</span></p>
                <p className="text-sm text-muted-foreground">Recommended Events: <span className="font-bold text-foreground">{venue.recommendedEventTypes.join(', ')}</span></p>
              </Card>
            ))}
          </div>
          
          <h3 className="text-xl font-semibold mb-4">Venue Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={venuePerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="venueName" />
              <YAxis label={{ value: 'Metrics', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number, name: string) => {
                  if (name === 'utilizationRate' || name === 'operationalEfficiencyScore') return [`${value.toFixed(1)}%`, name];
                  if (name === 'avgRevenuePerEvent') return [`$${value.toFixed(2)}`, name];
                  return [value.toLocaleString(), name];
              }} />
              <Legend />
              <Bar dataKey="totalEventsHosted" fill="#8884d8" name="Events Hosted" />
              <Bar dataKey="avgAttendancePerEvent" fill="#82ca9d" name="Avg. Attendance" />
              <Bar dataKey="avgRevenuePerEvent" fill="#ffc658" name="Avg. Revenue" />
              <Bar dataKey="utilizationRate" fill="#fd6b4a" name="Utilization Rate" />
              <Bar dataKey="attendeeSatisfactionScore" fill="#a4c8f0" name="Satisfaction Score (1-5)" />
              <Bar dataKey="operationalEfficiencyScore" fill="#c058c0" name="Efficiency Score %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default VenueAnalysisSection; 