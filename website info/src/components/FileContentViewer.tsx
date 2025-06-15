
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Eye, Copy, Download } from 'lucide-react';
import { StoredFile, useFileOperations } from '@/hooks/useFileOperations';
import { toast } from '@/components/ui/sonner';

interface FileContentViewerProps {
  file: StoredFile;
}

const FileContentViewer: React.FC<FileContentViewerProps> = ({ file }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { getFileUrl } = useFileOperations();

  const fetchFileContent = async () => {
    if (content) return; // Already loaded
    
    setIsLoading(true);
    try {
      const url = getFileUrl(file.storage_path);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      const text = await response.text();
      setContent(text);
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      toast.error("Failed to load file content", {
        description: "Please try again or download the file directly",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !content) {
      fetchFileContent();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard!", {
        description: "You can now paste it into your local .docs folder",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadFile = () => {
    const url = getFileUrl(file.storage_path);
    window.open(url, '_blank');
  };

  const isTextFile = file.mime_type?.startsWith('text/') || 
                    file.file_name.endsWith('.md') || 
                    file.file_name.endsWith('.txt');

  if (!isTextFile) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={downloadFile}
        className="text-blue-600 hover:text-blue-700 p-1"
        title="Download file"
      >
        <Download className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 p-1"
          title="View content"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:w-[800px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {file.file_name}
          </SheetTitle>
          <SheetDescription>
            File content - Copy this to save to your local .docs folder
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              disabled={!content || isLoading}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy All Content
            </Button>
            <Button
              variant="outline"
              onClick={downloadFile}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download File
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading file content...</div>
            </div>
          ) : content ? (
            <div className="border rounded-md p-4 bg-gray-50 max-h-[500px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">{content}</pre>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Click to load file content
            </div>
          )}
          
          {content && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>To add to local .docs folder:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 list-decimal list-inside space-y-1">
                <li>Copy the content above</li>
                <li>Create a new file in your .docs folder: <code className="bg-blue-100 px-1 rounded">.docs/{file.file_name}</code></li>
                <li>Paste the content and save</li>
                <li>The file will then be available for me to reference directly</li>
              </ol>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FileContentViewer;
