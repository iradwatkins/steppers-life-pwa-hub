
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, BookOpen, MapPin, Clock, Star } from 'lucide-react';
import { EventService } from '@/services/eventService';
import EventsMasonryGrid from '@/components/events/EventsMasonryGrid';

const Index = () => {
  // Real featured events from Supabase
  const [featuredEvents, setFeaturedEvents] = useState([]);

  // Load real events on component mount
  useEffect(() => {
    const loadFeaturedEvents = async () => {
      try {
        const featured = await EventService.getFeaturedEvents(3);
        setFeaturedEvents(featured || []); // Ensure it's always an array
      } catch (error) {
        console.error('Failed to load featured events:', error);
        setFeaturedEvents([]); // Set empty array on error
      }
    };

    loadFeaturedEvents();
  }, []);

  const communityHighlights = [
    {
      title: "DJ Services",
      description: "Professional DJs specializing in stepping music",
      count: "15+ Services"
    },
    {
      title: "Dance Apparel",
      description: "Stepping shoes, outfits, and accessories",
      count: "25+ Stores"
    },
    {
      title: "Event Venues",
      description: "Perfect spaces for stepping events and parties",
      count: "30+ Venues"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-stepping-gradient text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to SteppersLife
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Chicago's premier platform for the stepping community. Discover events, connect with dancers, and immerse yourself in the culture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/events">Find Events</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-stepping-purple" asChild>
              <Link to="/classes">Learn to Step</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Events</h2>
            <p className="text-xl text-muted-foreground">Don't miss these upcoming stepping events</p>
          </div>
          
          {Array.isArray(featuredEvents) && featuredEvents.length > 0 ? (
            <EventsMasonryGrid
              events={featuredEvents}
              variant="featured"
              showRating={true}
              showSoldOutStatus={true}
              showSocialShare={true}
              className="mb-8"
            />
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">Check back soon for upcoming stepping events!</p>
              <Button asChild>
                <Link to="/events/create">Create an Event</Link>
              </Button>
            </div>
          )}

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Community Highlights */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Services</h2>
            <p className="text-xl text-muted-foreground">Discover local businesses and services that support our stepping community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {(communityHighlights ?? []).map((highlight, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-stepping-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{highlight.title}</CardTitle>
                  <CardDescription>{highlight.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stepping-purple">{highlight.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/community">Explore Community</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Magazine Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest from the Magazine</h2>
            <p className="text-xl text-muted-foreground">Stay updated with stepping culture, tips, and community stories</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((article) => (
              <Card key={article} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-video bg-muted rounded-md mb-4"></div>
                  <CardTitle className="text-lg">Mastering the Basic Step: A Complete Guide</CardTitle>
                  <CardDescription>Learn the fundamentals of Chicago stepping with our comprehensive guide...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Star className="h-4 w-4" />
                    Featured Article
                  </div>
                  <Button variant="outline" size="sm">Read More</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/magazine">Read Magazine</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
