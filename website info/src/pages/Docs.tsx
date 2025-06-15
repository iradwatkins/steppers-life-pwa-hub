
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import UploadedFilesList from '@/components/UploadedFilesList';
import GitHubSync from '@/components/GitHubSync';
import LocalDocsFolder from '@/components/LocalDocsFolder';
import FileUpload from '@/components/FileUpload';

interface DocsFile {
  name: string;
  path: string;
  isDirectory: boolean;
  url?: string;
}

const Docs = () => {
  const [docsFiles, setDocsFiles] = useState<DocsFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();

  // Load files from .docs folder on component mount
  useEffect(() => {
    loadDocsFiles();
  }, [refreshTrigger]);

  const loadDocsFiles = async () => {
    try {
      setIsLoadingDocs(true);
      
      // Note: Web browsers cannot directly access local file system
      // This shows the conceptual .docs folder structure
      const docsFiles: DocsFile[] = [
        { name: "README.md", path: ".docs/README.md", isDirectory: false },
        { name: "upload.html", path: ".docs/upload.html", isDirectory: false },
      ];
      
      setDocsFiles(docsFiles);
      console.log('Loaded docs files:', docsFiles);
    } catch (error) {
      console.error('Failed to load docs files:', error);
      toast.error("Failed to load docs files", {
        description: "Could not retrieve files from .docs folder",
        duration: 3000,
      });
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleRefreshFolders = () => {
    console.log('Refreshing folders...');
    setRefreshTrigger(prev => prev + 1);
    toast.success("Refreshing folders", {
      description: "Reloading files from both local .docs and Supabase Storage",
      duration: 2000,
    });
  };

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Docs</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefreshFolders}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Authentication status */}
          {user && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-sm font-medium text-green-800">
                Signed in as: {user.email}
              </p>
              <p className="text-xs text-green-600">
                You can now upload files to Supabase Storage
              </p>
            </div>
          )}
          
          {/* GitHub Sync Section */}
          <GitHubSync onRefresh={handleRefreshFolders} />

          {/* Local .docs Folder Section */}
          <LocalDocsFolder docsFiles={docsFiles} isLoading={isLoadingDocs} />

          {/* Uploaded Files from Supabase Storage */}
          <UploadedFilesList user={user} refreshTrigger={refreshTrigger} />

          {/* Upload Section */}
          <FileUpload user={user} onUploadComplete={handleUploadComplete} />

          <div className="mt-8 text-center">
            <a href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">← Back to Home</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
