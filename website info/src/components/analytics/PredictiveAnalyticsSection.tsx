import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, TrendingUp, Target, DollarSign, BrainCircuit, AlertTriangle } from 'lucide-react';
import { PredictiveAnalyticsData } from '@/services/comparativeAnalyticsService';
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area
} from 'recharts';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PredictiveAnalyticsSectionProps {
  predictiveAnalyticsData: PredictiveAnalyticsData[];
  loading: boolean;
  selectedEventIds: string[];
}

const PredictiveAnalyticsSection: React.FC<PredictiveAnalyticsSectionProps> = ({
  predictiveAnalyticsData,
  loading,
  selectedEventIds
}) => {
  if (loading) {
    return <Card className="p-8 text-center">Loading Predictive Analytics...</Card>;
  }

  if (!predictiveAnalyticsData.length) {
    return <Card className="p-8 text-center">No predictive analytics data available for selected events. Please select events to generate forecasts.</Card>;
  }

  return (
    <div className="space-y-6">
      {predictiveAnalyticsData.map((data, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" /> Predictive Analytics for {data.eventName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-sm font-medium text-muted-foreground">Predicted Attendance</p>
                <p className="text-2xl font-bold text-foreground">{data.predictedAttendance.toLocaleString()}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm font-medium text-muted-foreground">Forecasted Revenue</p>
                <p className="text-2xl font-bold text-foreground">${data.forecastedRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Confidence: ${data.confidenceInterval.lower.toLocaleString()} - ${data.confidenceInterval.upper.toLocaleString()}</p>
              </Card>
            </div>

            <h3 className="text-xl font-semibold mb-4">Forecasted Ticket Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.forecastedTicketSales} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Sales', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>

            {data.riskFactors && data.riskFactors.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2 flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-red-500" /> Potential Risk Factors:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {data.riskFactors.map((risk, i) => <li key={i}>{risk}</li>)}
                </ul>
              </div>
            )}

            {data.optimizationRecommendations && data.optimizationRecommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-1"><TrendingUp className="h-4 w-4 text-green-500" /> Optimization Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {data.optimizationRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
              </div>
            )}

            {data.historicalPatterns && data.historicalPatterns.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 flex items-center gap-1">Historical Patterns:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {data.historicalPatterns.map((pattern, i) => <li key={i}>{pattern}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PredictiveAnalyticsSection; 