import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  Share2, 
  ArrowLeft, 
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Navigation,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Camera,
  Video,
  Music,
  Car,
  Utensils,
  Wifi,
  Shield
} from 'lucide-react';
import EventCard from '@/components/EventCard';
import ReviewsSection from '@/components/reviews/ReviewsSection';
import CalendarIntegration from '@/components/notifications/CalendarIntegration';
import { CompactShareButton } from '@/components/SocialShareButtons';
import type { EventData } from '@/services/socialSharingService';
import FollowButton from '@/components/FollowButton';

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mock event data - in a real app, this would come from an API
  const event = {
    id: parseInt(eventId || '1'),
    title: "Chicago Step Championship",
    date: "2024-07-15",
    time: "7:00 PM",
    endTime: "11:00 PM",
    location: "Chicago Cultural Center",
    address: "78 E Washington St, Chicago, IL 60602",
    city: "Chicago",
    state: "IL",
    price: 45,
    images: [
      "/placeholder.svg",
      "/placeholder.svg", 
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    category: "Competition",
    attendees: 250,
    capacity: 300,
    skillLevel: "Advanced",
    tags: ["stepping", "competition", "championship", "awards", "workshop"],
    rating: 4.8,
    totalReviews: 142,
    description: "Annual championship showcasing the best steppers in the Midwest. Competitive divisions and workshops available. This prestigious event brings together the region's most talented steppers for an unforgettable night of competition, learning, and community building.",
    longDescription: `Join us for the most anticipated stepping event of the year! The Chicago Step Championship features multiple competitive divisions, educational workshops, and special performances by renowned stepping artists.

Event Highlights:
• Professional and amateur competition divisions
• Beginner-friendly workshops throughout the day
• Live DJ sets and musical performances
• Awards ceremony with cash prizes
• Networking opportunities with industry professionals
• Photo and video coverage of all performances

Whether you're a seasoned competitor or just starting your stepping journey, this event offers something for everyone. Come witness incredible talent, learn from the best, and be part of the vibrant stepping community.`,
    organizer: "Chicago Step Alliance",
    organizerBio: "Premier stepping organization in the Midwest, promoting stepping culture and education since 2010.",
    coordinates: { lat: 41.8836, lng: -87.6270 },
    featured: true,
    soldOut: false,
    ticketTypes: [
      {
        id: 1,
        name: "General Admission",
        price: 45,
        description: "Access to all performances and workshops",
        available: 50
      },
      {
        id: 2,
        name: "VIP Package",
        price: 85,
        description: "Premium seating, meet & greet, exclusive merchandise",
        available: 15
      },
      {
        id: 3,
        name: "Student Discount",
        price: 30,
        description: "Valid student ID required",
        available: 25
      }
    ],
    instructor: {
      name: "Marcus Johnson",
      bio: "World-renowned stepping instructor with over 15 years of experience. Multiple championship winner and respected mentor in the stepping community.",
      image: "/placeholder.svg",
      credentials: ["Professional Instructor", "Competition Judge", "Workshop Leader"],
      experience: "15+ years",
      specialties: ["Advanced Technique", "Competition Prep", "Performance"]
    },
    venue: {
      name: "Chicago Cultural Center",
      description: "Historic landmark and premier cultural venue in downtown Chicago",
      capacity: 300,
      amenities: ["Parking Available", "Wheelchair Accessible", "Air Conditioning", "Professional Sound System", "Photography Allowed"],
      contact: {
        phone: "(312) 744-6630",
        website: "www.chicagoculturalcenter.org",
        email: "info@chicagoculturalcenter.org"
      },
      features: ["Professional Dance Floor", "Stadium Seating", "Concessions", "Coat Check", "WiFi"]
    },
    schedule: [
      { time: "6:00 PM", activity: "Registration & Check-in" },
      { time: "7:00 PM", activity: "Opening Ceremony" },
      { time: "7:30 PM", activity: "Beginner Workshop" },
      { time: "8:30 PM", activity: "Competition Rounds Begin" },
      { time: "10:00 PM", activity: "Finals & Awards" },
      { time: "11:00 PM", activity: "Social Dancing & Networking" }
    ],
    reviews: [
      {
        id: 1,
        name: "Sarah Williams",
        rating: 5,
        date: "2024-06-15",
        comment: "Amazing event! Well organized and great competition. Marcus is an incredible instructor.",
        verified: true
      },
      {
        id: 2,
        name: "David Chen",
        rating: 5,
        date: "2024-06-10", 
        comment: "Best stepping event I've attended. The venue was perfect and the workshops were very informative.",
        verified: true
      },
      {
        id: 3,
        name: "Lisa Rodriguez",
        rating: 4,
        date: "2024-06-08",
        comment: "Great event overall. Loved the variety of skill levels represented. Will definitely attend again.",
        verified: false
      }
    ],
    faqs: [
      {
        question: "What should I wear?",
        answer: "Comfortable dance attire and proper dance shoes. No specific dress code required."
      },
      {
        question: "Can beginners participate?",
        answer: "Absolutely! We have beginner-friendly workshops and welcome all skill levels."
      },
      {
        question: "Is parking available?",
        answer: "Yes, there are several parking options nearby including street parking and paid lots."
      },
      {
        question: "Can I get a refund?",
        answer: "Refunds are available up to 48 hours before the event. See our refund policy for details."
      }
    ]
  };

  // Mock related events
  const relatedEvents = [
    {
      id: 2,
      title: "Beginner Step Workshop",
      date: "2024-07-20",
      time: "2:00 PM",
      location: "Dance Studio One",
      city: "Atlanta",
      state: "GA",
      price: 25,
      image: "/placeholder.svg",
      category: "Workshop",
      attendees: 30,
      capacity: 35,
      instructor: "Lisa Davis",
      skillLevel: "Beginner",
      rating: 4.9
    },
    {
      id: 3,
      title: "Saturday Step Social",
      date: "2024-07-22",
      time: "8:00 PM",
      location: "Community Center",
      city: "Detroit",
      state: "MI",
      price: 15,
      image: "/placeholder.svg",
      category: "Social",
      attendees: 75,
      capacity: 100,
      instructor: "DJ Smooth",
      skillLevel: "All Levels",
      rating: 4.6
    }
  ];

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  // Convert event data to EventData interface for social sharing and meta tags
  const eventForSharing: EventData = {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.venue.name,
    city: event.city,
    state: event.state,
    price: event.price,
    description: event.description,
    image: event.images[0],
    category: event.category,
    organizer: event.organizer
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const availabilityPercentage = (event.attendees / event.capacity) * 100;
  const isAlmostSoldOut = availabilityPercentage > 80;

  return (
    <div className="min-h-screen bg-background-main">
      {/* Header */}
      <div className="border-b border-border-default bg-surface-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={handleBookmark}>
                <Heart className={`w-4 h-4 mr-2 ${isBookmarked ? 'fill-current text-red-500' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <CompactShareButton 
                event={eventForSharing}
                campaign="event_details_page"
                platforms={['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy']}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-brand-primary text-text-on-primary">{event.category}</Badge>
                <Badge variant="outline">{event.skillLevel}</Badge>
                {event.featured && <Badge className="bg-yellow-500 text-white">Featured</Badge>}
                {isAlmostSoldOut && <Badge className="bg-feedback-warning text-white">Almost Sold Out</Badge>}
              </div>
              
              <h1 className="font-serif text-4xl font-bold text-text-primary mb-4">
                {event.title}
              </h1>
              
              <div className="flex items-center gap-4 text-text-secondary mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold">{event.rating}</span>
                  <span>({event.totalReviews} reviews)</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span>{event.attendees} attending</span>
                <Separator orientation="vertical" className="h-4" />
                <span>by {event.organizer}</span>
              </div>
            </div>

            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={event.images[activeImageIndex]} 
                    alt={event.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {event.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-16 h-12 rounded border-2 overflow-hidden ${
                          index === activeImageIndex ? 'border-brand-primary' : 'border-white'
                        }`}
                      >
                        <img 
                          src={event.images[index]} 
                          alt={`View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Details Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="venue">Venue</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-secondary mb-4">{event.description}</p>
                    <div className="whitespace-pre-line text-text-secondary">
                      {event.longDescription}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-semibold text-text-primary mb-3">Event Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {event.faqs.map((faq, index) => (
                      <div key={index}>
                        <h5 className="font-semibold text-text-primary mb-2">{faq.question}</h5>
                        <p className="text-text-secondary">{faq.answer}</p>
                        {index < event.faqs.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={event.instructor.image} />
                        <AvatarFallback>{event.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-text-primary mb-2">{event.instructor.name}</h3>
                        <p className="text-text-secondary mb-4">{event.instructor.bio}</p>
                        <div className="flex flex-wrap gap-2">
                          {event.instructor.credentials.map((credential, index) => (
                            <Badge key={index} className="bg-brand-primary text-text-on-primary">
                              <Award className="w-3 h-3 mr-1" />
                              {credential}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3">Experience</h4>
                        <p className="text-text-secondary">{event.instructor.experience}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3">Specialties</h4>
                        <ul className="text-text-secondary space-y-1">
                          {event.instructor.specialties.map((specialty, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-feedback-success" />
                              {specialty}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="venue">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-text-primary mb-4">{event.venue.name}</h3>
                    <p className="text-text-secondary mb-6">{event.venue.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3">Contact Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Phone className="w-4 h-4" />
                            <span>{event.venue.contact.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Mail className="w-4 h-4" />
                            <span>{event.venue.contact.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-text-secondary">
                            <Globe className="w-4 h-4" />
                            <a href={`https://${event.venue.contact.website}`} className="text-brand-primary hover:underline">
                              {event.venue.contact.website}
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-text-primary mb-3">Venue Features</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {event.venue.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-text-secondary">
                              <CheckCircle className="w-4 h-4 text-feedback-success" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-text-primary mb-3">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.venue.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline">{amenity}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.schedule.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-surface-contrast">
                          <div className="w-20 text-sm font-medium text-brand-primary">
                            {item.time}
                          </div>
                          <div className="flex-1 text-text-primary">
                            {item.activity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <ReviewsSection eventId={event.id.toString()} />
              </TabsContent>
            </Tabs>

            {/* Related Events */}
            <div>
              <h2 className="text-2xl font-semibold text-text-primary mb-6">Related Events</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedEvents.map((relatedEvent) => (
                  <EventCard key={relatedEvent.id} event={relatedEvent} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Purchase Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Get Tickets</span>
                  {event.soldOut && <Badge variant="destructive">Sold Out</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {event.ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="p-4 border border-border-default rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-text-primary">{ticket.name}</h4>
                          <p className="text-sm text-text-secondary">{ticket.description}</p>
                        </div>
                        <span className="text-xl font-bold text-brand-primary">${ticket.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-text-secondary">{ticket.available} available</span>
                        <Button size="sm" disabled={ticket.available === 0}>
                          {ticket.available === 0 ? 'Sold Out' : 'Select'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary-hover" size="lg">
                  <Link to={`/event/${event.id}/tickets`}>
                    Continue to Checkout
                  </Link>
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-text-secondary">
                    {event.capacity - event.attendees} spots remaining
                  </p>
                  <div className="w-full bg-surface-contrast rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        availabilityPercentage > 90 ? 'bg-feedback-error' :
                        availabilityPercentage > 80 ? 'bg-feedback-warning' :
                        'bg-feedback-success'
                      }`}
                      style={{ width: `${Math.min(availabilityPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-text-primary">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {event.time} - {event.endTime}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-text-primary">{event.location}</div>
                    <div className="text-sm text-text-secondary">{event.address}</div>
                    <div className="text-sm text-text-secondary">{event.city}, {event.state}</div>
                    <Button variant="link" className="p-0 h-auto text-brand-primary">
                      <Navigation className="w-4 h-4 mr-1" />
                      Get Directions
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-brand-primary mt-0.5" />
                  <div>
                    <div className="font-medium text-text-primary">{event.attendees} attending</div>
                    <div className="text-sm text-text-secondary">Capacity: {event.capacity}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>{event.organizer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-primary">{event.organizer}</h4>
                    <p className="text-sm text-text-secondary mb-3">{event.organizerBio}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <FollowButton
                        entityId={`organizer_${event.organizer.toLowerCase().replace(/\s+/g, '_')}`}
                        entityType="organizer"
                        variant="outline"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Integration */}
            <CalendarIntegration
              eventDetails={{
                title: event.title,
                description: event.description,
                startDate: new Date(`${event.date} ${event.time}`),
                endDate: new Date(`${event.date} ${event.endTime}`),
                location: event.venue.name,
                address: event.address
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage; 