import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Users, Award, Search, Filter, CheckCircle } from 'lucide-react';
import InstructorCard from '@/components/InstructorCard';

const Instructors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const instructors = [
    {
      id: 1,
      name: "Marcus Johnson",
      title: "Master Stepper",
      location: "Chicago, IL",
      rating: 4.9,
      reviewCount: 127,
      image: "/placeholder.svg",
      specialties: ["Competition", "Advanced"],
      verified: true,
      experience: "15+ years",
      bio: "Champion stepper with over 15 years of experience. Specializes in competition preparation and advanced techniques.",
      hourlyRate: 85,
      studentsCount: 156
    },
    {
      id: 2,
      name: "Lisa Davis",
      title: "Step Instructor",
      location: "Atlanta, GA",
      rating: 4.8,
      reviewCount: 89,
      image: "/placeholder.svg",
      specialties: ["Beginner", "Workshop"],
      verified: true,
      experience: "8+ years",
      bio: "Passionate about introducing newcomers to the world of stepping. Patient and encouraging teaching style.",
      hourlyRate: 60,
      studentsCount: 89
    },
    {
      id: 3,
      name: "Carlos Martinez",
      title: "Professional Stepper",
      location: "Houston, TX",
      rating: 4.7,
      reviewCount: 156,
      image: "/placeholder.svg",
      specialties: ["Intermediate", "Social"],
      verified: true,
      experience: "12+ years",
      bio: "Expert in social stepping and partner connection. Creates a fun and engaging learning environment.",
      hourlyRate: 70,
      studentsCount: 134
    },
    {
      id: 4,
      name: "Angela Thompson",
      title: "Competition Coach",
      location: "Detroit, MI",
      rating: 4.9,
      reviewCount: 203,
      image: "/placeholder.svg",
      specialties: ["Competition", "Performance"],
      verified: true,
      experience: "18+ years",
      bio: "Former national champion now coaching the next generation of competitive steppers.",
      hourlyRate: 95,
      studentsCount: 78
    },
    {
      id: 5,
      name: "Michael Brown",
      title: "Style Specialist",
      location: "Dallas, TX",
      rating: 4.6,
      reviewCount: 94,
      image: "/placeholder.svg",
      specialties: ["Style", "Intermediate"],
      verified: true,
      experience: "10+ years",
      bio: "Focuses on developing personal style and expression in stepping. Creative and innovative approach.",
      hourlyRate: 65,
      studentsCount: 112
    },
    {
      id: 6,
      name: "Sarah Williams",
      title: "Youth Coach",
      location: "Memphis, TN",
      rating: 4.8,
      reviewCount: 67,
      image: "/placeholder.svg",
      specialties: ["Youth", "Beginner"],
      verified: true,
      experience: "6+ years",
      bio: "Specializes in teaching young dancers ages 8-18. Creates age-appropriate and fun learning experiences.",
      hourlyRate: 55,
      studentsCount: 85
    }
  ];

  const cities = ["Chicago, IL", "Atlanta, GA", "Detroit, MI", "Houston, TX", "Dallas, TX", "Memphis, TN"];
  const specialties = ["Competition", "Workshop", "Social", "Style", "Youth", "Beginner", "Intermediate", "Advanced"];
  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'all' || instructor.location === selectedCity;
    const matchesSpecialty = selectedSpecialty === 'all' || instructor.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesCity && matchesSpecialty;
  });

  const topInstructor = instructors.reduce((prev, current) => 
    (prev.rating > current.rating) ? prev : current
  );

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-text-primary mb-4">
            Master Instructors
          </h1>
          <p className="text-text-secondary text-lg">
            Learn from verified stepping experts and master instructors
          </p>
        </div>

        {/* Featured Instructor */}
        <Card className="mb-8 overflow-hidden bg-gradient-to-r from-brand-primary to-brand-primary-hover text-text-on-primary">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="bg-text-on-primary text-brand-primary mb-4">
                  Top Rated Instructor
                </Badge>
                <h2 className="font-serif text-3xl font-bold mb-4">
                  {topInstructor.name}
                </h2>
                <p className="text-text-on-primary/90 mb-6">
                  {topInstructor.bio}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 mr-1" />
                    <span>{topInstructor.rating} ({topInstructor.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-1" />
                    <span>{topInstructor.studentsCount} students</span>
                  </div>
                </div>
                <Button className="bg-text-on-primary text-brand-primary hover:bg-text-on-primary/90">
                  Book Session - ${topInstructor.hourlyRate}/hr
                </Button>
              </div>
              <div className="hidden md:block">
                <img
                  src={topInstructor.image}
                  alt={topInstructor.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                <Input
                  placeholder="Search instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="bg-brand-primary hover:bg-brand-primary-hover">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructor Categories */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {['Competition', 'Workshop', 'Social', 'Youth'].map((category) => (
            <Card key={category} className="text-center cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-text-on-primary" />
                </div>
                <h3 className="font-semibold text-text-primary">{category}</h3>
                <p className="text-sm text-text-secondary">
                  {instructors.filter(i => i.specialties.some(s => s.includes(category))).length} instructors
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructors Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-text-primary">
            Available Instructors ({filteredInstructors.length})
          </h2>
          <div className="flex gap-2">
            <Badge variant="secondary">Verified</Badge>
            <Badge variant="outline">Available Now</Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredInstructors.map((instructor) => (
            <Card key={instructor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-48 object-cover"
                />
                {instructor.verified && (
                  <Badge className="absolute top-3 left-3 bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <div className="absolute top-3 right-3 bg-black/50 rounded px-2 py-1">
                  <span className="text-white text-sm font-semibold">
                    ${instructor.hourlyRate}/hr
                  </span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-semibold text-text-primary mb-1">
                  {instructor.name}
                </h3>
                <p className="text-brand-primary font-medium mb-2">{instructor.title}</p>
                
                <div className="flex items-center text-text-secondary text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{instructor.location}</span>
                </div>
                
                <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                  {instructor.bio}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {instructor.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{instructor.rating}</span>
                    <span className="text-text-secondary ml-1">({instructor.reviewCount})</span>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{instructor.studentsCount} students</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-brand-primary hover:bg-brand-primary-hover">
                    Book Session
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-surface-contrast">
          <CardContent className="p-8 text-center">
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">
              Become a Verified Instructor
            </h3>
            <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
              Share your expertise with the stepping community. Join our network of verified instructors and help others master the art of stepping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-brand-primary hover:bg-brand-primary-hover">
                Apply to Teach
              </Button>
              <Button variant="outline">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Instructors;
