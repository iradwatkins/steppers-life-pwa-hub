import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  BellRing, 
  Calendar, 
  Clock, 
  Mail, 
  MessageSquare, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  MoreHorizontal,
  Trash2,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Notification } from '@/services/notificationService';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow, format } from 'date-fns';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { 
    notifications, 
    loading, 
    stats, 
    markAsRead, 
    markAllAsRead,
    getNotificationsByType
  } = useNotifications();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    const iconProps = {
      className: `w-4 h-4 ${
        priority === 'urgent' ? 'text-red-500' :
        priority === 'high' ? 'text-orange-500' :
        priority === 'medium' ? 'text-blue-500' :
        'text-gray-500'
      }`
    };

    switch (type) {
      case 'confirmation':
        return <CheckCircle {...iconProps} />;
      case 'reminder':
        return <Clock {...iconProps} />;
      case 'update':
        return <AlertCircle {...iconProps} />;
      case 'announcement':
        return <MessageSquare {...iconProps} />;
      case 'cancellation':
        return <AlertTriangle {...iconProps} className="text-red-500" />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.readAt);
      case 'reminders':
        return getNotificationsByType('reminder');
      case 'updates':
        return getNotificationsByType('update');
      default:
        return notifications;
    }
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div 
      className={`
        border-l-4 p-4 rounded-r-lg transition-all duration-200 hover:shadow-md cursor-pointer
        ${notification.readAt ? 'opacity-70' : 'shadow-sm'}
        ${getPriorityColor(notification.priority)}
      `}
      onClick={() => !notification.readAt && handleMarkAsRead(notification.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-1">
            {getNotificationIcon(notification.type, notification.priority)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-text-primary text-sm truncate">
                {notification.title}
              </h4>
              {!notification.readAt && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-2">
              {notification.message}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span>
                  {formatDistanceToNow(notification.scheduledFor, { addSuffix: true })}
                </span>
                {notification.sentAt && (
                  <Badge variant="outline" className="text-xs">
                    Sent
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {notification.type}
                </Badge>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.readAt && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}>
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => e.stopPropagation()}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={`relative ${className}`}>
          {stats.unread > 0 ? (
            <BellRing className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {stats.unread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {stats.unread > 99 ? '99+' : stats.unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {stats.unread > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark All Read
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span>{stats.total} total</span>
              <span>{stats.unread} unread</span>
              <span>{stats.scheduled} upcoming</span>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mx-4 mb-4">
                <TabsTrigger value="all" className="text-xs">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread ({stats.unread})
                </TabsTrigger>
                <TabsTrigger value="reminders" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Reminders
                </TabsTrigger>
                <TabsTrigger value="updates" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Updates
                </TabsTrigger>
              </TabsList>

              <div className="max-h-96 overflow-y-auto px-4 pb-4">
                <TabsContent value="all" className="mt-0 space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse border-l-4 border-gray-200 p-4 rounded-r-lg">
                          <div className="flex gap-3">
                            <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
                            <div className="flex-1">
                              <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                              <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
                              <div className="w-24 h-3 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : getFilteredNotifications().length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                      <p className="text-text-secondary">No notifications yet</p>
                    </div>
                  ) : (
                    getFilteredNotifications().map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="unread" className="mt-0 space-y-3">
                  {getFilteredNotifications().length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-8 h-8 text-feedback-success mx-auto mb-2" />
                      <p className="text-text-secondary">All caught up!</p>
                    </div>
                  ) : (
                    getFilteredNotifications().map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="reminders" className="mt-0 space-y-3">
                  {getFilteredNotifications().length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                      <p className="text-text-secondary">No reminders</p>
                    </div>
                  ) : (
                    getFilteredNotifications().map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="updates" className="mt-0 space-y-3">
                  {getFilteredNotifications().length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                      <p className="text-text-secondary">No updates</p>
                    </div>
                  ) : (
                    getFilteredNotifications().map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter; 