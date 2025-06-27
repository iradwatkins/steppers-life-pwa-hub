import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { ImageUploadService } from '@/services/imageUploadService';
import { ImageOptimizer } from '@/utils/imageOptimization';
import { useAuth } from '@/hooks/useAuth';
import { Camera, Image as ImageIcon, User, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const ImageUploadTestPage: React.FC = () => {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = useState<string>('');
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isTestingStorage, setIsTestingStorage] = useState(false);

  const runStorageTest = async () => {
    setIsTestingStorage(true);
    setTestResults([]);
    
    try {
      // Test 1: Storage Connectivity
      const connectivityResult = await ImageUploadService.testStorageConnectivity();
      setTestResults(prev => [...prev, {
        test: 'Storage Connectivity',
        result: connectivityResult ? 'PASS' : 'FAIL',
        message: connectivityResult ? 'Storage is accessible' : 'Storage connection failed'
      }]);

      // Test 2: Storage Diagnostic
      const diagnostic = await ImageUploadService.diagnoseStorage();
      setTestResults(prev => [...prev, {
        test: 'Storage Diagnostic',
        result: diagnostic.canUpload ? 'PASS' : 'FAIL',
        message: diagnostic.error || `Found buckets: ${diagnostic.bucketsExist.join(', ')}`
      }]);

      // Test 3: Image Optimization Test
      try {
        // Create a test image blob
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Draw a test pattern
          ctx.fillStyle = '#3B82F6';
          ctx.fillRect(0, 0, 800, 600);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('TEST IMAGE', 400, 300);
          
          // Convert to blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), 'image/png');
          });
          
          const testFile = new File([blob], 'test-optimization.png', { type: 'image/png' });
          
          // Test optimization
          const optimizationResult = await ImageOptimizer.optimizeImage(testFile);
          
          setTestResults(prev => [...prev, {
            test: 'Image Optimization',
            result: 'PASS',
            message: `Compressed ${optimizationResult.compressionRatio.toFixed(1)}% (${optimizationResult.originalSize} → ${optimizationResult.optimizedSize} bytes)`
          }]);
        }
      } catch (error) {
        setTestResults(prev => [...prev, {
          test: 'Image Optimization',
          result: 'FAIL',
          message: `Optimization failed: ${error}`
        }]);
      }

    } catch (error) {
      console.error('Storage test error:', error);
    } finally {
      setIsTestingStorage(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to test image uploads.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Image Upload Test Suite</h1>
          <p className="text-muted-foreground">
            Test all image upload functionality with optimization and WebP conversion
          </p>
        </div>

        {/* Storage Test Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Storage System Test
            </CardTitle>
            <CardDescription>
              Test storage connectivity, buckets, and optimization system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runStorageTest} 
              disabled={isTestingStorage}
              className="mb-4"
            >
              {isTestingStorage ? 'Running Tests...' : 'Run Storage Tests'}
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Test Results:</h4>
                {testResults.map((result, index) => (
                  <Alert key={index} className={result.result === 'PASS' ? 'border-green-200' : 'border-red-200'}>
                    {result.result === 'PASS' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.result === 'PASS' ? 'default' : 'destructive'}>
                          {result.result}
                        </Badge>
                        <strong>{result.test}:</strong> {result.message}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Image Upload Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Image Upload
              </CardTitle>
              <CardDescription>
                Test optimized profile picture upload (512x512 WebP)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileImageUpload
                currentImageUrl={profileImage}
                userId={user.id}
                onImageUpdate={(url) => setProfileImage(url || '')}
              />
              
              {profileImage && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Current Profile Image:</p>
                  <p className="text-sm text-gray-600 break-all">{profileImage}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Images Upload Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Event Images Upload
              </CardTitle>
              <CardDescription>
                Test optimized event image upload (1200x800 WebP)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={eventImages}
                onChange={(urls) => setEventImages(Array.isArray(urls) ? urls : [urls])}
                multiple={true}
                maxFiles={5}
                variant="gallery"
                placeholder="Upload event images"
              />
              
              {eventImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded Images ({eventImages.length}):</p>
                  {eventImages.map((url, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs break-all">
                      {url}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Featured Image Upload Test */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Featured Image Upload
            </CardTitle>
            <CardDescription>
              Test single featured image upload with optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value=""
              onChange={(url) => console.log('Featured image uploaded:', url)}
              multiple={false}
              variant="featured"
              placeholder="Upload featured image"
            />
          </CardContent>
        </Card>

        {/* Optimization Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Image Optimization Details</CardTitle>
            <CardDescription>
              All uploaded images are automatically optimized for web delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Profile Pictures</h4>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Resized to 512x512</li>
                  <li>• Converted to WebP</li>
                  <li>• 90% quality</li>
                  <li>• ~60-80% smaller</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900">Event Images</h4>
                <ul className="mt-2 space-y-1 text-green-700">
                  <li>• Resized to 1200x800</li>
                  <li>• Converted to WebP</li>
                  <li>• 85% quality</li>
                  <li>• ~70-85% smaller</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900">Gallery Images</h4>
                <ul className="mt-2 space-y-1 text-purple-700">
                  <li>• Resized to 1920x1080</li>
                  <li>• Converted to WebP</li>
                  <li>• 80% quality</li>
                  <li>• ~75-90% smaller</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageUploadTestPage;