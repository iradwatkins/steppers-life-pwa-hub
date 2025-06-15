// Notification Service for managing event notifications and reminders
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  reminders: {
    sevenDays: boolean;
    oneDay: boolean;
    twoHours: boolean;
  };
  eventUpdates: boolean;
  organizerAnnouncements: boolean;
  marketing: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  eventId: string;
  type: 'reminder' | 'update' | 'announcement' | 'confirmation' | 'cancellation';
  title: string;
  message: string;
  scheduledFor: Date;
  sentAt?: Date;
  readAt?: Date;
  channels: ('email' | 'sms' | 'push')[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: {
    eventTitle?: string;
    eventDate?: string;
    reminderType?: '7days' | '1day' | '2hours';
    updateType?: 'time' | 'venue' | 'general' | 'cancellation';
  };
}

export interface NotificationTemplate {
  id: string;
  type: string;
  subject: string;
  emailBody: string;
  smsBody: string;
  pushBody: string;
  variables: string[];
}

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  url?: string;
}

class NotificationService {
  private notifications: Notification[] = [];
  private userPreferences: Map<string, NotificationPreferences> = new Map();
  private templates: NotificationTemplate[] = [];

  constructor() {
    this.initializeTemplates();
    this.initializeMockData();
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'ticket-confirmation',
        type: 'confirmation',
        subject: 'Your ticket confirmation for {{eventTitle}}',
        emailBody: `
          <h2>Ticket Confirmation</h2>
          <p>Thank you for purchasing tickets to <strong>{{eventTitle}}</strong>!</p>
          <div style="border: 1px solid #ddd; padding: 16px; margin: 16px 0;">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> {{eventTitle}}</p>
            <p><strong>Date:</strong> {{eventDate}}</p>
            <p><strong>Time:</strong> {{eventTime}}</p>
            <p><strong>Location:</strong> {{eventLocation}}</p>
            <p><strong>Tickets:</strong> {{ticketCount}} x {{ticketType}}</p>
          </div>
          <p>We'll send you reminders as the event approaches. Have questions? Contact us anytime!</p>
        `,
        smsBody: 'Tickets confirmed for {{eventTitle}} on {{eventDate}}! Check your email for details.',
        pushBody: 'Tickets confirmed for {{eventTitle}}',
        variables: ['eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'ticketCount', 'ticketType']
      },
      {
        id: 'reminder-7days',
        type: 'reminder',
        subject: '{{eventTitle}} is coming up in one week!',
        emailBody: `
          <h2>Event Reminder</h2>
          <p>Just a friendly reminder that <strong>{{eventTitle}}</strong> is coming up in one week!</p>
          <div style="border: 1px solid #ddd; padding: 16px; margin: 16px 0;">
            <h3>Event Details:</h3>
            <p><strong>Date:</strong> {{eventDate}}</p>
            <p><strong>Time:</strong> {{eventTime}}</p>
            <p><strong>Location:</strong> {{eventLocation}}</p>
          </div>
          <p>Need directions? Check parking? Review event details anytime in your account.</p>
        `,
        smsBody: 'Reminder: {{eventTitle}} is in 1 week! {{eventDate}} at {{eventTime}}',
        pushBody: '{{eventTitle}} is coming up in one week!',
        variables: ['eventTitle', 'eventDate', 'eventTime', 'eventLocation']
      },
      {
        id: 'reminder-1day',
        type: 'reminder',
        subject: 'Tomorrow: {{eventTitle}}',
        emailBody: `
          <h2>Event Tomorrow!</h2>
          <p><strong>{{eventTitle}}</strong> is tomorrow! We can't wait to see you there.</p>
          <div style="border: 1px solid #ddd; padding: 16px; margin: 16px 0;">
            <h3>Event Details:</h3>
            <p><strong>Date:</strong> {{eventDate}}</p>
            <p><strong>Time:</strong> {{eventTime}}</p>
            <p><strong>Location:</strong> {{eventLocation}}</p>
            <p><strong>Address:</strong> {{eventAddress}}</p>
          </div>
          <p><strong>What to bring:</strong> Your enthusiasm and comfortable dancing shoes!</p>
          <p>See you on the dance floor! 💃🕺</p>
        `,
        smsBody: 'Tomorrow: {{eventTitle}} at {{eventTime}}. {{eventLocation}}. See you there!',
        pushBody: '{{eventTitle}} is tomorrow at {{eventTime}}!',
        variables: ['eventTitle', 'eventDate', 'eventTime', 'eventLocation', 'eventAddress']
      },
      {
        id: 'reminder-2hours',
        type: 'reminder',
        subject: 'Starting soon: {{eventTitle}}',
        emailBody: `
          <h2>Event Starting Soon!</h2>
          <p><strong>{{eventTitle}}</strong> starts in just 2 hours!</p>
          <div style="border: 1px solid #ddd; padding: 16px; margin: 16px 0;">
            <h3>Final Details:</h3>
            <p><strong>Time:</strong> {{eventTime}}</p>
            <p><strong>Location:</strong> {{eventLocation}}</p>
            <p><strong>Address:</strong> {{eventAddress}}</p>
          </div>
          <p>Time to get ready! See you soon! 🎉</p>
        `,
        smsBody: '{{eventTitle}} starts in 2 hours! {{eventTime}} at {{eventLocation}}',
        pushBody: '{{eventTitle}} starts in 2 hours!',
        variables: ['eventTitle', 'eventTime', 'eventLocation', 'eventAddress']
      },
      {
        id: 'event-update',
        type: 'update',
        subject: 'Important update about {{eventTitle}}',
        emailBody: `
          <h2>Event Update</h2>
          <p>We have an important update regarding <strong>{{eventTitle}}</strong>:</p>
          <div style="border: 1px solid #ddd; padding: 16px; margin: 16px 0; background: #f9f9f9;">
            {{updateMessage}}
          </div>
          <p>We apologize for any inconvenience and appreciate your understanding.</p>
        `,
        smsBody: 'Update for {{eventTitle}}: {{updateMessage}}',
        pushBody: 'Update: {{eventTitle}}',
        variables: ['eventTitle', 'updateMessage']
      }
    ];
  }

  private initializeMockData() {
    // Mock user preferences
    this.userPreferences.set('user-001', {
      email: true,
      sms: true,
      push: true,
      reminders: {
        sevenDays: true,
        oneDay: true,
        twoHours: true
      },
      eventUpdates: true,
      organizerAnnouncements: true,
      marketing: false
    });

    // Mock notifications
    const now = new Date();
    this.notifications = [
      {
        id: 'notif-001',
        userId: 'user-001',
        eventId: '1',
        type: 'confirmation',
        title: 'Ticket Confirmation',
        message: 'Your tickets for Chicago Step Championship have been confirmed!',
        scheduledFor: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        sentAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        readAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
        channels: ['email'],
        priority: 'high',
        metadata: {
          eventTitle: 'Chicago Step Championship',
          eventDate: '2024-07-15'
        }
      },
      {
        id: 'notif-002',
        userId: 'user-001',
        eventId: '1',
        type: 'reminder',
        title: 'Event Reminder',
        message: 'Chicago Step Championship is coming up in one week!',
        scheduledFor: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        channels: ['email', 'push'],
        priority: 'medium',
        metadata: {
          eventTitle: 'Chicago Step Championship',
          eventDate: '2024-07-15',
          reminderType: '7days'
        }
      }
    ];
  }

  // Get user notification preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    return this.userPreferences.get(userId) || {
      email: true,
      sms: false,
      push: true,
      reminders: {
        sevenDays: true,
        oneDay: true,
        twoHours: false
      },
      eventUpdates: true,
      organizerAnnouncements: true,
      marketing: false
    };
  }

  // Update user notification preferences
  async updateUserPreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    this.userPreferences.set(userId, preferences);
  }

  // Get notifications for a user
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let userNotifications = this.notifications.filter(n => n.userId === userId);
    
    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.readAt);
    }

    return userNotifications.sort((a, b) => b.scheduledFor.getTime() - a.scheduledFor.getTime());
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId && n.userId === userId);
    if (notification) {
      notification.readAt = new Date();
    }
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const userNotifications = this.notifications.filter(n => n.userId === userId && !n.readAt);
    userNotifications.forEach(notification => {
      notification.readAt = new Date();
    });
  }

  // Schedule a notification
  async scheduleNotification(notification: Omit<Notification, 'id'>): Promise<string> {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.notifications.push(newNotification);
    
    // In a real implementation, this would queue the notification for delivery
    this.processNotificationDelivery(newNotification);
    
    return newNotification.id;
  }

  // Schedule confirmation notification after ticket purchase
  async scheduleTicketConfirmation(
    userId: string, 
    eventId: string, 
    eventDetails: {
      title: string;
      date: string;
      time: string;
      location: string;
      ticketCount: number;
      ticketType: string;
    }
  ): Promise<void> {
    const userPrefs = await this.getUserPreferences(userId);
    const channels: ('email' | 'sms' | 'push')[] = [];
    
    if (userPrefs.email) channels.push('email');
    if (userPrefs.sms) channels.push('sms');
    if (userPrefs.push) channels.push('push');

    await this.scheduleNotification({
      userId,
      eventId,
      type: 'confirmation',
      title: 'Ticket Confirmation',
      message: `Your tickets for ${eventDetails.title} have been confirmed!`,
      scheduledFor: new Date(), // Send immediately
      channels,
      priority: 'high',
      metadata: {
        eventTitle: eventDetails.title,
        eventDate: eventDetails.date
      }
    });
  }

  // Schedule event reminders
  async scheduleEventReminders(
    userId: string,
    eventId: string,
    eventDate: Date,
    eventDetails: {
      title: string;
      time: string;
      location: string;
      address: string;
    }
  ): Promise<void> {
    const userPrefs = await this.getUserPreferences(userId);
    const channels: ('email' | 'sms' | 'push')[] = [];
    
    if (userPrefs.email) channels.push('email');
    if (userPrefs.sms) channels.push('sms');
    if (userPrefs.push) channels.push('push');

    // 7-day reminder
    if (userPrefs.reminders.sevenDays) {
      const sevenDaysBefore = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (sevenDaysBefore > new Date()) {
        await this.scheduleNotification({
          userId,
          eventId,
          type: 'reminder',
          title: 'Event Reminder - 7 Days',
          message: `${eventDetails.title} is coming up in one week!`,
          scheduledFor: sevenDaysBefore,
          channels,
          priority: 'medium',
          metadata: {
            eventTitle: eventDetails.title,
            eventDate: eventDate.toLocaleDateString(),
            reminderType: '7days'
          }
        });
      }
    }

    // 1-day reminder
    if (userPrefs.reminders.oneDay) {
      const oneDayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
      if (oneDayBefore > new Date()) {
        await this.scheduleNotification({
          userId,
          eventId,
          type: 'reminder',
          title: 'Event Reminder - Tomorrow',
          message: `${eventDetails.title} is tomorrow!`,
          scheduledFor: oneDayBefore,
          channels,
          priority: 'high',
          metadata: {
            eventTitle: eventDetails.title,
            eventDate: eventDate.toLocaleDateString(),
            reminderType: '1day'
          }
        });
      }
    }

    // 2-hour reminder
    if (userPrefs.reminders.twoHours) {
      const twoHoursBefore = new Date(eventDate.getTime() - 2 * 60 * 60 * 1000);
      if (twoHoursBefore > new Date()) {
        await this.scheduleNotification({
          userId,
          eventId,
          type: 'reminder',
          title: 'Event Starting Soon',
          message: `${eventDetails.title} starts in 2 hours!`,
          scheduledFor: twoHoursBefore,
          channels,
          priority: 'urgent',
          metadata: {
            eventTitle: eventDetails.title,
            reminderType: '2hours'
          }
        });
      }
    }
  }

  // Send event update notification
  async sendEventUpdate(
    eventId: string,
    updateMessage: string,
    updateType: 'time' | 'venue' | 'general' | 'cancellation',
    eventTitle: string
  ): Promise<void> {
    // In a real implementation, this would get all users who have tickets for this event
    const affectedUsers = ['user-001']; // Mock data
    
    for (const userId of affectedUsers) {
      const userPrefs = await this.getUserPreferences(userId);
      
      if (userPrefs.eventUpdates) {
        const channels: ('email' | 'sms' | 'push')[] = [];
        
        if (userPrefs.email) channels.push('email');
        if (userPrefs.sms) channels.push('sms');
        if (userPrefs.push) channels.push('push');

        await this.scheduleNotification({
          userId,
          eventId,
          type: 'update',
          title: `Important Update: ${eventTitle}`,
          message: updateMessage,
          scheduledFor: new Date(), // Send immediately
          channels,
          priority: updateType === 'cancellation' ? 'urgent' : 'high',
          metadata: {
            eventTitle,
            updateType
          }
        });
      }
    }
  }

  // Generate calendar event data
  generateCalendarEvent(eventDetails: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    address: string;
  }): CalendarEvent {
    return {
      title: eventDetails.title,
      description: eventDetails.description,
      startDate: eventDetails.startDate,
      endDate: eventDetails.endDate,
      location: `${eventDetails.location}, ${eventDetails.address}`,
      url: window.location.origin
    };
  }

  // Generate calendar URLs
  generateCalendarUrls(calendarEvent: CalendarEvent): {
    google: string;
    apple: string;
    outlook: string;
    ics: string;
  } {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const encodedTitle = encodeURIComponent(calendarEvent.title);
    const encodedDescription = encodeURIComponent(calendarEvent.description);
    const encodedLocation = encodeURIComponent(calendarEvent.location);
    const startDate = formatDate(calendarEvent.startDate);
    const endDate = formatDate(calendarEvent.endDate);

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startDate}/${endDate}&details=${encodedDescription}&location=${encodedLocation}`,
      apple: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:${calendarEvent.url || ''}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${calendarEvent.title}
DESCRIPTION:${calendarEvent.description}
LOCATION:${calendarEvent.location}
END:VEVENT
END:VCALENDAR`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodedTitle}&startdt=${startDate}&enddt=${endDate}&body=${encodedDescription}&location=${encodedLocation}`,
      ics: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SteppersLife//EN
BEGIN:VEVENT
UID:${Date.now()}@stepperslife.com
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${calendarEvent.title}
DESCRIPTION:${calendarEvent.description}
LOCATION:${calendarEvent.location}
URL:${calendarEvent.url || ''}
END:VEVENT
END:VCALENDAR`
    };
  }

  private async processNotificationDelivery(notification: Notification): Promise<void> {
    // Mock implementation - in a real app, this would:
    // 1. Check if it's time to send the notification
    // 2. Send via the appropriate channels (email service, SMS service, push notification service)
    // 3. Update the notification status
    
    if (notification.scheduledFor <= new Date()) {
      // Mark as sent immediately for demo purposes
      notification.sentAt = new Date();
      
      // Mock delivery to different channels
      console.log(`Sending notification "${notification.title}" to user ${notification.userId} via:`, notification.channels);
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    sent: number;
    scheduled: number;
  }> {
    const userNotifications = this.notifications.filter(n => n.userId === userId);
    
    return {
      total: userNotifications.length,
      unread: userNotifications.filter(n => !n.readAt).length,
      sent: userNotifications.filter(n => n.sentAt).length,
      scheduled: userNotifications.filter(n => !n.sentAt && n.scheduledFor > new Date()).length
    };
  }
}

export const notificationService = new NotificationService(); 