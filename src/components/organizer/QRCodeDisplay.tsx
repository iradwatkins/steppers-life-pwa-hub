/**
 * QRCodeDisplay Component
 * Displays QR codes with management options and analytics
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Download,
  Copy,
  ExternalLink,
  Share2,
  BarChart3,
  Calendar,
  MapPin,
  Users,
  MousePointer,
  Printer,
  Maximize2,
  QrCode
} from 'lucide-react';
import type { MarketingQRCode } from '@/services/qrCodeService';

interface QRCodeDisplayProps {
  qrCode: MarketingQRCode;
  showAnalytics?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'card' | 'minimal';
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCode,
  showAnalytics = true,
  size = 'md',
  variant = 'card'
}) => {
  const [showLargeView, setShowLargeView] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrCode.target_url);
      toast.success('URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode.qr_code_url;
    link.download = `${qrCode.name.replace(/\s+/g, '_')}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: qrCode.name,
          text: qrCode.description || 'Check out this QR code',
          url: qrCode.target_url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopyUrl();
    }
  };

  const openTargetUrl = () => {
    window.open(qrCode.target_url, '_blank');
  };

  const getQRTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'venue':
        return <MapPin className="h-4 w-4" />;
      case 'campaign':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  const getQRTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-500';
      case 'venue':
        return 'bg-green-500';
      case 'campaign':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { qr: 'w-24 h-24', container: 'p-4' };
      case 'lg':
        return { qr: 'w-64 h-64', container: 'p-8' };
      default:
        return { qr: 'w-32 h-32', container: 'p-6' };
    }
  };

  const sizeClasses = getSizeClasses();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = qrCode.expires_at && new Date(qrCode.expires_at) < new Date();

  // Minimal variant for embedding
  if (variant === 'minimal') {
    return (
      <div className="flex flex-col items-center space-y-2">
        <img 
          src={qrCode.qr_code_url} 
          alt={qrCode.name}
          className={`border rounded-lg ${sizeClasses.qr} ${isExpired ? 'opacity-50' : ''}`}
        />
        <div className="text-center">
          <p className="font-medium text-sm">{qrCode.name}</p>
          {showAnalytics && (
            <p className="text-xs text-muted-foreground">
              {qrCode.scan_count} scans
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyUrl}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <>
      <Card className={`hover:shadow-lg transition-shadow ${isExpired ? 'opacity-75' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`text-white ${getQRTypeBadgeColor(qrCode.qr_type)}`}>
                  {getQRTypeIcon(qrCode.qr_type)}
                  <span className="ml-1 capitalize">{qrCode.qr_type}</span>
                </Badge>
                {qrCode.tracking_enabled && (
                  <Badge variant="outline" className="text-xs">
                    <MousePointer className="h-3 w-3 mr-1" />
                    Tracked
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{qrCode.name}</CardTitle>
              <CardDescription>
                {qrCode.description || 'No description provided'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className={sizeClasses.container}>
          <div className="flex flex-col items-center space-y-4">
            {/* QR Code Image */}
            <div className="relative">
              <img 
                src={qrCode.qr_code_url} 
                alt={qrCode.name}
                className={`border rounded-lg ${sizeClasses.qr} cursor-pointer`}
                onClick={() => setShowLargeView(true)}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => setShowLargeView(true)}
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Stats */}
            {showAnalytics && (
              <div className="grid grid-cols-2 gap-4 w-full text-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center text-blue-600 mb-1">
                    <MousePointer className="h-4 w-4" />
                  </div>
                  <p className="font-semibold">{qrCode.scan_count}</p>
                  <p className="text-xs text-muted-foreground">Total Scans</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center text-green-600 mb-1">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <p className="font-semibold">{formatDate(qrCode.created_at)}</p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Actions */}
            <div className="flex flex-wrap gap-2 w-full">
              <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleCopyUrl} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              
              <Button variant="outline" size="sm" onClick={openTargetUrl} className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit
              </Button>
            </div>

            {/* Additional Info */}
            {(qrCode.expires_at || qrCode.metadata) && (
              <>
                <Separator />
                <div className="w-full space-y-2 text-sm">
                  {qrCode.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className={isExpired ? 'text-red-600' : ''}>
                        {formatDate(qrCode.expires_at)}
                      </span>
                    </div>
                  )}
                  
                  {qrCode.metadata?.campaign_source && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source:</span>
                      <Badge variant="outline" className="text-xs">
                        {qrCode.metadata.campaign_source}
                      </Badge>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Large View Dialog */}
      <Dialog open={showLargeView} onOpenChange={setShowLargeView}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{qrCode.name}</DialogTitle>
            <DialogDescription>
              High-resolution view for printing or sharing
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            <img 
              src={qrCode.qr_code_url} 
              alt={qrCode.name}
              className="w-80 h-80 border rounded-lg"
            />
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Right-click to save image</p>
              <p>Scan count: {qrCode.scan_count}</p>
            </div>
            
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={handleDownload} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </Button>
              
              <Button variant="outline" onClick={handleCopyUrl} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Copy URL
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRCodeDisplay;