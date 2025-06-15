import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  ArrowLeft, 
  Camera, 
  X, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

const ReviewEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Review form state
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    organization: 0,
    instruction: 0,
    venue: 0,
    value: 0
  });
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [attendeeType, setAttendeeType] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock event data - in real app, would fetch from API
  const event = {
    id: parseInt(eventId || '1'),
    title: "Chicago Step Championship",
    date: "2024-07-15",
    time: "7:00 PM",
    location: "Chicago Cultural Center",
    city: "Chicago",
    state: "IL",
    image: "/placeholder.svg",
    organizer: "Chicago Step Alliance",
    category: "Competition",
    attendedDate: "2024-07-15" // Date user attended
  };

  const ratingCategories = [
    { key: 'organization', label: 'Event Organization', description: 'Registration, communication, timing' },
    { key: 'instruction', label: 'Instruction Quality', description: 'Teaching, demonstration, feedback' },
    { key: 'venue', label: 'Venue & Facilities', description: 'Location, space, amenities' },
    { key: 'value', label: 'Value for Money', description: 'Price vs. experience received' }
  ];

  const attendeeTypes = [
    'First-time attendee',
    'Regular participant', 
    'Competitor',
    'Instructor/Professional',
    'Student',
    'Social dancer'
  ];

  const skillLevels = [
    'Beginner',
    'Intermediate', 
    'Advanced',
    'Professional'
  ];

  const handleOverallRatingClick = (rating: number) => {
    setOverallRating(rating);
  };

  const handleCategoryRatingClick = (category: string, rating: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were rejected",
        description: "Only image files under 5MB are allowed.",
        variant: "destructive"
      });
    }
    
    setPhotos(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide an overall rating for the event.",
        variant: "destructive"
      });
      return;
    }
    
    if (!reviewText.trim()) {
      toast({
        title: "Review text required", 
        description: "Please write a review describing your experience.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Review submitted successfully!",
        description: "Thank you for your feedback. Your review will be visible once approved.",
      });
      
      // Navigate back to ticket history or event details
      navigate('/tickets/history');
      
    } catch (error) {
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    rating, 
    onRatingClick, 
    onHover, 
    size = "w-6 h-6",
    readonly = false 
  }: {
    rating: number;
    onRatingClick?: (rating: number) => void;
    onHover?: (rating: number) => void;
    size?: string;
    readonly?: boolean;
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${size} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          onClick={() => onRatingClick?.(star)}
          onMouseEnter={() => onHover?.(star)}
          onMouseLeave={() => onHover?.(0)}
        >
          <Star 
            className={`w-full h-full ${
              star <= rating 
                ? 'text-yellow-500 fill-current' 
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ticket History
          </Button>
          
          <h1 className="font-serif text-3xl font-bold text-text-primary mb-2">
            Review Your Experience
          </h1>
          <p className="text-text-secondary">
            Share your feedback to help other steppers and improve future events
          </p>
        </div>

        {/* Event Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-text-primary mb-2">{event.title}</h3>
                <div className="space-y-1 text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}, {event.city}, {event.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Attended on {new Date(event.attendedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge className="mt-2 bg-brand-primary text-text-on-primary">
                  {event.category}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Overall Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <StarRating 
                  rating={hoverRating || overallRating}
                  onRatingClick={handleOverallRatingClick}
                  onHover={setHoverRating}
                  size="w-12 h-12"
                />
                <p className="text-text-secondary">
                  {overallRating === 0 ? 'Click to rate your overall experience' :
                   overallRating === 1 ? 'Poor - Significantly below expectations' :
                   overallRating === 2 ? 'Fair - Below expectations' :
                   overallRating === 3 ? 'Good - Met expectations' :
                   overallRating === 4 ? 'Very Good - Exceeded expectations' :
                   'Excellent - Far exceeded expectations'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Ratings */}
          <Card>
            <CardHeader>
              <CardTitle>Rate Specific Aspects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ratingCategories.map((category) => (
                <div key={category.key}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Label className="text-base font-medium">{category.label}</Label>
                      <p className="text-sm text-text-secondary">{category.description}</p>
                    </div>
                    <StarRating 
                      rating={categoryRatings[category.key as keyof typeof categoryRatings]}
                      onRatingClick={(rating) => handleCategoryRatingClick(category.key, rating)}
                    />
                  </div>
                  {category.key !== ratingCategories[ratingCategories.length - 1].key && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Review Text */}
          <Card>
            <CardHeader>
              <CardTitle>Write Your Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reviewTitle">Review Title (Optional)</Label>
                <Input
                  id="reviewTitle"
                  placeholder="Summarize your experience in a few words"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-text-secondary mt-1">
                  {reviewTitle.length}/100 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="reviewText">Your Review *</Label>
                <Textarea
                  id="reviewText"
                  placeholder="Share details about your experience. What did you enjoy? What could be improved? Would you recommend this event to others?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-text-secondary mt-1">
                  {reviewText.length}/2000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recommendation */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Would you recommend this event to other steppers?
                </Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={wouldRecommend === true ? "default" : "outline"}
                    onClick={() => setWouldRecommend(true)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Yes, I'd recommend it
                  </Button>
                  <Button
                    type="button"
                    variant={wouldRecommend === false ? "default" : "outline"}
                    onClick={() => setWouldRecommend(false)}
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    No, I wouldn't recommend it
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {/* Attendee Type */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Which best describes you as an attendee?
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {attendeeTypes.map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={attendeeType === type ? "default" : "outline"}
                      onClick={() => setAttendeeType(type)}
                      size="sm"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Skill Level */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  What's your stepping skill level?
                </Label>
                <div className="flex gap-2">
                  {skillLevels.map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={skillLevel === level ? "default" : "outline"}
                      onClick={() => setSkillLevel(level)}
                      size="sm"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Add Photos (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border-default rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label 
                    htmlFor="photo-upload" 
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-text-secondary" />
                    <p className="text-text-secondary">
                      Click to upload photos from the event
                    </p>
                    <p className="text-xs text-text-secondary">
                      Max 5 photos, 5MB each. JPG, PNG supported.
                    </p>
                  </label>
                </div>
                
                {/* Photo Preview */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-feedback-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-brand-primary hover:bg-brand-primary-hover"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewEventPage; 