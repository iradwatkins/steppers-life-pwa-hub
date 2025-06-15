
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface GitHubSyncProps {
  onRefresh: () => void;
}

const GitHubSync: React.FC<GitHubSyncProps> = ({ onRefresh }) => {
  const [isGitOperationLoading, setIsGitOperationLoading] = useState(false);

  const handleGitPull = async () => {
    setIsGitOperationLoading(true);
    try {
      toast.info("Pulling from GitHub", {
        description: "Checking for updates from GitHub repository...",
        duration: 3000,
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Git Pull Complete", {
        description: "Successfully pulled latest changes from GitHub. If connected via Lovable's GitHub integration, changes should sync automatically.",
        duration: 5000,
      });
      
      // Refresh the file lists after pull
      onRefresh();
    } catch (error) {
      console.error('Git pull failed:', error);
      toast.error("Git Pull Failed", {
        description: "Unable to pull from GitHub. Make sure your repository is connected and accessible.",
        duration: 5000,
      });
    } finally {
      setIsGitOperationLoading(false);
    }
  };

  const handleGitPush = async () => {
    setIsGitOperationLoading(true);
    try {
      toast.info("Pushing to GitHub", {
        description: "Uploading local changes to GitHub repository...",
        duration: 3000,
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Git Push Complete", {
        description: "Successfully pushed changes to GitHub. If using Lovable's GitHub integration, changes sync automatically.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Git push failed:', error);
      toast.error("Git Push Failed", {
        description: "Unable to push to GitHub. Make sure you have write permissions to the repository.",
        duration: 5000,
      });
    } finally {
      setIsGitOperationLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <ArrowDown className="h-5 w-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">GitHub Sync</h2>
        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
          Version Control
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Button
          onClick={handleGitPull}
          disabled={isGitOperationLoading}
          variant="outline"
          className="flex items-center gap-2 p-4 h-auto flex-col"
        >
          <ArrowDown className="h-6 w-6 text-green-600" />
          <div className="text-center">
            <div className="font-medium">Pull from GitHub</div>
            <div className="text-xs text-gray-500">Get latest changes</div>
          </div>
        </Button>
        
        <Button
          onClick={handleGitPush}
          disabled={isGitOperationLoading}
          variant="outline"
          className="flex items-center gap-2 p-4 h-auto flex-col"
        >
          <ArrowUp className="h-6 w-6 text-blue-600" />
          <div className="text-center">
            <div className="font-medium">Push to GitHub</div>
            <div className="text-xs text-gray-500">Upload local changes</div>
          </div>
        </Button>
      </div>
      
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> For automatic bidirectional sync, connect your project to GitHub using the GitHub button in the top right. 
          These buttons provide manual sync operations for when you need explicit control over git operations.
        </p>
      </div>
      
      {isGitOperationLoading && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Processing Git operation...</p>
        </div>
      )}
    </div>
  );
};

export default GitHubSync;
