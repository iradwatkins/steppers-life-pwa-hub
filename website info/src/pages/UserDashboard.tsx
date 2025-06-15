import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Calendar, 
  GraduationCap, 
  Video, 
  Briefcase, 
  Store,
  Users,
  Star,
  ArrowRight,
  Settings,
  Eye,
  EyeOff,
  TrendingUp,
  Activity,
  Clock,
  MapPin,
  Award,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserDashboard } from '@/hooks/useUserDashboard';
import { useTheme } from '@/contexts/ThemeContext';
import ContentCreationDialog from '@/components/dashboard/ContentCreationDialog';
import RoleActivationCard from '@/components/dashboard/RoleActivationCard';
import DashboardWidget from '@/components/dashboard/DashboardWidget';
import ProgressSection from '@/components/dashboard/ProgressSection';

const UserDashboard = () => {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const {
    userRoles,
    activeRoles,
    userProgress,
    isLoading,
    activateRole,
    toggleWidgetVisibility,
    getVisibleWidgets,
    getAvailableContentOptions,
    getComingSoonOptions,
    getRoleActivationSuggestions
  } = useUserDashboard();

  const [showContentDialog, setShowContentDialog] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);

  const visibleWidgets = getVisibleWidgets();
  const availableContentOptions = getAvailableContentOptions();
  const comingSoonOptions = getComingSoonOptions();
  const roleSuggestions = getRoleActivationSuggestions();

  // Get icon component by name
  const getIcon = (iconName: string, className: string = "h-5 w-5") => {
    const icons: { [key: string]: React.ReactNode } = {
      Users: <Users className={className} />,
      Calendar: <Calendar className={className} />,
      GraduationCap: <GraduationCap className={className} />,
      Video: <Video className={className} />,
      Briefcase: <Briefcase className={className} />,
      Store: <Store className={className} />
    };
    return icons[iconName] || <Users className={className} />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border-b border-border-default">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-text-primary">
                Welcome back, {user?.name?.split(' ')[0] || 'Stepper'}! 👋
              </h1>
              <p className="text-text-secondary text-lg">
                Ready to step into your next adventure?
              </p>
              
              {/* Active Roles Display */}
              <div className="flex flex-wrap gap-2 mt-3">
                {userRoles.filter(role => role.isActive).map(role => (
                  <Badge 
                    key={role.id} 
                    variant="secondary" 
                    className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary"
                  >
                    {getIcon(role.icon, "h-3 w-3")}
                    {role.displayName}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content Creation Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg"
                onClick={() => setShowContentDialog(true)}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Content
              </Button>
              
              <Link to="/account/settings">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          {/* Main Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats Row */}
            {userProgress && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Profile</p>
                        <p className="text-2xl font-bold text-text-primary">{userProgress.profileCompletion}%</p>
                      </div>
                      <Users className="h-6 w-6 text-brand-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Active Roles</p>
                        <p className="text-2xl font-bold text-text-primary">{activeRoles.length}</p>
                      </div>
                      <Award className="h-6 w-6 text-brand-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Progress</p>
                        <p className="text-2xl font-bold text-text-primary">{userProgress.completedSteps}/{userProgress.totalSteps}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-brand-primary" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-secondary">Next Steps</p>
                        <p className="text-2xl font-bold text-text-primary">{userProgress.nextSteps.length}</p>
                      </div>
                      <Activity className="h-6 w-6 text-brand-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {visibleWidgets.map(widget => (
                <DashboardWidget 
                  key={widget.id} 
                  widget={widget} 
                  onToggleVisibility={toggleWidgetVisibility}
                />
              ))}
            </div>

            {/* Role Activation Suggestions */}
            {roleSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-brand-primary" />
                    Expand Your Opportunities
                  </CardTitle>
                  <CardDescription>
                    Activate new roles to unlock more features and grow your presence in the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {roleSuggestions.map(role => (
                      <RoleActivationCard 
                        key={role.id} 
                        role={role} 
                        onActivate={activateRole}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <ProgressSection userProgress={userProgress} />
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {/* Available Content Creation */}
            {availableContentOptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>What would you like to create?</CardTitle>
                  <CardDescription>
                    Based on your active roles, here's what you can create right now
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableContentOptions.map(option => (
                      <Card key={option.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-brand-primary/10 rounded-lg">
                              {getIcon(option.icon, "h-5 w-5 text-brand-primary")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-text-primary mb-1">{option.title}</h3>
                              <p className="text-sm text-text-secondary mb-3">{option.description}</p>
                              <Link to={option.route}>
                                <Button size="sm" className="w-full">
                                  Get Started
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Coming Soon Features */}
            {comingSoonOptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                  <CardDescription>
                    These features are in development and will be available soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {comingSoonOptions.map(option => (
                      <Card key={option.id} className="opacity-75">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {getIcon(option.icon, "h-5 w-5 text-gray-400")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-text-primary">{option.title}</h3>
                                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                              </div>
                              <p className="text-sm text-text-secondary">{option.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Community Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>
                  Based on your interests and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border border-border-default rounded-lg hover:bg-surface-card transition-colors">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary">Chicago Steppers Social</h3>
                      <p className="text-sm text-text-secondary">Perfect for meeting other steppers in your area</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-secondary" />
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 border border-border-default rounded-lg hover:bg-surface-card transition-colors">
                    <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary">Beginner Workshop</h3>
                      <p className="text-sm text-text-secondary">Perfect for learning the fundamentals</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Content Creation Dialog */}
      <ContentCreationDialog 
        open={showContentDialog}
        onOpenChange={setShowContentDialog}
        availableOptions={availableContentOptions}
        comingSoonOptions={comingSoonOptions}
        onSelectOption={(optionId) => {
          setSelectedContentType(optionId);
          // Handle navigation to creation flow
        }}
      />
    </div>
  );
};

export default UserDashboard; 