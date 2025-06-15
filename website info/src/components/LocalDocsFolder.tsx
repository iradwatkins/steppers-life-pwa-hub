
import React from 'react';
import { Folder, File } from "lucide-react";

interface DocsFile {
  name: string;
  path: string;
  isDirectory: boolean;
  url?: string;
}

interface LocalDocsFolderProps {
  docsFiles: DocsFile[];
  isLoading: boolean;
}

const LocalDocsFolder: React.FC<LocalDocsFolderProps> = ({ docsFiles, isLoading }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Folder className="h-5 w-5 text-gray-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Local .docs Folder</h2>
        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
          Local Files
        </span>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="text-sm text-gray-500">Loading files...</div>
        </div>
      ) : docsFiles.length > 0 ? (
        <div className="space-y-2">
          {docsFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center">
                {file.isDirectory ? (
                  <Folder className="h-5 w-5 text-gray-600 mr-2" />
                ) : (
                  <File className="h-5 w-5 text-gray-600 mr-2" />
                )}
                <div>
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <div className="text-xs text-gray-500">{file.path}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No files found in .docs folder
        </div>
      )}
      
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Web browsers cannot write files directly to the local file system for security reasons. 
          To add files to the .docs folder, you need to add them manually in your code editor.
        </p>
      </div>
    </div>
  );
};

export default LocalDocsFolder;
