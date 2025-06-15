export interface PWAInstallEvent {
  id: string;
  timestamp: Date;
  deviceType: 'android' | 'ios' | 'desktop' | 'unknown';
  browser: string;
  browserVersion: string;
  platform: string;
  userAgent: string;
  installMethod: 'auto' | 'manual' | 'unknown';
  userId?: string;
}

export interface PWAUsageEvent {
  id: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  deviceType: 'android' | 'ios' | 'desktop' | 'unknown';
  browser: string;
  platform: string;
  sessionDuration?: number; // in seconds
  pageViews: number;
  features: string[]; // which features were used
}

export interface PWAAnalytics {
  totalInstalls: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  installsByPlatform: {
    android: number;
    ios: number;
    desktop: number;
    unknown: number;
  };
  usageByPlatform: {
    android: number;
    ios: number;
    desktop: number;
    unknown: number;
  };
  dailyInstalls: Array<{
    date: string;
    count: number;
  }>;
  dailyActiveUsersHistory: Array<{
    date: string;
    count: number;
  }>;
  averageSessionDuration: number;
  mostUsedFeatures: Array<{
    feature: string;
    count: number;
  }>;
}

class PWAAnalyticsService {
  private sessionId: string;
  private sessionStart: Date;
  private pageViews: number = 0;
  private featuresUsed: Set<string> = new Set();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `pwa_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    let deviceType: 'android' | 'ios' | 'desktop' | 'unknown' = 'unknown';
    let browser = 'unknown';
    let browserVersion = 'unknown';
    let platform = 'unknown';

    // Device detection
    if (userAgent.includes('android')) {
      deviceType = 'android';
      platform = 'Android';
    } else if (/ipad|iphone|ipod/.test(userAgent)) {
      deviceType = 'ios';
      platform = 'iOS';
    } else if (userAgent.includes('windows') || userAgent.includes('mac') || userAgent.includes('linux')) {
      deviceType = 'desktop';
      platform = userAgent.includes('windows') ? 'Windows' : 
                userAgent.includes('mac') ? 'macOS' : 'Linux';
    }

    // Browser detection
    const chromeMatch = userAgent.match(/chrome\/(\d+)/);
    const safariMatch = userAgent.match(/safari\/(\d+)/);
    const firefoxMatch = userAgent.match(/firefox\/(\d+)/);
    const edgeMatch = userAgent.match(/edg\/(\d+)/);

    if (edgeMatch) {
      browser = 'Edge';
      browserVersion = edgeMatch[1];
    } else if (chromeMatch && !userAgent.includes('edg')) {
      browser = 'Chrome';
      browserVersion = chromeMatch[1];
    } else if (firefoxMatch) {
      browser = 'Firefox';
      browserVersion = firefoxMatch[1];
    } else if (safariMatch && !userAgent.includes('chrome')) {
      browser = 'Safari';
      browserVersion = safariMatch[1];
    }

    return {
      deviceType,
      browser,
      browserVersion,
      platform,
      userAgent: navigator.userAgent
    };
  }

  private initializeTracking() {
    // Track page views
    this.trackPageView();

    // Track when app is opened in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      this.trackAppOpen();
    }

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.trackAppOpen();
      } else {
        this.trackSessionEnd();
      }
    });

    // Track before unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });

    // Track every 30 seconds for session duration
    setInterval(() => {
      this.trackHeartbeat();
    }, 30000);
  }

  // Public methods for tracking

  public trackPWAInstall(installMethod: 'auto' | 'manual' = 'unknown'): void {
    const deviceInfo = this.getDeviceInfo();
    const installEvent: PWAInstallEvent = {
      id: `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      installMethod,
      ...deviceInfo
    };

    // Store locally
    const installations = this.getStoredInstallations();
    installations.push(installEvent);
    localStorage.setItem('pwa_installations', JSON.stringify(installations));

    // Send to analytics endpoint (implement when backend is ready)
    this.sendToAnalytics('install', installEvent);

    console.log('📊 PWA Installation tracked:', installEvent);
  }

  public trackFeatureUsage(feature: string): void {
    this.featuresUsed.add(feature);
    
    // Store feature usage
    const usage = this.getStoredFeatureUsage();
    const today = new Date().toISOString().split('T')[0];
    
    if (!usage[today]) {
      usage[today] = {};
    }
    if (!usage[today][feature]) {
      usage[today][feature] = 0;
    }
    usage[today][feature]++;

    localStorage.setItem('pwa_feature_usage', JSON.stringify(usage));

    console.log('📊 Feature usage tracked:', feature);
  }

  public trackPageView(): void {
    this.pageViews++;
    console.log('📊 Page view tracked:', this.pageViews);
  }

  public trackAppOpen(): void {
    const today = new Date().toISOString().split('T')[0];
    const deviceInfo = this.getDeviceInfo();
    
    // Track daily active user
    const dailyUsers = this.getStoredDailyUsers();
    if (!dailyUsers.includes(today)) {
      dailyUsers.push(today);
      localStorage.setItem('pwa_daily_active', JSON.stringify(dailyUsers));
    }

    // Track usage by platform
    const platformUsage = this.getStoredPlatformUsage();
    if (!platformUsage[today]) {
      platformUsage[today] = {};
    }
    if (!platformUsage[today][deviceInfo.deviceType]) {
      platformUsage[today][deviceInfo.deviceType] = 0;
    }
    platformUsage[today][deviceInfo.deviceType]++;
    localStorage.setItem('pwa_platform_usage', JSON.stringify(platformUsage));

    console.log('📊 App open tracked for:', today);
  }

  private trackHeartbeat(): void {
    // Update session duration tracking
    const sessionDuration = Math.floor((new Date().getTime() - this.sessionStart.getTime()) / 1000);
    localStorage.setItem('pwa_current_session_duration', sessionDuration.toString());
  }

  private trackSessionEnd(): void {
    const sessionDuration = Math.floor((new Date().getTime() - this.sessionStart.getTime()) / 1000);
    
    const usageEvent: PWAUsageEvent = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      timestamp: new Date(),
      sessionDuration,
      pageViews: this.pageViews,
      features: Array.from(this.featuresUsed),
      ...this.getDeviceInfo()
    };

    // Store session data
    const sessions = this.getStoredSessions();
    sessions.push(usageEvent);
    localStorage.setItem('pwa_sessions', JSON.stringify(sessions));

    // Send to analytics endpoint
    this.sendToAnalytics('usage', usageEvent);

    console.log('📊 Session ended:', usageEvent);
  }

  // Analytics retrieval methods

  public getAnalytics(): PWAAnalytics {
    const installations = this.getStoredInstallations();
    const sessions = this.getStoredSessions();
    const dailyUsers = this.getStoredDailyUsers();
    const platformUsage = this.getStoredPlatformUsage();
    const featureUsage = this.getStoredFeatureUsage();

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Calculate statistics
    const totalInstalls = installations.length;
    
    const dailyActiveUsers = dailyUsers.filter(date => date >= today).length;
    const weeklyActiveUsers = dailyUsers.filter(date => date >= weekAgo).length;
    const monthlyActiveUsers = dailyUsers.filter(date => date >= monthAgo).length;

    // Installs by platform
    const installsByPlatform = installations.reduce((acc, install) => {
      acc[install.deviceType]++;
      return acc;
    }, { android: 0, ios: 0, desktop: 0, unknown: 0 });

    // Usage by platform (last 30 days)
    const usageByPlatform = { android: 0, ios: 0, desktop: 0, unknown: 0 };
    Object.entries(platformUsage).forEach(([date, platforms]) => {
      if (date >= monthAgo) {
        Object.entries(platforms as any).forEach(([platform, count]) => {
          if (platform in usageByPlatform) {
            usageByPlatform[platform as keyof typeof usageByPlatform] += count as number;
          }
        });
      }
    });

    // Daily installs (last 30 days)
    const dailyInstalls = this.getDailyInstalls(installations, 30);

    // Daily active users history (last 30 days)
    const dailyActiveUsersHistory = this.getDailyActiveUsersHistory(30);

    // Average session duration
    const validSessions = sessions.filter(s => s.sessionDuration && s.sessionDuration > 0);
    const averageSessionDuration = validSessions.length > 0 
      ? validSessions.reduce((sum, s) => sum + (s.sessionDuration || 0), 0) / validSessions.length
      : 0;

    // Most used features
    const mostUsedFeatures = this.getMostUsedFeatures(featureUsage);

    return {
      totalInstalls,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers,
      installsByPlatform,
      usageByPlatform,
      dailyInstalls,
      dailyActiveUsersHistory,
      averageSessionDuration,
      mostUsedFeatures
    };
  }

  // Private helper methods

  private getStoredInstallations(): PWAInstallEvent[] {
    const stored = localStorage.getItem('pwa_installations');
    return stored ? JSON.parse(stored) : [];
  }

  private getStoredSessions(): PWAUsageEvent[] {
    const stored = localStorage.getItem('pwa_sessions');
    return stored ? JSON.parse(stored) : [];
  }

  private getStoredDailyUsers(): string[] {
    const stored = localStorage.getItem('pwa_daily_active');
    return stored ? JSON.parse(stored) : [];
  }

  private getStoredPlatformUsage(): Record<string, Record<string, number>> {
    const stored = localStorage.getItem('pwa_platform_usage');
    return stored ? JSON.parse(stored) : {};
  }

  private getStoredFeatureUsage(): Record<string, Record<string, number>> {
    const stored = localStorage.getItem('pwa_feature_usage');
    return stored ? JSON.parse(stored) : {};
  }

  private getDailyInstalls(installations: PWAInstallEvent[], days: number) {
    const result = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = installations.filter(install => 
        install.timestamp.toString().split('T')[0] === dateStr
      ).length;
      
      result.push({ date: dateStr, count });
    }
    
    return result;
  }

  private getDailyActiveUsersHistory(days: number) {
    const result = [];
    const now = new Date();
    const platformUsage = this.getStoredPlatformUsage();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = platformUsage[dateStr] 
        ? Object.values(platformUsage[dateStr]).reduce((sum: number, val: any) => sum + val, 0)
        : 0;
      
      result.push({ date: dateStr, count });
    }
    
    return result;
  }

  private getMostUsedFeatures(featureUsage: Record<string, Record<string, number>>) {
    const featureCount: Record<string, number> = {};
    
    Object.values(featureUsage).forEach(dailyUsage => {
      Object.entries(dailyUsage).forEach(([feature, count]) => {
        featureCount[feature] = (featureCount[feature] || 0) + count;
      });
    });
    
    return Object.entries(featureCount)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private sendToAnalytics(type: 'install' | 'usage', data: any): void {
    // TODO: Implement when backend analytics endpoint is ready
    // fetch('/api/analytics/pwa', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type, data })
    // });
    
    console.log(`📊 Analytics ${type} event would be sent to backend:`, data);
  }

  // Reset methods for testing
  public clearAnalytics(): void {
    localStorage.removeItem('pwa_installations');
    localStorage.removeItem('pwa_sessions');
    localStorage.removeItem('pwa_daily_active');
    localStorage.removeItem('pwa_platform_usage');
    localStorage.removeItem('pwa_feature_usage');
    localStorage.removeItem('pwa_current_session_duration');
    console.log('📊 PWA Analytics data cleared');
  }

  public generateMockData(): void {
    // Generate mock data for testing
    const mockInstalls = this.generateMockInstalls(50);
    const mockSessions = this.generateMockSessions(200);
    const mockDailyUsers = this.generateMockDailyUsers(30);
    
    localStorage.setItem('pwa_installations', JSON.stringify(mockInstalls));
    localStorage.setItem('pwa_sessions', JSON.stringify(mockSessions));
    localStorage.setItem('pwa_daily_active', JSON.stringify(mockDailyUsers));
    
    console.log('📊 Mock PWA Analytics data generated');
  }

  private generateMockInstalls(count: number): PWAInstallEvent[] {
    const installs = [];
    const devices = ['android', 'ios', 'desktop'];
    const browsers = ['Chrome', 'Safari', 'Edge', 'Firefox'];
    const platforms = ['Android', 'iOS', 'Windows', 'macOS'];
    
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      installs.push({
        id: `mock_install_${i}`,
        timestamp,
        deviceType: devices[Math.floor(Math.random() * devices.length)] as any,
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        browserVersion: `${Math.floor(Math.random() * 50 + 80)}`,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        userAgent: 'Mock User Agent',
        installMethod: Math.random() > 0.5 ? 'auto' : 'manual'
      });
    }
    
    return installs;
  }

  private generateMockSessions(count: number): PWAUsageEvent[] {
    const sessions = [];
    const devices = ['android', 'ios', 'desktop'];
    const features = ['qr-scanner', 'attendee-list', 'check-in', 'dashboard', 'settings'];
    
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      sessions.push({
        id: `mock_session_${i}`,
        sessionId: `mock_session_id_${i}`,
        timestamp,
        deviceType: devices[Math.floor(Math.random() * devices.length)] as any,
        browser: 'Chrome',
        platform: 'Android',
        sessionDuration: Math.floor(Math.random() * 3600), // 0-60 minutes
        pageViews: Math.floor(Math.random() * 10 + 1),
        features: features.slice(0, Math.floor(Math.random() * features.length + 1))
      });
    }
    
    return sessions;
  }

  private generateMockDailyUsers(days: number): string[] {
    const dailyUsers = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dailyUsers.push(date.toISOString().split('T')[0]);
    }
    return dailyUsers;
  }
}

// Create singleton instance
const pwaAnalyticsService = new PWAAnalyticsService();

// Export service and types with named export only
export { pwaAnalyticsService }; 