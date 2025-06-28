
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ImageUploadService } from '@/services/imageUploadService';
import { toast } from 'sonner';

const ImageUploadTest: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);

  const testConnection = async () => {
    const result = await ImageUploadService.testStorageConnection();
    setConnectionStatus(result);
    
    if (result.success) {
      toast.success('Storage connection successful!');
    } else {
      toast.error(result.message);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      console.log('🔄 Testing image upload...');
      
      const result = await ImageUploadService.uploadImage(file, 'images', 'test-uploads');
      
      setUploadedImage(result.url);
      
      toast.success(`Image uploaded successfully! ${result.compressionRatio ? `Compressed by ${result.compressionRatio.toFixed(1)}%` : ''}`);
      
      console.log('✅ Test upload successful:', result);
      
    } catch (error) {
      console.error('❌ Test upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Upload Test
          </CardTitle>
          <CardDescription>
            Test the image upload functionality and storage connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Test */}
          <div className="space-y-2">
            <Button onClick={testConnection} variant="outline" className="w-full">
              Test Storage Connection
            </Button>
            
            {connectionStatus && (
              <Alert className={connectionStatus.success ? 'border-green-200' : 'border-red-200'}>
                {connectionStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {connectionStatus.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Image Upload Test */}
          <div className="space-y-2">
            <label className="block">
              <Button 
                className="w-full" 
                disabled={isUploading}
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Test Image Upload'}
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Display uploaded image */}
          {uploadedImage && (
            <div className="space-y-2">
              <Alert className="border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Image uploaded successfully! URL: {uploadedImage}
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-lg p-4">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded test image" 
                  className="max-w-full h-auto rounded"
                  onError={(e) => {
                    console.error('❌ Image display error:', e);
                    toast.error('Failed to display uploaded image');
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploadTest;
