import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import OrdersList from '@/components/orders/OrdersList';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Heart, 
  TicketCheck, 
  TrendingUp,
  Users,
  Star,
  Plus,
  ArrowRight,
  Activity,
  Receipt,
  Home
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Mock data - in real app this would come from Supabase
  const userStats = {
    eventsAttended: 12,
    upcomingEvents: 3,
    savedEvents: 8,
    totalSpent: 450
  };

  const upcomingEvents = [
    {
      id: 1,
      title: "Chicago Stepping Championship 2024",
      date: "2024-12-20",
      time: "7:00 PM",
      venue: "Navy Pier Ballroom",
      image: "/placeholder.svg",
      ticketType: "VIP",
      status: "confirmed"
    },
    {
      id: 2,
      title: "Beginner Stepping Workshop",
      date: "2024-12-15",
      time: "2:00 PM", 
      venue: "South Side Cultural Center",
      image: "/placeholder.svg",
      ticketType: "General",
      status: "confirmed"
    },
    {
      id: 3,
      title: "Holiday Stepping Social",
      date: "2024-12-22",
      time: "8:00 PM",
      venue: "Chicago Stepping Academy",
      image: "/placeholder.svg",
      ticketType: "Early Bird",
      status: "pending"
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "ticket_purchase",
      title: "Purchased ticket for Chicago Stepping Championship 2024",
      date: "2024-12-01",
      amount: "$75"
    },
    {
      id: 2,
      type: "event_saved",
      title: "Saved Advanced Stepping Techniques Workshop",
      date: "2024-11-28"
    },
    {
      id: 3,
      type: "profile_updated",
      title: "Updated profile preferences",
      date: "2024-11-25"
    },
    {
      id: 4,
      type: "ticket_purchase", 
      title: "Purchased ticket for Holiday Stepping Social",
      date: "2024-11-20",
      amount: "$45"
    }
  ];

  const savedEvents = [
    {
      id: 1,
      title: "New Year's Eve Stepping Gala",
      date: "2024-12-31",
      venue: "Palmer House Hotel",
      price: "$125",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Advanced Stepping Techniques Workshop",
      date: "2025-01-10",
      venue: "Dance Studio Chicago",
      price: "$35",
      image: "/placeholder.svg"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket_purchase':
        return <TicketCheck className="h-4 w-4 text-green-600" />;
      case 'event_saved':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'profile_updated':
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-stepping-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.first_name || 'Stepper'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your stepping journey
          </p>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              My Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Events Attended</p>
                  <p className="text-2xl font-bold">{userStats.eventsAttended}</p>
                </div>
                <Calendar className="h-6 w-6 text-stepping-purple" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{userStats.upcomingEvents}</p>
                </div>
                <Clock className="h-6 w-6 text-stepping-purple" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saved Events</p>
                  <p className="text-2xl font-bold">{userStats.savedEvents}</p>
                </div>
                <Heart className="h-6 w-6 text-stepping-purple" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${userStats.totalSpent}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-stepping-purple" />
              </div>
            </CardContent>
          </Card>
        </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    Your next stepping adventures
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/events">
                    <Plus className="h-4 w-4 mr-2" />
                    Find Events
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium line-clamp-1">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.time}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.ticketType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/events">
                    View All Events
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>
                  Your latest actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{activity.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.date)}
                        </p>
                        {activity.amount && (
                          <Badge variant="outline" className="text-xs">
                            {activity.amount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Saved Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Saved Events</CardTitle>
                  <CardDescription>
                    Events you're interested in
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/events">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedEvents.slice(0, 2).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm line-clamp-2">{event.title}</h5>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{event.venue}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.price}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/events">
                    <Calendar className="mr-2 h-4 w-4" />
                    Browse Events
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/classes">
                    <Users className="mr-2 h-4 w-4" />
                    Find Classes
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/profile">
                    <Star className="mr-2 h-4 w-4" />
                    Update Preferences
                  </Link>
                </Button>
              </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <OrdersList showHeader={false} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;