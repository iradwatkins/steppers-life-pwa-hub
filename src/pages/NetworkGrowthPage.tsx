/**
 * Network Growth Page - Epic P.001: User Network Growth & Friend Invitations
 * 
 * Comprehensive interface for friend discovery, invitations, social sharing,
 * network analytics, and viral growth features.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  UserPlus, 
  Share2, 
  TrendingUp, 
  Target,
  Copy,
  Mail,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Phone,
  Upload,
  Award,
  BarChart3,
  UserCheck,
  Calendar,
  Star,
  Trophy,
  Gift
} from 'lucide-react';
import NetworkGrowthService, { 
  type Contact, 
  type FriendConnection, 
  type InvitationLink,
  type NetworkAnalytics,
  type ViralChallenge
} from '@/services/networkGrowthService';

const NetworkGrowthPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('invite');
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Contact[]>([]);
  const [connections, setConnections] = useState<FriendConnection[]>([]);
  const [invitationLinks, setInvitationLinks] = useState<InvitationLink[]>([]);
  const [analytics, setAnalytics] = useState<NetworkAnalytics | null>(null);
  const [challenges, setChallenges] = useState<ViralChallenge[]>([]);

  // Form states
  const [inviteForm, setInviteForm] = useState({
    shareType: 'general' as InvitationLink['shareType'],
    customMessage: '',
    maxUses: undefined as number | undefined
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsData, connectionsData, analyticsData, challengesData] = await Promise.all([
        NetworkGrowthService.findFriends(),
        NetworkGrowthService.getFriendConnections(),
        NetworkGrowthService.getNetworkAnalytics(),
        NetworkGrowthService.getViralChallenges()
      ]);

      setFriends(friendsData);
      setConnections(connectionsData);
      setAnalytics(analyticsData);
      setChallenges(challengesData);
    } catch (error) {
      console.error('Error loading network data:', error);
      toast.error('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInviteLink = async () => {
    try {
      const invitation = await NetworkGrowthService.generateInvitationLink(inviteForm);
      setInvitationLinks([invitation, ...invitationLinks]);
      toast.success('Invitation link generated!');
      return invitation;
    } catch (error) {
      toast.error('Failed to generate invitation link');
      throw error;
    }
  };

  const handleCopyInviteLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleSocialShare = async (platform: string) => {
    try {
      const invitation = await handleGenerateInviteLink();
      const shareData = NetworkGrowthService.generateSocialShare(
        platform as any,
        invitation,
        { text: inviteForm.customMessage }
      );

      // Track the share attempt
      await NetworkGrowthService.trackInvitationClick(invitation.code, { platform });

      // Open share URL
      window.open(shareData.url, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSendFriendRequest = async (friendId: string) => {
    try {
      await NetworkGrowthService.sendFriendRequest(friendId);
      toast.success('Friend request sent!');
      await loadData();
    } catch (error) {
      toast.error('Failed to send friend request');
    }
  };

  const handleContactImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // This would typically parse a CSV file of contacts
      // For demo purposes, we'll simulate contact import
      const demoContacts: Contact[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', source: 'imported', isRegistered: false },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', source: 'imported', isRegistered: true }
      ];

      const result = await NetworkGrowthService.importContacts(demoContacts);
      toast.success(`Imported ${result.imported} contacts, found ${result.matched} friends`);
      await loadData();
    } catch (error) {
      toast.error('Failed to import contacts');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Join the Network</h3>
            <p className="text-gray-600 mb-4">
              Sign in to connect with friends and grow your stepping community.
            </p>
            <Button>
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your network...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Grow Your Network</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect with friends, invite new members, and build your stepping community. 
          The more you share, the stronger our community becomes!
        </p>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.metrics.networkSize}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.metrics.newConnections} new this {analytics.period}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invites Sent</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.metrics.invitesSent}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.metrics.conversionRate.toFixed(1)}% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.metrics.communityImpact}</div>
              <p className="text-xs text-muted-foreground">
                Impact score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Viral Coefficient</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.metrics.viralCoefficient.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Growth multiplier
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="invite">Invite Friends</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="network">My Network</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Invite Generation */}
            <Card>
              <CardHeader>
                <CardTitle>Create Invitation Link</CardTitle>
                <CardDescription>Generate a personalized link to share with friends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="message">Custom Message (Optional)</Label>
                  <Input
                    id="message"
                    value={inviteForm.customMessage}
                    onChange={(e) => setInviteForm({...inviteForm, customMessage: e.target.value})}
                    placeholder="Join me on SteppersLife - it's amazing!"
                    maxLength={280}
                  />
                  <p className="text-xs text-gray-500 mt-1">{inviteForm.customMessage.length}/280 characters</p>
                </div>

                <div>
                  <Label htmlFor="max-uses">Max Uses (Optional)</Label>
                  <Input
                    id="max-uses"
                    type="number"
                    value={inviteForm.maxUses || ''}
                    onChange={(e) => setInviteForm({...inviteForm, maxUses: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="Unlimited"
                  />
                </div>

                <Button onClick={handleGenerateInviteLink} className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Generate Invite Link
                </Button>
              </CardContent>
            </Card>

            {/* Social Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>Share on Social Media</CardTitle>
                <CardDescription>Share your invitation across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('facebook')}
                    className="flex items-center gap-2"
                  >
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('twitter')}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="w-4 h-4 text-blue-400" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('linkedin')}
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="w-4 h-4 text-blue-700" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('whatsapp')}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('sms')}
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    SMS
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('email')}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Links */}
          {invitationLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Invitation Links</CardTitle>
                <CardDescription>Track your generated invitation links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invitationLinks.slice(0, 5).map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{link.url}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{link.analytics.clicks} clicks</span>
                          <span>•</span>
                          <span>{link.analytics.conversions} conversions</span>
                          <span>•</span>
                          <span>{link.currentUses}/{link.maxUses || '∞'} uses</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyInviteLink(link.url)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Import */}
          <Card>
            <CardHeader>
              <CardTitle>Import Contacts</CardTitle>
              <CardDescription>Find friends who are already on SteppersLife</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    We'll securely scan your contacts to find friends already using SteppersLife. 
                    Your contact data is encrypted and never shared.
                  </AlertDescription>
                </Alert>
                <div>
                  <input
                    type="file"
                    accept=".csv,.vcf"
                    onChange={handleContactImport}
                    className="hidden"
                    id="contact-upload"
                  />
                  <Button
                    onClick={() => document.getElementById('contact-upload')?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Contacts (CSV/VCF)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>People You May Know</CardTitle>
              <CardDescription>Friends from your contacts who joined SteppersLife</CardDescription>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No friends found yet. Try importing your contacts!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={friend.avatarUrl} />
                        <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-sm text-gray-600">{friend.email}</p>
                        {friend.lastSeen && (
                          <p className="text-xs text-gray-500">Last seen {new Date(friend.lastSeen).toLocaleDateString()}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => friend.userId && handleSendFriendRequest(friend.userId)}
                        disabled={!friend.userId}
                      >
                        <UserPlus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Connections</CardTitle>
              <CardDescription>Your network of friends and followers</CardDescription>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No connections yet. Start by inviting friends!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {connection.friendId.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Friend #{connection.friendId.substring(0, 8)}</p>
                          <p className="text-sm text-gray-600 capitalize">{connection.connectionType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          connection.status === 'accepted' ? 'default' :
                          connection.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {connection.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(connection.connectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.length === 0 ? (
              <Card className="md:col-span-2">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Challenges</h3>
                  <p className="text-gray-600">Complete actions to unlock growth challenges and earn rewards!</p>
                </CardContent>
              </Card>
            ) : (
              challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                      <Badge>
                        {challenge.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{challenge.progress.current}/{challenge.progress.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${challenge.progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Reward:</p>
                      <div className="flex items-center space-x-2">
                        <Gift className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm">{challenge.rewards.description}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Expires {new Date(challenge.expiresAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Growth Analytics</CardTitle>
                  <CardDescription>Track your network growth and referral performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Viral Coefficient</p>
                      <p className="text-2xl font-bold">{analytics.metrics.viralCoefficient.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        Average new users per invitation
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold">{analytics.metrics.conversionRate.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">
                        Invitations that resulted in signups
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Activity Score</p>
                      <p className="text-2xl font-bold">{analytics.metrics.friendActivityScore}</p>
                      <p className="text-xs text-gray-500">
                        Network engagement level
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Referral Sources</CardTitle>
                  <CardDescription>Your most effective sharing platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.metrics.topReferralSources.map((source, index) => (
                      <div key={source.platform} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium capitalize">{source.platform}</p>
                            <p className="text-sm text-gray-600">{source.count} referrals</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{source.conversionRate.toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">conversion</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkGrowthPage;