import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye,
  EyeOff,
  MoreHorizontal,
  Calendar,
  Ticket,
  GraduationCap,
  Star,
  TrendingUp,
  Activity,
  Clock,
  MapPin,
  ArrowRight,
  DollarSign,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';
import { DashboardWidget as Widget } from '@/services/userDashboardService';

interface DashboardWidgetProps {
  widget: Widget;
  onToggleVisibility: (widgetId: string, isVisible: boolean) => Promise<void>;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  widget,
  onToggleVisibility
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleVisibility = async () => {
    setIsToggling(true);
    try {
      await onToggleVisibility(widget.id, !widget.isVisible);
    } finally {
      setIsToggling(false);
    }
  };

  // Render different widget types
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'stats':
        return renderStatsWidget();
      case 'recent_activity':
        return renderRecentActivityWidget();
      case 'recommendations':
        return renderRecommendationsWidget();
      case 'progress':
        return renderProgressWidget();
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const renderStatsWidget = () => {
    const { data } = widget;

    if (widget.id === 'upcoming_events') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-brand-primary">{data.count}</span>
            <Calendar className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="space-y-3">
            {data.items?.slice(0, 3).map((event: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-surface-card rounded-lg">
                <div className="w-2 h-2 bg-brand-primary rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary text-sm">{event.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.date} at {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/account">
            <Button variant="outline" size="sm" className="w-full">
              View All Events
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      );
    }

    if (widget.id === 'organizer_stats') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-surface-card rounded-lg">
            <div className="text-2xl font-bold text-text-primary">{data.total_events}</div>
            <div className="text-xs text-text-secondary">Total Events</div>
          </div>
          <div className="text-center p-3 bg-surface-card rounded-lg">
            <div className="text-2xl font-bold text-brand-primary">{data.active_events}</div>
            <div className="text-xs text-text-secondary">Active</div>
          </div>
          <div className="text-center p-3 bg-surface-card rounded-lg">
            <div className="text-2xl font-bold text-green-600">${data.total_revenue}</div>
            <div className="text-xs text-text-secondary">Revenue</div>
          </div>
          <div className="text-center p-3 bg-surface-card rounded-lg">
            <div className="text-2xl font-bold text-text-primary">{data.total_attendees}</div>
            <div className="text-xs text-text-secondary">Attendees</div>
          </div>
        </div>
      );
    }

    if (widget.id === 'instructor_stats') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-surface-card rounded-lg">
            <div className="text-2xl font-bold text-text-primary">{data.total_classes}</div>
            <div className="text-xs text-text-secondary">Total Classes</div>
          </div>
          <div className="text-center p-3 bg-surface-card rounded-lg">
            <div className="text-2xl font-bold text-brand-primary">{data.active_classes}</div>
            <div className="text-xs text-text-secondary">Active</div>
          </div>
          <div className="text-center p-3 bg-surface-card rounded-lg">
            <div className="text-2xl font-bold text-text-primary">{data.total_students}</div>
            <div className="text-xs text-text-secondary">Students</div>
          </div>
          <div className="text-center p-3 bg-surface-card rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
              <Star className="w-4 h-4" />
              {data.average_rating}
            </div>
            <div className="text-xs text-text-secondary">Rating</div>
          </div>
        </div>
      );
    }

    return <div>Stats data</div>;
  };

  const renderRecentActivityWidget = () => {
    const { data } = widget;
    
    return (
      <div className="space-y-3">
        {data.activities?.map((activity: any, index: number) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-surface-card rounded-lg">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm text-text-primary">
                  {getActivityText(activity)}
                </p>
                {activity.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < activity.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-text-secondary">{activity.date}</p>
            </div>
          </div>
        ))}
        <Link to="/account">
          <Button variant="outline" size="sm" className="w-full">
            View All Activity
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>
    );
  };

  const renderRecommendationsWidget = () => {
    const { data } = widget;
    
    return (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm">{data.message}</p>
        <div className="space-y-2">
          {data.suggestions?.map((suggestion: any, index: number) => (
            <Link key={index} to={suggestion.route}>
              <div className="flex items-center gap-3 p-3 bg-surface-card rounded-lg hover:bg-surface-contrast transition-colors">
                <div className="p-1.5 bg-brand-primary/10 rounded">
                  {getRecommendationIcon(suggestion.icon)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{suggestion.title}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const renderProgressWidget = () => {
    return <div>Progress widget content</div>;
  };

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      ticket_purchase: <Ticket className="h-4 w-4 text-brand-primary" />,
      class_enrollment: <GraduationCap className="h-4 w-4 text-brand-primary" />,
      review_posted: <Star className="h-4 w-4 text-brand-primary" />,
      event_created: <Calendar className="h-4 w-4 text-brand-primary" />
    };
    return icons[type] || <Activity className="h-4 w-4 text-brand-primary" />;
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'ticket_purchase':
        return `Purchased ticket for ${activity.event}`;
      case 'class_enrollment':
        return `Enrolled in ${activity.class}`;
      case 'review_posted':
        return `Reviewed ${activity.event}`;
      default:
        return 'Activity';
    }
  };

  const getRecommendationIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      User: <Users className="h-3 w-3 text-brand-primary" />,
      Calendar: <Calendar className="h-3 w-3 text-brand-primary" />,
      GraduationCap: <GraduationCap className="h-3 w-3 text-brand-primary" />,
      MessageCircle: <Activity className="h-3 w-3 text-brand-primary" />
    };
    return icons[iconName] || <Activity className="h-3 w-3 text-brand-primary" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{widget.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleToggleVisibility}
                disabled={isToggling}
              >
                {widget.isVisible ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Widget
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Widget
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {widget.roleRestriction && (
          <div className="flex flex-wrap gap-1">
            {widget.roleRestriction.map(role => (
              <Badge key={role} variant="secondary" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
};

export default DashboardWidget; 