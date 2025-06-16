import { useState, useEffect } from 'react';

interface DeviceSecurityCapabilities {
  biometric: boolean;
  webauthn: boolean;
  touchId: boolean;
  faceId: boolean;
  deviceCredentials: boolean;
}

interface DeviceSecurityHookResult {
  capabilities: DeviceSecurityCapabilities;
  isSecureContext: boolean;
  isDeviceSecure: boolean;
  authenticateWithBiometrics: () => Promise<boolean>;
  authenticateWithWebAuthn: () => Promise<boolean>;
  requestDeviceAuthentication: () => Promise<boolean>;
}

export const useDeviceSecurity = (): DeviceSecurityHookResult => {
  const [capabilities, setCapabilities] = useState<DeviceSecurityCapabilities>({
    biometric: false,
    webauthn: false,
    touchId: false,
    faceId: false,
    deviceCredentials: false,
  });

  const [isSecureContext] = useState(window.isSecureContext);
  const [isDeviceSecure, setIsDeviceSecure] = useState(false);

  useEffect(() => {
    const detectCapabilities = async () => {
      const caps: DeviceSecurityCapabilities = {
        biometric: false,
        webauthn: false,
        touchId: false,
        faceId: false,
        deviceCredentials: false,
      };

      // WebAuthn support
      if (window.PublicKeyCredential) {
        caps.webauthn = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }

      // Touch ID / Face ID detection (iOS Safari)
      if ('TouchID' in window) {
        caps.touchId = true;
        caps.biometric = true;
      }

      // General biometric detection
      if (navigator.credentials && 'create' in navigator.credentials) {
        caps.biometric = true;
      }

      // Device credential manager
      if (navigator.credentials && 'get' in navigator.credentials) {
        caps.deviceCredentials = true;
      }

      // Platform-specific detection
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        caps.touchId = caps.biometric;
        caps.faceId = caps.biometric;
      }

      setCapabilities(caps);
      setIsDeviceSecure(caps.biometric || caps.webauthn || caps.deviceCredentials);
    };

    detectCapabilities();
  }, []);

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    if (!capabilities.biometric || !isSecureContext) {
      return false;
    }

    try {
      // Try WebAuthn first
      if (capabilities.webauthn) {
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: {
              name: "Steppers Life",
              id: window.location.hostname,
            },
            user: {
              id: new TextEncoder().encode("user-id"),
              name: "user@example.com",
              displayName: "User",
            },
            pubKeyCredParams: [{alg: -7, type: "public-key"}],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            },
            timeout: 60000,
            attestation: "direct"
          }
        });

        return !!credential;
      }

      return false;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const authenticateWithWebAuthn = async (): Promise<boolean> => {
    if (!capabilities.webauthn || !isSecureContext) {
      return false;
    }

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          userVerification: "required"
        }
      });

      return !!credential;
    } catch (error) {
      console.error('WebAuthn authentication failed:', error);
      return false;
    }
  };

  const requestDeviceAuthentication = async (): Promise<boolean> => {
    // Try biometric first, then WebAuthn
    if (capabilities.biometric) {
      return await authenticateWithBiometrics();
    }
    
    if (capabilities.webauthn) {
      return await authenticateWithWebAuthn();
    }

    // Fallback to standard authentication prompt
    return new Promise((resolve) => {
      const result = window.confirm('Device authentication required. Continue?');
      resolve(result);
    });
  };

  return {
    capabilities,
    isSecureContext,
    isDeviceSecure,
    authenticateWithBiometrics,
    authenticateWithWebAuthn,
    requestDeviceAuthentication,
  };
};