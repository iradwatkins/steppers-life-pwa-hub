import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  Users,
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  Award,
  Zap,
  Building,
  MapPin,
  Star,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Brain,
  Clock,
  UserCheck,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { TeamPerformanceComparison, ComparisonEvent, VenuePerformance, PredictiveModel } from '@/services/comparativeAnalyticsService';

interface TeamPerformanceAnalysisProps {
  events: ComparisonEvent[];
  teamComparison?: TeamPerformanceComparison;
  onGenerateAnalysis?: () => void;
}

const TeamPerformanceAnalysis: React.FC<TeamPerformanceAnalysisProps> = ({
  events,
  teamComparison,
  onGenerateAnalysis
}) => {
  const [activeTab, setActiveTab] = useState('team-performance');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [analysisType, setAnalysisType] = useState('overview');

  // Mock team performance data
  const mockTeamData: TeamPerformanceComparison = {
    comparison_id: 'team_comp_2024',
    events_compared: [
      {
        event_id: '1',
        staff_configuration: {
          total_staff: 12,
          roles: [
            { role: 'Check-in Staff', count: 4, experience_level: 'mid' },
            { role: 'Security', count: 3, experience_level: 'senior' },
            { role: 'Event Coordinators', count: 2, experience_level: 'senior' },
            { role: 'Technical Support', count: 3, experience_level: 'mid' }
          ]
        },
        performance_metrics: {
          check_in_efficiency: 92,
          customer_service_rating: 4.6,
          incident_count: 2,
          setup_time: 3.5,
          cost_per_staff_hour: 25
        }
      },
      {
        event_id: '2',
        staff_configuration: {
          total_staff: 8,
          roles: [
            { role: 'Check-in Staff', count: 3, experience_level: 'senior' },
            { role: 'Security', count: 2, experience_level: 'mid' },
            { role: 'Event Coordinators', count: 1, experience_level: 'senior' },
            { role: 'Technical Support', count: 2, experience_level: 'junior' }
          ]
        },
        performance_metrics: {
          check_in_efficiency: 88,
          customer_service_rating: 4.8,
          incident_count: 1,
          setup_time: 2.5,
          cost_per_staff_hour: 22
        }
      }
    ],
    insights: {
      optimal_staff_size: 10,
      best_role_distribution: [
        { role: 'Check-in Staff', recommended_count: 3 },
        { role: 'Security', recommended_count: 2 },
        { role: 'Event Coordinators', recommended_count: 2 }
      ],
      performance_drivers: ['Experience level of coordinators', 'Staff-to-attendee ratio', 'Pre-event training'],
      cost_optimization_opportunities: ['Reduce junior staff overtime', 'Cross-train staff for multiple roles']
    }
  };

  // Mock marketing channel data
  const marketingChannelData = [
    { channel: 'Social Media', spend: 1200, conversions: 120, roi: 4.1, cpa: 10.0, reach: 15000 },
    { channel: 'Email Marketing', spend: 400, conversions: 80, roi: 8.2, cpa: 5.0, reach: 5000 },
    { channel: 'Paid Advertising', spend: 900, conversions: 75, roi: 2.8, cpa: 12.0, reach: 25000 },
    { channel: 'Influencer Partnership', spend: 600, conversions: 45, roi: 3.5, cpa: 13.3, reach: 8000 },
    { channel: 'Word of Mouth', spend: 200, conversions: 35, roi: 7.5, cpa: 5.7, reach: 2000 }
  ];

  // Mock venue performance data
  const venuePerformanceData: VenuePerformance[] = [
    {
      venue_id: '1',
      venue_name: 'Chicago Cultural Center',
      location: { city: 'Chicago', state: 'IL', address: '78 E Washington St' },
      events_hosted: 15,
      total_revenue: 185000,
      avg_attendance_rate: 91.5,
      avg_customer_satisfaction: 4.7,
      operational_efficiency: 88,
      cost_effectiveness: 85,
      accessibility_score: 95,
      amenities_score: 92,
      performance_trend: 'improving',
      strengths: ['Excellent accessibility', 'Prime location', 'Professional facilities'],
      weaknesses: ['Limited parking', 'No outdoor space'],
      recommended_improvements: ['Add shuttle service', 'Improve signage']
    },
    {
      venue_id: '2',
      venue_name: 'Millennium Park',
      location: { city: 'Chicago', state: 'IL', address: '201 E Randolph St' },
      events_hosted: 8,
      total_revenue: 95000,
      avg_attendance_rate: 94.2,
      avg_customer_satisfaction: 4.8,
      operational_efficiency: 82,
      cost_effectiveness: 78,
      accessibility_score: 88,
      amenities_score: 85,
      performance_trend: 'stable',
      strengths: ['Beautiful outdoor setting', 'High attendance rates'],
      weaknesses: ['Weather dependent', 'Limited technical infrastructure'],
      recommended_improvements: ['Weather contingency plans', 'Mobile tech solutions']
    }
  ];

  // Mock predictive modeling data
  const predictiveData: PredictiveModel = {
    model_type: 'attendance',
    event_id: 'future_event',
    prediction: {
      value: 285,
      confidence_interval: { lower: 260, upper: 310 },
      confidence_level: 0.85
    },
    factors_considered: [
      { factor: 'Historical attendance patterns', weight: 0.3, impact: 'positive' },
      { factor: 'Marketing spend allocation', weight: 0.25, impact: 'positive' },
      { factor: 'Seasonal trends', weight: 0.2, impact: 'positive' },
      { factor: 'Venue capacity utilization', weight: 0.15, impact: 'positive' },
      { factor: 'Competitive events', weight: 0.1, impact: 'negative' }
    ],
    historical_accuracy: {
      model_version: '2.1.0',
      accuracy_percentage: 87.5,
      last_updated: new Date().toISOString()
    },
    scenario_analysis: [
      { scenario: 'Optimistic: High marketing + good weather', predicted_outcome: 320, probability: 0.25 },
      { scenario: 'Most likely: Standard conditions', predicted_outcome: 285, probability: 0.5 },
      { scenario: 'Conservative: Limited marketing', predicted_outcome: 250, probability: 0.25 }
    ]
  };

  const activeTeamData = teamComparison || mockTeamData;

  // Calculate team efficiency metrics
  const teamEfficiencyData = useMemo(() => {
    return activeTeamData.events_compared.map(eventData => {
      const event = events.find(e => e.id === eventData.event_id);
      return {
        eventName: event?.name || `Event ${eventData.event_id}`,
        staffSize: eventData.staff_configuration.total_staff,
        efficiency: eventData.performance_metrics.check_in_efficiency,
        satisfaction: eventData.performance_metrics.customer_service_rating,
        incidents: eventData.performance_metrics.incident_count,
        setupTime: eventData.performance_metrics.setup_time,
        costPerHour: eventData.performance_metrics.cost_per_staff_hour,
        attendees: event?.tickets_sold || 0,
        staffRatio: event ? (event.tickets_sold / eventData.staff_configuration.total_staff) : 0
      };
    });
  }, [activeTeamData, events]);

  // Staff role distribution data
  const staffRoleData = useMemo(() => {
    const roleDistribution: Record<string, { total: number, junior: number, mid: number, senior: number }> = {};
    
    activeTeamData.events_compared.forEach(eventData => {
      eventData.staff_configuration.roles.forEach(role => {
        if (!roleDistribution[role.role]) {
          roleDistribution[role.role] = { total: 0, junior: 0, mid: 0, senior: 0 };
        }
        roleDistribution[role.role].total += role.count;
        roleDistribution[role.role][role.experience_level] += role.count;
      });
    });

    return Object.entries(roleDistribution).map(([role, data]) => ({
      role,
      ...data
    }));
  }, [activeTeamData]);

  const getPerformanceTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Target className="h-4 w-4 text-blue-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getROIColor = (roi: number) => {
    if (roi >= 5) return 'text-green-600 bg-green-50';
    if (roi >= 3) return 'text-blue-600 bg-blue-50';
    if (roi >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-primary" />
              Advanced Analytics & Team Performance
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {onGenerateAnalysis && (
                <Button variant="outline" onClick={onGenerateAnalysis}>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Analysis
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="team-performance">Team Performance</TabsTrigger>
          <TabsTrigger value="marketing-channels">Marketing Channels</TabsTrigger>
          <TabsTrigger value="venue-roi">Venue ROI</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Models</TabsTrigger>
          <TabsTrigger value="insights">Advanced Insights</TabsTrigger>
        </TabsList>

        {/* Team Performance Tab */}
        <TabsContent value="team-performance" className="space-y-6">
          {/* Team Efficiency Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Team Efficiency Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={teamEfficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="staffRatio" 
                      name="Attendees per Staff"
                      unit=" people"
                    />
                    <YAxis 
                      dataKey="efficiency" 
                      name="Check-in Efficiency"
                      unit="%"
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'Check-in Efficiency' ? `${value}%` : value,
                        name
                      ]}
                    />
                    <Scatter dataKey="efficiency" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Staff Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Role Distribution & Experience Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={staffRoleData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="role" type="category" width={120} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="junior" stackId="a" fill="#EF4444" name="Junior" />
                      <Bar dataKey="mid" stackId="a" fill="#F59E0B" name="Mid-level" />
                      <Bar dataKey="senior" stackId="a" fill="#10B981" name="Senior" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Optimal Staff Configuration</h4>
                  {activeTeamData.insights.best_role_distribution.map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <span className="font-medium">{role.role}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-brand-primary">
                          {role.recommended_count}
                        </span>
                        <span className="text-sm text-muted-foreground">recommended</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800 mb-2">Performance Drivers</div>
                    <ul className="text-sm text-blue-600 space-y-1">
                      {activeTeamData.insights.performance_drivers.map((driver, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          {driver}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Event Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Event Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamEfficiencyData.map((eventData, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground">{eventData.eventName}</h4>
                      <Badge variant="outline">
                        {eventData.staffSize} staff • {eventData.attendees} attendees
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(eventData.efficiency)}`}>
                          {eventData.efficiency}%
                        </div>
                        <div className="text-sm text-muted-foreground">Check-in Efficiency</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(eventData.satisfaction * 20)}`}>
                          {eventData.satisfaction.toFixed(1)}/5.0
                        </div>
                        <div className="text-sm text-muted-foreground">Customer Rating</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-lg font-bold ${eventData.incidents <= 2 ? 'text-green-600' : 'text-red-600'}`}>
                          {eventData.incidents}
                        </div>
                        <div className="text-sm text-muted-foreground">Incidents</div>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-lg font-bold ${eventData.setupTime <= 3 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {eventData.setupTime}h
                        </div>
                        <div className="text-sm text-muted-foreground">Setup Time</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing Channels Tab */}
        <TabsContent value="marketing-channels" className="space-y-6">
          {/* Channel Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing Channel Effectiveness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={marketingChannelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="conversions" fill="#3B82F6" name="Conversions" />
                    <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={3} name="ROI" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Channel Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketingChannelData.map((channel, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">{channel.channel}</h4>
                    <Badge className={getROIColor(channel.roi)}>
                      {channel.roi.toFixed(1)}x ROI
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Spend:</span>
                      <span className="font-medium">${channel.spend.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conversions:</span>
                      <span className="font-medium">{channel.conversions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">CPA:</span>
                      <span className="font-medium">${channel.cpa.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Reach:</span>
                      <span className="font-medium">{channel.reach.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground mb-1">Conversion Rate</div>
                    <Progress value={(channel.conversions / channel.reach) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {((channel.conversions / channel.reach) * 100).toFixed(2)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Channel Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-primary" />
                Channel Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-800">High Performers</span>
                  </div>
                  <p className="text-sm text-green-600">Email Marketing and Word of Mouth show excellent ROI (8.2x and 7.5x). Increase budget allocation to these channels.</p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-yellow-800">Optimization Needed</span>
                  </div>
                  <p className="text-sm text-yellow-600">Paid Advertising has the lowest ROI (2.8x) despite high spend. Consider refining targeting or reducing budget.</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-800">Growth Opportunity</span>
                  </div>
                  <p className="text-sm text-blue-600">Social Media shows good potential with 4.1x ROI and high reach. Consider increasing investment for scale.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Venue ROI Tab */}
        <TabsContent value="venue-roi" className="space-y-6">
          {/* Venue Performance Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {venuePerformanceData.map((venue, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{venue.venue_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{venue.location.city}, {venue.location.state}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPerformanceTrendIcon(venue.performance_trend)}
                      <Badge variant="outline">{venue.performance_trend}</Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded">
                        <div className="text-lg font-bold text-foreground">{venue.events_hosted}</div>
                        <div className="text-sm text-muted-foreground">Events Hosted</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded">
                        <div className="text-lg font-bold text-foreground">
                          ${(venue.total_revenue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Attendance Rate</span>
                          <span className={getScoreColor(venue.avg_attendance_rate)}>
                            {venue.avg_attendance_rate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={venue.avg_attendance_rate} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Customer Satisfaction</span>
                          <span className={getScoreColor(venue.avg_customer_satisfaction * 20)}>
                            {venue.avg_customer_satisfaction.toFixed(1)}/5.0
                          </span>
                        </div>
                        <Progress value={venue.avg_customer_satisfaction * 20} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Operational Efficiency</span>
                          <span className={getScoreColor(venue.operational_efficiency)}>
                            {venue.operational_efficiency}%
                          </span>
                        </div>
                        <Progress value={venue.operational_efficiency} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <h5 className="text-sm font-medium text-green-600 mb-1">Strengths</h5>
                        {venue.strengths.slice(0, 2).map((strength, i) => (
                          <p key={i} className="text-xs text-green-600">• {strength}</p>
                        ))}
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-orange-600 mb-1">Areas for Improvement</h5>
                        {venue.weaknesses.slice(0, 2).map((weakness, i) => (
                          <p key={i} className="text-xs text-orange-600">• {weakness}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Venue ROI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Venue ROI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={venuePerformanceData.map(v => ({
                    name: v.venue_name,
                    roi: (v.total_revenue / v.events_hosted) / 10000, // Simplified ROI calculation
                    satisfaction: v.avg_customer_satisfaction,
                    events: v.events_hosted,
                    efficiency: v.operational_efficiency
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="roi" name="ROI" unit="x" />
                    <YAxis dataKey="satisfaction" name="Customer Satisfaction" domain={[4, 5]} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'Customer Satisfaction' ? `${value}/5.0` : `${value}x`,
                        name
                      ]}
                    />
                    <Scatter dataKey="satisfaction" fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Models Tab */}
        <TabsContent value="predictive" className="space-y-6">
          {/* Prediction Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-brand-primary" />
                Predictive Analytics Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-brand-primary mb-2">
                      {predictiveData.prediction.value}
                    </div>
                    <div className="text-lg text-muted-foreground mb-1">Predicted Attendance</div>
                    <div className="text-sm text-muted-foreground">
                      Range: {predictiveData.prediction.confidence_interval.lower} - {predictiveData.prediction.confidence_interval.upper}
                    </div>
                    <Badge className="mt-2">
                      {(predictiveData.prediction.confidence_level * 100).toFixed(0)}% Confidence
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Model Performance</h4>
                    <div className="flex justify-between">
                      <span className="text-sm">Historical Accuracy:</span>
                      <span className="font-medium">{predictiveData.historical_accuracy.accuracy_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Model Version:</span>
                      <span className="font-medium">{predictiveData.historical_accuracy.model_version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Updated:</span>
                      <span className="font-medium">
                        {new Date(predictiveData.historical_accuracy.last_updated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Contributing Factors</h4>
                  <div className="space-y-3">
                    {predictiveData.factors_considered.map((factor, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{factor.factor}</span>
                          <span className="font-medium">{(factor.weight * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={factor.weight * 100} className="flex-1 h-2" />
                          <Badge 
                            variant="outline" 
                            className={factor.impact === 'positive' ? 'text-green-600' : 'text-red-600'}
                          >
                            {factor.impact}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scenario Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictiveData.scenario_analysis.map((scenario, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{scenario.scenario}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-brand-primary">
                          {scenario.predicted_outcome}
                        </span>
                        <Badge variant="outline">
                          {(scenario.probability * 100).toFixed(0)}% chance
                        </Badge>
                      </div>
                    </div>
                    <Progress value={scenario.probability * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          {/* Cost Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-brand-primary" />
                Cost Optimization Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeTeamData.insights.cost_optimization_opportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-800">{opportunity}</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Estimated savings: $500-1,200 per event
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-primary" />
                Key Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Best Practices
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-800">Optimal Staff Ratio</div>
                      <div className="text-sm text-green-600">25-30 attendees per staff member maximizes efficiency</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-800">Email Marketing ROI</div>
                      <div className="text-sm text-green-600">Consistently delivers 8x+ return on investment</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <div className="font-medium text-green-800">Senior Staff Impact</div>
                      <div className="text-sm text-green-600">Events with senior coordinators show 15% better satisfaction</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Improvement Areas
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-orange-50 rounded">
                      <div className="font-medium text-orange-800">Paid Advertising Efficiency</div>
                      <div className="text-sm text-orange-600">ROI below 3x indicates targeting issues</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded">
                      <div className="font-medium text-orange-800">Setup Time Optimization</div>
                      <div className="text-sm text-orange-600">Events over 4h setup time impact staff costs</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded">
                      <div className="font-medium text-orange-800">Venue Utilization</div>
                      <div className="text-sm text-orange-600">Some venues underperforming on operational efficiency</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamPerformanceAnalysis; 