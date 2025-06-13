
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Clock, Users, DollarSign, Star, ArrowLeft, BookOpen } from 'lucide-react';

const ClassDetail = () => {
  const { id } = useParams();

  // Mock class data - in real app, fetch based on id
  const classData = {
    id: 1,
    title: "Beginner's Chicago Stepping",
    instructor: "Marcus Johnson",
    description: "Learn the fundamentals of Chicago stepping in a welcoming environment. Perfect for complete beginners who want to discover the joy of this beautiful dance form.",
    longDescription: "This comprehensive 8-week course is designed specifically for those who are new to Chicago stepping. You'll learn the basic step, timing, posture, and foundational moves that form the backbone of this elegant dance style. Our patient and experienced instructor creates a supportive environment where you can learn at your own pace while building confidence on the dance floor.",
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
    startDate: "January 8, 2025",
    featured: true,
    image: "/placeholder.svg",
    whatYoullLearn: [
      "Basic stepping rhythm and timing",
      "Proper posture and frame",
      "Fundamental footwork patterns",
      "Basic turns and spins",
      "Dance floor etiquette",
      "Connection with your partner"
    ],
    requirements: [
      "No prior dance experience necessary",
      "Comfortable shoes with smooth soles",
      "Positive attitude and willingness to learn",
      "Regular attendance for best results"
    ],
    instructorBio: "Marcus Johnson has been teaching Chicago stepping for over 15 years. He's a competitive dancer with numerous championship titles and is known for his patient teaching style and ability to break down complex moves into easy-to-understand steps."
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="aspect-video bg-muted rounded-lg mb-8 relative">
          {classData.featured && (
            <Badge className="absolute top-4 left-4 bg-stepping-gradient">Featured Class</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <div>
              <Badge className={`mb-2 text-white ${getLevelColor(classData.level)}`}>
                {classData.level.charAt(0).toUpperCase() + classData.level.slice(1)}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{classData.title}</h1>
              <p className="text-lg text-stepping-purple font-medium mb-4">with {classData.instructor}</p>
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{classData.rating}</span>
                <span className="text-muted-foreground">({classData.students} students)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-stepping-purple" />
                  <span>{classData.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-stepping-purple" />
                  <span>{classData.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-stepping-purple" />
                  <span>{classData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-stepping-purple" />
                  <span>{classData.students}/{classData.maxStudents} enrolled</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Class</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{classData.description}</p>
              <p className="text-muted-foreground leading-relaxed">{classData.longDescription}</p>
            </div>

            <Separator />

            {/* What You'll Learn */}
            <div>
              <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {classData.whatYoullLearn.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-stepping-purple" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Requirements */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {classData.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-stepping-purple mt-2"></div>
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Instructor */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Meet Your Instructor</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-stepping-gradient rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{classData.instructor}</h3>
                      <p className="text-muted-foreground">{classData.instructorBio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Enroll Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-stepping-purple mb-2">{classData.price}</div>
                  <p className="text-sm text-muted-foreground">for the complete {classData.duration} course</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Starts:</span>
                    <span className="font-medium">{classData.startDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Spots Available:</span>
                    <span className="font-medium">{classData.maxStudents - classData.students}</span>
                  </div>
                </div>
                <Button className="w-full bg-stepping-gradient">
                  Enroll in Class
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  30-day money-back guarantee
                </p>
              </CardContent>
            </Card>

            {/* Class Details */}
            <Card>
              <CardHeader>
                <CardTitle>Class Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <Badge className={`text-white ${getLevelColor(classData.level)}`}>
                    {classData.level.charAt(0).toUpperCase() + classData.level.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{classData.type.charAt(0).toUpperCase() + classData.type.slice(1)} Class</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{classData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Schedule:</span>
                  <span className="font-medium">{classData.schedule}</span>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{classData.location}</p>
                  <p className="text-sm text-muted-foreground">{classData.address}</p>
                  <div className="aspect-video bg-muted rounded-lg"></div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetail;
