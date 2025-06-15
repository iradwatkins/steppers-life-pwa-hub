import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Settings, Upload, Download } from 'lucide-react';
import SeatingLayoutManager from '@/components/SeatingLayoutManager';

interface SeatingLayout {
  id: string;
  name: string;
  description: string;
  venueType: 'theater' | 'stadium' | 'arena' | 'table-service' | 'general-admission';
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  seats: any[];
  priceCategories: any[];
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  tags: string[];
}

const AdvancedSeatingEditorPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [hasExistingLayout, setHasExistingLayout] = useState(false);
  const [existingLayout, setExistingLayout] = useState<SeatingLayout | null>(null);

  useEffect(() => {
    // Check if there's an existing layout from the simple editor
    // In a real app, this would fetch from the backend
    const checkExistingLayout = async () => {
      // Mock check - in reality, you'd fetch this from your API
      const mockExistingLayout = localStorage.getItem(`seating_layout_${eventId}`);
      if (mockExistingLayout) {
        try {
          const layout = JSON.parse(mockExistingLayout);
          setExistingLayout(layout);
          setHasExistingLayout(true);
        } catch (error) {
          console.error('Error parsing existing layout:', error);
        }
      }
    };

    checkExistingLayout();
  }, [eventId]);

  const handleLayoutSaved = (layout: SeatingLayout) => {
    // Save to backend and update local state
    localStorage.setItem(`seating_layout_${eventId}`, JSON.stringify(layout));
    setExistingLayout(layout);
    setHasExistingLayout(true);
    
    console.log('Advanced layout saved:', layout);
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to={`/organizer/event/${eventId}/seating`}
              className="flex items-center gap-2 text-brand-primary hover:text-brand-primary-hover"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Simple Editor
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl font-bold text-text-primary mb-2 flex items-center gap-3">
                <Zap className="text-brand-primary" />
                Advanced Seating Editor
              </h1>
              <p className="text-text-secondary text-lg">
                Professional seating layout tools with advanced features - Event ID: {eventId}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-brand-primary border-brand-primary">
                Professional Tools
              </Badge>
              <Badge variant="outline">
                Addon Feature
              </Badge>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <Card className="mb-8 bg-gradient-to-r from-brand-primary/5 to-brand-primary-hover/5 border-brand-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-brand-primary">Advanced Features Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium">Zoom & Pan Controls</p>
                  <p className="text-sm text-text-secondary">50%-300% zoom levels</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium">Bulk Operations</p>
                  <p className="text-sm text-text-secondary">Add rows, multi-select</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium">Import/Export</p>
                  <p className="text-sm text-text-secondary">Save layouts as templates</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="font-medium">Revenue Analytics</p>
                  <p className="text-sm text-text-secondary">Capacity optimization</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Migration Notice */}
        {hasExistingLayout && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Existing Layout Detected</p>
                  <p className="text-sm text-blue-700">
                    We found a seating layout from your simple editor. It will be imported automatically.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Seating Layout Manager */}
        <SeatingLayoutManager
          eventId={eventId}
          onLayoutSaved={handleLayoutSaved}
          initialLayout={existingLayout || undefined}
          mode="edit"
        />

        {/* Footer */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-text-primary mb-2">Need Help?</h3>
            <p className="text-text-secondary mb-4">
              The advanced editor includes professional features for complex venues. 
              For simple layouts, you can always return to the basic editor.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={`/organizer/event/${eventId}/seating`}>
                <Button variant="outline">
                  Return to Simple Editor
                </Button>
              </Link>
              <Button variant="outline">
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedSeatingEditorPage; 