import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  GraduationCap, 
  Video, 
  Briefcase, 
  Store,
  Users,
  ChevronRight,
  Check,
  Star
} from 'lucide-react';
import { UserRole } from '@/services/userDashboardService';

interface RoleActivationCardProps {
  role: UserRole;
  onActivate: (roleId: string) => Promise<void>;
}

const RoleActivationCard: React.FC<RoleActivationCardProps> = ({
  role,
  onActivate
}) => {
  const [isActivating, setIsActivating] = useState(false);

  // Get icon component by name
  const getIcon = (iconName: string, className: string = "h-5 w-5") => {
    const icons: { [key: string]: React.ReactNode } = {
      Users: <Users className={className} />,
      Calendar: <Calendar className={className} />,
      GraduationCap: <GraduationCap className={className} />,
      Video: <Video className={className} />,
      Briefcase: <Briefcase className={className} />,
      Store: <Store className={className} />
    };
    return icons[iconName] || <Users className={className} />;
  };

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await onActivate(role.id);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-2 hover:border-brand-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              {getIcon(role.icon, "h-5 w-5 text-brand-primary")}
            </div>
            <div>
              <CardTitle className="text-lg">{role.displayName}</CardTitle>
              {role.id === 'organizer' && (
                <Badge variant="secondary" className="mt-1 bg-yellow-100 text-yellow-800 text-xs">
                  Popular
                </Badge>
              )}
            </div>
          </div>
        </div>
        <CardDescription className="text-sm leading-relaxed mt-2">
          {role.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Requirements */}
        {role.requirements && role.requirements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-2">To get started:</h4>
            <ul className="space-y-1">
              {role.requirements.map((requirement, index) => (
                <li key={index} className="text-sm text-text-secondary flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full flex-shrink-0" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benefits */}
        <div>
          <h4 className="text-sm font-medium text-text-primary mb-2">Benefits:</h4>
          <ul className="space-y-1">
            {role.benefits.slice(0, 3).map((benefit, index) => (
              <li key={index} className="text-sm text-text-secondary flex items-center gap-2">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                {benefit}
              </li>
            ))}
            {role.benefits.length > 3 && (
              <li className="text-xs text-text-secondary italic">
                +{role.benefits.length - 3} more benefits
              </li>
            )}
          </ul>
        </div>

        {/* Activation Button */}
        <Button 
          onClick={handleActivate}
          disabled={isActivating}
          className="w-full bg-brand-primary hover:bg-brand-primary-hover"
        >
          {isActivating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Activating...
            </>
          ) : (
            <>
              Activate {role.displayName}
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>

        {/* Quick Stats */}
        {role.id === 'organizer' && (
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>Most Popular</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>2.5k+ Active</span>
            </div>
          </div>
        )}

        {role.id === 'instructor' && (
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              <span>Educational</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>800+ Active</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleActivationCard; 