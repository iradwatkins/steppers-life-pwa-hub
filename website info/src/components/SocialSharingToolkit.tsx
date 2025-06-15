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
import { 
  Share2, 
  Download, 
  Copy, 
  Calendar, 
  Image,
  Video,
  Heart,
  MessageCircle,
  Send,
  Eye,
  TrendingUp,
  Users,
  Plus,
  Edit,
  Trash2,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Clock,
  Palette,
  Wand2,
  Camera,
  FileText
} from 'lucide-react';
import { socialSharingToolkitService, SocialPlatform, SocialMediaTemplate, GeneratedContent } from '../services/socialSharingToolkitService';
import { formatCurrency } from '../utils/formatters';
import { toast } from '../hooks/use-toast';

interface SocialSharingToolkitProps {
  agentId: string;
  eventId: string;
  className?: string;
}

interface ContentGenerationFormData {
  platforms: SocialPlatform[];
  templateIds: string[];
  customCaption: string;
  customHashtags: string;
  scheduledDate: string;
  publishNow: boolean;
}

const SocialSharingToolkit: React.FC<SocialSharingToolkitProps> = ({
  agentId,
  eventId,
  className = ""
}) => {
  const [sharingKit, setSharingKit] = useState<any>(null);
  const [availableTemplates, setAvailableTemplates] = useState<SocialMediaTemplate[]>([]);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('instagram');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [formData, setFormData] = useState<ContentGenerationFormData>({
    platforms: ['instagram'],
    templateIds: [],
    customCaption: '',
    customHashtags: '',
    scheduledDate: '',
    publishNow: false
  });

  // Load sharing kit and templates on mount
  useEffect(() => {
    loadSharingKit();
    loadTemplates();
  }, [agentId, eventId]);

  const loadSharingKit = async () => {
    try {
      setIsLoading(true);
      const kit = await socialSharingToolkitService.createSharingKit(agentId, eventId);
      setSharingKit(kit);
      
      // Load existing generated content
      const content = await socialSharingToolkitService.generateContent({
        agentId,
        eventId,
        platforms: ['instagram', 'facebook', 'twitter'],
        schedulingOptions: { publishNow: false, scheduledDates: [], frequency: 'once', timeZone: 'UTC', optimalTiming: false }
      });
      setGeneratedContent(content);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load sharing toolkit", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const templates = await socialSharingToolkitService.getAvailableTemplates();
      setAvailableTemplates(templates);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load templates", variant: "destructive" });
    }
  };

  const handleGenerateContent = async () => {
    try {
      setIsLoading(true);
      
      const content = await socialSharingToolkitService.generateContent({
        agentId,
        eventId,
        platforms: formData.platforms,
        templateIds: formData.templateIds.length > 0 ? formData.templateIds : undefined,
        customization: {
          template: formData.customCaption,
          hashtags: formData.customHashtags.split(' ').filter(tag => tag.length > 0),
          title: '',
          description: '',
          callToAction: '',
          mentions: [],
          mediaAssets: []
        },
        schedulingOptions: {
          publishNow: formData.publishNow,
          scheduledDates: formData.scheduledDate ? [new Date(formData.scheduledDate)] : [],
          frequency: 'once',
          timeZone: 'UTC',
          optimalTiming: false
        }
      });

      setGeneratedContent(prev => [...prev, ...content]);
      toast({ title: "Success", description: `Generated content for ${formData.platforms.length} platform(s)` });
      setShowGenerateDialog(false);
      
      // Reset form
      setFormData({
        platforms: ['instagram'],
        templateIds: [],
        customCaption: '',
        customHashtags: '',
        scheduledDate: '',
        publishNow: false
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate content", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({ title: "Success", description: "Content copied to clipboard" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy content", variant: "destructive" });
    }
  };

  const handlePublishContent = async (contentId: string) => {
    try {
      await socialSharingToolkitService.publishContent(contentId);
      
      // Update local state
      setGeneratedContent(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, status: 'published' as const }
            : content
        )
      );
      
      toast({ title: "Success", description: "Content published successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to publish content", variant: "destructive" });
    }
  };

  const handleScheduleContent = async (contentId: string, scheduledDate: Date) => {
    try {
      await socialSharingToolkitService.scheduleContent(contentId, scheduledDate);
      
      // Update local state
      setGeneratedContent(prev => 
        prev.map(content => 
          content.id === contentId 
            ? { ...content, status: 'scheduled' as const, scheduledDate }
            : content
        )
      );
      
      toast({ title: "Success", description: "Content scheduled successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to schedule content", variant: "destructive" });
    }
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  const getPlatformColor = (platform: SocialPlatform) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-600';
      case 'instagram': return 'bg-pink-600';
      case 'twitter': return 'bg-sky-500';
      case 'linkedin': return 'bg-blue-700';
      default: return 'bg-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTemplates = availableTemplates.filter(template => 
    template.platform === selectedPlatform && template.isActive
  );

  const platformContent = generatedContent.filter(content => 
    content.platform === selectedPlatform
  );

  if (isLoading && !sharingKit) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Overview */}
      {sharingKit?.performance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sharingKit.performance.totalShares}</div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sharingKit.performance.totalReach.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                People reached
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicks Generated</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sharingKit.performance.totalClicks}</div>
              <p className="text-xs text-muted-foreground">
                Link clicks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(sharingKit.performance.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From social sales
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Social Media Toolkit</CardTitle>
              <CardDescription>
                Generate and manage social media content for {sharingKit?.eventDetails.title}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Content
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Generate Social Media Content</DialogTitle>
                    <DialogDescription>
                      Create customized content for your social media platforms
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Platforms</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['instagram', 'facebook', 'twitter', 'linkedin'] as SocialPlatform[]).map((platform) => (
                          <Button
                            key={platform}
                            variant={formData.platforms.includes(platform) ? "default" : "outline"}
                            className="justify-start"
                            onClick={() => {
                              const newPlatforms = formData.platforms.includes(platform)
                                ? formData.platforms.filter(p => p !== platform)
                                : [...formData.platforms, platform];
                              setFormData(prev => ({ ...prev, platforms: newPlatforms }));
                            }}
                          >
                            <div className={`w-3 h-3 rounded-full ${getPlatformColor(platform)} mr-2`} />
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Templates (Optional)</Label>
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, templateIds: [value] }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} - {template.platform}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Caption</Label>
                      <Textarea
                        value={formData.customCaption}
                        onChange={(e) => setFormData(prev => ({ ...prev, customCaption: e.target.value }))}
                        placeholder="Write your custom caption here..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Hashtags</Label>
                      <Input
                        value={formData.customHashtags}
                        onChange={(e) => setFormData(prev => ({ ...prev, customHashtags: e.target.value }))}
                        placeholder="#dance #salsa #event"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Schedule Post</Label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>&nbsp;</Label>
                        <Button
                          variant={formData.publishNow ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setFormData(prev => ({ ...prev, publishNow: !prev.publishNow }))}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Publish Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateContent}>
                      Generate Content
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as SocialPlatform)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="instagram" className="flex items-center space-x-2">
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </TabsTrigger>
              <TabsTrigger value="facebook" className="flex items-center space-x-2">
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </TabsTrigger>
              <TabsTrigger value="twitter" className="flex items-center space-x-2">
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </TabsTrigger>
              <TabsTrigger value="linkedin" className="flex items-center space-x-2">
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </TabsTrigger>
            </TabsList>

            {(['instagram', 'facebook', 'twitter', 'linkedin'] as SocialPlatform[]).map((platform) => (
              <TabsContent key={platform} value={platform} className="space-y-4">
                {/* Templates Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Templates for {platform.charAt(0).toUpperCase() + platform.slice(1)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{template.name}</CardTitle>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-600 mb-3">{template.content.description}</p>
                          <div className="text-xs text-gray-500 mb-3 font-mono bg-gray-50 p-2 rounded">
                            {template.content.template.substring(0, 100)}...
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Used {template.usageCount} times
                            </span>
                            <div className="flex items-center space-x-1">
                              <Button size="sm" variant="outline" className="h-6 px-2">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-6 px-2">
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Generated Content Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Generated Content</h3>
                  {platformContent.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No content generated yet</h3>
                      <p className="text-sm mb-4">Generate your first social media post for {platform}</p>
                      <Button onClick={() => setShowGenerateDialog(true)}>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Content
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {platformContent.map((content) => (
                        <Card key={content.id} className="border-l-4" style={{borderLeftColor: getPlatformColor(content.platform).replace('bg-', '')}}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getPlatformIcon(content.platform)}
                                <span className="font-medium">{content.platform.charAt(0).toUpperCase() + content.platform.slice(1)}</span>
                                <Badge className={`${getStatusBadgeColor(content.status)} text-white`}>
                                  {content.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyContent(content.content.caption)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                {content.status === 'draft' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handlePublishContent(content.id)}
                                  >
                                    <Send className="w-4 h-4 mr-1" />
                                    Publish
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="bg-gray-50 p-3 rounded">
                                <p className="text-sm whitespace-pre-wrap">{content.content.caption}</p>
                              </div>
                              
                              {content.content.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {content.content.hashtags.map((hashtag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {hashtag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Created: {content.createdDate.toLocaleDateString()}</span>
                                {content.scheduledDate && (
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Scheduled: {content.scheduledDate.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {content.analytics && (
                                <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                                  <div className="text-center">
                                    <div className="font-medium">{content.analytics.reach}</div>
                                    <div className="text-xs text-gray-500">Reach</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-medium">{content.analytics.engagement}</div>
                                    <div className="text-xs text-gray-500">Engagement</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-medium">{content.analytics.clicks}</div>
                                    <div className="text-xs text-gray-500">Clicks</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialSharingToolkit; 