import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Upload, 
  User, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  TestTube
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { ImageUploadService } from '@/services/imageUploadService';
import { BMADImageService } from '@/services/bMADImageService';
import { ImageUpload } from '@/components/ui/image-upload';
import ProfileImageUpload from '@/components/profile/ProfileImageUpload';

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
}

const ImageUploadTestPage: React.FC = () => {
  const { user } = useAuth();
  const { role, organizerId } = useRoles();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [eventImageUrls, setEventImageUrls] = useState<string[]>([]);
  const [adminImageUrls, setAdminImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      runSystemDiagnostic();
    }
  }, [user?.id]);

  const updateTestResult = (test: string, status: TestResult['status'], message?: string, duration?: number) => {
    setTestResults(prev => {
      const existingIndex = prev.findIndex(r => r.test === test);
      const newResult = { test, status, message, duration };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newResult;
        return updated;
      }
      return [...prev, newResult];
    });
  };

  const runSystemDiagnostic = async () => {
    if (!user?.id) return;

    try {
      console.log('🔍 Running comprehensive image system diagnostic...');
      
      // Test storage connectivity
      const storageTest = await ImageUploadService.diagnoseStorage();
      
      // Test BMAD system
      const bmadTest = await BMADImageService.testBMADImageSystem(user.id);
      
      setSystemStatus({
        storage: storageTest,
        bmad: bmadTest,
        userRole: role,
        organizerId: organizerId,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ System diagnostic complete:', { storageTest, bmadTest });
      
    } catch (error) {
      console.error('❌ System diagnostic failed:', error);
      toast.error('System diagnostic failed');
    }
  };

  const runComprehensiveTests = async () => {
    if (!user?.id) {
      toast.error('Please log in to run tests');
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    const tests = [
      'Storage Connectivity',
      'User Authentication',
      'BMAD Permissions',
      'Profile Image Upload',
      'Event Image Upload',
      'Image Optimization',
      'Error Handling'
    ];

    // Initialize all tests as pending
    tests.forEach(test => updateTestResult(test, 'pending'));

    try {
      // Test 1: Storage Connectivity
      updateTestResult('Storage Connectivity', 'running');
      const startTime = Date.now();
      const storageResult = await ImageUploadService.testStorageConnectivity();
      updateTestResult(
        'Storage Connectivity', 
        storageResult ? 'success' : 'error',
        storageResult ? 'Storage is accessible' : 'Storage connection failed',
        Date.now() - startTime
      );

      // Test 2: User Authentication
      updateTestResult('User Authentication', 'running');
      const authStart = Date.now();
      const authValid = !!user && !!user.id;
      updateTestResult(
        'User Authentication',
        authValid ? 'success' : 'error',
        authValid ? `Authenticated as ${role}` : 'User not authenticated',
        Date.now() - authStart
      );

      // Test 3: BMAD Permissions
      updateTestResult('BMAD Permissions', 'running');
      const bmadStart = Date.now();
      const bmadResult = await BMADImageService.testBMADImageSystem(user.id);
      updateTestResult(
        'BMAD Permissions',
        bmadResult.canUpload ? 'success' : 'error',
        bmadResult.error || `${bmadResult.config.userRole} permissions loaded`,
        Date.now() - bmadStart
      );

      // Test 4: Profile Image Upload (simulate)
      updateTestResult('Profile Image Upload', 'running');
      const profileStart = Date.now();
      try {
        // Create a small test blob
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#4F46E5';
          ctx.fillRect(0, 0, 100, 100);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.fillText('TEST', 25, 55);
        }
        
        const blob = await new Promise<Blob | null>(resolve => 
          canvas.toBlob(resolve, 'image/png')
        );
        
        if (blob) {
          const testFile = new File([blob], 'test-profile.png', { type: 'image/png' });
          const result = await ImageUploadService.uploadProfilePicture(testFile, user.id);
          updateTestResult(
            'Profile Image Upload',
            'success',
            `Upload successful: ${result.url.substring(0, 50)}...`,
            Date.now() - profileStart
          );
        } else {
          throw new Error('Failed to create test image');
        }
      } catch (error) {
        updateTestResult(
          'Profile Image Upload',
          'error',
          error instanceof Error ? error.message : 'Upload failed',
          Date.now() - profileStart
        );
      }

      // Test 5: Event Image Upload (if user has permissions)
      updateTestResult('Event Image Upload', 'running');
      const eventStart = Date.now();
      if (bmadResult.permissions.canUploadEventImages) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 150;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#10B981';
            ctx.fillRect(0, 0, 200, 150);
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText('EVENT TEST', 60, 80);
          }
          
          const blob = await new Promise<Blob | null>(resolve => 
            canvas.toBlob(resolve, 'image/png')
          );
          
          if (blob) {
            const testFile = new File([blob], 'test-event.png', { type: 'image/png' });
            const result = await BMADImageService.uploadImageBMAD(
              testFile, 
              'event', 
              bmadResult.config,
              'test-event'
            );
            updateTestResult(
              'Event Image Upload',
              'success',
              `Event upload successful`,
              Date.now() - eventStart
            );
          }
        } catch (error) {
          updateTestResult(
            'Event Image Upload',
            'error',
            error instanceof Error ? error.message : 'Event upload failed',
            Date.now() - eventStart
          );
        }
      } else {
        updateTestResult(
          'Event Image Upload',
          'error',
          'No event upload permissions for current role',
          Date.now() - eventStart
        );
      }

      // Test 6: Image Optimization
      updateTestResult('Image Optimization', 'running');
      const optimizeStart = Date.now();
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#8B5CF6';
          ctx.fillRect(0, 0, 1000, 1000);
        }
        
        const blob = await new Promise<Blob | null>(resolve => 
          canvas.toBlob(resolve, 'image/png')
        );
        
        if (blob) {
          const largeFile = new File([blob], 'test-large.png', { type: 'image/png' });
          const result = await ImageUploadService.uploadImage(largeFile, 'images', 'test', true);
          
          const compressionRatio = result.compressionRatio || 0;
          updateTestResult(
            'Image Optimization',
            compressionRatio > 10 ? 'success' : 'error',
            `Optimization: ${compressionRatio.toFixed(1)}% reduction`,
            Date.now() - optimizeStart
          );
        }
      } catch (error) {
        updateTestResult(
          'Image Optimization',
          'error',
          error instanceof Error ? error.message : 'Optimization test failed',
          Date.now() - optimizeStart
        );
      }

      // Test 7: Error Handling
      updateTestResult('Error Handling', 'running');
      const errorStart = Date.now();
      try {
        // Try to upload an invalid file
        const invalidFile = new File(['invalid'], 'test.txt', { type: 'text/plain' });
        await ImageUploadService.uploadImage(invalidFile);
        
        // If we get here, error handling failed
        updateTestResult(
          'Error Handling',
          'error',
          'Failed to catch invalid file type',
          Date.now() - errorStart
        );
      } catch (error) {
        // This is expected - error handling is working
        updateTestResult(
          'Error Handling',
          'success',
          'Properly caught invalid file type',
          Date.now() - errorStart
        );
      }

      toast.success('Comprehensive testing completed!');
      
    } catch (error) {
      console.error('❌ Test suite error:', error);
      toast.error('Test suite encountered an error');
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the image upload test page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Image Upload System Test</h1>
          <p className="text-muted-foreground">
            Comprehensive testing and validation of all image upload functionality
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runSystemDiagnostic}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Diagnostic
          </Button>
          <Button onClick={runComprehensiveTests} disabled={isRunning}>
            <TestTube className="h-4 w-4 mr-2" />
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="diagnostic" className="w-full">
        <TabsList>
          <TabsTrigger value="diagnostic">System Diagnostic</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="uploads">Live Upload Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current state of the image upload system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {systemStatus ? (
                <div className="space-y-4">
                  {/* Storage Status */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">Storage System</h4>
                      <p className="text-sm text-muted-foreground">
                        {systemStatus.storage.canUpload ? 'Storage accessible' : systemStatus.storage.error}
                      </p>
                    </div>
                    <Badge variant={systemStatus.storage.canUpload ? 'default' : 'destructive'}>
                      {systemStatus.storage.canUpload ? 'Online' : 'Offline'}
                    </Badge>
                  </div>

                  {/* BMAD Status */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">BMAD System</h4>
                      <p className="text-sm text-muted-foreground">
                        Role: {systemStatus.bmad.config.userRole} | 
                        Max Size: {systemStatus.bmad.permissions.maxFileSize}MB
                      </p>
                    </div>
                    <Badge variant={systemStatus.bmad.canUpload ? 'default' : 'destructive'}>
                      {systemStatus.bmad.canUpload ? 'Ready' : 'Error'}
                    </Badge>
                  </div>

                  {/* User Status */}
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">User Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        User ID: {user.id.substring(0, 8)}... | Email: {user.email}
                      </p>
                    </div>
                    <Badge variant="default">Authenticated</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p>Running system diagnostic...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Results from comprehensive system testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h4 className="font-medium">{result.test}</h4>
                        {result.message && (
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        )}
                      </div>
                    </div>
                    {result.duration && (
                      <Badge variant="outline">{result.duration}ms</Badge>
                    )}
                  </div>
                ))}

                {testResults.length === 0 && (
                  <div className="text-center py-8">
                    <TestTube className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <p>No test results yet. Click "Run All Tests" to begin.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Image
                </CardTitle>
                <CardDescription>
                  Test profile picture upload functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileImageUpload
                  currentImageUrl={profileImageUrl}
                  userId={user.id}
                  onImageUpdate={(url) => setProfileImageUrl(url || '')}
                />
              </CardContent>
            </Card>

            {/* Event Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Event Images
                </CardTitle>
                <CardDescription>
                  Test event image upload functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={eventImageUrls}
                  onChange={(urls) => setEventImageUrls(Array.isArray(urls) ? urls : [urls])}
                  multiple={true}
                  maxFiles={5}
                  variant="gallery"
                  useBMADMethod={true}
                  bMADImageType="event"
                  placeholder="Upload event images"
                />
              </CardContent>
            </Card>

            {/* Admin Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Admin Images
                </CardTitle>
                <CardDescription>
                  Test admin-level image uploads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={adminImageUrls}
                  onChange={(urls) => setAdminImageUrls(Array.isArray(urls) ? urls : [urls])}
                  multiple={true}
                  maxFiles={3}
                  variant="gallery"
                  useBMADMethod={true}
                  bMADImageType="admin"
                  placeholder="Upload admin images"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageUploadTestPage;