import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star, TrendingUp } from 'lucide-react';
import { TeamPerformanceData } from '@/services/comparativeAnalyticsService';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface TeamPerformanceSectionProps {
  teamPerformanceData: TeamPerformanceData[];
  loading: boolean;
}

const TeamPerformanceSection: React.FC<TeamPerformanceSectionProps> = ({
  teamPerformanceData,
  loading,
}) => {
  if (loading) {
    return <Card className="p-8 text-center">Loading Team Performance Analytics...</Card>;
  }

  if (!teamPerformanceData.length) {
    return <Card className="p-8 text-center">No team performance data available. Select events to analyze or add team members.</Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Team Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {teamPerformanceData.map((member, index) => (
              <Card key={index} className="p-4">
                <h3 className="text-lg font-semibold mb-2">{member.name} ({member.role})</h3>
                <p className="text-sm text-muted-foreground">Events Assigned: <span className="font-bold text-foreground">{member.eventsAssigned}</span></p>
                {member.ticketsSold !== undefined && (
                  <p className="text-sm text-muted-foreground">Tickets Sold: <span className="font-bold text-foreground">{member.ticketsSold.toLocaleString()}</span></p>
                )}
                {member.revenueGenerated !== undefined && (
                  <p className="text-sm text-muted-foreground">Revenue Generated: <span className="font-bold text-foreground">${member.revenueGenerated.toFixed(2)}</span></p>
                )}
                {member.checkInsProcessed !== undefined && (
                  <p className="text-sm text-muted-foreground">Check-ins Processed: <span className="font-bold text-foreground">{member.checkInsProcessed.toLocaleString()}</span></p>
                )}
                <p className="text-sm text-muted-foreground">Avg. Rating: <span className="font-bold text-foreground flex items-center">{member.avgRating} <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" /></span></p>
                <p className="text-sm text-muted-foreground">Efficiency Score: <span className="font-bold text-foreground">{member.efficiencyScore}%</span></p>
                <p className="text-sm text-muted-foreground">Incidents Reported: <span className="font-bold text-foreground">{member.incidentsReported}</span></p>
                <p className="text-sm text-muted-foreground mt-2">Recommendations: <span className="font-bold text-foreground">{member.recommendations.join(', ')}</span></p>
              </Card>
            ))}
          </div>

          <h3 className="text-xl font-semibold mb-4">Team Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="efficiency" orientation="left" label={{ value: 'Efficiency Score %', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
              <YAxis yAxisId="rating" orientation="right" label={{ value: 'Rating (1-5)', angle: 90, position: 'insideRight' }} domain={[0, 5]} />
              <Tooltip formatter={(value: number, name: string) => {
                  if (name === 'Efficiency Score') return [`${value.toFixed(1)}%`, name];
                  if (name === 'Avg. Rating') return [`${value.toFixed(1)} / 5`, name];
                  return [value.toLocaleString(), name];
              }} />
              <Legend />
              <Bar yAxisId="efficiency" dataKey="efficiencyScore" fill="#8884d8" name="Efficiency Score" />
              <Bar yAxisId="rating" dataKey="avgRating" fill="#82ca9d" name="Avg. Rating" />
              {/* Optionally add more bars for ticketsSold, revenueGenerated, checkInsProcessed */}
              {teamPerformanceData.some(d => d.ticketsSold !== undefined) && <Bar dataKey="ticketsSold" fill="#ffc658" name="Tickets Sold" />} 
              {teamPerformanceData.some(d => d.revenueGenerated !== undefined) && <Bar dataKey="revenueGenerated" fill="#fd6b4a" name="Revenue Generated" />} 
              {teamPerformanceData.some(d => d.checkInsProcessed !== undefined) && <Bar dataKey="checkInsProcessed" fill="#a4c8f0" name="Check-ins Processed" />} 
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPerformanceSection; 