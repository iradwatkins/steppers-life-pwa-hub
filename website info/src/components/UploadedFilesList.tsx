import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { File, X, ExternalLink, Cloud } from 'lucide-react';
import { StoredFile, useFileOperations } from '@/hooks/useFileOperations';
import { User } from '@supabase/supabase-js';
import FileContentViewer from './FileContentViewer';

interface UploadedFilesListProps {
  user: User | null;
  refreshTrigger: number;
}

const UploadedFilesList: React.FC<UploadedFilesListProps> = ({ user, refreshTrigger }) => {
  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteFile, getFileUrl } = useFileOperations();

  const loadUploadedFiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUploadedFiles(data || []);
      console.log('Loaded uploaded files:', data);
    } catch (error) {
      console.error('Failed to load uploaded files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUploadedFiles();
  }, [refreshTrigger]);

  const handleDeleteFile = async (file: StoredFile) => {
    const success = await deleteFile(file);
    if (success) {
      setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openFile = (file: StoredFile) => {
    const url = getFileUrl(file.storage_path);
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Cloud className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Supabase Storage Files</h2>
        </div>
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-gray-500">Loading files from Supabase Storage...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Cloud className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Supabase Storage Files</h2>
        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
          {uploadedFiles.length} files
        </span>
      </div>
      
      {uploadedFiles.length > 0 && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <strong>💡 Tip:</strong> Click the eye icon to view file contents and copy them to your local .docs folder for direct access.
          </p>
        </div>
      )}
      
      {uploadedFiles.length > 0 ? (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center flex-1">
                <File className="h-5 w-5 text-blue-600 mr-2" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{file.file_name}</span>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(file.file_size)} • Uploaded {new Date(file.uploaded_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600">
                    Stored in Supabase: {file.storage_path}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <FileContentViewer file={file} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openFile(file)}
                  className="text-blue-600 hover:text-blue-700 p-1"
                  title="Open file in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No files uploaded to Supabase Storage yet
        </div>
      )}
    </div>
  );
};

export default UploadedFilesList;
