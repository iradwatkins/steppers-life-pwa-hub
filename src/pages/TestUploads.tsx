import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageUploadService } from '@/services/imageUploadService';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Upload, AlertCircle } from 'lucide-react';

const TestUploads = () => {
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [testImageUrl, setTestImageUrl] = useState<string>('');
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);

  const runStorageDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const result = await ImageUploadService.diagnoseStorage();
      setDiagnosticResult(result);
      console.log('🔍 Storage Diagnostic Result:', result);
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      setDiagnosticResult({ 
        error: `Diagnostic failed: ${error}`,
        canUpload: false,
        imagesBucket: false,
        bucketsExist: []
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const handleImageUpload = (url: string | string[]) => {
    setTestImageUrl(Array.isArray(url) ? url[0] : url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">🔧 Storage Upload Test</h1>
          <p className="text-muted-foreground">
            Test image upload functionality and storage configuration
          </p>
        </div>

        {/* Storage Diagnostic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Storage Diagnostic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runStorageDiagnostic}
              disabled={isRunningDiagnostic}
              className="w-full"
            >
              {isRunningDiagnostic ? 'Running Diagnostic...' : 'Run Storage Diagnostic'}
            </Button>

            {diagnosticResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Upload Ready:</span>
                  {diagnosticResult.canUpload ? (
                    <Badge variant="default" className="text-green-700 bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium">Images Bucket:</span>
                  {diagnosticResult.imagesBucket ? (
                    <Badge variant="default" className="text-green-700 bg-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Found
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>

                <div>
                  <span className="font-medium">Available Buckets:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {diagnosticResult.bucketsExist?.length > 0 ? (
                      diagnosticResult.bucketsExist.map((bucket: string) => (
                        <Badge key={bucket} variant="outline">{bucket}</Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">None found</Badge>
                    )}
                  </div>
                </div>

                {diagnosticResult.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    <strong>Error:</strong> {diagnosticResult.error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Test Image Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              value={testImageUrl}
              onChange={handleImageUpload}
              variant="featured"
              multiple={false}
              placeholder="Upload a test image to verify storage is working"
            />

            {testImageUrl && (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700">
                  <strong>✅ Upload Successful!</strong>
                  <br />
                  Image URL: <code className="text-xs">{testImageUrl}</code>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={testImageUrl} 
                    alt="Test upload" 
                    className="w-full max-w-md mx-auto"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 What This Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Storage bucket existence and accessibility</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Image upload, optimization, and storage</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>Public URL generation and image display</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <span>RLS policies and permissions</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestUploads;