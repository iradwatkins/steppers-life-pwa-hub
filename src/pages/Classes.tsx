
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, Search, Filter, Users, Star, BookOpen } from 'lucide-react';
import FollowButton from '@/components/following/FollowButton';

const Classes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const classes = [
    {
      id: 1,
      title: "Beginner's Chicago Stepping",
      instructor: "Marcus Johnson",
      description: "Learn the fundamentals of Chicago stepping in a welcoming environment. Perfect for complete beginners.",
      level: "beginner",
      type: "group",
      duration: "8 weeks",
      schedule: "Mondays 7:00 PM - 8:30 PM",
      location: "South Side Cultural Center",
      address: "4506 S Martin Luther King Jr Dr, Chicago, IL",
      price: "$120",
      rating: 4.9,
      students: 24,
      maxStudents: 30,
      featured: true,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Intermediate Stepping Techniques",
      instructor: "Diana Williams",
      description: "Build on your basics with more complex patterns, turns, and styling techniques.",
      level: "intermediate",
      type: "group",
      duration: "6 weeks",
      schedule: "Wednesdays 6:30 PM - 8:00 PM",
      location: "Chicago Dance Academy",
      address: "1016 N Dearborn St, Chicago, IL",
      price: "$150",
      rating: 4.8,
      students: 18,
      maxStudents: 25,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Private Stepping Lessons",
      instructor: "James Mitchell",
      description: "One-on-one instruction tailored to your specific needs and learning pace.",
      level: "all",
      type: "private",
      duration: "Flexible",
      schedule: "By Appointment",
      location: "Millennium Ballroom",
      address: "2047 W Division St, Chicago, IL",
      price: "$80/hour",
      rating: 5.0,
      students: 12,
      maxStudents: 1,
      featured: true,
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Advanced Competition Prep",
      instructor: "Sarah Davis",
      description: "Intensive training for dancers preparing for stepping competitions.",
      level: "advanced",
      type: "group",
      duration: "12 weeks",
      schedule: "Saturdays 2:00 PM - 4:00 PM",
      location: "Elite Dance Studio",
      address: "789 N Michigan Ave, Chicago, IL",
      price: "$250",
      rating: 4.9,
      students: 15,
      maxStudents: 20,
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Couples Stepping Workshop",
      instructor: "Robert & Lisa Brown",
      description: "Learn to step together as a couple with focus on connection and communication.",
      level: "beginner",
      type: "couples",
      duration: "4 weeks",
      schedule: "Sundays 3:00 PM - 5:00 PM",
      location: "Community Center",
      address: "123 W Randolph St, Chicago, IL",
      price: "$180/couple",
      rating: 4.7,
      students: 16,
      maxStudents: 20,
      image: "/placeholder.svg"
    },
    {
      id: 6,
      title: "Youth Stepping Program",
      instructor: "Angela Thompson",
      description: "Fun and engaging stepping classes designed specifically for young dancers aged 10-17.",
      level: "beginner",
      type: "group",
      duration: "10 weeks",
      schedule: "Saturdays 11:00 AM - 12:30 PM",
      location: "Youth Center",
      address: "456 S State St, Chicago, IL",
      price: "$90",
      rating: 4.8,
      students: 22,
      maxStudents: 25,
      image: "/placeholder.svg"
    }
  ];

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'group', label: 'Group Classes' },
    { value: 'private', label: 'Private Lessons' },
    { value: 'couples', label: 'Couples Classes' }
  ];

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         classItem.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || classItem.level === selectedLevel || classItem.level === 'all';
    const matchesType = selectedType === 'all' || classItem.type === selectedType;
    return matchesSearch && matchesLevel && matchesType;
  });

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      case 'all': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Stepping Classes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn from Chicago's best stepping instructors. Whether you're a beginner or looking to perfect your technique, we have the right class for you.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search classes, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-48">
                <BookOpen className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(levels ?? []).map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(types ?? []).map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(filteredClasses ?? []).map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-md mb-4 relative">
                  {classItem.featured && (
                    <Badge className="absolute top-2 left-2 bg-stepping-gradient">Featured</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`text-white ${getLevelBadgeColor(classItem.level)}`}>
                    {levels.find(level => level.value === classItem.level)?.label}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{classItem.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-1">{classItem.title}</CardTitle>
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm text-stepping-purple font-medium">
                    with {classItem.instructor}
                  </CardDescription>
                  <FollowButton
                    entityId={`instructor_${classItem.id}`}
                    entityType="instructor"
                    entityName={classItem.instructor}
                    variant="icon"
                    size="sm"
                  />
                </div>
                <CardDescription className="line-clamp-2">{classItem.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {classItem.duration}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {classItem.schedule}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {classItem.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {classItem.students}/{classItem.maxStudents} students
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-stepping-purple">{classItem.price}</span>
                  <Button size="sm" asChild className="bg-stepping-gradient">
                    <Link to={`/classes/${classItem.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Results count */}
        <div className="text-center mt-8 text-muted-foreground">
          Showing {filteredClasses.length} of {classes.length} classes
        </div>
      </div>
    </div>
  );
};

export default Classes;
