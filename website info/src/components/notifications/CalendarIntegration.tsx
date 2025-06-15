import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar, 
  CalendarPlus, 
  Download, 
  ExternalLink,
  Globe,
  Smartphone,
  CheckCircle,
  Copy
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationService } from '@/services/notificationService';

interface CalendarIntegrationProps {
  eventDetails: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    address: string;
  };
  className?: string;
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  eventDetails,
  className = ''
}) => {
  const { toast } = useToast();
  const [addedToCalendar, setAddedToCalendar] = useState<string[]>([]);

  const calendarEvent = notificationService.generateCalendarEvent(eventDetails);
  const calendarUrls = notificationService.generateCalendarUrls(calendarEvent);

  const handleAddToCalendar = (platform: string, url: string) => {
    if (platform === 'apple' || platform === 'ics') {
      // For Apple and ICS, download the file
      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', `${eventDetails.title}.ics`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // For Google and Outlook, open in new window
      window.open(url, '_blank');
    }

    if (!addedToCalendar.includes(platform)) {
      setAddedToCalendar([...addedToCalendar, platform]);
    }

    toast({
      title: "Calendar Event",
      description: `Event ${platform === 'apple' || platform === 'ics' ? 'downloaded' : 'opened'} for ${platform === 'google' ? 'Google Calendar' : platform === 'outlook' ? 'Outlook' : platform === 'apple' ? 'Apple Calendar' : 'ICS file'}`
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(calendarUrls.google);
      toast({
        title: "Link Copied",
        description: "Google Calendar link copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const isAdded = (platform: string) => addedToCalendar.includes(platform);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Add to Calendar
        </CardTitle>
        <p className="text-sm text-text-secondary">
          Never miss your event - add it to your preferred calendar app
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddToCalendar('google', calendarUrls.google)}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>Google</span>
            {isAdded('google') && <CheckCircle className="w-4 h-4 text-green-500" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddToCalendar('outlook', calendarUrls.outlook)}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>Outlook</span>
            {isAdded('outlook') && <CheckCircle className="w-4 h-4 text-green-500" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddToCalendar('apple', calendarUrls.apple)}
            className="flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Apple</span>
            {isAdded('apple') && <CheckCircle className="w-4 h-4 text-green-500" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddToCalendar('ics', calendarUrls.ics)}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
            {isAdded('ics') && <CheckCircle className="w-4 h-4 text-green-500" />}
          </Button>
        </div>

        {/* More Options */}
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <CalendarPlus className="w-4 h-4 mr-2" />
                More Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleCopyLink}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Google Calendar Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddToCalendar('ics', calendarUrls.ics)}>
                <Download className="w-4 h-4 mr-2" />
                Download ICS File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {addedToCalendar.length > 0 && (
            <Badge variant="outline" className="text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Added to {addedToCalendar.length} calendar{addedToCalendar.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Event Preview */}
        <div className="bg-surface-contrast p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-text-primary text-sm">{calendarEvent.title}</h4>
          <div className="text-xs text-text-secondary space-y-1">
            <p>📅 {calendarEvent.startDate.toLocaleDateString()} at {calendarEvent.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p>📍 {calendarEvent.location}</p>
            {calendarEvent.description && (
              <p className="line-clamp-2">📝 {calendarEvent.description}</p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-text-secondary space-y-1">
          <p><strong>Google/Outlook:</strong> Opens calendar in your browser</p>
          <p><strong>Apple:</strong> Downloads .ics file for Apple Calendar</p>
          <p><strong>Download:</strong> Universal .ics file for any calendar app</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarIntegration; 