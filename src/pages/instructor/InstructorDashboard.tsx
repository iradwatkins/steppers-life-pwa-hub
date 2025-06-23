import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  DollarSign, 
  Play, 
  Calendar, 
  TrendingUp, 
  Star,
  Eye,
  Heart,
  MessageCircle,
  Plus,
  Settings,
  Crown,
  BookOpen,
  Video,
  Upload
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { classesService } from '@/services/classesService';
import type { InstructorProfile, InstructorSubscription, VODClass, PhysicalClass } from '@/types/classes';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [subscription, setSubscription] = useState<InstructorSubscription | null>(null);
  const [vodClasses, setVodClasses] = useState<VODClass[]>([]);
  const [physicalClasses, setPhysicalClasses] = useState<PhysicalClass[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        profileResult,
        subscriptionResult,
        vodResult,
        physicalResult,
        analyticsResult,
        earningsResult
      ] = await Promise.all([
        classesService.getInstructorProfile(user!.id),
        classesService.getInstructorSubscription(user!.id),
        classesService.getVODClasses({ instructor_id: user!.id }),
        classesService.getPhysicalClasses({ instructor_id: user!.id }),
        classesService.getInstructorAnalytics(user!.id),
        classesService.getInstructorEarnings(user!.id)
      ]);

      if (profileResult.success) setProfile(profileResult.data);
      if (subscriptionResult.success) setSubscription(subscriptionResult.data);
      if (vodResult.success) setVodClasses(vodResult.data || []);
      if (physicalResult.success) setPhysicalClasses(physicalResult.data || []);
      if (analyticsResult.success) setAnalytics(analyticsResult.data);
      if (earningsResult.success) setEarnings(earningsResult.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatsCard = ({ title, value, icon: Icon, trend, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    trend?: string;
    subtitle?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading instructor dashboard...</div>
      </div>
    );
  }

  const hasActiveSubscription = subscription?.status === 'active';
  const canCreateVOD = hasActiveSubscription;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your classes, track performance, and grow your following
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/instructor/profile">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          {!hasActiveSubscription && (
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500" asChild>
              <Link to="/instructor/subscribe">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to VOD
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Subscription Status */}
      {hasActiveSubscription ? (
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800">VOD Instructor Active</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              {subscription?.tier?.name} Plan - Next billing: {new Date(subscription?.current_period_end!).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Ready to Create VOD Classes?</CardTitle>
            <CardDescription className="text-blue-700">
              Subscribe to our VOD Instructor plan to upload video classes and earn revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link to="/instructor/subscribe">
                Start VOD Subscription - $40/month
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Students"
          value={profile?.total_students || 0}
          icon={Users}
          trend={analytics?.student_growth || undefined}
        />
        <StatsCard
          title="Revenue This Month"
          value={`$${earnings?.current_month || 0}`}
          icon={DollarSign}
          trend={earnings?.growth_percentage ? `+${earnings.growth_percentage}%` : undefined}
        />
        <StatsCard
          title="Total Classes"
          value={profile?.total_classes || 0}
          icon={BookOpen}
          subtitle={`${vodClasses.length} VOD, ${physicalClasses.length} Physical`}
        />
        <StatsCard
          title="Average Rating"
          value={profile?.average_rating?.toFixed(1) || '0.0'}
          icon={Star}
          subtitle={`${analytics?.total_reviews || 0} reviews`}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vod-classes">VOD Classes</TabsTrigger>
          <TabsTrigger value="physical-classes">Physical Classes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="h-20 flex-col gap-2" asChild>
                  <Link to="/classes/create/physical">
                    <Calendar className="h-6 w-6" />
                    Create Physical Class
                  </Link>
                </Button>
                <Button 
                  className="h-20 flex-col gap-2" 
                  disabled={!canCreateVOD}
                  asChild={canCreateVOD}
                >
                  {canCreateVOD ? (
                    <Link to="/classes/create/vod">
                      <Video className="h-6 w-6" />
                      Create VOD Class
                    </Link>
                  ) : (
                    <>
                      <Video className="h-6 w-6" />
                      Create VOD Class
                      <span className="text-xs opacity-75">(Subscription Required)</span>
                    </>
                  )}
                </Button>
                <Button className="h-20 flex-col gap-2" variant="outline" asChild>
                  <Link to="/instructor/profile">
                    <Settings className="h-6 w-6" />
                    Update Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent VOD Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vodClasses.slice(0, 3).map((vodClass) => (
                    <div key={vodClass.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vodClass.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {vodClass.student_count} students • ${vodClass.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={vodClass.status === 'published' ? 'default' : 'secondary'}>
                          {vodClass.status}
                        </Badge>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/classes/vod/${vodClass.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {vodClasses.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No VOD classes yet. {!canCreateVOD && 'Subscribe to create VOD classes.'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Physical Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {physicalClasses.slice(0, 3).map((physicalClass) => (
                    <div key={physicalClass.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{physicalClass.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {physicalClass.current_students}/{physicalClass.max_students} students
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(physicalClass.current_students / physicalClass.max_students) * 100} 
                          className="w-20" 
                        />
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/classes/physical/${physicalClass.id}/manage`}>
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {physicalClasses.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No physical classes yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vod-classes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your VOD Classes</CardTitle>
                <Button disabled={!canCreateVOD} asChild={canCreateVOD}>
                  {canCreateVOD ? (
                    <Link to="/classes/create/vod">
                      <Plus className="h-4 w-4 mr-2" />
                      Create VOD Class
                    </Link>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create VOD Class
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!canCreateVOD ? (
                <div className="text-center py-8">
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">VOD Subscription Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Subscribe to our VOD Instructor plan to create and sell video classes
                  </p>
                  <Button asChild>
                    <Link to="/instructor/subscribe">
                      Subscribe for $40/month
                    </Link>
                  </Button>
                </div>
              ) : vodClasses.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No VOD Classes Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start creating video-on-demand classes to reach more students
                  </p>
                  <Button asChild>
                    <Link to="/classes/create/vod">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First VOD Class
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vodClasses.map((vodClass) => (
                    <Card key={vodClass.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        {vodClass.thumbnail_url ? (
                          <img 
                            src={vodClass.thumbnail_url} 
                            alt={vodClass.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2">
                          {vodClass.status}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{vodClass.title}</h4>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>{vodClass.student_count} students</span>
                          <span>${vodClass.price}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{vodClass.rating_average.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">
                            ({vodClass.rating_count})
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" asChild>
                            <Link to={`/classes/vod/${vodClass.id}`}>
                              View
                            </Link>
                          </Button>
                          <Button size="sm" className="flex-1" asChild>
                            <Link to={`/classes/vod/${vodClass.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physical-classes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Physical Classes</CardTitle>
                <Button asChild>
                  <Link to="/classes/create/physical">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Physical Class
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {physicalClasses.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Physical Classes Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create in-person classes to teach students directly
                  </p>
                  <Button asChild>
                    <Link to="/classes/create/physical">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Physical Class
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {physicalClasses.map((physicalClass) => (
                    <Card key={physicalClass.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">{physicalClass.title}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <p className="font-medium">Students</p>
                                <p>{physicalClass.current_students}/{physicalClass.max_students}</p>
                              </div>
                              <div>
                                <p className="font-medium">Price</p>
                                <p>${physicalClass.price}</p>
                              </div>
                              <div>
                                <p className="font-medium">Location</p>
                                <p>{physicalClass.location}</p>
                              </div>
                              <div>
                                <p className="font-medium">Status</p>
                                <Badge variant={physicalClass.status === 'published' ? 'default' : 'secondary'}>
                                  {physicalClass.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/classes/physical/${physicalClass.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button size="sm" asChild>
                              <Link to={`/classes/physical/${physicalClass.id}/manage`}>
                                Manage
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Views</span>
                    <span className="font-semibold">{analytics?.total_views || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="font-semibold">{analytics?.completion_rate || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Watch Time</span>
                    <span className="font-semibold">{analytics?.avg_watch_time || '0m'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Student Retention</span>
                    <span className="font-semibold">{analytics?.retention_rate || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Total Likes</span>
                    </div>
                    <span className="font-semibold">{analytics?.total_likes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Comments</span>
                    </div>
                    <span className="font-semibold">{analytics?.total_comments || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Followers</span>
                    </div>
                    <span className="font-semibold">{profile?.followers_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Reviews</span>
                    </div>
                    <span className="font-semibold">{analytics?.total_reviews || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-semibold text-green-600">
                      ${earnings?.current_month || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Month</span>
                    <span className="font-semibold">${earnings?.previous_month || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Earnings</span>
                    <span className="font-semibold">${earnings?.total_earnings || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Payout</span>
                    <span className="font-semibold">${earnings?.pending_payout || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hasActiveSubscription ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Monthly Fee</span>
                        <span className="font-semibold text-red-600">
                          -${subscription?.tier?.monthly_fee || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Commission Rate</span>
                        <span className="font-semibold">
                          {subscription?.tier?.commission_rate || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Net Earnings</span>
                        <span className="font-semibold text-green-600">
                          ${(earnings?.current_month || 0) - (subscription?.tier?.monthly_fee || 0)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">
                        No subscription costs - physical classes only
                      </p>
                      <Button asChild>
                        <Link to="/instructor/subscribe">
                          Upgrade to VOD Plan
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructorDashboard;