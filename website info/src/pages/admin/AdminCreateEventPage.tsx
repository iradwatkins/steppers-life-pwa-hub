import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Image as ImageIcon, MapPin as MapPinIcon, Tag as TagIcon, Clock, UserCheck, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock promoter data
const mockPromoters = [
  { id: 'promoter1', name: 'John Promoter (john.promoter@example.com)' },
  { id: 'promoter2', name: 'Alice StepStar (alice.stepstar@example.com)' },
  { id: 'promoter3', name: 'Mike Organizer (mike.organizer@example.com)' },
];

const AdminCreateEventPage = () => {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [assignedPromoterId, setAssignedPromoterId] = useState<string>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEventId = `admin-evt-${Date.now().toString().slice(-5)}`;
    const finalAssignedPromoterId = assignedPromoterId === 'none' ? null : assignedPromoterId;
    console.log('Admin creating and assigning event:', {
      newEventId,
      eventName,
      eventDescription,
      eventDate,
      eventTime,
      eventLocation,
      eventCategory,
      eventImage,
      assignedPromoterId: finalAssignedPromoterId,
    });
    alert(`Event "${eventName}" created with ID ${newEventId} and assigned to promoter ID: ${finalAssignedPromoterId || 'None'}. (Mock action)`);
    // navigate(`/admin/events`); // Or to a page listing admin-created events
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-surface-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <Building className="mr-2 h-6 w-6 text-brand-primary" />
              Admin: Create & Assign Event
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Fill in event details and optionally assign it to a promoter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4 flex items-center"><TagIcon className="mr-2 h-5 w-5 text-text-secondary"/>Event Details</h3>
              <div>
                <Label htmlFor="eventName" className="text-text-primary font-medium">Event Name</Label>
                <Input id="eventName" type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g., Steppers Gala Night" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="eventDescription" className="text-text-primary font-medium">Event Description</Label>
                <Textarea id="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} placeholder="Describe the event..." className="mt-1" rows={3} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="eventDate" className="text-text-primary font-medium flex items-center"><CalendarIcon className="mr-2 h-4 w-4 text-text-secondary" /> Event Date</Label>
                  <Input id="eventDate" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="eventTime" className="text-text-primary font-medium flex items-center"><Clock className="mr-2 h-4 w-4 text-text-secondary" /> Event Time</Label>
                  <Input id="eventTime" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="mt-1" required />
                </div>
              </div>
              <div>
                <Label htmlFor="eventLocation" className="text-text-primary font-medium flex items-center"><MapPinIcon className="mr-2 h-4 w-4 text-text-secondary" /> Event Location</Label>
                <Input id="eventLocation" type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="e.g., Grand Ballroom, 123 Main St" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="eventCategory" className="text-text-primary font-medium">Event Category</Label>
                <Select onValueChange={setEventCategory} value={eventCategory}>
                  <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Gathering</SelectItem>
                    <SelectItem value="workshop">Workshop/Class</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="fundraiser">Fundraiser</SelectItem>
                    <SelectItem value="conference">Conference/Summit</SelectItem>
                    <SelectItem value="platform_hosted">Platform Hosted</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eventImage" className="text-text-primary font-medium flex items-center"><ImageIcon className="mr-2 h-4 w-4 text-text-secondary" /> Event Image/Flyer</Label>
                <Input id="eventImage" type="file" onChange={(e) => setEventImage(e.target.files ? e.target.files[0] : null)} className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20" />
                {eventImage && <p className="text-sm text-text-secondary mt-2">Selected: {eventImage.name}</p>}
              </div>

              <h3 className="text-lg font-semibold text-text-primary border-b pb-2 my-6 flex items-center"><UserCheck className="mr-2 h-5 w-5 text-text-secondary"/>Assign to Promoter (Optional)</h3>
              <div>
                <Label htmlFor="assignedPromoterId" className="text-text-primary font-medium">Select Promoter</Label>
                <Select onValueChange={setAssignedPromoterId} value={assignedPromoterId}>
                  <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select a promoter to assign this event to" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Event remains claimable or unassigned)</SelectItem>
                    {mockPromoters.map(promoter => (
                      <SelectItem key={promoter.id} value={promoter.id}>{promoter.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <CardFooter className="px-0 pt-8">
                <Button type="submit" className="w-full md:w-auto bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary">
                  Create Event & Assign
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCreateEventPage; 