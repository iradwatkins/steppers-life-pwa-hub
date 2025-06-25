import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { verifyAndCreateStorageBucket, testImageUpload } from '@/utils/storage-setup';
import { ImageUploadService } from '@/services/imageUploadService';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';

export const ImageTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    bucketVerification: boolean | null;
    uploadTest: boolean | null;
    componentTest: boolean | null;
  }>({
    bucketVerification: null,
    uploadTest: null,
    componentTest: null
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [testImages, setTestImages] = useState<string[]>([]);
  const [featuredTestImage, setFeaturedTestImage] = useState<string>('');

  const runFullImageTest = async () => {
    setIsRunning(true);
    setTestResults({ bucketVerification: null, uploadTest: null, componentTest: null });
    
    try {
      console.log('🧪 Starting comprehensive image test...');
      
      // Test 1: Bucket verification
      console.log('🗂️ Testing bucket verification...');
      const bucketTest = await verifyAndCreateStorageBucket();
      setTestResults(prev => ({ ...prev, bucketVerification: bucketTest }));
      
      if (!bucketTest) {
        console.error('❌ Bucket test failed - stopping further tests');
        return;
      }
      
      // Test 2: Direct upload test
      console.log('📤 Testing direct upload...');
      const uploadTest = await testImageUpload();
      setTestResults(prev => ({ ...prev, uploadTest }));
      
      // Test 3: Component integration (simulated)
      console.log('🧩 Testing component integration...');
      const componentTest = testImages.length > 0 || featuredTestImage !== '';
      setTestResults(prev => ({ ...prev, componentTest }));
      
      console.log('✅ All image tests completed');
      
    } catch (error) {
      console.error('❌ Image test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    return status ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Pending</Badge>;
    return status ? <Badge variant="default" className="bg-green-600">Passed</Badge> : <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Upload System Test
          </CardTitle>
          <CardDescription>
            Test all components of the image upload system to ensure everything works correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runFullImageTest} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isRunning ? 'Running Tests...' : 'Run Image System Test'}
          </Button>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.bucketVerification)}
                <span className="font-medium">Storage Bucket Verification</span>
              </div>
              {getStatusBadge(testResults.bucketVerification)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.uploadTest)}
                <span className="font-medium">Direct Upload Test</span>
              </div>
              {getStatusBadge(testResults.uploadTest)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.componentTest)}
                <span className="font-medium">Component Integration</span>
              </div>
              {getStatusBadge(testResults.componentTest)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Image Upload Test</CardTitle>
          <CardDescription>Test the featured image upload component</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={featuredTestImage}
            onChange={setFeaturedTestImage}
            variant="featured"
            placeholder="Test featured image upload functionality"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Images Upload Test</CardTitle>
          <CardDescription>Test the gallery images upload component</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={testImages}
            onChange={setTestImages}
            variant="gallery"
            multiple
            maxFiles={3}
            placeholder="Test gallery images upload functionality"
          />
        </CardContent>
      </Card>
      
      {(testImages.length > 0 || featuredTestImage) && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
            <CardDescription>Successfully uploaded images will appear below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredTestImage && (
              <div>
                <h4 className="font-medium mb-2">Featured Image:</h4>
                <img src={featuredTestImage} alt="Featured test" className="w-full max-w-md rounded-lg" />
              </div>
            )}
            
            {testImages.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Gallery Images:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testImages.map((url, index) => (
                    <img key={index} src={url} alt={`Gallery test ${index + 1}`} className="w-full rounded-lg" />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};