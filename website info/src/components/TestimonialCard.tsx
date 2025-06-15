
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: {
    id: number;
    name: string;
    location: string;
    rating: number;
    text: string;
    image: string;
    date: string;
  };
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <Card className="bg-surface-card border-border-default hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <img 
            src={testimonial.image} 
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary">{testimonial.name}</h4>
            <p className="text-sm text-text-secondary">{testimonial.location}</p>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${
                  i < testimonial.rating 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
        </div>
        
        <div className="relative">
          <Quote className="h-6 w-6 text-brand-primary/30 absolute -top-1 -left-1" />
          <p className="text-text-secondary italic pl-4">
            "{testimonial.text}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
