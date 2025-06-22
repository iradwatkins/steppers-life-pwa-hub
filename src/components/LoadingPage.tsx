import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ 
  message = "Loading...", 
  className = "min-h-screen" 
}) => {
  return (
    <div className={`${className} bg-muted/30 flex items-center justify-center`}>
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-stepping-purple mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">{message}</p>
      </div>
    </div>
  );
}; 