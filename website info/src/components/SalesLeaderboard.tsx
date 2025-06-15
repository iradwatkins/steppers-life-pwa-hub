import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  ArrowUp,
  ArrowDown,
  Minus,
  Crown,
  Star,
  Flame,
  Target,
  Users,
  DollarSign,
  Calendar,
  MessageCircle,
  Heart,
  Send,
  Download,
  Filter,
  Plus,
  Zap,
  Gift,
  ThumbsUp
} from 'lucide-react';
import { salesLeaderboardService, LeaderboardEntry, LeaderboardPeriod, Achievement, Competition } from '../services/salesLeaderboardService';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { toast } from '../hooks/use-toast';

interface SalesLeaderboardProps {
  organizerId: string;
  agentId?: string;
  className?: string;
}

interface KudosFormData {
  toAgentId: string;
  message: string;
  type: 'great_sale' | 'helpful_tip' | 'team_spirit' | 'customer_service';
  isPublic: boolean;
}

const SalesLeaderboard: React.FC<SalesLeaderboardProps> = ({
  organizerId,
  agentId,
  className = ""
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teamFeed, setTeamFeed] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentAgentRank, setCurrentAgentRank] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showKudosDialog, setShowKudosDialog] = useState(false);
  const [showCompetitionDialog, setShowCompetitionDialog] = useState(false);
  const [kudosForm, setKudosForm] = useState<KudosFormData>({
    toAgentId: '',
    message: '',
    type: 'great_sale',
    isPublic: true
  });

  useEffect(() => {
    loadLeaderboard();
    loadCompetitions();
    loadTeamFeed();
    if (agentId) {
      loadAgentRank();
    }
  }, [organizerId, selectedPeriod, selectedCategory, agentId]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const data = await salesLeaderboardService.getLeaderboard(
        organizerId, 
        selectedPeriod, 
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      setLeaderboard(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load leaderboard", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompetitions = async () => {
    try {
      const data = await salesLeaderboardService.getActiveCompetitions(organizerId);
      setCompetitions(data);
    } catch (error) {
      console.error('Failed to load competitions:', error);
    }
  };

  const loadTeamFeed = async () => {
    try {
      const data = await salesLeaderboardService.getTeamFeed(organizerId);
      setTeamFeed(data);
    } catch (error) {
      console.error('Failed to load team feed:', error);
    }
  };

  const loadAgentRank = async () => {
    if (!agentId) return;
    
    try {
      const rank = await salesLeaderboardService.getAgentRank(agentId, organizerId, selectedPeriod);
      setCurrentAgentRank(rank);
    } catch (error) {
      console.error('Failed to load agent rank:', error);
    }
  };

  const handleGiveKudos = async () => {
    try {
      if (!agentId || !kudosForm.toAgentId || !kudosForm.message) {
        toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
        return;
      }

      await salesLeaderboardService.giveKudos(agentId, kudosForm.toAgentId, {
        message: kudosForm.message,
        type: kudosForm.type,
        isPublic: kudosForm.isPublic
      });

      toast({ title: "Success", description: "Kudos sent successfully!" });
      setShowKudosDialog(false);
      setKudosForm({
        toAgentId: '',
        message: '',
        type: 'great_sale',
        isPublic: true
      });
      
      // Refresh team feed
      loadTeamFeed();
    } catch (error) {
      toast({ title: "Error", description: "Failed to send kudos", variant: "destructive" });
    }
  };

  const handleExportLeaderboard = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const blob = await salesLeaderboardService.exportLeaderboard(organizerId, selectedPeriod, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `leaderboard-${selectedPeriod}-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Success", description: "Leaderboard exported successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to export leaderboard", variant: "destructive" });
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{rank}</span>;
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
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

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'sales': return <Target className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      case 'customer': return <Heart className="w-4 h-4" />;
      case 'streak': return <Flame className="w-4 h-4" />;
      case 'special': return <Star className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  if (isLoading && leaderboard.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Agent Rank (if applicable) */}
      {currentAgentRank && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-blue-500" />
              <span>Your Ranking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">#{currentAgentRank.rank}</div>
                <div className="text-sm text-gray-500">Current Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentAgentRank.totalParticipants}</div>
                <div className="text-sm text-gray-500">Total Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{currentAgentRank.percentile}%</div>
                <div className="text-sm text-gray-500">Percentile</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentAgentRank.entry.points}</div>
                <div className="text-sm text-gray-500">Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Leaderboard</CardTitle>
              <CardDescription>
                Track team performance and celebrate achievements
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {agentId && (
                <Dialog open={showKudosDialog} onOpenChange={setShowKudosDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Give Kudos
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Give Kudos to a Team Member</DialogTitle>
                      <DialogDescription>
                        Recognize outstanding performance and team spirit
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>To Agent</Label>
                        <Select value={kudosForm.toAgentId} onValueChange={(value) => setKudosForm(prev => ({ ...prev, toAgentId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an agent" />
                          </SelectTrigger>
                          <SelectContent>
                            {leaderboard.map((entry) => (
                              <SelectItem key={entry.agentId} value={entry.agentId}>
                                {entry.agentName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={kudosForm.type} onValueChange={(value) => setKudosForm(prev => ({ ...prev, type: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="great_sale">Great Sale</SelectItem>
                            <SelectItem value="helpful_tip">Helpful Tip</SelectItem>
                            <SelectItem value="team_spirit">Team Spirit</SelectItem>
                            <SelectItem value="customer_service">Customer Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                          value={kudosForm.message}
                          onChange={(e) => setKudosForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Write your appreciation message..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={kudosForm.isPublic}
                          onChange={(e) => setKudosForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        />
                        <Label htmlFor="isPublic">Make this public</Label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowKudosDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleGiveKudos}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Kudos
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as LeaderboardPeriod)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => handleExportLeaderboard('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="leaderboard" className="space-y-4">
            <TabsList>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="competitions">Competitions</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="feed">Team Feed</TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="space-y-4">
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <Card key={entry.agentId} className={`transition-all ${index < 3 ? 'border-l-4' : ''} ${
                    index === 0 ? 'border-l-yellow-500 bg-yellow-50' :
                    index === 1 ? 'border-l-gray-400 bg-gray-50' :
                    index === 2 ? 'border-l-orange-600 bg-orange-50' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getRankIcon(entry.rank)}
                            {getTrendIcon(entry.trendDirection)}
                          </div>
                          
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={entry.agentPhoto} alt={entry.agentName} />
                            <AvatarFallback>{entry.agentName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{entry.agentName}</h3>
                              <Badge className={`${getTierBadgeColor(entry.tier)} text-white`}>
                                {entry.tier}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{entry.points} points</span>
                              {entry.streak.isActive && (
                                <span className="flex items-center">
                                  <Flame className="w-3 h-3 mr-1 text-orange-500" />
                                  {entry.streak.currentStreak} day streak
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{entry.metrics.totalSales}</div>
                            <div className="text-gray-500">Sales</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{formatCurrency(entry.metrics.totalRevenue)}</div>
                            <div className="text-gray-500">Revenue</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{formatPercentage(entry.metrics.conversionRate)}</div>
                            <div className="text-gray-500">Conversion</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{formatCurrency(entry.metrics.totalCommissions)}</div>
                            <div className="text-gray-500">Commissions</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {entry.badges.slice(0, 3).map((badge) => (
                            <div
                              key={badge.id}
                              className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
                              title={badge.title}
                            >
                              {getAchievementIcon(badge.category)}
                            </div>
                          ))}
                          {entry.badges.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                              +{entry.badges.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="competitions" className="space-y-4">
              {competitions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active competitions</h3>
                  <p className="text-sm">Check back later for new competitions!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {competitions.map((competition) => (
                    <Card key={competition.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center space-x-2">
                              <Trophy className="w-5 h-5 text-yellow-500" />
                              <span>{competition.title}</span>
                              <Badge variant="outline">{competition.status}</Badge>
                            </CardTitle>
                            <CardDescription>{competition.description}</CardDescription>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>Ends: {competition.endDate.toLocaleDateString()}</div>
                            <div>{competition.participants.length} participants</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Goals</h4>
                            <ul className="text-sm space-y-1">
                              {competition.goals.map((goal, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <Target className="w-3 h-3" />
                                  <span>{goal.target} {goal.unit} {goal.type.replace('_', ' ')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Prizes</h4>
                            <ul className="text-sm space-y-1">
                              {competition.prizes.map((prize, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <Gift className="w-3 h-3" />
                                  <span>#{prize.position}: {prize.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leaderboard.slice(0, 6).map((entry) => (
                  <Card key={`${entry.agentId}-achievements`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={entry.agentPhoto} alt={entry.agentName} />
                          <AvatarFallback>{entry.agentName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-sm">{entry.agentName}</CardTitle>
                          <CardDescription className="text-xs">{entry.badges.length} achievements</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {entry.badges.slice(0, 4).map((badge) => (
                          <div key={badge.id} className="flex items-center space-x-2 text-sm">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              badge.isRare ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {getAchievementIcon(badge.category)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{badge.title}</div>
                              <div className="text-xs text-gray-500">{badge.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="feed" className="space-y-4">
              {teamFeed.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recent activity</h3>
                  <p className="text-sm">Team activity will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamFeed.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            {item.type === 'kudos' ? <Heart className="w-4 h-4 text-red-500" /> :
                             item.type === 'achievement' ? <Star className="w-4 h-4 text-yellow-500" /> :
                             <MessageCircle className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className="font-medium">{item.agentName || 'Team'}</span>
                              {item.type === 'kudos' && <span> received kudos: "{item.message}"</span>}
                              {item.type === 'achievement' && <span> earned "{item.title}" achievement!</span>}
                              {item.type === 'post' && <span> shared: "{item.content}"</span>}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(item.timestamp || item.earnedDate).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesLeaderboard; 