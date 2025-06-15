import { useState, useEffect } from 'react';
import { 
  notificationService, 
  Notification, 
  NotificationPreferences 
} from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    sent: 0,
    scheduled: 0
  });
  const { user } = useAuth();

  const loadNotifications = async (unreadOnly: boolean = false) => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [notificationsData, statsData] = await Promise.all([
        notificationService.getUserNotifications(user.id, unreadOnly),
        notificationService.getNotificationStats(user.id)
      ]);
      
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!user) {
      setPreferences(null);
      return;
    }

    try {
      const userPreferences = await notificationService.getUserPreferences(user.id);
      setPreferences(userPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        loadNotifications(),
        loadPreferences()
      ]);
    } else {
      setNotifications([]);
      setPreferences(null);
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId: string): Promise<void> => {
    if (!user) return;

    try {
      await notificationService.markNotificationAsRead(notificationId, user.id);
      await loadNotifications(); // Refresh notifications
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    if (!user) return;

    try {
      await notificationService.markAllNotificationsAsRead(user.id);
      await loadNotifications(); // Refresh notifications
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to update preferences');
    }

    try {
      await notificationService.updateUserPreferences(user.id, newPreferences);
      setPreferences(newPreferences);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  const scheduleTicketConfirmation = async (
    eventId: string,
    eventDetails: {
      title: string;
      date: string;
      time: string;
      location: string;
      ticketCount: number;
      ticketType: string;
    }
  ): Promise<void> => {
    if (!user) return;

    try {
      await notificationService.scheduleTicketConfirmation(user.id, eventId, eventDetails);
      await loadNotifications(); // Refresh to show new notification
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to schedule confirmation');
    }
  };

  const scheduleEventReminders = async (
    eventId: string,
    eventDate: Date,
    eventDetails: {
      title: string;
      time: string;
      location: string;
      address: string;
    }
  ): Promise<void> => {
    if (!user) return;

    try {
      await notificationService.scheduleEventReminders(user.id, eventId, eventDate, eventDetails);
      await loadNotifications(); // Refresh to show new notifications
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to schedule reminders');
    }
  };

  const getUnreadCount = (): number => {
    return stats.unread;
  };

  const getNotificationsByType = (type: Notification['type']): Notification[] => {
    return notifications.filter(notification => notification.type === type);
  };

  return {
    notifications,
    preferences,
    loading,
    error,
    stats,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    scheduleTicketConfirmation,
    scheduleEventReminders,
    getUnreadCount,
    getNotificationsByType,
    refresh: loadNotifications,
    refreshPreferences: loadPreferences
  };
}; 