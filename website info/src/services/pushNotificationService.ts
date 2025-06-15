// Push Notification Service for mobile and PWA notifications
export interface PushNotificationDevice {
  id: string;
  userId: string;
  deviceType: 'ios' | 'android' | 'web';
  pushToken: string;
  endpoint?: string; // For web push
  p256dh?: string; // For web push
  auth?: string; // For web push
  isActive: boolean;
  lastUsed: Date;
  appVersion?: string;
  deviceInfo?: {
    model?: string;
    osVersion?: string;
    appVersion?: string;
    userAgent?: string;
  };
  registeredAt: Date;
}

export interface PushNotificationMessage {
  id: string;
  userId: string;
  deviceId?: string; // If targeting specific device
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  actionButtons?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  category: 'class_reminder' | 'event_update' | 'purchase_confirmation' | 'general' | 'marketing';
  priority: 'low' | 'normal' | 'high';
  scheduledFor?: Date;
  expiresAt?: Date;
  clickAction?: string; // URL to open when notification is clicked
  sound?: string;
  badge?: number;
  silent?: boolean;
}

export interface PushNotificationDelivery {
  id: string;
  messageId: string;
  deviceId: string;
  userId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'expired';
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  clickedAt?: Date;
  actionTaken?: string;
}

export interface PushNotificationCampaign {
  id: string;
  name: string;
  message: PushNotificationMessage;
  targetAudience: {
    userIds?: string[];
    userRoles?: string[];
    locationRadius?: {
      center: { lat: number; lng: number };
      radiusKm: number;
    };
    lastActiveAfter?: Date;
    hasCompletedActions?: string[];
  };
  scheduledFor?: Date;
  timezone?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  sentAt?: Date;
  completedAt?: Date;
  stats: {
    targeted: number;
    sent: number;
    delivered: number;
    clicked: number;
    failed: number;
  };
}

export interface PushNotificationSettings {
  userId: string;
  enabled: boolean;
  categories: {
    class_reminders: boolean;
    event_updates: boolean;
    purchase_confirmations: boolean;
    general_notifications: boolean;
    marketing: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
    timezone: string;
  };
  frequency: {
    maxPerDay: number;
    maxPerHour: number;
  };
  updatedAt: Date;
}

