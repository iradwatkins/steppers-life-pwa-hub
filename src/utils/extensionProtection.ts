/**
 * Browser Extension Interference Protection
 * Detects and handles browser extension conflicts during critical operations
 */

export interface ExtensionInterferenceResult {
  hasInterference: boolean;
  detectedExtensions: string[];
  recommendations: string[];
}

export class ExtensionProtection {
  private static detectedInterference: Set<string> = new Set();

  /**
   * Detect potential browser extension interference
   */
  static detectExtensionInterference(): ExtensionInterferenceResult {
    const detectedExtensions: string[] = [];
    const recommendations: string[] = [];

    // Check for common extension indicators
    const indicators = [
      // Ad blockers
      { name: 'uBlock Origin', check: () => window.hasOwnProperty('uBlockOrigin') },
      { name: 'AdBlock Plus', check: () => window.hasOwnProperty('adblockplus') },
      { name: 'AdBlock', check: () => document.querySelector('[data-adblock-key]') !== null },
      
      // Shopping extensions
      { name: 'Honey', check: () => window.hasOwnProperty('honey') },
      { name: 'Capital One Shopping', check: () => window.hasOwnProperty('capitalone') },
      { name: 'Rakuten', check: () => window.hasOwnProperty('rakuten') },
      
      // Privacy extensions
      { name: 'Ghostery', check: () => window.hasOwnProperty('ghostery') },
      { name: 'Privacy Badger', check: () => window.hasOwnProperty('privacybadger') },
      
      // Password managers
      { name: 'LastPass', check: () => document.querySelector('[data-lastpass-icon-root]') !== null },
      { name: '1Password', check: () => document.querySelector('[data-onepassword-root]') !== null },
      
      // Generic content script detection
      { name: 'Unknown Extension', check: () => {
        // Check for injected scripts or elements that shouldn't be there
        const suspiciousElements = document.querySelectorAll('[data-extension], [class*="extension-"], [id*="extension-"]');
        return suspiciousElements.length > 0;
      }}
    ];

    indicators.forEach(indicator => {
      try {
        if (indicator.check()) {
          detectedExtensions.push(indicator.name);
        }
      } catch (error) {
        // Silently continue if check fails
      }
    });

    // Check for console errors that indicate extension issues
    const hasConnectionErrors = this.detectedInterference.has('connection_error');
    const hasScriptErrors = this.detectedInterference.has('script_error');

    if (detectedExtensions.length > 0 || hasConnectionErrors || hasScriptErrors) {
      recommendations.push('Try using incognito/private browsing mode');
      recommendations.push('Temporarily disable browser extensions');
      recommendations.push('Clear browser cache and cookies for this site');
      
      if (detectedExtensions.includes('Honey') || detectedExtensions.includes('Capital One Shopping')) {
        recommendations.push('Shopping extensions can interfere with checkout - disable them temporarily');
      }
      
      if (detectedExtensions.some(ext => ext.includes('Block'))) {
        recommendations.push('Ad blockers may block payment processing - whitelist this site');
      }
    }

    return {
      hasInterference: detectedExtensions.length > 0 || hasConnectionErrors || hasScriptErrors,
      detectedExtensions,
      recommendations
    };
  }

  /**
   * Monitor for extension-related errors
   */
  static monitorExtensionErrors() {
    // Monitor console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ').toLowerCase();
      
      if (errorMessage.includes('could not establish connection') || 
          errorMessage.includes('receiving end does not exist') ||
          errorMessage.includes('extension context invalidated')) {
        this.detectedInterference.add('connection_error');
      }
      
      if (errorMessage.includes('content script') || 
          errorMessage.includes('background script')) {
        this.detectedInterference.add('script_error');
      }
      
      originalConsoleError.apply(console, args);
    };

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const errorMessage = event.reason?.message?.toLowerCase() || '';
      
      if (errorMessage.includes('could not establish connection') ||
          errorMessage.includes('extension')) {
        this.detectedInterference.add('connection_error');
        
        // Prevent the error from breaking the app
        event.preventDefault();
        console.warn('🛡️ Extension interference detected and handled:', event.reason);
      }
    });
  }

  /**
   * Show user-friendly notification about extension interference
   */
  static showExtensionInterferenceNotification(onRetry?: () => void) {
    const result = this.detectExtensionInterference();
    
    if (!result.hasInterference) return false;

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'extension-interference-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 16px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h4 style="margin: 0 0 8px 0; color: #856404;">⚠️ Browser Extension Detected</h4>
        <p style="margin: 0 0 12px 0; color: #856404; font-size: 14px;">
          A browser extension may be interfering with the ticket purchase process.
        </p>
        ${result.detectedExtensions.length > 0 ? `
          <p style="margin: 0 0 8px 0; color: #856404; font-size: 12px;">
            <strong>Detected:</strong> ${result.detectedExtensions.join(', ')}
          </p>
        ` : ''}
        <div style="margin-bottom: 12px;">
          ${result.recommendations.map(rec => `
            <div style="color: #856404; font-size: 12px; margin: 2px 0;">• ${rec}</div>
          `).join('')}
        </div>
        <div style="display: flex; gap: 8px;">
          ${onRetry ? `
            <button onclick="this.parentElement.parentElement.parentElement.remove(); (${onRetry.toString()})();" style="
              background: #007bff;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
            ">Try Again</button>
          ` : ''}
          <button onclick="this.parentElement.parentElement.parentElement.remove();" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">Dismiss</button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 30000);

    return true;
  }

  /**
   * Initialize extension protection
   */
  static initialize() {
    console.log('🛡️ Initializing Extension Protection...');
    this.monitorExtensionErrors();
    
    // Run initial detection
    const result = this.detectExtensionInterference();
    if (result.hasInterference) {
      console.warn('⚠️ Browser extension interference detected:', result);
    }
  }
}

// Auto-initialize when module loads
ExtensionProtection.initialize(); 