import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Settings,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Award,
  Link2,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react';
import { useCommissionConfig } from '../../hooks/useCommissionConfig';
import { useTrackableLinks } from '../../hooks/useTrackableLinks';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface SalesAgentManagementPageProps {
  className?: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  tier: string;
  joinDate: Date;
  totalSales: number;
  totalCommissions: number;
  conversionRate: number;
  assignedEvents: number;
  activeLinks: number;
}

const SalesAgentManagementPage: React.FC<SalesAgentManagementPageProps> = ({
  className = ""
}) => {
  const { eventId } = useParams();
  const organizerId = 'org-1'; // Mock - would come from auth context
  
  const {
    config,
    availableTiers,
    isLoading: configLoading,
    updateConfiguration,
    createCommissionTier,
    updateAgentTier
  } = useCommissionConfig(organizerId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Mock agents data
  const agents: Agent[] = [
    {
      id: 'agent-1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://example.com/sarah.jpg',
      status: 'active',
      tier: 'gold',
      joinDate: new Date('2024-01-15'),
      totalSales: 156,
      totalCommissions: 2340,
      conversionRate: 28.5,
      assignedEvents: 12,
      activeLinks: 8
    },
    {
      id: 'agent-2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      phone: '+1 (555) 234-5678',
      status: 'active',
      tier: 'silver',
      joinDate: new Date('2024-02-01'),
      totalSales: 98,
      totalCommissions: 1470,
      conversionRate: 22.1,
      assignedEvents: 8,
      activeLinks: 5
    },
    {
      id: 'agent-3',
      name: 'Emma Rodriguez',
      email: 'emma@example.com',
      phone: '+1 (555) 345-6789',
      status: 'inactive',
      tier: 'bronze',
      joinDate: new Date('2024-03-10'),
      totalSales: 45,
      totalCommissions: 675,
      conversionRate: 18.7,
      assignedEvents: 4,
      activeLinks: 2
    }
  ];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesTier = tierFilter === 'all' || agent.tier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'gold': return 'bg-yellow-500';
      case 'silver': return 'bg-gray-400';
      case 'bronze': return 'bg-orange-600';
      default: return 'bg-gray-500';
    }
  };

  const handleActivateAgent = async (agentId: string, eventId: string) => {
    // Implementation for activating agent for specific event
    console.log('Activating agent', agentId, 'for event', eventId);
  };

  const handleUpdateCommission = async (agentId: string, newRate: number) => {
    // Implementation for updating agent commission rate
    console.log('Updating commission for agent', agentId, 'to', newRate);
  };

  if (configLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">Sales Agent Management</h1>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Agent
              </Button>
              <Button variant="outline" onClick={() => setShowTierDialog(true)}>
                <Award className="w-4 h-4 mr-2" />
                Manage Tiers
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
              <p className="text-xs text-muted-foreground">
                {agents.filter(a => a.status === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agents.reduce((sum, agent) => sum + agent.totalSales, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(agents.reduce((sum, agent) => sum + agent.totalCommissions, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercentage(agents.reduce((sum, agent) => sum + agent.conversionRate, 0) / agents.length)}
              </div>
              <p className="text-xs text-muted-foreground">
                +2.3% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="commissions">Commission Config</TabsTrigger>
            <TabsTrigger value="tiers">Tier Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Agents</CardTitle>
                <CardDescription>Search and filter your sales agents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search agents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select value={tierFilter} onValueChange={setTierFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="bronze">Bronze</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button variant="outline" className="w-full">
                      <Filter className="w-4 h-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agents List */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Agents ({filteredAgents.length})</CardTitle>
                <CardDescription>Manage your sales team and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {agent.avatar ? (
                            <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-sm font-medium">{agent.name.charAt(0)}</span>
                          )}
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{agent.name}</h3>
                            <Badge className={`${getStatusBadgeColor(agent.status)} text-white`}>
                              {agent.status}
                            </Badge>
                            <Badge className={`${getTierBadgeColor(agent.tier)} text-white`}>
                              {agent.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{agent.totalSales}</div>
                          <div className="text-gray-500">Sales</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{formatCurrency(agent.totalCommissions)}</div>
                          <div className="text-gray-500">Commissions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{formatPercentage(agent.conversionRate)}</div>
                          <div className="text-gray-500">Conversion</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{agent.activeLinks}</div>
                          <div className="text-gray-500">Links</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Link2 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Configuration</CardTitle>
                <CardDescription>Set default commission rates and rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {config && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Default Rates</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Standard Rate</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={config.defaultRates.standardRate}
                                className="w-20"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>VIP Rate</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={config.defaultRates.vipRate}
                                className="w-20"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Bulk Rate</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={config.defaultRates.bulkRate}
                                className="w-20"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Early Bird Rate</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={config.defaultRates.earlyBirdRate}
                                className="w-20"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium">Payout Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Payout Schedule</Label>
                            <Select value={config.payoutSettings.schedule}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Minimum Amount</Label>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">$</span>
                              <Input
                                type="number"
                                value={config.payoutSettings.minimumAmount}
                                className="w-20"
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Auto Approval</Label>
                            <Switch checked={config.payoutSettings.autoApproval} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button>Save Configuration</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Commission Tiers</CardTitle>
                <CardDescription>Manage performance-based commission tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableTiers.map((tier) => (
                    <div key={tier.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getTierBadgeColor(tier.id)} text-white`}>
                            {tier.name}
                          </Badge>
                          <span className="font-medium">{tier.commissionRate}% commission</span>
                          {tier.bonusPercentage > 0 && (
                            <span className="text-sm text-green-600">
                              +{tier.bonusPercentage}% bonus
                            </span>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Requirements</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {tier.requirements.map((req, index) => (
                              <li key={index}>
                                • {req.threshold} {req.unit} {req.type.replace('_', ' ')}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Benefits</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {tier.benefits.map((benefit, index) => (
                              <li key={index}>• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Tier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance Analytics</CardTitle>
                <CardDescription>Analyze sales agent performance and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Analytics charts and graphs would go here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesAgentManagementPage; 