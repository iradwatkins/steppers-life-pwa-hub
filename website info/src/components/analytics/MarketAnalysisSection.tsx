import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { MarketPositioningData, SeasonalTrendData } from '@/services/comparativeAnalyticsService';
import { 
  ResponsiveContainer, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Line,
  Area,
  Pie,
  PieLabel
} from 'recharts';

interface MarketAnalysisSectionProps {
  marketPositioningData: MarketPositioningData[];
  seasonalTrendData: SeasonalTrendData[];
  loading: boolean;
}

const MarketAnalysisSection: React.FC<MarketAnalysisSectionProps> = ({
  marketPositioningData,
  seasonalTrendData,
  loading,
}) => {
  if (loading) {
    return <Card className="p-8 text-center">Loading Market Analysis...</Card>;
  }

  if (!marketPositioningData.length && !seasonalTrendData.length) {
    return <Card className="p-8 text-center">No market analysis data available. Select events to analyze.</Card>;
  }

  // Prepare market positioning data for charting
  const marketShareChartData = marketPositioningData.map(data => ({
    name: data.eventName,
    'Your Share': data.marketShare,
    'Competitor Avg': data.competitors.reduce((sum, c) => sum + c.marketShare, 0) / data.competitors.length,
  }));

  // Prepare seasonal trend data for charting
  const seasonalRevenueChartData = seasonalTrendData.map(data => ({
    name: `${data.season} ${data.year}`,
    'Total Revenue': data.totalRevenue,
    'Avg Attendance': data.avgAttendance,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" /> Market Positioning
          </CardTitle>
        </CardHeader>
        <CardContent>
          {marketPositioningData.length > 0 ? (
            <div className="space-y-4">
              {marketPositioningData.map((data, index) => (
                <div key={index} className="mb-6 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">{data.eventName}</h3>
                  <p className="text-sm text-muted-foreground">Your Market Share: <span className="font-bold text-foreground">{data.marketShare}%</span></p>
                  <p className="text-sm text-muted-foreground">Average Competitor Price: <span className="font-bold text-foreground">${data.competitorAvgTicketPrice.toFixed(2)}</span></p>
                  <p className="text-sm text-muted-foreground">Your Average Price: <span className="font-bold text-foreground">${data.avgTicketPrice.toFixed(2)}</span></p>
                  <p className="text-sm text-muted-foreground">Market Growth: <span className="font-bold text-foreground">{data.marketGrowth}%</span></p>
                  <p className="text-sm text-muted-foreground">Key Differentiators: <span className="font-bold text-foreground">{data.keyDifferentiators.join(', ')}</span></p>
                  
                  <h4 className="font-semibold mt-4 mb-2">Competitor Breakdown:</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[{ name: 'Your Share', value: data.marketShare }, ...data.competitors.map(c => ({ name: c.name, value: c.marketShare }))]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Market Share %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Market Share" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}

              <h3 className="text-xl font-semibold mb-4">Market Share Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marketShareChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Market Share %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Your Share" fill="#82ca9d" />
                  <Bar dataKey="Competitor Avg" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground">No market positioning data available for selected events.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" /> Seasonal Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seasonalTrendData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={seasonalRevenueChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Attendance', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Total Revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Avg Attendance" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Peak Performance Month: <span className="font-bold text-foreground">{seasonalTrendData[0]?.peakMonth}</span></p>
                <p>Off-Peak Performance Month: <span className="font-bold text-foreground">{seasonalTrendData[0]?.offPeakMonth}</span></p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No seasonal trend data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketAnalysisSection; 