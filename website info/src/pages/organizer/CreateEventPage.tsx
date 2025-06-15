import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // For category selection
import { Calendar as CalendarIcon, Image as ImageIcon, MapPin as MapPinIcon, Tag as TagIcon, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CreateEventPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventImage, setEventImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend submission logic will go here
    const mockCreatedEventId = `evt-${Date.now().toString().slice(-6)}`; // Create a mock event ID
    console.log({
      eventId: mockCreatedEventId,
      eventName,
      eventDescription,
      eventDate,
      eventTime,
      eventLocation,
      eventCategory,
      eventImage,
    });
    // For now, just log to console and maybe show a success message (using toast if available)
    alert(`Mock event "${eventName}" created with ID: ${mockCreatedEventId}! Redirecting to manage page.`);
    navigate(`/organizer/event/${mockCreatedEventId}/manage`); // Redirect to ManageEventPage
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-surface-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <CalendarIcon className="mr-2 h-6 w-6 text-brand-primary" />
              Create New Event
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Fill in the details below to set up your new event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="eventName" className="text-text-primary font-medium flex items-center">
                  <TagIcon className="mr-2 h-4 w-4 text-text-secondary" /> Event Name
                </Label>
                <Input
                  id="eventName"
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Annual Steppers Ball"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="eventDescription" className="text-text-primary font-medium">Event Description</Label>
                <Textarea
                  id="eventDescription"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Describe your event, including highlights, special guests, and what attendees can expect."
                  className="mt-1"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="eventDate" className="text-text-primary font-medium flex items-center">
                     <CalendarIcon className="mr-2 h-4 w-4 text-text-secondary" /> Event Date
                  </Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="eventTime" className="text-text-primary font-medium flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-text-secondary" /> Event Time
                  </Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="eventLocation" className="text-text-primary font-medium flex items-center">
                  <MapPinIcon className="mr-2 h-4 w-4 text-text-secondary" /> Event Location
                </Label>
                <Input
                  id="eventLocation"
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g., Grand Ballroom, 123 Main St"
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="eventCategory" className="text-text-primary font-medium">Event Category</Label>
                <Select onValueChange={setEventCategory} value={eventCategory}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Gathering</SelectItem>
                    <SelectItem value="workshop">Workshop/Class</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="fundraiser">Fundraiser</SelectItem>
                    <SelectItem value="conference">Conference/Summit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {/* For custom category input if needed:
                <Input
                  id="eventCategory"
                  type="text"
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value)}
                  placeholder="e.g., Workshop, Social, Competition"
                  className="mt-1"
                /> */}
              </div>

              <div>
                <Label htmlFor="eventImage" className="text-text-primary font-medium flex items-center">
                  <ImageIcon className="mr-2 h-4 w-4 text-text-secondary" /> Event Image/Flyer
                </Label>
                <Input
                  id="eventImage"
                  type="file"
                  onChange={(e) => setEventImage(e.target.files ? e.target.files[0] : null)}
                  className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                />
                {eventImage && <p className="text-sm text-text-secondary mt-2">Selected: {eventImage.name}</p>}
              </div>

              <CardFooter className="px-0 pt-6">
                <Button type="submit" className="w-full md:w-auto bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary">
                  Create Event
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEventPage; 