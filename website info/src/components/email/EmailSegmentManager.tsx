import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { EmailSegment, EmailRecipient } from '../../services/emailCampaignService';

interface EmailSegmentManagerProps {
  segments: EmailSegment[];
  recipients: EmailRecipient[];
  eventId: string;
}

const EmailSegmentManager: React.FC<EmailSegmentManagerProps> = ({
  segments,
  recipients,
  eventId
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Audience Segments</h3>
          <p className="text-sm text-text-secondary">
            Create targeted segments to send personalized campaigns
          </p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-primary-hover">
          <Plus className="mr-2 h-4 w-4" />
          Create Segment
        </Button>
      </div>

      {/* All Recipients Overview */}
      <Card className="bg-surface-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-text-primary flex items-center">
            <Users className="mr-2 h-5 w-5 text-brand-primary" />
            All Event Attendees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-text-primary">{recipients.length}</p>
              <p className="text-sm text-text-secondary">Total attendees</p>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              View All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Custom Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {segments.map((segment) => (
          <Card key={segment.id} className="bg-surface-card">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold text-text-primary">
                  {segment.name}
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  {segment.description}
                </p>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-text-primary">
                      {segment.recipientCount}
                    </p>
                    <p className="text-xs text-text-secondary">People in segment</p>
                  </div>
                  <Users className="h-8 w-8 text-text-tertiary" />
                </div>
                
                {/* Criteria Summary */}
                <div className="bg-background-main p-2 rounded text-xs">
                  <p className="text-text-secondary mb-1">Criteria:</p>
                  {segment.criteria.ticketTypes && (
                    <p className="text-text-primary">
                      Ticket Types: {segment.criteria.ticketTypes.join(', ')}
                    </p>
                  )}
                  {segment.criteria.purchaseDateRange && (
                    <p className="text-text-primary">
                      Purchase Period: Early Bird Buyers
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <Card className="bg-surface-card">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No segments created yet</h3>
            <p className="text-text-secondary mb-4">
              Create segments to target specific groups of attendees with personalized messages.
            </p>
            <Button className="bg-brand-primary hover:bg-brand-primary-hover">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Segment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmailSegmentManager; 