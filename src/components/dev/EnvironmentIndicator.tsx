import React from 'react';
import { Badge } from '@/components/ui/badge';
import { env } from '@/config/environment';
import { Database, GitBranch } from 'lucide-react';

const EnvironmentIndicator: React.FC = () => {
  // Only show in development mode
  if (!env.isDevelopment) return null;

  const isDevelopmentDB = env.supabaseUrl.includes('nwoteszpvvefbopbbvrl');
  const isProductionDB = env.supabaseUrl.includes('nvryyufpbcruyqqndyjn');

  const dbStatus = isDevelopmentDB ? 'Development DB' : isProductionDB ? 'Production DB' : 'Unknown DB';
  const dbColor = isDevelopmentDB ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300';

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Database Indicator */}
      <Badge className={`${dbColor} flex items-center gap-1 px-2 py-1 text-xs font-mono`}>
        <Database className="h-3 w-3" />
        {dbStatus}
      </Badge>
      
      {/* Environment Indicator */}
      <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 px-2 py-1 text-xs font-mono">
        <GitBranch className="h-3 w-3" />
        {env.appEnv} mode
      </Badge>
    </div>
  );
};

export default EnvironmentIndicator;