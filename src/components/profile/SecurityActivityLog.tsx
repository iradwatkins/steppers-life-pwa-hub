import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SecurityActivity {
  id: string;
  activity_type: string;
  description: string;
  ip_address: string;
  user_agent: string;
  location: string;
  device_type: string;
  is_suspicious: boolean;
  risk_score: number;
  created_at: string;
}

const SecurityActivityLog: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<SecurityActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'suspicious' | 'normal'>('all');

  const loadSecurityActivity = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mock data for now
      const mockActivities: SecurityActivity[] = [];
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error loading security activity:', error);
      toast.error('Failed to load security activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityActivity();
  }, [user]);

  const getActivityIcon = (activityType: string) => {
    switch (activityType.toLowerCase()) {
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'login_failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'password_change':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getRiskBadge = (riskScore: number, isSuspicious: boolean) => {
    if (isSuspicious || riskScore > 70) {
      return <Badge variant="destructive">High Risk</Badge>;
    } else if (riskScore > 40) {
      return <Badge variant="secondary">Medium Risk</Badge>;
    } else {
      return <Badge variant="outline">Low Risk</Badge>;
    }
  };

  const filteredActivities = activities.filter(activity => {
    switch (filter) {
      case 'suspicious':
        return activity.is_suspicious || activity.risk_score > 70;
      case 'normal':
        return !activity.is_suspicious && activity.risk_score <= 70;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading security activity...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Activity
        </CardTitle>
        <CardDescription>
          Monitor your account security and login activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Activity
          </Button>
          <Button
            variant={filter === 'suspicious' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('suspicious')}
          >
            Suspicious
          </Button>
          <Button
            variant={filter === 'normal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('normal')}
          >
            Normal
          </Button>
        </div>

        {filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No security activity found</p>
            <p className="text-sm">Your account activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={`border rounded-lg p-4 ${
                  activity.is_suspicious ? 'border-red-200 bg-red-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getActivityIcon(activity.activity_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{activity.activity_type.replace('_', ' ').toUpperCase()}</span>
                        {getRiskBadge(activity.risk_score, activity.is_suspicious)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(activity.device_type)}
                          <span>{activity.device_type}</span>
                        </div>
                        {activity.location && (
                          <span>{activity.location}</span>
                        )}
                        {activity.ip_address && (
                          <span>{activity.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityActivityLog;
