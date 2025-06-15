import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminRoute } from '@/components/auth/ProtectedRoute';
import { EventService } from '@/services/eventService';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Users, 
  Calendar, 
  TrendingUp, 
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Building,
  DollarSign,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalOrganizers: number;
  totalRevenue: number;
  recentEvents: any[];
  recentUsers: any[];
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { role, isSuperAdmin, isAdmin } = useRoles();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalOrganizers: 0,
    totalRevenue: 0,
    recentEvents: [],
    recentUsers: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch basic stats
        const [usersResult, eventsResult, organizersResult] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('organizers').select('id', { count: 'exact', head: true }),
        ]);

        // Fetch recent events
        const { data: recentEvents } = await supabase
          .from('events')
          .select(`
            id,
            title,
            status,
            start_date,
            organizers (
              organization_name
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch recent users
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalUsers: usersResult.count || 0,
          totalEvents: eventsResult.count || 0,
          totalOrganizers: organizersResult.count || 0,
          totalRevenue: 0, // TODO: Calculate from orders
          recentEvents: recentEvents || [],
          recentUsers: recentUsers || [],
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-6 w-6 text-blue-600" />,
      description: 'Registered platform users',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      description: 'Events created on platform',
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Active Organizers',
      value: stats.totalOrganizers,
      icon: <Building className="h-6 w-6 text-purple-600" />,
      description: 'Verified event organizers',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Platform Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6 text-orange-600" />,
      description: 'Total revenue generated',
      color: 'bg-orange-50 border-orange-200'
    },
  ];

  if (isLoading) {
    return (
      <AdminRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 animate-pulse" />
                Loading Dashboard
              </CardTitle>
              <CardDescription>Fetching admin dashboard data...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {role}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Platform overview and management tools for SteppersLife
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/admin/create-event')} className="bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className={stat.color}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">
                        {stat.value}
                      </p>
                    </div>
                    {stat.icon}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Events
                </CardTitle>
                <CardDescription>
                  Latest events created on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentEvents.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            by {event.organizers?.organization_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={event.status === 'published' ? 'default' : 'secondary'}
                          >
                            {event.status}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => navigate(`/events/${event.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No events found
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Users
                </CardTitle>
                <CardDescription>
                  Newest platform registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentUsers.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{user.full_name || 'Unnamed User'}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {user.role}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No users found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks and platform management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate('/admin/users')}
                >
                  <Users className="h-6 w-6" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate('/admin/events')}
                >
                  <Calendar className="h-6 w-6" />
                  Manage Events
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate('/admin/organizers')}
                >
                  <Building className="h-6 w-6" />
                  Manage Organizers
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => navigate('/admin/reports')}
                >
                  <TrendingUp className="h-6 w-6" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminDashboard;