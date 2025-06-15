import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemEvent {
  title: string;
  description: string;
  category: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  location: string;
  capacity: number;
  price: number;
  status: 'draft' | 'published' | 'scheduled';
}

const CreateSystemEventPage: React.FC = () => {
  const [event, setEvent] = useState<SystemEvent>({
    title: '',
    description: '',
    category: '',
    startDate: undefined,
    endDate: undefined,
    location: '',
    capacity: 0,
    price: 0,
    status: 'draft'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual API call
    console.log('Creating system event:', event);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create System Event</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new platform-wide event
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={event.category}
                  onValueChange={(value) => setEvent({ ...event, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="food">Food & Drink</SelectItem>
                    <SelectItem value="art">Art & Culture</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !event.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {event.startDate ? format(event.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={event.startDate}
                      onSelect={(date) => setEvent({ ...event, startDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !event.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {event.endDate ? format(event.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={event.endDate}
                      onSelect={(date) => setEvent({ ...event, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={event.location}
                  onChange={(e) => setEvent({ ...event, location: e.target.value })}
                  placeholder="Enter event location"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={event.capacity}
                  onChange={(e) => setEvent({ ...event, capacity: parseInt(e.target.value) })}
                  placeholder="Enter maximum capacity"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Ticket Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={event.price}
                  onChange={(e) => setEvent({ ...event, price: parseFloat(e.target.value) })}
                  placeholder="Enter ticket price"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={event.status}
                  onValueChange={(value: 'draft' | 'published' | 'scheduled') => setEvent({ ...event, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={event.description}
                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                placeholder="Enter event description"
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button type="submit">
                Create Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateSystemEventPage; 