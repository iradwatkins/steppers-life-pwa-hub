import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setupAllStorageBuckets, testImageUpload } from '@/utils/storage-setup';

interface DiagnosticResult {
  bucket: string;
  success: boolean;
  message: string;
}

const StorageDiagnosticPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [uploadTestResult, setUploadTestResult] = useState<{
    success: boolean;
    message: string;
    url?: string;
  } | null>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    setUploadTestResult(null);

    try {
      console.log('🔧 Starting storage diagnostic...');
      
      // Setup all buckets
      const bucketResults = await setupAllStorageBuckets();
      setResults(bucketResults.results);

      // Test image upload if buckets were successful
      if (bucketResults.success) {
        console.log('🧪 Testing image upload...');
        const uploadResult = await testImageUpload('images');
        setUploadTestResult(uploadResult);
      }

    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      setResults([{
        bucket: 'diagnostic',
        success: false,
        message: `Diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Storage Diagnostic & Fix</h1>
          <p className="text-muted-foreground">
            Diagnose and fix storage bucket configuration issues
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Storage System Diagnostic</CardTitle>
            <CardDescription>
              This tool will check for and create missing storage buckets, configure proper permissions,
              and test image upload functionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running Diagnostic...
                </>
              ) : (
                'Run Storage Diagnostic & Fix'
              )}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bucket Setup Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.map((result, index) => (
                <Alert key={index} className={result.success ? 'border-green-200' : 'border-red-200'}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <strong>{result.bucket}:</strong> {result.message}
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {uploadTestResult && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={uploadTestResult.success ? 'border-green-200' : 'border-red-200'}>
                {uploadTestResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <strong>Image Upload Test:</strong> {uploadTestResult.message}
                  {uploadTestResult.url && (
                    <div className="mt-2">
                      <a 
                        href={uploadTestResult.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Test Image
                      </a>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StorageDiagnosticPage;