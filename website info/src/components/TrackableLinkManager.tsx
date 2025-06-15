import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Link2, 
  Copy, 
  Eye, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Globe,
  Share2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTrackableLinks } from '../hooks/useTrackableLinks';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { toast } from '../hooks/use-toast';

interface TrackableLinkManagerProps {
  agentId: string;
  eventId?: string;
  className?: string;
}

interface CreateLinkFormData {
  title: string;
  description: string;
  vanityUrl: string;
  eventId: string;
  expiresAt: string;
  campaign: string;
  medium: string;
  source: string;
}

const TrackableLinkManager: React.FC<TrackableLinkManagerProps> = ({
  agentId,
  eventId,
  className = ""
}) => {
  const {
    agentLinks,
    analytics,
    performance,
    isLoading,
    generateLink,
    updateLink,
    deleteLink,
    checkVanityUrl,
    getAnalytics
  } = useTrackableLinks(agentId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateLinkFormData>({
    title: '',
    description: '',
    vanityUrl: '',
    eventId: eventId || '',
    expiresAt: '',
    campaign: '',
    medium: 'referral',
    source: 'agent'
  });
  const [vanityAvailable, setVanityAvailable] = useState<boolean | null>(null);
  const [vanityChecking, setVanityChecking] = useState(false);

  const handleCreateLink = async () => {
    try {
      if (!formData.title || !formData.eventId) {
        toast({ title: "Error", description: "Title and event are required", variant: "destructive" });
        return;
      }

      await generateLink({
        agentId,
        eventId: formData.eventId,
        organizerId: 'org-1', // Mock - would come from context
        title: formData.title,
        description: formData.description,
        vanityUrl: formData.vanityUrl || undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        metadata: {
          campaign: formData.campaign,
          medium: formData.medium,
          source: formData.source,
          customParams: {}
        }
      });

      toast({ title: "Success", description: "Trackable link created successfully" });
      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        vanityUrl: '',
        eventId: eventId || '',
        expiresAt: '',
        campaign: '',
        medium: 'referral',
        source: 'agent'
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create link", variant: "destructive" });
    }
  };

  const handleVanityCheck = async (vanity: string) => {
    if (!vanity) {
      setVanityAvailable(null);
      return;
    }

    setVanityChecking(true);
    try {
      const result = await checkVanityUrl(vanity);
      setVanityAvailable(result.available);
    } catch (error) {
      setVanityAvailable(false);
    } finally {
      setVanityChecking(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Success", description: "Link copied to clipboard" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy link", variant: "destructive" });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteLink(linkId);
      toast({ title: "Success", description: "Link deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete link", variant: "destructive" });
    }
  };

  const filteredLinks = eventId 
    ? agentLinks.filter(link => link.eventId === eventId)
    : agentLinks;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Overview */}
      {performance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.totalClicks}</div>
              <p className="text-xs text-muted-foreground">
                {performance.totalConversions} conversions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(performance.conversionRate)}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(performance.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From {performance.totalConversions} sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Links</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredLinks.filter(l => l.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                of {filteredLinks.length} total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Links Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trackable Links</CardTitle>
              <CardDescription>
                Manage your sales links and track their performance
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Link
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Trackable Link</DialogTitle>
                  <DialogDescription>
                    Generate a new trackable link for your sales activities
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Link Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="My Event Sales Link"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventId">Event *</Label>
                    <Select value={formData.eventId} onValueChange={(value) => setFormData(prev => ({ ...prev, eventId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event-1">Salsa Night Spectacular</SelectItem>
                        <SelectItem value="event-2">Bachata Workshop</SelectItem>
                        <SelectItem value="event-3">Latin Dance Festival</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description of your sales link"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vanityUrl">Vanity URL</Label>
                    <div className="relative">
                      <Input
                        id="vanityUrl"
                        value={formData.vanityUrl}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, vanityUrl: e.target.value }));
                          handleVanityCheck(e.target.value);
                        }}
                        placeholder="my-custom-link"
                        className={vanityAvailable === false ? 'border-red-500' : vanityAvailable === true ? 'border-green-500' : ''}
                      />
                      {vanityChecking && (
                        <div className="absolute right-2 top-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        </div>
                      )}
                      {vanityAvailable === true && (
                        <CheckCircle className="absolute right-2 top-2 h-4 w-4 text-green-500" />
                      )}
                      {vanityAvailable === false && (
                        <AlertCircle className="absolute right-2 top-2 h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Leave empty for auto-generated URL
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expires At</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="campaign">Campaign</Label>
                    <Input
                      id="campaign"
                      value={formData.campaign}
                      onChange={(e) => setFormData(prev => ({ ...prev, campaign: e.target.value }))}
                      placeholder="winter-promotion"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medium">Medium</Label>
                    <Select value={formData.medium} onValueChange={(value) => setFormData(prev => ({ ...prev, medium: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateLink}>
                    Create Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Link2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No trackable links yet</h3>
                <p className="text-sm mb-4">Create your first trackable link to start tracking sales</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Link
                </Button>
              </div>
            ) : (
              filteredLinks.map((link) => {
                const linkAnalytics = analytics[link.id];
                return (
                  <div
                    key={link.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{link.title}</h3>
                          <Badge variant={link.isActive ? "default" : "secondary"}>
                            {link.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {link.expiresAt && new Date(link.expiresAt) < new Date() && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                        {link.description && (
                          <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Globe className="w-4 h-4" />
                          <span className="font-mono">{link.fullUrl}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(link.fullUrl)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {linkAnalytics && (
                          <div className="text-right text-sm">
                            <div className="font-medium">{linkAnalytics.totalClicks} clicks</div>
                            <div className="text-gray-500">{linkAnalytics.conversions} conversions</div>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLinkId(link.id)}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(link.fullUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLink(link.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {linkAnalytics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{linkAnalytics.totalClicks}</div>
                          <div className="text-xs text-gray-500">Total Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{linkAnalytics.uniqueClicks}</div>
                          <div className="text-xs text-gray-500">Unique Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{formatPercentage(linkAnalytics.conversionRate)}</div>
                          <div className="text-xs text-gray-500">Conversion Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold">{formatCurrency(linkAnalytics.totalRevenue)}</div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackableLinkManager; 