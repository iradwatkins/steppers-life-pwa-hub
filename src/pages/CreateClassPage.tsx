import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Users, 
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';

const CreateClassPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    duration: '',
    price: '',
    maxStudents: '',
    location: '',
    date: '',
    time: '',
    requirements: [] as string[],
    whatToExpect: '',
    instructorBio: ''
  });

  const [newRequirement, setNewRequirement] = useState('');

  const classCategories = [
    'Beginner Stepping',
    'Advanced Stepping',
    'Competition Prep',
    'Choreography',
    'Freestyle',
    'Youth Stepping',
    'Adult Stepping',
    'Specialty Moves'
  ];

  const skillLevels = [
    'Beginner',
    'Intermediate', 
    'Advanced',
    'All Levels'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirement)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create a class');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create class in database
      const { data: classData, error } = await supabase
        .from('classes')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          level: formData.level,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          max_students: parseInt(formData.maxStudents),
          location: formData.location,
          class_date: formData.date,
          class_time: formData.time,
          requirements: formData.requirements,
          what_to_expect: formData.whatToExpect,
          instructor_id: user.id,
          instructor_bio: formData.instructorBio,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Class created successfully!');
      navigate('/classes');
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-green-500 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create New Class</h1>
              <p className="text-muted-foreground">
                Share your stepping knowledge with the community
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Tell students about your class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Class Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Beginner Stepping Fundamentals"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {classCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what students will learn in this class..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Class Details */}
          <Card>
            <CardHeader>
              <CardTitle>Class Details</CardTitle>
              <CardDescription>
                Specify the level, duration, and logistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Skill Level *</Label>
                  <Select 
                    value={formData.level} 
                    onValueChange={(value) => handleInputChange('level', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="90"
                    min="30"
                    max="300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Max Students *</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                    placeholder="20"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="25.00"
                    min="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Studio name or address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Expectations */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements & What to Expect</CardTitle>
              <CardDescription>
                Help students prepare for your class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Requirements (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="e.g., Comfortable athletic wear"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {req}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => removeRequirement(req)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatToExpect">What Students Can Expect</Label>
                <Textarea
                  id="whatToExpect"
                  value={formData.whatToExpect}
                  onChange={(e) => handleInputChange('whatToExpect', e.target.value)}
                  placeholder="Describe the class structure, what students will learn, and the overall experience..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructorBio">Instructor Bio</Label>
                <Textarea
                  id="instructorBio"
                  value={formData.instructorBio}
                  onChange={(e) => handleInputChange('instructorBio', e.target.value)}
                  placeholder="Tell students about your background and experience..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-green-500 hover:bg-green-600"
            >
              {isSubmitting ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClassPage; 