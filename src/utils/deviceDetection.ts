/**
 * Device Detection Utilities
 * Used to show appropriate payment methods based on device capabilities
 */

export interface DeviceCapabilities {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  supportsApplePay: boolean;
  supportsGooglePay: boolean;
  supportsCashApp: boolean;
  userAgent: string;
}

export class DeviceDetection {
  private static capabilities: DeviceCapabilities | null = null;

  static getCapabilities(): DeviceCapabilities {
    if (!this.capabilities) {
      this.capabilities = this.detectCapabilities();
    }
    return this.capabilities;
  }

  private static detectCapabilities(): DeviceCapabilities {
    const userAgent = navigator.userAgent;
    
    // Mobile detection
    const isMobile = /iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile|WPDesktop/i.test(userAgent);
    
    // iOS detection
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Android detection
    const isAndroid = /Android/i.test(userAgent);
    
    // Apple Pay support detection
    const supportsApplePay = isIOS && 
                            'ApplePaySession' in window && 
                            typeof window.ApplePaySession !== 'undefined' &&
                            window.ApplePaySession.canMakePayments();
    
    // Google Pay support detection
    const supportsGooglePay = isAndroid && 
                              'PaymentRequest' in window;
    
    // Cash App support (mobile browsers)
    const supportsCashApp = isMobile && (
      /Safari/i.test(userAgent) || // iOS Safari
      /Chrome/i.test(userAgent)    // Android Chrome or iOS Chrome
    );

    return {
      isMobile,
      isIOS,
      isAndroid,
      supportsApplePay,
      supportsGooglePay,
      supportsCashApp,
      userAgent
    };
  }

  static shouldShowApplePay(): boolean {
    const caps = this.getCapabilities();
    return caps.supportsApplePay;
  }

  static shouldShowGooglePay(): boolean {
    const caps = this.getCapabilities();
    return caps.supportsGooglePay;
  }

  static shouldShowCashApp(): boolean {
    const caps = this.getCapabilities();
    return caps.supportsCashApp;
  }

  static isMobileDevice(): boolean {
    const caps = this.getCapabilities();
    return caps.isMobile;
  }

  static getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const caps = this.getCapabilities();
    
    if (!caps.isMobile) {
      return 'desktop';
    }
    
    // iPad detection
    if (caps.isIOS && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
      return 'tablet';
    }
    
    // Android tablet detection (rough approximation)
    if (caps.isAndroid && screen.width >= 768) {
      return 'tablet';
    }
    
    return 'mobile';
  }

  static debugInfo(): DeviceCapabilities & { deviceType: string } {
    const caps = this.getCapabilities();
    return {
      ...caps,
      deviceType: this.getDeviceType()
    };
  }
}

// Export for direct use
export const deviceDetection = DeviceDetection;