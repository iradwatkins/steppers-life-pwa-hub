import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { 
  Camera, 
  CameraOff, 
  Flashlight, 
  FlashlightOff, 
  RotateCcw, 
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Crown
} from 'lucide-react';
import QrScanner from 'qr-scanner';
import { pwaCheckinService, PWATicketData, PWACheckinResult } from '@/services/pwaCheckinService';
import { usePWAAuth } from '@/hooks/usePWAAuth';

interface PWAQRScannerProps {
  eventId: string;
  onCheckinSuccess: (result: PWACheckinResult) => void;
  onCheckinError: (error: string) => void;
  className?: string;
}

const PWAQRScanner: React.FC<PWAQRScannerProps> = ({ 
  eventId, 
  onCheckinSuccess, 
  onCheckinError,
  className = ""
}) => {
  const { user, isOnline } = usePWAAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [scanResult, setScanResult] = useState<PWACheckinResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Initialize camera and QR scanner
  useEffect(() => {
    const initializeScanner = async () => {
      if (!videoRef.current) return;

      try {
        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        setHasCamera(hasCamera);

        if (!hasCamera) {
          setCameraError('No camera found on this device');
          return;
        }

        // Create QR scanner instance
        const scanner = new QrScanner(
          videoRef.current,
          (result) => handleQRScan(result.data),
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: facingMode,
          }
        );

        qrScannerRef.current = scanner;

        // Check if flash is available
        const hasFlash = await scanner.hasFlash();
        setHasFlash(hasFlash);

      } catch (error) {
        console.error('Scanner initialization error:', error);
        setCameraError('Failed to initialize camera');
      }
    };

    initializeScanner();

    // Cleanup
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, [facingMode]);

  // Handle QR code scan
  const handleQRScan = async (qrData: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setScanResult(null);

    try {
      // First validate the QR code
      const validation = await pwaCheckinService.validateQRCode(qrData, eventId);
      
      if (!validation.success) {
        setScanResult(validation);
        onCheckinError(validation.message);
        setIsProcessing(false);
        return;
      }

      // If validation is successful, perform check-in
      const checkinResult = await pwaCheckinService.performCheckin(
        validation.ticket!,
        user?.id || 'unknown',
        isOnline
      );

      setScanResult(checkinResult);
      
      if (checkinResult.success) {
        onCheckinSuccess(checkinResult);
        // Brief pause before resuming scanning
        setTimeout(() => {
          setScanResult(null);
          setIsProcessing(false);
        }, 2000);
      } else {
        onCheckinError(checkinResult.message);
        setIsProcessing(false);
      }

    } catch (error) {
      console.error('QR scan processing error:', error);
      const errorResult: PWACheckinResult = {
        success: false,
        message: 'Failed to process QR code',
        error: 'PROCESSING_ERROR'
      };
      setScanResult(errorResult);
      onCheckinError(errorResult.message);
      setIsProcessing(false);
    }
  };

  // Start/stop scanning
  const toggleScanning = async () => {
    if (!qrScannerRef.current) {
      toast.error('Scanner not initialized');
      return;
    }

    try {
      if (isScanning) {
        await qrScannerRef.current.stop();
        setIsScanning(false);
      } else {
        await qrScannerRef.current.start();
        setIsScanning(true);
        setCameraError(null);
      }
    } catch (error) {
      console.error('Camera control error:', error);
      setCameraError('Failed to control camera');
      toast.error('Camera control failed');
    }
  };

  // Toggle flash
  const toggleFlash = async () => {
    if (!qrScannerRef.current || !hasFlash) return;

    try {
      if (isFlashOn) {
        await qrScannerRef.current.turnFlashOff();
        setIsFlashOn(false);
      } else {
        await qrScannerRef.current.turnFlashOn();
        setIsFlashOn(true);
      }
    } catch (error) {
      console.error('Flash control error:', error);
      toast.error('Flash control failed');
    }
  };

  // Switch camera (front/back)
  const switchCamera = () => {
    setFacingMode(current => current === 'user' ? 'environment' : 'user');
  };

  // Manual QR input fallback
  const handleManualInput = () => {
    const qrCode = prompt('Enter QR code or ticket ID manually:');
    if (qrCode && qrCode.trim()) {
      handleQRScan(qrCode.trim());
    }
  };

  // Render scan result feedback
  const renderScanResult = () => {
    if (!scanResult) return null;

    const { success, message, ticket, isAlreadyCheckedIn, error } = scanResult;

    return (
      <Card className={`mb-4 border-2 ${success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            {success ? (
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <p className={`font-medium ${success ? 'text-green-800' : 'text-red-800'}`}>
                  {message}
                </p>
                {!isOnline && (
                  <Badge variant="secondary" className="text-xs">
                    Offline
                  </Badge>
                )}
              </div>

              {ticket && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{ticket.attendeeName}</span>
                    {ticket.isVIP && <Crown className="w-4 h-4 text-amber-500" />}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Email: {ticket.attendeeEmail}</p>
                    {ticket.attendeePhone && <p>Phone: {ticket.attendeePhone}</p>}
                    <p>Ticket: {ticket.ticketType}</p>
                    {ticket.seatInfo && <p>Seat: {ticket.seatInfo}</p>}
                    {ticket.specialNotes && (
                      <p className="text-amber-600 font-medium">
                        Note: {ticket.specialNotes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isAlreadyCheckedIn && (
                <Alert className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    This attendee was already checked in. Please verify their identity if needed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Scanner Controls */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">QR Code Scanner</h3>
            <div className="flex items-center space-x-2">
              {!isOnline && (
                <Badge variant="outline" className="text-amber-600">
                  Offline Mode
                </Badge>
              )}
              {isProcessing && (
                <Badge variant="secondary">
                  <Zap className="w-3 h-3 mr-1" />
                  Processing
                </Badge>
              )}
            </div>
          </div>

          {/* Camera Error */}
          {cameraError && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}

          {/* Camera Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={toggleScanning}
              disabled={!hasCamera || !!cameraError}
              className="flex-1"
              variant={isScanning ? "destructive" : "default"}
            >
              {isScanning ? (
                <>
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Scanning
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Scanning
                </>
              )}
            </Button>

            {hasFlash && (
              <Button
                onClick={toggleFlash}
                disabled={!isScanning}
                variant="outline"
                size="sm"
              >
                {isFlashOn ? (
                  <FlashlightOff className="w-4 h-4" />
                ) : (
                  <Flashlight className="w-4 h-4" />
                )}
              </Button>
            )}

            <Button
              onClick={switchCamera}
              disabled={!isScanning}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Manual Input Fallback */}
          <Button
            onClick={handleManualInput}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Manual Input
          </Button>
        </CardContent>
      </Card>

      {/* Scan Result */}
      {renderScanResult()}

      {/* Camera Video */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square bg-gray-900">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanning Animation */}
                <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-50">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-primary"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-primary"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-primary"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-primary"></div>
                </div>

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4 max-w-xs mx-4">
                      <div className="text-center">
                        <Zap className="w-8 h-8 text-brand-primary mx-auto mb-2 animate-pulse" />
                        <p className="text-sm font-medium text-gray-900">Processing QR Code...</p>
                        <Progress value={undefined} className="mt-2" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Camera Overlay */}
            {!hasCamera && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center text-gray-500">
                  <CameraOff className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">No camera available</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Scanning Instructions</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Point camera at the QR code on attendee's ticket</li>
            <li>• Keep steady until code is detected</li>
            <li>• Use manual input if QR code is damaged</li>
            {!isOnline && <li>• Offline mode: check-ins will sync when online</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAQRScanner; 