import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { 
  ChevronRight, 
  Edit, 
  Settings, 
  Eye, 
  Send, 
  Archive, 
  CalendarCheck2, 
  Ticket, 
  Armchair, 
  MessageSquarePlus, 
  Tag as TagIcon, 
  RefreshCw, 
  DollarSign,
  Share2,
  BarChart3,
  Copy,
  Download,
  ExternalLink,
  Mail,
  FolderPlus,
  Users
} from 'lucide-react';
import SocialShareButtons from '@/components/SocialShareButtons';
import { createEventURL, createShortURL, addTrackingParams } from '@/utils/urlUtils';
import type { EventData } from '@/services/socialSharingService';

// Mock event data structure
interface MockEvent {
  id: string;
  name: string;
  status: 'Draft' | 'Published' | 'Unpublished' | 'Pending Review';
  // Add other relevant event details if needed for display
  date?: string;
  location?: string;
}

// Simulate fetching event data (replace with actual API call later)
const fetchMockEvent = (eventId: string): Promise<MockEvent> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        id: eventId,
        name: `Sample Event: The Big Steppers Bash ${eventId.slice(-3)}`,
        status: 'Draft',
        date: '2025-10-15',
        location: 'Community Grand Hall'
      });
    }, 500);
  });
};

const ManageEventPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<MockEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchMockEvent(eventId).then(data => {
        setEvent(data);
        setLoading(false);
      });
    } else {
      // Handle case where eventId is not present, perhaps redirect or show error
      setLoading(false);
      // navigate('/organizer/dashboard'); // Example redirect
    }
  }, [eventId, navigate]);

  const handleStatusChange = (newStatus: MockEvent['status']) => {
    if (event) {
      setEvent({ ...event, status: newStatus });
      // Here you would call an API to update the event status in the backend
      console.log(`Event ${event.id} status changed to ${newStatus}`);
      // Potentially show a toast notification for success
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background-main flex items-center justify-center"><p className="text-text-secondary">Loading event details...</p></div>;
  }

  if (!event) {
    return <div className="min-h-screen bg-background-main flex items-center justify-center"><p className="text-destructive">Event not found or ID missing.</p></div>;
  }

  const managementLinks = [
    {
      label: 'Event Details',
      icon: <Edit className="h-5 w-5 text-brand-primary" />,
      description: 'Update name, date, location, description, and image.',
      path: `/organizer/events/create`, // This could be an edit page /organizer/event/${eventId}/edit-details
      note: eventId ? `(for event ${event.name}) (Currently links to Create Page)` : '(Currently links to Create Page)'
    },
    {
      label: 'Ticketing Configuration',
      icon: <Ticket className="h-5 w-5 text-brand-primary" />,
      description: 'Manage ticket types, prices, and sales periods.',
      path: `/organizer/event/${eventId}/ticketing`,
    },
    {
      label: 'Seating Arrangements',
      icon: <Armchair className="h-5 w-5 text-brand-primary" />,
      description: 'Define sections, tables, or general admission.',
      path: `/organizer/event/${eventId}/seating`,
    },
    {
      label: 'Custom Attendee Questions',
      icon: <MessageSquarePlus className="h-5 w-5 text-brand-primary" />,
      description: 'Add custom questions for attendees during registration.',
      path: `/organizer/event/${eventId}/custom-questions`,
    },
    {
      label: 'Promotional Codes',
      icon: <TagIcon className="h-5 w-5 text-brand-primary" />,
      description: 'Create and manage discount codes for your event.',
      path: `/organizer/event/${eventId}/promo-codes`,
    },
    {
      label: 'Refunds & Cancellations',
      icon: <RefreshCw className="h-5 w-5 text-brand-primary" />,
      description: 'Process refund requests and handle ticket cancellations.',
      path: `/organizer/event/${eventId}/refunds`,
    },
    {
      label: 'Cash Payment Management',
      icon: <DollarSign className="h-5 w-5 text-brand-primary" />,
      description: 'Generate codes for cash payments and verify transactions.',
      path: `/organizer/event/${eventId}/cash-payments`,
    },
    {
      label: 'Email Campaigns',
      icon: <Mail className="h-5 w-5 text-brand-primary" />,
      description: 'Send updates, reminders, and promotional emails to attendees.',
      path: `/organizer/event/${eventId}/email-campaigns`,
    },
    {
      label: 'Performance Analytics',
      icon: <BarChart3 className="h-5 w-5 text-brand-primary" />,
      description: 'View comprehensive analytics and performance metrics for your event.',
      path: `/organizer/event/${eventId}/performance`,
    },
    {
      label: 'Attendee Report',
      icon: <Users className="h-5 w-5 text-brand-primary" />,
      description: 'Manage attendee information, view reports, and export attendee data.',
      path: `/organizer/event/${eventId}/attendees`,
    },
    {
      label: 'Event Collections',
      icon: <FolderPlus className="h-5 w-5 text-brand-primary" />,
      description: 'Organize events into collections, create series, and manage templates.',
      path: `/organizer/collections`,
    },
    {
      label: 'Team Management',
      icon: <Users className="h-5 w-5 text-brand-primary" />,
      description: 'Manage your followers, team members, and role assignments.',
      path: `/organizer/event/${eventId}/team`,
    },
  ];

  // Convert event to EventData for sharing
  const eventForSharing: EventData = event ? {
    id: event.id,
    title: event.name,
    date: event.date || new Date().toISOString().split('T')[0],
    location: event.location || 'TBD',
    description: `Join us for ${event.name}!`,
    organizer: 'Organizer'
  } : {
    id: '1',
    title: 'Sample Event',
    date: new Date().toISOString().split('T')[0],
    location: 'TBD'
  };

  // Sharing analytics (mock data)
  const sharingAnalytics = {
    totalShares: 247,
    platforms: {
      facebook: 89,
      twitter: 54,
      linkedin: 23,
      whatsapp: 81
    },
    recentActivity: [
      { platform: 'Facebook', shares: 12, time: '2 hours ago' },
      { platform: 'Twitter', shares: 8, time: '4 hours ago' },
      { platform: 'WhatsApp', shares: 15, time: '6 hours ago' }
    ]
  };

  const handleCopyUrl = async (url: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(label);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateCampaignUrl = (campaign: string) => {
    if (!event) return '';
    const baseUrl = createEventURL(eventForSharing);
    return addTrackingParams(baseUrl, 'organizer_dashboard', campaign, 'manual_share');
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-surface-card mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold text-text-primary">Manage Event: {event.name}</CardTitle>
                <CardDescription className="text-text-secondary">Event ID: {event.id}</CardDescription>
              </div>
              <Badge 
                className="text-sm font-semibold px-3 py-1 bg-yellow-100 text-yellow-700 border-yellow-300"
              >
                Status: {event.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-text-secondary"><strong className="text-text-primary">Date:</strong> {event.date || 'Not set'} | <strong className="text-text-primary">Location:</strong> {event.location || 'Not set'}</p>
            <Separator />
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-text-primary font-medium mr-2">Actions:</span>
              {event.status !== 'Published' && (
                <Button onClick={() => handleStatusChange('Published')} className="bg-green-600 hover:bg-green-700 text-white">
                  <CalendarCheck2 className="mr-2 h-4 w-4" /> Publish Event
                </Button>
              )}
              {event.status === 'Published' && (
                <Button onClick={() => handleStatusChange('Unpublished')} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                  <Archive className="mr-2 h-4 w-4" /> Unpublish Event
                </Button>
              )}
              {event.status !== 'Draft' && event.status !== 'Published' && (
                <Button onClick={() => handleStatusChange('Draft')} variant="outline">
                  Move to Draft
                </Button>
              )}
              {/* Add 'Submit for Review' button if that state is implemented */}
              {/* <Button onClick={() => handleStatusChange('Pending Review')} variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                <Send className="mr-2 h-4 w-4" /> Submit for Review
              </Button> */}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate('/events')} className="mr-auto">
                <Eye className="mr-2 h-4 w-4" /> View Public Page (Placeholder)
            </Button>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managementLinks.map((link) => (
            <Link to={link.path} key={link.label} className="block hover:no-underline">
              <Card className="bg-surface-card hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
                <CardHeader className="flex-row items-start justify-between pb-3">
                  <div className="flex items-center">
                    {link.icon}
                    <CardTitle className="text-xl font-semibold text-text-primary ml-3">{link.label}</CardTitle>
                  </div>
                  <ChevronRight className="h-5 w-5 text-text-tertiary" />
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-text-secondary text-sm">{link.description}</p>
                  {link.note && <p className="text-xs text-text-tertiary mt-1">{link.note}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Social Media Promotion Tools */}
        <Card className="bg-surface-card mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Share2 className="h-6 w-6 text-brand-primary" />
              <div>
                <CardTitle className="text-2xl font-bold text-text-primary">Social Media Promotion</CardTitle>
                <CardDescription className="text-text-secondary">Share your event and track engagement across social platforms</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Share */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Quick Share</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <SocialShareButtons
                  event={eventForSharing}
                  campaign="organizer_promotion"
                  platforms={['facebook', 'twitter', 'linkedin', 'instagram', 'whatsapp', 'email']}
                  size="lg"
                  variant="default"
                  showLabels={false}
                />
                <Separator orientation="vertical" className="h-12" />
                <div className="text-sm text-text-secondary">
                  Share directly to your favorite platforms with pre-filled content and tracking
                </div>
              </div>
            </div>

            {/* Campaign URLs */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Campaign URLs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">Event Page</div>
                      <div className="text-xs text-text-secondary truncate">
                        {generateCampaignUrl('event_page')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(generateCampaignUrl('event_page'), 'event_page')}
                      className="dark:text-white dark:border-gray-600"
                    >
                      {copiedUrl === 'event_page' ? (
                        <>✓ Copied</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-1" /> Copy</>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">Ticket Purchase</div>
                      <div className="text-xs text-text-secondary truncate">
                        {generateCampaignUrl('ticket_sales')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(generateCampaignUrl('ticket_sales'), 'tickets')}
                      className="dark:text-white dark:border-gray-600"
                    >
                      {copiedUrl === 'tickets' ? (
                        <>✓ Copied</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-1" /> Copy</>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">Short URL</div>
                      <div className="text-xs text-text-secondary truncate">
                        {createShortURL(generateCampaignUrl('short_link'), 'organizer_share')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(createShortURL(generateCampaignUrl('short_link')), 'short')}
                      className="dark:text-white dark:border-gray-600"
                    >
                      {copiedUrl === 'short' ? (
                        <>✓ Copied</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-1" /> Copy</>
                      )}
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full dark:text-white dark:border-gray-600"
                    onClick={() => window.open(generateCampaignUrl('preview'), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview Event Page
                  </Button>
                </div>
              </div>
            </div>

            {/* Sharing Analytics */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sharing Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-brand-primary">{sharingAnalytics.totalShares}</div>
                    <div className="text-sm text-text-secondary">Total Shares</div>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-text-primary mb-2">Platform Breakdown</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Facebook</span>
                        <span className="font-medium">{sharingAnalytics.platforms.facebook}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>WhatsApp</span>
                        <span className="font-medium">{sharingAnalytics.platforms.whatsapp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Twitter</span>
                        <span className="font-medium">{sharingAnalytics.platforms.twitter}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LinkedIn</span>
                        <span className="font-medium">{sharingAnalytics.platforms.linkedin}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200 dark:border-gray-600">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-text-primary mb-2">Recent Activity</div>
                    <div className="space-y-1 text-xs">
                      {sharingAnalytics.recentActivity.map((activity, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{activity.platform}</span>
                          <span className="text-text-secondary">{activity.shares} • {activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Download Tools */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">Download Assets</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="dark:text-white dark:border-gray-600">
                  <Download className="h-4 w-4 mr-2" />
                  Event Card (PNG)
                </Button>
                <Button variant="outline" size="sm" className="dark:text-white dark:border-gray-600">
                  <Download className="h-4 w-4 mr-2" />
                  Social Story (JPG)
                </Button>
                <Button variant="outline" size="sm" className="dark:text-white dark:border-gray-600">
                  <Download className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageEventPage; 