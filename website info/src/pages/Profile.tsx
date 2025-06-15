import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, Star, Calendar, Users, Award, Edit, Settings, Briefcase, BookOpen, Handshake, Ticket as TicketIcon, Bell, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import NotificationPreferencesComponent from '@/components/notifications/NotificationPreferences';
import PaymentSettingsComponent from '@/components/PaymentSettings';

interface MockPurchasedTicket {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  quantity: number;
  purchaseDate: string;
  qrCodePlaceholder?: string; // URL or data for a mock QR
}

const Profile = () => {
  const { user } = useAuth();

  const userProfile = {
    name: 'Sarah Mitchell',
    title: 'Stepping Enthusiast',
    location: 'Houston, TX',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=300&fit=crop&crop=face',
    rating: 4.8,
    eventsAttended: 25,
    classesCompleted: 12,
    verified: true,
    joinDate: 'January 2023',
    specialties: ['Beginner Classes', 'Social Dancing', 'Line Step'],
    role: 'organizer'
  };

  let profileTitle = 'Stepping Enthusiast';
  if (userProfile.role === 'promoter') {
    profileTitle = 'Event Promoter';
  } else if (userProfile.role === 'instructor') {
    profileTitle = 'Dance Instructor';
  } else if (userProfile.role === 'organizer') {
    profileTitle = 'Event Organizer';
  }

  const mockPurchasedTickets: MockPurchasedTicket[] = [
    {
      id: 'ticket001',
      eventId: 'evt987',
      eventName: 'Grand Steppers Ball 2025',
      eventDate: 'Saturday, October 25, 2025 - 7:00 PM',
      eventLocation: 'The Elegant Ballroom, Downtown',
      ticketType: 'VIP Ticket',
      quantity: 2,
      purchaseDate: 'July 15, 2024',
      qrCodePlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SLTICKET001GRANDBALL'
    },
    {
      id: 'ticket002',
      eventId: 'evt002',
      eventName: 'Lakeside Smooth Groove Night',
      eventDate: 'Friday, August 15, 2025 - 8:00 PM',
      eventLocation: 'Lakeview Pavilion',
      ticketType: 'General Admission',
      quantity: 1,
      purchaseDate: 'July 20, 2024',
      qrCodePlaceholder: 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=SLTICKET002LAKESIDE'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'event',
      title: 'Chicago Steppers Social at Navy Pier',
      date: 'Jan 15, 2024',
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=200&h=150&fit=crop'
    },
    {
      id: 2,
      type: 'class',
      title: 'Beginner Stepping Fundamentals',
      date: 'Jan 10, 2024',
      image: 'https://images.unsplash.com/photo-1574279606130-09958dc756f4?w=200&h=150&fit=crop'
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Completed 12 Classes',
      date: 'Jan 8, 2024'
    }
  ];

  // Determine if user can receive payouts
  const canReceivePayouts = ['organizer', 'sales_agent', 'instructor'].includes(userProfile.role);
  
  // Calculate tab grid columns based on role
  const getTabsGridCols = () => {
    const baseTabsCount = 5; // activity, tickets, classes, achievements, notifications
    let extraTabs = 0;
    
    if (userProfile.role === 'promoter') extraTabs += 1;
    if (userProfile.role === 'instructor') extraTabs += 1;
    if (canReceivePayouts) extraTabs += 1; // payment settings
    
    return `grid-cols-${baseTabsCount + extraTabs}`;
  };

  return (
    <div className="min-h-screen bg-background-main pb-20">
      {/* Profile Header */}
      <section className="bg-gradient-to-r from-brand-primary to-brand-primary-hover text-text-on-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img 
                src={userProfile.image} 
                alt={userProfile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white"
              />
              {userProfile.verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-brand-primary" />
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="font-serif text-3xl font-bold mb-2">{userProfile.name}</h1>
              <p className="text-xl text-text-on-primary/90 mb-2">{profileTitle}</p>
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{userProfile.location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  <span>{userProfile.rating}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {userProfile.specialties.map((specialty, index) => (
                  <Badge key={index} className="bg-white/20 text-white border-white/30">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button className="bg-white text-brand-primary hover:bg-white/90">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Stats */}
      <section className="py-8 bg-surface-card border-b border-border-default">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-2xl font-bold text-brand-primary">{userProfile.eventsAttended}</h3>
              <p className="text-text-secondary">Events Attended</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-brand-primary">{userProfile.classesCompleted}</h3>
              <p className="text-text-secondary">Classes Completed</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-brand-primary">{userProfile.rating}</h3>
              <p className="text-text-secondary">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className={`grid w-full ${getTabsGridCols()}`}>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="tickets">My Tickets</TabsTrigger>
              <TabsTrigger value="classes">My Classes</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              {canReceivePayouts && (
                <TabsTrigger value="payment-settings">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Settings
                </TabsTrigger>
              )}
              {userProfile.role === 'promoter' && (
                <TabsTrigger value="promoter-dashboard">Promoter Tools</TabsTrigger>
              )}
              {userProfile.role === 'instructor' && (
                <TabsTrigger value="instructor-dashboard">Instructor Tools</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="activity" className="mt-8">
              <div className="space-y-6">
                <h2 className="font-serif text-2xl font-bold text-text-primary">Recent Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentActivity.map((activity) => (
                    <Card key={activity.id} className="bg-surface-card border-border-default">
                      <CardContent className="p-6">
                        {activity.image && (
                          <img 
                            src={activity.image} 
                            alt={activity.title}
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="font-semibold text-text-primary mb-2">{activity.title}</h3>
                        <p className="text-text-secondary text-sm">{activity.date}</p>
                        <Badge className="mt-2 capitalize">{activity.type}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="mt-8">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-serif text-2xl font-bold text-text-primary flex items-center">
                    <TicketIcon className="mr-3 h-7 w-7 text-brand-primary" />
                    My Tickets
                  </h2>
                  <Button asChild variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-text-on-primary">
                    <Link to="/tickets/history">
                      <TicketIcon className="mr-2 h-4 w-4" />
                      View Full History
                    </Link>
                  </Button>
                </div>
                {mockPurchasedTickets.length === 0 ? (
                  <div className="text-center py-12 bg-surface-card border border-border-default rounded-lg">
                    <TicketIcon className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                    <h3 className="font-semibold text-text-primary mb-2">No Tickets Yet</h3>
                    <p className="text-text-secondary mb-6">You haven't purchased any tickets for upcoming events.</p>
                    <Button asChild className="bg-brand-primary hover:bg-brand-primary-hover">
                      <Link to="/events">Browse Events</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {mockPurchasedTickets.map((ticket) => (
                      <Card key={ticket.id} className="bg-surface-card border-border-default overflow-hidden shadow-md">
                        <CardHeader className="pb-3 bg-background-main border-b border-border-default">
                          <CardTitle className="text-xl font-semibold text-text-primary">{ticket.eventName}</CardTitle>
                          <CardDescription className="text-sm text-text-secondary">
                            {ticket.eventDate} @ {ticket.eventLocation}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="md:col-span-2 space-y-2">
                            <p className="text-sm text-text-secondary"><strong className="text-text-primary">Ticket Type:</strong> {ticket.ticketType}</p>
                            <p className="text-sm text-text-secondary"><strong className="text-text-primary">Quantity:</strong> {ticket.quantity}</p>
                            <p className="text-sm text-text-secondary"><strong className="text-text-primary">Purchased:</strong> {ticket.purchaseDate}</p>
                            <p className="text-sm text-text-secondary"><strong className="text-text-primary">Ticket ID:</strong> {ticket.id}</p>
                          </div>
                          <div className="flex justify-center md:justify-end items-center">
                            {ticket.qrCodePlaceholder ? (
                              <img src={ticket.qrCodePlaceholder} alt="Mock QR Code" className="w-24 h-24 border border-border-default rounded-md p-1" />
                            ) : (
                              <div className="w-24 h-24 border border-border-default rounded-md flex items-center justify-center text-text-secondary bg-muted text-xs p-2">
                                QR Placeholder
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="bg-background-main border-t border-border-default p-3 flex justify-end">
                           <Button variant="outline" size="sm" asChild>
                             <Link to={`/event/${ticket.eventId}/tickets`}>View Event</Link>
                           </Button>
                        </CardFooter>
                      </Card>
                    ))}
                    <div className="text-center pt-4">
                      <Button asChild variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-text-on-primary">
                        <Link to="/tickets/history">
                          View Complete Ticket History & Downloads
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="classes" className="mt-8">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">No Active Classes</h3>
                <p className="text-text-secondary mb-6">Start your stepping journey by enrolling in a class.</p>
                <Button className="bg-brand-primary hover:bg-brand-primary-hover">
                  Find Classes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-8">
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                <h3 className="font-semibold text-text-primary mb-2">Your Achievements</h3>
                <p className="text-text-secondary mb-6">Complete classes and attend events to unlock achievements.</p>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-8">
              <NotificationPreferencesComponent />
            </TabsContent>

            {/* Payment Settings Tab - Only for roles that can receive payouts */}
            {canReceivePayouts && (
              <TabsContent value="payment-settings" className="mt-8">
                <PaymentSettingsComponent 
                  userRole={userProfile.role}
                  onSettingsChange={(settings) => {
                    console.log('Payment settings updated:', settings);
                  }}
                />
              </TabsContent>
            )}

            {userProfile.role === 'promoter' && (
              <TabsContent value="promoter-dashboard" className="mt-8">
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                  <h3 className="font-semibold text-text-primary mb-2">Promoter Dashboard</h3>
                  <p className="text-text-secondary mb-6">Access tools to manage your promoted events, view sales, and find new events to claim.</p>
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link to="/promoter/events/claim" className="w-full sm:w-auto">
                      <Button className="bg-brand-primary hover:bg-brand-primary-hover w-full">
                        <Handshake className="mr-2 h-4 w-4" /> Browse & Claim Events
                      </Button>
                    </Link>
                    <Link to="#" className="w-full sm:w-auto"> {/* Placeholder for future Promoter dashboard link */}
                      <Button variant="outline" className="w-full">
                        My Promoted Events (Coming Soon)
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Show earnings info for promoters with payout access */}
                  {canReceivePayouts && (
                    <div className="mt-8 p-6 bg-green-50 rounded-lg max-w-md mx-auto">
                      <h4 className="font-semibold text-green-900 mb-2">💰 Earnings Overview</h4>
                      <div className="text-2xl font-bold text-green-700 mb-1">$347.50</div>
                      <p className="text-sm text-green-600 mb-3">Total earned this month</p>
                      <Button size="sm" variant="outline" className="border-green-500 text-green-700">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Payouts
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {userProfile.role === 'instructor' && (
              <TabsContent value="instructor-dashboard" className="mt-8">
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                  <h3 className="font-semibold text-text-primary mb-2">Instructor Dashboard</h3>
                  <p className="text-text-secondary mb-6">Manage your classes, view student enrollment, and access teaching resources.</p>
                  <Button asChild className="bg-brand-primary hover:bg-brand-primary-hover">
                    <Link to="/instructor/dashboard">
                      Go to Instructor Tools
                    </Link>
                  </Button>
                  
                  {/* Show earnings info for instructors */}
                  <div className="mt-8 p-6 bg-blue-50 rounded-lg max-w-md mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-2">📚 Teaching Stats</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-blue-700">12</div>
                        <p className="text-xs text-blue-600">Active Students</p>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-blue-700">$275.00</div>
                        <p className="text-xs text-blue-600">This Month</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-blue-500 text-blue-700 mt-3">
                      <CreditCard className="mr-2 h-4 w-4" />
                      View Earnings
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Profile;
