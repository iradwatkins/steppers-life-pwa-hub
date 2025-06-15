import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, DollarSign, Percent, LineChart } from 'lucide-react';
import { PricingAnalyticsData } from '@/services/comparativeAnalyticsService';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line
} from 'recharts';

interface PricingAnalyticsSectionProps {
  pricingAnalyticsData: PricingAnalyticsData[];
  loading: boolean;
}

const PricingAnalyticsSection: React.FC<PricingAnalyticsSectionProps> = ({
  pricingAnalyticsData,
  loading,
}) => {
  if (loading) {
    return <Card className="p-8 text-center">Loading Pricing Analytics...</Card>;
  }

  if (!pricingAnalyticsData.length) {
    return <Card className="p-8 text-center">No pricing analytics data available. Select events to analyze.</Card>;
  }

  const competitivePricingChartData = pricingAnalyticsData.flatMap(eventData =>
    eventData.competitivePricing.map(comp => ({ 
      name: `${eventData.eventName} - ${comp.competitor}`,
      'Competitor Price': comp.avgPrice
    }))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Pricing Strategy Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pricingAnalyticsData.length > 0 ? (
            <div className="space-y-4">
              {pricingAnalyticsData.map((data, index) => (
                <div key={index} className="mb-6 p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">{data.eventName}</h3>
                  <p className="text-sm text-muted-foreground">Strategy: <span className="font-bold text-foreground">{data.pricingStrategy}</span></p>
                  <p className="text-sm text-muted-foreground">Avg Ticket Price: <span className="font-bold text-foreground">${data.avgTicketPrice.toFixed(2)}</span></p>
                  <p className="text-sm text-muted-foreground">Tickets Sold at Avg Price: <span className="font-bold text-foreground">{data.ticketsSoldAtAvgPrice.toLocaleString()}</span></p>
                  <p className="text-sm text-muted-foreground">Revenue from Pricing: <span className="font-bold text-foreground">${data.revenueFromPricing.toLocaleString()}</span></p>
                  <p className="text-sm text-muted-foreground">Conversion Rate: <span className="font-bold text-foreground">{data.conversionRateAtPrice}%</span></p>
                  <p className="text-sm text-muted-foreground">Price Elasticity: <span className="font-bold text-foreground">{data.priceElasticity}</span></p>
                  
                  <h4 className="font-semibold mt-4 mb-2">Competitive Pricing:</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[{ name: 'Your Price', value: data.avgTicketPrice }, ...data.competitivePricing.map(c => ({ name: c.competitor, value: c.avgPrice }))]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Average Price ($)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" name="Average Price" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-2">Recommendations: <span className="font-bold text-foreground">{data.pricingRecommendations.join(', ')}</span></p>
                </div>
              ))}

              <h3 className="text-xl font-semibold mb-4">Overall Competitive Pricing</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={competitivePricingChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Average Price ($)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Competitor Price" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground">No pricing analytics data available for selected events.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingAnalyticsSection; 