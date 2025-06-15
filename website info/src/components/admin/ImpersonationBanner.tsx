import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  UserX, 
  AlertTriangle, 
  Eye,
  LogOut 
} from 'lucide-react';
import { useUserImpersonation } from '@/hooks/useUserImpersonation';

const ImpersonationBanner: React.FC = () => {
  const { impersonationState, endImpersonation, loading } = useUserImpersonation();

  if (!impersonationState.isImpersonating || !impersonationState.impersonatedUser) {
    return null;
  }

  const impersonatedUser = impersonationState.impersonatedUser;
  const originalAdmin = impersonationState.originalAdmin;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'organizer': return 'bg-blue-500';
      case 'instructor': return 'bg-green-500';
      case 'sales_agent': return 'bg-orange-500';
      case 'event_staff': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'organizer': return 'Event Organizer';
      case 'instructor': return 'Instructor';
      case 'sales_agent': return 'Sales Agent';
      case 'event_staff': return 'Event Staff';
      case 'buyer': return 'Customer';
      default: return role;
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg border-b-2 border-orange-600">
      <div className="container mx-auto px-4 py-3">
        <Alert className="border-none bg-transparent text-white">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-300" />
                <Eye className="h-5 w-5" />
              </div>
              
              <div className="flex items-center gap-3">
                <div>
                  <AlertDescription className="text-white font-medium text-base">
                    Acting as user:
                  </AlertDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {impersonatedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{impersonatedUser.name}</div>
                      <div className="text-sm opacity-90">{impersonatedUser.email}</div>
                    </div>
                  </div>
                  
                  <Badge 
                    className={`${getRoleColor(impersonatedUser.role)} text-white border-white/30`}
                  >
                    {getRoleDisplayName(impersonatedUser.role)}
                  </Badge>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-2 text-sm opacity-90">
                <Shield className="h-4 w-4" />
                <span>Admin: {originalAdmin?.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm opacity-90">
                You can now make changes as this user
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={endImpersonation}
                disabled={loading}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ending...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    End Impersonation
                  </>
                )}
              </Button>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default ImpersonationBanner; 