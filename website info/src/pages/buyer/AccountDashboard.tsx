import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Calendar, 
  Heart, 
  CreditCard, 
  Shield, 
  Settings, 
  Download,
  Edit,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Ticket,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useBuyerAccount } from '@/hooks/useBuyerAccount';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const AccountDashboard = () => {
  const {
    loading,
    dashboardData,
    profile,
    purchaseHistory,
    savedEvents,
    securityActivity,
    getUpcomingEventsCount,
    getTotalEventsAttended,
    getTotalAmountSpent,
    exportAccountData
  } = useBuyerAccount();

  const [exportLoading, setExportLoading] = useState(false);

  const handleExportData = async () => {
    setExportLoading(true);
    await exportAccountData();
    setExportLoading(false);
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-background-main py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">Loading your account...</p>
          </div>
        </div>
      </div>
    );
  }

  const upcomingEvents = dashboardData?.upcoming_events || [];
  const pastEvents = dashboardData?.past_events || [];
  const recentActivity = dashboardData?.recent_activity || [];

  return (
    <div className="min-h-screen bg-background-main py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-text-primary">My Account</h1>
            <p className="text-text-secondary">Manage your profile, events, and preferences</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {exportLoading ? 'Exporting...' : 'Export Data'}
            </Button>
            <Link to="/account/settings">
              <Button className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="bg-surface-card border-border-default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
              <Link to="/account/profile">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.profile_picture_url} />
                <AvatarFallback className="bg-brand-primary text-text-on-primary text-lg">
                  {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-text-secondary">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profile?.email}
                    </div>
                    {profile?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {profile.phone}
                      </div>
                    )}
                    {profile?.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profile.address.city}, {profile.address.state}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-background-main rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-brand-primary mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Upcoming</span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">{getUpcomingEventsCount()}</p>
                  </div>
                  <div className="text-center p-3 bg-background-main rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-brand-primary mb-1">
                      <Ticket className="h-4 w-4" />
                      <span className="text-sm font-medium">Attended</span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">{getTotalEventsAttended()}</p>
                  </div>
                  <div className="text-center p-3 bg-background-main rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-brand-primary mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Total Spent</span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">${getTotalAmountSpent()}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming" className="space-y-4">
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-background-main rounded-lg border border-border-default"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary">{event.event_title}</h3>
                          <div className="flex flex-wrap gap-4 mt-1 text-sm text-text-secondary">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(event.event_date), 'MMM d, yyyy • h:mm a')}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.event_venue}
                            </div>
                            <div className="flex items-center gap-1">
                              <Ticket className="h-3 w-3" />
                              {event.quantity} × {event.ticket_type}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="mb-2">
                            ${event.total_amount}
                          </Badge>
                          <div className="flex gap-2">
                            <Link to={`/events/${event.event_id}`}>
                              <Button variant="outline" size="sm">View Event</Button>
                            </Link>
                            {event.qr_code_url && (
                              <Link to={`/tickets/${event.id}`}>
                                <Button size="sm">View Ticket</Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming events</p>
                    <Link to="/events">
                      <Button variant="outline" className="mt-2">Browse Events</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase History */}
          <TabsContent value="history" className="space-y-4">
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
              </CardHeader>
              <CardContent>
                {pastEvents.length > 0 ? (
                  <div className="space-y-4">
                    {pastEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-background-main rounded-lg border border-border-default"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-text-primary">{event.event_title}</h3>
                          <div className="flex flex-wrap gap-4 mt-1 text-sm text-text-secondary">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(event.event_date), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.event_venue}
                            </div>
                            <div className="flex items-center gap-1">
                              <Ticket className="h-3 w-3" />
                              {event.quantity} × {event.ticket_type}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={event.status === 'completed' ? 'default' : 'destructive'}
                            className="mb-2"
                          >
                            {event.status === 'completed' ? `$${event.total_amount}` : event.status}
                          </Badge>
                          <div className="flex gap-2">
                            <Link to={`/events/${event.event_id}`}>
                              <Button variant="outline" size="sm">View Event</Button>
                            </Link>
                            <Link to={`/events/${event.event_id}/review`}>
                              <Button size="sm">Write Review</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No past events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Events */}
          <TabsContent value="saved" className="space-y-4">
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <CardTitle>Saved Events</CardTitle>
              </CardHeader>
              <CardContent>
                {savedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {savedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-background-main rounded-lg border border-border-default"
                      >
                        <div className="flex gap-4">
                          {event.event_image_url && (
                            <img
                              src={event.event_image_url}
                              alt={event.event_title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary">{event.event_title}</h3>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-text-secondary">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(event.event_date), 'MMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.event_venue}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {event.ticket_price_range}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/events/${event.event_id}`}>
                            <Button variant="outline" size="sm">View Event</Button>
                          </Link>
                          <Link to={`/events/${event.event_id}/checkout`}>
                            <Button size="sm">Buy Tickets</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No saved events</p>
                    <Link to="/events">
                      <Button variant="outline" className="mt-2">Browse Events</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Activity */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Security Activity</CardTitle>
                  <Link to="/account/security">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          activity.is_suspicious 
                            ? 'bg-destructive/10 border-destructive/20' 
                            : 'bg-background-main border-border-default'
                        }`}
                      >
                        {activity.is_suspicious && (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                        <Shield className={`h-4 w-4 flex-shrink-0 ${
                          activity.is_suspicious ? 'text-destructive' : 'text-brand-primary'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{activity.action}</p>
                          <p className="text-xs text-text-secondary">{activity.description}</p>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountDashboard; 