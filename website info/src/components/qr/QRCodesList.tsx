import React, { useState } from 'react';
import { MoreVertical, Download, Edit, Copy, Trash2, Play, Pause, Eye, Share2, TestTube } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';
import { QRCodeConfig } from '../../services/qrCodeService';
import { useQRCodes } from '../../hooks/useQRCodes';
import { toast } from 'sonner';

interface QRCodesListProps {
  qrCodes: QRCodeConfig[];
  viewMode: 'grid' | 'list';
}

export const QRCodesList: React.FC<QRCodesListProps> = ({ qrCodes, viewMode }) => {
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
  const { 
    generateQRCodeImage, 
    downloadQRCode, 
    deleteQRCode, 
    updateQRCode,
    duplicateQRCode,
    selectQRCode
  } = useQRCodes();

  // Generate QR code preview image on first load
  const generatePreview = async (qrCode: QRCodeConfig) => {
    if (previewImages[qrCode.id]) return previewImages[qrCode.id];
    
    try {
      const imageUrl = await generateQRCodeImage(qrCode);
      setPreviewImages(prev => ({ ...prev, [qrCode.id]: imageUrl }));
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate preview:', error);
      return null;
    }
  };

  const handleDownload = async (qrCode: QRCodeConfig, format: 'png' | 'svg') => {
    try {
      await downloadQRCode(qrCode, format);
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const handleToggleStatus = async (qrCode: QRCodeConfig) => {
    try {
      await updateQRCode(qrCode.id, { isActive: !qrCode.isActive });
      toast.success(`QR code ${qrCode.isActive ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to update QR code status');
    }
  };

  const handleDuplicate = async (qrCode: QRCodeConfig) => {
    try {
      await duplicateQRCode(qrCode.id);
      toast.success('QR code duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate QR code');
    }
  };

  const handleDelete = async (qrCode: QRCodeConfig) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      try {
        await deleteQRCode(qrCode.id);
        toast.success('QR code deleted successfully');
      } catch (error) {
        toast.error('Failed to delete QR code');
      }
    }
  };

  const handleCopyUrl = async (qrCode: QRCodeConfig) => {
    try {
      await navigator.clipboard.writeText(qrCode.targetUrl);
      toast.success('URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const QRCodeCard: React.FC<{ qrCode: QRCodeConfig }> = ({ qrCode }) => {
    React.useEffect(() => {
      generatePreview(qrCode);
    }, [qrCode]);

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    };

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-medium truncate">{qrCode.name}</CardTitle>
              {qrCode.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{qrCode.description}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => selectQRCode(qrCode)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => selectQRCode(qrCode)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(qrCode)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDownload(qrCode, 'png')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload(qrCode, 'svg')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopyUrl(qrCode)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleToggleStatus(qrCode)}>
                  {qrCode.isActive ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(qrCode)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={qrCode.isActive ? 'default' : 'secondary'}>
              {qrCode.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {qrCode.design.size}px
            </Badge>
            <Badge variant="outline" className="text-xs">
              {qrCode.format.type.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* QR Code Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center min-h-[200px]">
            {previewImages[qrCode.id] ? (
              <img 
                src={previewImages[qrCode.id]} 
                alt={`QR Code for ${qrCode.name}`}
                className="max-w-full max-h-[180px] object-contain"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded animate-pulse" />
            )}
          </div>
          
          {/* QR Code Info */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{formatDate(qrCode.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span>{qrCode.format.size} • {qrCode.format.dpi} DPI</span>
            </div>
            {qrCode.campaign && (
              <div className="flex justify-between">
                <span>Campaign:</span>
                <span className="font-medium">{qrCode.campaign}</span>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-2 mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleDownload(qrCode, 'png')}
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => selectQRCode(qrCode)}
              className="flex-1"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const QRCodeListItem: React.FC<{ qrCode: QRCodeConfig }> = ({ qrCode }) => {
    React.useEffect(() => {
      generatePreview(qrCode);
    }, [qrCode]);

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    return (
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* QR Code Preview */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                {previewImages[qrCode.id] ? (
                  <img 
                    src={previewImages[qrCode.id]} 
                    alt={`QR Code for ${qrCode.name}`}
                    className="w-14 h-14 object-contain"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-200 rounded animate-pulse" />
                )}
              </div>
            </div>
            
            {/* QR Code Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{qrCode.name}</h3>
                  {qrCode.description && (
                    <p className="text-sm text-gray-600 mt-1 truncate">{qrCode.description}</p>
                  )}
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge variant={qrCode.isActive ? 'default' : 'secondary'}>
                      {qrCode.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {qrCode.design.size}px • {qrCode.format.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      Created {formatDate(qrCode.createdAt)}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDownload(qrCode, 'png')}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => selectQRCode(qrCode)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => selectQRCode(qrCode)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(qrCode)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDownload(qrCode, 'svg')}>
                        <Download className="h-4 w-4 mr-2" />
                        Download SVG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyUrl(qrCode)}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleStatus(qrCode)}>
                        {qrCode.isActive ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(qrCode)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qrCode) => (
          <QRCodeCard key={qrCode.id} qrCode={qrCode} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {qrCodes.map((qrCode) => (
        <QRCodeListItem key={qrCode.id} qrCode={qrCode} />
      ))}
    </div>
  );
}; 