import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  Square, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ScanLine,
  CameraOff,
  RefreshCw,
  User,
  Clock,
  AlertTriangle,
  Ticket
} from 'lucide-react';
import { TicketVerificationResult } from '@/services/checkinService';
import useCheckin from '@/hooks/useCheckin';

interface QRScannerComponentProps {
  eventId: string;
  staffId?: string;
  onCheckinComplete?: (success: boolean, result?: any) => void;
  showManualInput?: boolean;
}

export const QRScannerComponent: React.FC<QRScannerComponentProps> = ({
  eventId,
  staffId,
  onCheckinComplete,
  showManualInput = true
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualQRCode, setManualQRCode] = useState('');
  const [notes, setNotes] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    lastVerification,
    isLoading,
    offlineMode,
    scanAndCheckin,
    verifyTicket
  } = useCheckin({ eventId });

  // Start camera stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStreamActive(true);
        
        // Start scanning when video is ready
        videoRef.current.onloadedmetadata = () => {
          startScanning();
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please check permissions or use manual entry.');
      setShowManualEntry(true);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
    setIsScanning(false);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  // Start QR code scanning
  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    setIsScanning(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Scan every 500ms
    scanIntervalRef.current = setInterval(async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          // In a real implementation, you would use a QR code library like jsQR
          // For now, we'll simulate QR detection
          const qrCode = await simulateQRDetection(canvas);
          
          if (qrCode) {
            await handleQRCodeDetected(qrCode);
          }
        } catch (error) {
          console.error('QR scanning error:', error);
        }
      }
    }, 500);
  };

  // Simulate QR code detection (replace with real QR library)
  const simulateQRDetection = async (canvas: HTMLCanvasElement): Promise<string | null> => {
    // This is a mock implementation
    // In production, use a library like jsQR:
    // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // const code = jsQR(imageData.data, imageData.width, imageData.height);
    // return code?.data || null;
    
    // Mock QR detection for demo
    if (Math.random() > 0.95) { // 5% chance to "detect" a QR code
      return btoa(JSON.stringify({
        ticketId: `mock_ticket_${Date.now()}`,
        eventId,
        timestamp: Date.now()
      }));
    }
    return null;
  };

  // Handle QR code detection
  const handleQRCodeDetected = async (qrCode: string) => {
    if (isLoading) return;

    // Stop scanning temporarily to prevent multiple scans
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    try {
      const success = await scanAndCheckin(qrCode, staffId, notes);
      onCheckinComplete?.(success, lastVerification);
      
      // Reset for next scan after a delay
      setTimeout(() => {
        if (streamActive) {
          startScanning();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Check-in processing error:', error);
      // Resume scanning after error
      setTimeout(() => {
        if (streamActive) {
          startScanning();
        }
      }, 1000);
    }
  };

  // Manual QR code entry
  const handleManualQRSubmit = async () => {
    if (!manualQRCode.trim()) return;

    try {
      const success = await scanAndCheckin(manualQRCode, staffId, notes);
      onCheckinComplete?.(success, lastVerification);
      
      if (success) {
        setManualQRCode('');
        setNotes('');
      }
    } catch (error) {
      console.error('Manual QR processing error:', error);
    }
  };

  // Get status color based on verification result
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'checked_in':
        return 'bg-green-500';
      case 'already_checked_in':
        return 'bg-yellow-500';
      case 'expired':
      case 'invalid':
      case 'not_found':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'checked_in':
        return <CheckCircle className="h-4 w-4" />;
      case 'already_checked_in':
        return <AlertTriangle className="h-4 w-4" />;
      case 'expired':
      case 'invalid':
      case 'not_found':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Camera Scanner Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            QR Code Scanner
            {offlineMode && (
              <Badge variant="outline" className="ml-auto">
                Offline Mode
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Controls */}
          <div className="flex gap-2">
            {!streamActive ? (
              <Button onClick={startCamera} disabled={isLoading}>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Stop Camera
              </Button>
            )}
            
            <Button 
              onClick={() => setShowManualEntry(!showManualEntry)} 
              variant="outline"
            >
              <ScanLine className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
          </div>

          {/* Camera Error */}
          {cameraError && (
            <Alert>
              <CameraOff className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}

          {/* Camera View */}
          {streamActive && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full max-w-md mx-auto rounded-lg bg-black"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
                  {isScanning ? (
                    <div className="flex items-center gap-2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scanning...
                    </div>
                  ) : (
                    <div className="text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                      Position QR Code Here
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manual QR Entry */}
          {(showManualEntry || showManualInput) && (
            <div className="space-y-3 border-t pt-4">
              <Label htmlFor="manual-qr">Manual QR Code Entry</Label>
              <Input
                id="manual-qr"
                value={manualQRCode}
                onChange={(e) => setManualQRCode(e.target.value)}
                placeholder="Enter QR code data or ticket ID"
              />
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any check-in notes..."
                  rows={2}
                />
              </div>
              <Button 
                onClick={handleManualQRSubmit}
                disabled={!manualQRCode.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Ticket className="h-4 w-4 mr-2" />
                )}
                Process Check-in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Verification Result */}
      {lastVerification && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(lastVerification.status)}
              Last Scan Result
              <Badge 
                variant="outline" 
                className={`ml-auto text-white ${getStatusColor(lastVerification.status)}`}
              >
                {lastVerification.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastVerification.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{lastVerification.error}</AlertDescription>
                </Alert>
              )}
              
              {lastVerification.ticketInfo && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Ticket Type</Label>
                    <p className="font-medium">{lastVerification.ticketInfo.ticketType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Price</Label>
                    <p className="font-medium">
                      {lastVerification.ticketInfo.currency} {lastVerification.ticketInfo.price}
                    </p>
                  </div>
                </div>
              )}
              
              {lastVerification.attendeeInfo && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="font-medium">
                      {lastVerification.attendeeInfo.firstName} {lastVerification.attendeeInfo.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {lastVerification.attendeeInfo.email}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Scanned at: {lastVerification.timestamp?.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScannerComponent; 