import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Flashlight, FlashlightOff, RotateCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { pwaCheckinService, type ScanResult, type AttendeeInfo } from '@/services/pwaCheckinService';
import { toast } from 'sonner';

// QR code detection using jsQR library
declare global {
  interface Window {
    jsQR: any;
  }
}

interface PWAQRScannerProps {
  eventId: string;
  onScanResult: (result: ScanResult) => void;
  onError?: (error: string) => void;
}

export const PWAQRScanner: React.FC<PWAQRScannerProps> = ({
  eventId,
  onScanResult,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [lastScan, setLastScan] = useState<string>('');
  const [scanCooldown, setScanCooldown] = useState(false);
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    hasTorch: false,
    hasMultipleCameras: false
  });

  // Initialize camera
  const initCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check device capabilities
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      setDeviceCapabilities({
        hasTorch: 'torch' in capabilities,
        hasMultipleCameras: false // Will be determined by checking available devices
      });

      setHasPermission(true);
      setIsScanning(true);
      startScanningLoop();
    } catch (error) {
      console.error('Camera initialization error:', error);
      setHasPermission(false);
      onError?.('Failed to access camera. Please check permissions.');
    }
  }, [facingMode, onError]);

  // Start scanning loop
  const startScanningLoop = useCallback(() => {
    const scan = () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Use jsQR to detect QR codes
        if (window.jsQR) {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data && !scanCooldown) {
            handleQRDetected(code.data);
          }
        }
      }

      animationRef.current = requestAnimationFrame(scan);
    };

    scan();
  }, [isScanning, scanCooldown]);

  // Handle QR code detection
  const handleQRDetected = async (qrData: string) => {
    if (qrData === lastScan) return;

    setLastScan(qrData);
    setScanCooldown(true);

    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    try {
      const result = await pwaCheckinService.scanQRCode(qrData);
      
      // Visual and audio feedback
      if (result.success) {
        // Success sound (if audio context available)
        playSound('success');
        toast.success(`✅ ${result.attendee?.name} checked in successfully`);
      } else {
        playSound('error');
        toast.error(`❌ ${result.error}`);
      }

      onScanResult(result);
    } catch (error) {
      console.error('Scan processing error:', error);
      toast.error('Failed to process scan');
    }

    // Reset cooldown after 2 seconds
    setTimeout(() => {
      setScanCooldown(false);
      setLastScan('');
    }, 2000);
  };

  // Play feedback sounds
  const playSound = (type: 'success' | 'error') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'success') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      } else {
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      }

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Audio not available, silently continue
    }
  };

  // Toggle torch
  const toggleTorch = async () => {
    if (!streamRef.current || !deviceCapabilities.hasTorch) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !torchEnabled }]
      });
      setTorchEnabled(!torchEnabled);
    } catch (error) {
      console.error('Torch toggle error:', error);
      toast.error('Failed to toggle flashlight');
    }
  };

  // Switch camera
  const switchCamera = () => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user');
  };

  // Stop scanning
  const stopScanning = () => {
    setIsScanning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Load jsQR library
  useEffect(() => {
    const loadJsQR = async () => {
      if (!window.jsQR) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
        script.onload = () => {
          console.log('jsQR loaded');
        };
        document.head.appendChild(script);
      }
    };

    loadJsQR();
  }, []);

  // Initialize on mount
  useEffect(() => {
    initCamera();
    return () => {
      stopScanning();
    };
  }, [initCamera]);

  // Restart scanning when facingMode changes
  useEffect(() => {
    if (hasPermission) {
      initCamera();
    }
  }, [facingMode, initCamera, hasPermission]);

  // Permission denied state
  if (hasPermission === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CameraOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
          <p className="text-muted-foreground mb-4">
            Please allow camera access to scan QR codes for check-in.
          </p>
          <Button onClick={initCamera} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Enable Camera
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Scanner Interface */}
      <Card className="relative overflow-hidden">
        <div className="relative aspect-square bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Scanning Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-green-400"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-green-400"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-green-400"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-green-400"></div>
              
              {/* Scanning line animation */}
              <div className="absolute inset-0 flex items-center">
                <div 
                  className={`w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent
                    ${isScanning ? 'animate-pulse' : ''}`}
                ></div>
              </div>
            </div>
          </div>

          {/* Scan status indicator */}
          {scanCooldown && (
            <div className="absolute top-4 left-4 right-4">
              <Alert className="bg-green-500/20 border-green-500">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-100">
                  Processing scan...
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={switchCamera}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          {deviceCapabilities.hasTorch && (
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTorch}
              className={`bg-black/50 hover:bg-black/70 text-white border-0 ${
                torchEnabled ? 'bg-yellow-500/50' : ''
              }`}
            >
              {torchEnabled ? (
                <FlashlightOff className="h-4 w-4" />
              ) : (
                <Flashlight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="sm"
            onClick={stopScanning}
            className="bg-red-500/50 hover:bg-red-500/70 border-0"
          >
            <CameraOff className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Instructions */}
      <div className="mt-4 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Position the QR code within the frame to check in attendees
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant={isScanning ? 'default' : 'secondary'}>
            {isScanning ? 'Scanning' : 'Stopped'}
          </Badge>
          {!navigator.onLine && (
            <Badge variant="outline" className="text-orange-600">
              Offline Mode
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};