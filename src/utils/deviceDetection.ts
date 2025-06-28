
export class DeviceDetection {
  static getCapabilities() {
    return {
      touchScreen: 'ontouchstart' in window,
      camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      geolocation: 'geolocation' in navigator,
      webGL: !!document.createElement('canvas').getContext('webgl'),
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'Notification' in window && 'serviceWorker' in navigator,
      webAuthn: 'credentials' in navigator,
      biometrics: 'credentials' in navigator && 'PublicKeyCredential' in window,
    };
  }

  static shouldShowApplePay(): boolean {
    // Check if device supports Apple Pay
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && 'ApplePaySession' in window;
  }

  static shouldShowGooglePay(): boolean {
    // Check if device supports Google Pay (Android or Chrome on desktop)
    return /Android/.test(navigator.userAgent) || 
           /Chrome/.test(navigator.userAgent) ||
           'PaymentRequest' in window;
  }

  static shouldShowCashApp(): boolean {
    // Cash App Pay is available on mobile devices
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  static getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent;
    
    if (/Mobi|Android/i.test(userAgent)) {
      return 'mobile';
    }
    
    if (/Tablet|iPad/i.test(userAgent)) {
      return 'tablet';
    }
    
    return 'desktop';
  }

  static isMobile(): boolean {
    return this.getDeviceType() === 'mobile';
  }

  static isTablet(): boolean {
    return this.getDeviceType() === 'tablet';
  }

  static isDesktop(): boolean {
    return this.getDeviceType() === 'desktop';
  }

  static getBrowserInfo() {
    const userAgent = navigator.userAgent;
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    return {
      browser,
      userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    };
  }
}
