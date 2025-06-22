import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/layout/ThemeProvider';
import OrdersList from '@/components/orders/OrdersList';
import TicketDisplay from '@/components/tickets/TicketDisplay';
import { supabase } from '@/integrations/supabase/client';
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
  Home,
  QrCode,
  CreditCard,
  User,
  Store,
  Briefcase,
  GraduationCap,
  Megaphone,
  Settings,
  Moon,
  Sun,
  Monitor,
  Crown,
  Shield,
  UserPlus,
  BarChart3,
  FileText,
  Camera
} from 'lucide-react';

// User role types
type UserRole = 'attendee' | 'organizer' | 'instructor' | 'admin';

interface UserProfile {
  id: string;
  roles: UserRole[];
  isOrganizer: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    dashboardLayout: 'compact' | 'expanded';
    notifications: boolean;
  };
}

// Content creation options
interface ContentOption {
  type: 'event' | 'class' | 'service' | 'store';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  route: string;
  requiredRole?: UserRole;
  color: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // User profile and role state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isRoleActivationOpen, setIsRoleActivationOpen] = useState(false);
  const [isDashboardCustomizationOpen, setIsDashboardCustomizationOpen] = useState(false);

  // Dashboard data state
  const [userStats, setUserStats] = useState({
    eventsAttended: 0,
    upcomingEvents: 0,
    savedEvents: 0,
    totalSpent: 0,
    eventsCreated: 0,
    classesInstructed: 0,
    servicesOffered: 0,
    storesManaged: 0
  });

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);

  // Content creation options
  const contentOptions: ContentOption[] = [
    {
      type: 'event',
      title: 'Create Event',
      description: 'Host stepping events and manage attendees',
      icon: Calendar,
      route: '/events/create',
      requiredRole: 'organizer',
      color: 'bg-blue-500'
    },
    {
      type: 'class',
      title: 'Offer Class',
      description: 'Teach stepping classes and workshops',
      icon: GraduationCap,
      route: '/classes/create',
      requiredRole: 'instructor',
      color: 'bg-green-500'
    },
    {
      type: 'service',
      title: 'List Service',
      description: 'Offer stepping-related services',
      icon: Briefcase,
      route: '/community/services/create',
      color: 'bg-purple-500'
    },
    {
      type: 'store',
      title: 'Add Store',
      description: 'List your stepping store or products',
      icon: Store,
      route: '/community/stores/create',
      color: 'bg-orange-500'
    }
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load user profile and role data
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserStats();
      loadDashboardData();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      // Check user roles from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        return;
      }

      // Default profile if none exists
      const defaultProfile: UserProfile = {
        id: user?.id || '',
        roles: ['attendee'],
        isOrganizer: false,
        isInstructor: false,
        isAdmin: user?.email?.includes('admin') || false,
        preferences: {
          theme: theme as 'light' | 'dark' | 'system',
          dashboardLayout: 'expanded',
          notifications: true
        }
      };

      if (profile) {
        setUserProfile({
          ...defaultProfile,
          roles: profile.roles || ['attendee'],
          isOrganizer: profile.is_organizer || false,
          isInstructor: profile.is_instructor || false,
          isAdmin: profile.is_admin || false,
          preferences: {
            ...defaultProfile.preferences,
            ...profile.preferences
          }
        });
      } else {
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      // Load user statistics from various tables
      const [ordersResult, eventsResult, classesResult] = await Promise.all([
        supabase
          .from('orders')
          .select('total_amount')
          .eq('user_id', user?.id),
        supabase
          .from('events')
          .select('id')
          .eq('organizer_id', user?.id),
        supabase
          .from('classes')
          .select('id')
          .eq('instructor_id', user?.id)
      ]);

      const totalSpent = ordersResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const eventsCreated = eventsResult.data?.length || 0;
      const classesInstructed = classesResult.data?.length || 0;

      setUserStats(prev => ({
        ...prev,
        totalSpent,
        eventsCreated,
        classesInstructed
      }));
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load upcoming events, recent activity, saved events
      // This would be implemented with real Supabase queries
      // For now, using placeholder data structure
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const activateRole = async (role: UserRole) => {
    if (!user || !userProfile) return;

    try {
      const updatedRoles = [...userProfile.roles];
      if (!updatedRoles.includes(role)) {
        updatedRoles.push(role);
      }

      const updatedProfile = {
        ...userProfile,
        roles: updatedRoles,
        isOrganizer: role === 'organizer' ? true : userProfile.isOrganizer,
        isInstructor: role === 'instructor' ? true : userProfile.isInstructor
      };

      // Update in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          roles: updatedRoles,
          is_organizer: updatedProfile.isOrganizer,
          is_instructor: updatedProfile.isInstructor,
          is_admin: updatedProfile.isAdmin,
          preferences: updatedProfile.preferences
        });

      if (error) throw error;

      setUserProfile(updatedProfile);
      setIsRoleActivationOpen(false);
    } catch (error) {
      console.error('Error activating role:', error);
    }
  };

  const updateThemePreference = async (newTheme: 'light' | 'dark' | 'system') => {
    if (!user || !userProfile) return;

    try {
      const updatedProfile = {
        ...userProfile,
        preferences: {
          ...userProfile.preferences,
          theme: newTheme
        }
      };

      // Update in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferences: updatedProfile.preferences
        });

      if (error) throw error;

      setUserProfile(updatedProfile);
      setTheme(newTheme);
    } catch (error) {
      console.error('Error updating theme preference:', error);
    }
  };

  const getAvailableContentOptions = () => {
    if (!userProfile) return contentOptions.filter(option => !option.requiredRole);

    return contentOptions.filter(option => {
      if (!option.requiredRole) return true;
      return userProfile.roles.includes(option.requiredRole);
    });
  };

  const getRoleBasedStats = () => {
    const stats = [
      {
        label: 'Events Attended',
        value: userStats.eventsAttended,
        icon: Calendar,
        color: 'text-blue-500'
      },
      {
        label: 'Upcoming Events',
        value: userStats.upcomingEvents,
        icon: Clock,
        color: 'text-green-500'
      },
      {
        label: 'Saved Events',
        value: userStats.savedEvents,
        icon: Heart,
        color: 'text-red-500'
      },
      {
        label: 'Total Spent',
        value: `$${userStats.totalSpent}`,
        icon: TrendingUp,
        color: 'text-purple-500'
      }
    ];

    // Add role-specific stats
    if (userProfile?.isOrganizer) {
      stats.push({
        label: 'Events Created',
        value: userStats.eventsCreated,
        icon: Megaphone,
        color: 'text-orange-500'
      });
    }

    if (userProfile?.isInstructor) {
      stats.push({
        label: 'Classes Instructed',
        value: userStats.classesInstructed,
        icon: GraduationCap,
        color: 'text-indigo-500'
      });
    }

    return stats;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket_purchase':
        return <TicketCheck className="h-4 w-4 text-green-600" />;
      case 'event_saved':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'profile_updated':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'event_created':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'class_created':
        return <GraduationCap className="h-4 w-4 text-green-600" />;
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

  const roleBasedStats = getRoleBasedStats();
  const availableContentOptions = getAvailableContentOptions();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header with Role Info and Theme Toggle */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.user_metadata?.first_name || 'Stepper'}!
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-muted-foreground">
                  Here's what's happening with your stepping journey
                </p>
                {userProfile?.roles && userProfile.roles.length > 1 && (
                  <div className="flex gap-1">
                    {userProfile.roles.map(role => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateThemePreference(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>

              {/* Role Activation */}
              <Dialog open={isRoleActivationOpen} onOpenChange={setIsRoleActivationOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Activate Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Activate New Role</DialogTitle>
                    <DialogDescription>
                      Unlock new features by activating additional roles on the platform
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-4 py-4">
                    {(['organizer', 'instructor'] as UserRole[]).map(role => (
                      <div key={role} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {role === 'organizer' && <Megaphone className="h-5 w-5 text-orange-500" />}
                          {role === 'instructor' && <GraduationCap className="h-5 w-5 text-green-500" />}
                          <div>
                            <h4 className="font-medium capitalize">{role}</h4>
                            <p className="text-sm text-muted-foreground">
                              {role === 'organizer' && 'Create and manage events'}
                              {role === 'instructor' && 'Teach classes and workshops'}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          disabled={userProfile?.roles.includes(role)}
                          onClick={() => activateRole(role)}
                        >
                          {userProfile?.roles.includes(role) ? 'Active' : 'Activate'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Dashboard Customization */}
              <Dialog open={isDashboardCustomizationOpen} onOpenChange={setIsDashboardCustomizationOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dashboard Preferences</DialogTitle>
                    <DialogDescription>
                      Customize your dashboard experience
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Theme</label>
                      <div className="flex gap-2">
                        {(['light', 'dark', 'system'] as const).map(themeOption => (
                          <Button
                            key={themeOption}
                            variant={userProfile?.preferences.theme === themeOption ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateThemePreference(themeOption)}
                            className="flex items-center gap-2"
                          >
                            {themeOption === 'light' && <Sun className="h-4 w-4" />}
                            {themeOption === 'dark' && <Moon className="h-4 w-4" />}
                            {themeOption === 'system' && <Monitor className="h-4 w-4" />}
                            {themeOption}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Content Creation Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Content
              </CardTitle>
              <CardDescription>
                Share your stepping expertise with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {availableContentOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.type}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50"
                      asChild
                    >
                      <Link to={option.route}>
                        <div className={`p-3 rounded-full ${option.color} text-white`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                          <h4 className="font-medium">{option.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value })} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              My Tickets
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Dynamic Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {roleBasedStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                    {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 ? (
                      upcomingEvents.map((event) => (
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
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No upcoming events</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link to="/events">Browse Events</Link>
                        </Button>
                      </div>
                    )}
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
                    {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
                      recentActivity.slice(0, 4).map((activity) => (
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
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                    )}
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
                      <Link to="/tickets">
                        <TicketCheck className="mr-2 h-4 w-4" />
                        My Tickets
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/community">
                        <Store className="mr-2 h-4 w-4" />
                        Community
                      </Link>
                    </Button>
                    {userProfile?.isOrganizer && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/organizer/events">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Manage Events
                        </Link>
                      </Button>
                    )}
                    {userProfile?.isAdmin && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/admin">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <TicketDisplay />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersList showHeader={false} />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}</div>
                      <div><strong>Email:</strong> {user?.email}</div>
                      <div><strong>Phone:</strong> {user?.user_metadata?.phone || 'Not provided'}</div>
                      <div><strong>Roles:</strong> {userProfile?.roles.join(', ') || 'Attendee'}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Account Settings</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <Link to="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <Link to="/forgot-password">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Change Password
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => setIsRoleActivationOpen(true)}
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Activate Roles
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;