export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private devices: PushNotificationDevice[] = [];
  private messages: PushNotificationMessage[] = [];
  private deliveries: PushNotificationDelivery[] = [];
  private campaigns: PushNotificationCampaign[] = [];
  private userSettings: Map<string, PushNotificationSettings> = new Map();
  private vapidKeys = {
    publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa40HI80YlUz6dNqnKqYO5YjI', // Mock VAPID key
    privateKey: 'AAAAAAA_mock_private_key_AAAAAAA'
  };

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock devices
    this.devices = [
      {
        id: 'device_001',
        userId: 'user_001',
        deviceType: 'ios',
        pushToken: 'mock_ios_token_abc123',
        isActive: true,
        lastUsed: new Date(),
        deviceInfo: {
          model: 'iPhone 13',
          osVersion: '16.2',
          appVersion: '1.0.0'
        },
        registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'device_002',
        userId: 'user_001',
        deviceType: 'web',
        pushToken: 'mock_web_token_def456',
        endpoint: 'https://fcm.googleapis.com/fcm/send/mock_endpoint',
        p256dh: 'mock_p256dh_key',
        auth: 'mock_auth_key',
        isActive: true,
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
        deviceInfo: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        },
        registeredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'device_003',
        userId: 'user_002',
        deviceType: 'android',
        pushToken: 'mock_android_token_ghi789',
        isActive: true,
        lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000),
        deviceInfo: {
          model: 'Samsung Galaxy S21',
          osVersion: '13',
          appVersion: '1.0.0'
        },
        registeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ];

    // Mock user settings
    this.userSettings.set('user_001', {
      userId: 'user_001',
      enabled: true,
      categories: {
        class_reminders: true,
        event_updates: true,
        purchase_confirmations: true,
        general_notifications: true,
        marketing: false
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'America/Chicago'
      },
      frequency: {
        maxPerDay: 10,
        maxPerHour: 3
      },
      updatedAt: new Date()
    });

    // Mock messages
    this.messages = [
      {
        id: 'msg_001',
        userId: 'user_001',
        title: 'Class Reminder',
        body: 'Your stepping class starts in 2 hours!',
        data: {
          classId: 'class_001',
          type: 'class_reminder'
        },
        category: 'class_reminder',
        priority: 'high',
        clickAction: '/classes/class_001',
        sound: 'default'
      },
      {
        id: 'msg_002',
        userId: 'user_002',
        title: 'Event Update',
        body: 'Chicago Step Championship venue has changed',
        data: {
          eventId: 'event_001',
          type: 'event_update'
        },
        category: 'event_update',
        priority: 'high',
        clickAction: '/events/event_001'
      }
    ];

    // Mock deliveries
    this.deliveries = [
      {
        id: 'delivery_001',
        messageId: 'msg_001',
        deviceId: 'device_001',
        userId: 'user_001',
        status: 'delivered',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
        clickedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 120000)
      }
    ];

    // Mock campaigns
    this.campaigns = [
      {
        id: 'campaign_001',
        name: 'Weekly Class Reminders',
        message: {
          id: 'campaign_msg_001',
          userId: '', // Will be filled per user
          title: 'Don\'t Miss Your Weekly Class!',
          body: 'Your favorite stepping class is coming up. See you on the dance floor!',
          category: 'class_reminder',
          priority: 'normal',
          clickAction: '/classes'
        },
        targetAudience: {
          userRoles: ['student', 'member'],
          lastActiveAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        status: 'completed',
        createdBy: 'admin_001',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        stats: {
          targeted: 250,
          sent: 245,
          delivered: 238,
          clicked: 89,
          failed: 5
        }
      }
    ];
  }

  // Device Registration
  async registerDevice(deviceData: {
    userId: string;
    deviceType: 'ios' | 'android' | 'web';
    pushToken: string;
    endpoint?: string;
    p256dh?: string;
    auth?: string;
    deviceInfo?: any;
  }): Promise<PushNotificationDevice> {
    // Check if device already exists
    const existingDevice = this.devices.find(d => 
      d.userId === deviceData.userId && 
      d.pushToken === deviceData.pushToken
    );

    if (existingDevice) {
      existingDevice.lastUsed = new Date();
      existingDevice.isActive = true;
      if (deviceData.deviceInfo) {
        existingDevice.deviceInfo = { ...existingDevice.deviceInfo, ...deviceData.deviceInfo };
      }
      return Promise.resolve(existingDevice);
    }

    const device: PushNotificationDevice = {
      id: `device_${Date.now()}`,
      userId: deviceData.userId,
      deviceType: deviceData.deviceType,
      pushToken: deviceData.pushToken,
      endpoint: deviceData.endpoint,
      p256dh: deviceData.p256dh,
      auth: deviceData.auth,
      isActive: true,
      lastUsed: new Date(),
      deviceInfo: deviceData.deviceInfo,
      registeredAt: new Date()
    };

    this.devices.push(device);
    return Promise.resolve(device);
  }

  async registerWebPushSubscription(userId: string, subscription: WebPushSubscription): Promise<PushNotificationDevice> {
    return this.registerDevice({
      userId,
      deviceType: 'web',
      pushToken: subscription.endpoint,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      deviceInfo: {
        userAgent: navigator.userAgent
      }
    });
  }

  async unregisterDevice(deviceId: string): Promise<boolean> {
    const device = this.devices.find(d => d.id === deviceId);
    if (device) {
      device.isActive = false;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async getUserDevices(userId: string): Promise<PushNotificationDevice[]> {
    const devices = this.devices.filter(d => d.userId === userId && d.isActive);
    return Promise.resolve(devices);
  }

  // User Settings
  async getUserSettings(userId: string): Promise<PushNotificationSettings> {
    const settings = this.userSettings.get(userId) || {
      userId,
      enabled: true,
      categories: {
        class_reminders: true,
        event_updates: true,
        purchase_confirmations: true,
        general_notifications: true,
        marketing: false
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'America/Chicago'
      },
      frequency: {
        maxPerDay: 20,
        maxPerHour: 5
      },
      updatedAt: new Date()
    };

    return Promise.resolve(settings);
  }

  async updateUserSettings(userId: string, updates: Partial<PushNotificationSettings>): Promise<PushNotificationSettings> {
    const currentSettings = await this.getUserSettings(userId);
    const newSettings = {
      ...currentSettings,
      ...updates,
      userId,
      updatedAt: new Date()
    };

    this.userSettings.set(userId, newSettings);
    return Promise.resolve(newSettings);
  }

  // Message Sending
  async sendNotification(message: Omit<PushNotificationMessage, 'id'>): Promise<PushNotificationMessage> {
    const fullMessage: PushNotificationMessage = {
      ...message,
      id: `msg_${Date.now()}`
    };

    this.messages.push(fullMessage);

    // Get user settings to check if notifications are enabled
    const userSettings = await this.getUserSettings(message.userId);
    
    if (!userSettings.enabled || !userSettings.categories[message.category]) {
      return Promise.resolve(fullMessage);
    }

    // Check quiet hours
    if (this.isInQuietHours(userSettings)) {
      // Schedule for later or skip
      return Promise.resolve(fullMessage);
    }

    // Get user devices
    const devices = await this.getUserDevices(message.userId);
    
    // Send to each device
    for (const device of devices) {
      await this.sendToDevice(fullMessage, device);
    }

    return Promise.resolve(fullMessage);
  }

  async sendBulkNotifications(messages: Array<Omit<PushNotificationMessage, 'id'>>): Promise<PushNotificationMessage[]> {
    const sentMessages: PushNotificationMessage[] = [];
    
    for (const message of messages) {
      const sent = await this.sendNotification(message);
      sentMessages.push(sent);
    }

    return Promise.resolve(sentMessages);
  }

  private async sendToDevice(message: PushNotificationMessage, device: PushNotificationDevice): Promise<PushNotificationDelivery> {
    const delivery: PushNotificationDelivery = {
      id: `delivery_${Date.now()}_${device.id}`,
      messageId: message.id,
      deviceId: device.id,
      userId: message.userId,
      status: 'queued',
      sentAt: new Date()
    };

    try {
      // Simulate sending based on device type
      await this.simulateDeviceSend(device, message);
      
      delivery.status = 'sent';
      delivery.deliveredAt = new Date(Date.now() + 1000); // Simulate 1 second delivery delay
      
      // Simulate random click rate
      if (Math.random() < 0.3) { // 30% click rate
        delivery.clickedAt = new Date(Date.now() + Math.random() * 60 * 60 * 1000); // Within an hour
      }

    } catch (error) {
      delivery.status = 'failed';
      delivery.failureReason = error instanceof Error ? error.message : 'Unknown error';
    }

    this.deliveries.push(delivery);
    return Promise.resolve(delivery);
  }

  private async simulateDeviceSend(device: PushNotificationDevice, message: PushNotificationMessage): Promise<void> {
    // Simulate API calls to different push services
    switch (device.deviceType) {
      case 'ios':
        // Simulate APNs call
        await new Promise(resolve => setTimeout(resolve, 500));
        break;
      case 'android':
        // Simulate FCM call
        await new Promise(resolve => setTimeout(resolve, 300));
        break;
      case 'web':
        // Simulate Web Push call
        await new Promise(resolve => setTimeout(resolve, 200));
        break;
    }

    // Simulate occasional failures
    if (Math.random() < 0.02) { // 2% failure rate
      throw new Error('Push service unavailable');
    }
  }

  private isInQuietHours(settings: PushNotificationSettings): boolean {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit'
    });

    const startTime = settings.quietHours.startTime;
    const endTime = settings.quietHours.endTime;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  // Campaign Management
  async createCampaign(campaignData: Omit<PushNotificationCampaign, 'id' | 'createdAt' | 'stats'>): Promise<PushNotificationCampaign> {
    const campaign: PushNotificationCampaign = {
      ...campaignData,
      id: `campaign_${Date.now()}`,
      createdAt: new Date(),
      stats: {
        targeted: 0,
        sent: 0,
        delivered: 0,
        clicked: 0,
        failed: 0
      }
    };

    this.campaigns.push(campaign);
    return Promise.resolve(campaign);
  }

  async sendCampaign(campaignId: string): Promise<PushNotificationCampaign> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error('Campaign cannot be sent in current status');
    }

    campaign.status = 'sending';
    campaign.sentAt = new Date();

    // Get target audience
    const targetUsers = await this.getTargetAudience(campaign.targetAudience);
    campaign.stats.targeted = targetUsers.length;

    // Send to each user
    for (const userId of targetUsers) {
      try {
        const message = {
          ...campaign.message,
          userId,
          id: `${campaign.id}_${userId}`
        };
        
        await this.sendNotification(message);
        campaign.stats.sent++;
      } catch (error) {
        campaign.stats.failed++;
      }
    }

    campaign.status = 'completed';
    campaign.completedAt = new Date();

    return Promise.resolve(campaign);
  }

  private async getTargetAudience(targetAudience: PushNotificationCampaign['targetAudience']): Promise<string[]> {
    // Mock implementation - in real system would query user database
    let targetUsers: string[] = [];

    if (targetAudience.userIds) {
      targetUsers = targetAudience.userIds;
    } else {
      // Mock logic for role-based targeting
      const allUsers = ['user_001', 'user_002', 'user_003', 'user_004', 'user_005'];
      targetUsers = allUsers; // Simplified
    }

    return Promise.resolve(targetUsers);
  }

  async getCampaigns(): Promise<PushNotificationCampaign[]> {
    return Promise.resolve(this.campaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  }

  async getCampaign(campaignId: string): Promise<PushNotificationCampaign | null> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    return Promise.resolve(campaign || null);
  }

  // Analytics
  async getDeliveryStats(messageId: string): Promise<{
    sent: number;
    delivered: number;
    failed: number;
    clicked: number;
    deliveryRate: number;
    clickRate: number;
  }> {
    const deliveries = this.deliveries.filter(d => d.messageId === messageId);
    
    const sent = deliveries.filter(d => d.status === 'sent' || d.status === 'delivered').length;
    const delivered = deliveries.filter(d => d.status === 'delivered').length;
    const failed = deliveries.filter(d => d.status === 'failed').length;
    const clicked = deliveries.filter(d => d.clickedAt).length;

    const deliveryRate = sent > 0 ? delivered / sent : 0;
    const clickRate = delivered > 0 ? clicked / delivered : 0;

    return Promise.resolve({
      sent,
      delivered,
      failed,
      clicked,
      deliveryRate,
      clickRate
    });
  }

  async getUserNotificationHistory(userId: string, limit: number = 50): Promise<Array<{
    message: PushNotificationMessage;
    deliveries: PushNotificationDelivery[];
  }>> {
    const userMessages = this.messages
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.scheduledFor || 0).getTime() - new Date(a.scheduledFor || 0).getTime())
      .slice(0, limit);

    const result = userMessages.map(message => ({
      message,
      deliveries: this.deliveries.filter(d => d.messageId === message.id)
    }));

    return Promise.resolve(result);
  }

  async getPlatformStats(dateRange?: { start: Date; end: Date }): Promise<{
    totalMessages: number;
    totalDeliveries: number;
    totalDevices: number;
    deliveryRate: number;
    clickRate: number;
    topCategories: Array<{ category: string; count: number }>;
    deviceBreakdown: Array<{ deviceType: string; count: number }>;
  }> {
    let messages = this.messages;
    let deliveries = this.deliveries;

    if (dateRange) {
      messages = messages.filter(m => {
        const messageDate = new Date(m.scheduledFor || 0);
        return messageDate >= dateRange.start && messageDate <= dateRange.end;
      });
      
      const messageIds = new Set(messages.map(m => m.id));
      deliveries = deliveries.filter(d => messageIds.has(d.messageId));
    }

    const totalMessages = messages.length;
    const totalDeliveries = deliveries.filter(d => d.status === 'delivered').length;
    const totalDevices = this.devices.filter(d => d.isActive).length;
    const totalSent = deliveries.filter(d => d.status === 'sent' || d.status === 'delivered').length;
    const totalClicked = deliveries.filter(d => d.clickedAt).length;

    const deliveryRate = totalSent > 0 ? totalDeliveries / totalSent : 0;
    const clickRate = totalDeliveries > 0 ? totalClicked / totalDeliveries : 0;

    // Calculate top categories
    const categoryCount = new Map<string, number>();
    messages.forEach(m => {
      categoryCount.set(m.category, (categoryCount.get(m.category) || 0) + 1);
    });

    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Calculate device breakdown
    const deviceCount = new Map<string, number>();
    this.devices.filter(d => d.isActive).forEach(d => {
      deviceCount.set(d.deviceType, (deviceCount.get(d.deviceType) || 0) + 1);
    });

    const deviceBreakdown = Array.from(deviceCount.entries())
      .map(([deviceType, count]) => ({ deviceType, count }));

    return Promise.resolve({
      totalMessages,
      totalDeliveries,
      totalDevices,
      deliveryRate,
      clickRate,
      topCategories,
      deviceBreakdown
    });
  }

  // Utility Methods
  async scheduleNotification(message: Omit<PushNotificationMessage, 'id'>, scheduledFor: Date): Promise<PushNotificationMessage> {
    const scheduledMessage = {
      ...message,
      scheduledFor
    };

    return this.sendNotification(scheduledMessage);
  }

  async cancelScheduledNotification(messageId: string): Promise<boolean> {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      this.messages.splice(messageIndex, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async getVapidPublicKey(): Promise<string> {
    return Promise.resolve(this.vapidKeys.publicKey);
  }

  async testNotification(userId: string, deviceId?: string): Promise<boolean> {
    const testMessage: Omit<PushNotificationMessage, 'id'> = {
      userId,
      deviceId,
      title: 'Test Notification',
      body: 'This is a test notification from SteppersLife',
      category: 'general',
      priority: 'low',
      data: { test: true }
    };

    try {
      await this.sendNotification(testMessage);
      return Promise.resolve(true);
    } catch (error) {
      return Promise.resolve(false);
    }
  }
}

export const pushNotificationService = new PushNotificationService(); 