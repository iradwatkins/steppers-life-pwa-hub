
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Star, Award } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Users, label: "Community Members", value: "5,000+" },
    { icon: Star, label: "Events Listed", value: "500+" },
    { icon: Heart, label: "Classes Offered", value: "150+" },
    { icon: Award, label: "Partner Businesses", value: "200+" }
  ];

  const team = [
    {
      name: "Marcus Johnson",
      role: "Founder & CEO",
      bio: "A lifelong stepper with over 20 years of experience in the Chicago stepping community.",
      image: "/placeholder.svg"
    },
    {
      name: "Diana Williams",
      role: "Community Director",
      bio: "Passionate about connecting steppers and supporting the growth of our dance culture.",
      image: "/placeholder.svg"
    },
    {
      name: "James Mitchell",
      role: "Events Coordinator",
      bio: "Dedicated to showcasing the best stepping events and competitions across Chicago.",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About SteppersLife</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're dedicated to celebrating, preserving, and growing the Chicago stepping community. 
            Our platform connects dancers, instructors, event organizers, and businesses to create 
            a thriving ecosystem for this beautiful art form.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-stepping-gradient text-white rounded-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-center max-w-4xl mx-auto">
              To be the premier platform for the Chicago stepping community, providing a 
              comprehensive hub for discovering events, learning opportunities, and connecting 
              with fellow steppers. We believe in preserving the rich tradition of stepping 
              while embracing innovation and growth.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-stepping-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-stepping-purple mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  SteppersLife was born from a deep love for Chicago stepping and a desire to 
                  see our community thrive. Founded by lifelong steppers, we recognized the need 
                  for a centralized platform where dancers could discover events, find classes, 
                  and connect with local businesses.
                </p>
                <p>
                  What started as a simple event listing site has grown into a comprehensive 
                  platform that serves thousands of steppers across the Chicago area. We're 
                  proud to support instructors, event organizers, and businesses while helping 
                  newcomers discover the joy of stepping.
                </p>
                <p>
                  Our commitment goes beyond just technology – we're active members of the 
                  stepping community, participating in events, supporting competitions, and 
                  working to ensure that this beautiful art form continues to flourish for 
                  generations to come.
                </p>
              </div>
            </div>
            <div className="aspect-square bg-muted rounded-lg"></div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4"></div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription className="text-stepping-purple font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We believe in the power of community and work to bring steppers together.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authenticity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We honor the roots and traditions of Chicago stepping while embracing evolution.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inclusivity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our platform welcomes steppers of all backgrounds, skill levels, and experiences.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We strive for excellence in everything we do, from our platform to our service.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="text-center bg-muted/30 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Have questions, suggestions, or want to partner with us? We'd love to hear from you. 
              Reach out and let's continue building this amazing community together.
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> hello@stepperslife.com</p>
              <p><strong>Phone:</strong> (312) 555-STEP</p>
              <p><strong>Address:</strong> 123 S Michigan Ave, Chicago, IL 60603</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
