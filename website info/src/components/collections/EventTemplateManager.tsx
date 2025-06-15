import React from 'react';
import { FileText, Copy, Eye, Globe, Lock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EventTemplate } from '@/services/eventCollectionsService';

interface EventTemplateManagerProps {
  templates: EventTemplate[];
  loading: boolean;
  organizerId: string;
  viewMode: 'grid' | 'list' | 'calendar';
}

const EventTemplateManager: React.FC<EventTemplateManagerProps> = ({
  templates,
  loading,
  organizerId,
  viewMode,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Create templates from successful events to speed up event creation
            </p>
            <Button>Create Template</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="line-clamp-1">{template.name}</span>
              <div className="flex items-center gap-1">
                {template.isPublic ? (
                  <Globe className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Used {template.usageCount} times
                </span>
              </div>
              <Badge variant={template.isPublic ? "default" : "secondary"} className="text-xs">
                {template.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Created {formatDate(template.createdAt)}
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Use Template
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventTemplateManager; 