import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { EmailTemplate } from '../../services/emailCampaignService';

interface EmailTemplateManagerProps {
  templates: EmailTemplate[];
  eventId: string;
}

const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({
  templates,
  eventId
}) => {
  const getCategoryBadgeVariant = (category: EmailTemplate['category']) => {
    switch (category) {
      case 'reminder': return 'default';
      case 'update': return 'destructive';
      case 'announcement': return 'secondary';
      case 'marketing': return 'success';
      case 'custom': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Email Templates</h3>
          <p className="text-sm text-text-secondary">
            Manage your email templates for different campaign types
          </p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-primary-hover">
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="bg-surface-card">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold text-text-primary">
                  {template.name}
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  {template.description}
                </p>
              </div>
              <Badge variant={getCategoryBadgeVariant(template.category)}>
                {template.category}
              </Badge>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="bg-background-main p-2 rounded text-sm">
                  <p className="text-text-secondary mb-1">Subject:</p>
                  <p className="text-text-primary font-medium">{template.subject}</p>
                </div>
                
                <div className="text-xs text-text-tertiary">
                  Variables: {template.variables.join(', ')}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-text-tertiary">
                    {template.isBuiltIn ? 'Built-in template' : 'Custom template'}
                  </span>
                  
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    {!template.isBuiltIn && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmailTemplateManager; 