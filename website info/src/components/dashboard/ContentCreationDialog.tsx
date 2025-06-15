import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  GraduationCap, 
  Video, 
  Briefcase, 
  Store,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContentCreationOption } from '@/services/userDashboardService';

interface ContentCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableOptions: ContentCreationOption[];
  comingSoonOptions: ContentCreationOption[];
  onSelectOption: (optionId: string) => void;
}

const ContentCreationDialog: React.FC<ContentCreationDialogProps> = ({
  open,
  onOpenChange,
  availableOptions,
  comingSoonOptions,
  onSelectOption
}) => {
  // Get icon component by name
  const getIcon = (iconName: string, className: string = "h-5 w-5") => {
    const icons: { [key: string]: React.ReactNode } = {
      Calendar: <Calendar className={className} />,
      GraduationCap: <GraduationCap className={className} />,
      Video: <Video className={className} />,
      Briefcase: <Briefcase className={className} />,
      Store: <Store className={className} />
    };
    return icons[iconName] || <Calendar className={className} />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">What would you like to create?</DialogTitle>
          <DialogDescription>
            Choose from the content creation options available to you based on your active roles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Available Options */}
          {availableOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Available Now</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableOptions.map(option => (
                  <Card 
                    key={option.id} 
                    className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 hover:border-brand-primary/30"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-brand-primary/10 rounded-lg flex-shrink-0">
                          {getIcon(option.icon, "h-6 w-6 text-brand-primary")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-text-primary">{option.title}</h4>
                            {option.featured && (
                              <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                            {option.description}
                          </p>
                          <Link 
                            to={option.route}
                            onClick={() => {
                              onSelectOption(option.id);
                              onOpenChange(false);
                            }}
                          >
                            <Button className="w-full bg-brand-primary hover:bg-brand-primary-hover">
                              Get Started
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Coming Soon Options */}
          {comingSoonOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">Coming Soon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comingSoonOptions.map(option => (
                  <Card 
                    key={option.id} 
                    className="opacity-75 border-dashed"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg flex-shrink-0">
                          {getIcon(option.icon, "h-6 w-6 text-gray-400")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-text-primary">{option.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              Coming Soon
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                            {option.description}
                          </p>
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            disabled
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Not Available Yet
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Options Available */}
          {availableOptions.length === 0 && comingSoonOptions.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No Content Options Available</h3>
              <p className="text-text-secondary mb-4">
                You need to activate additional roles to unlock content creation features.
              </p>
              <Button 
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Explore Roles
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-default pt-4 mt-6">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>Need help getting started?</span>
            <Link to="/docs" className="text-brand-primary hover:underline">
              View Documentation
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentCreationDialog; 