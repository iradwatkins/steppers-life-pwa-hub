import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Monitor, 
  Users, 
  Star,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AdZone, AdPlacement } from '@/types/advertising';

interface AdZoneCardProps {
  zone: AdZone;
  onSelect: () => void;
}

export const AdZoneCard: React.FC<AdZoneCardProps> = ({ zone, onSelect }) => {
  const { name, description, dimensions, placement, pricing, supportedFormats, maxFileSize, isRandomPlacement } = zone;

  // Calculate sample pricing for different durations
  const calculatePrice = (days: number): number => {
    let basePrice = pricing.basePricePerDay * days;
    
    if (days >= 30 && pricing.monthlyDiscount) {
      basePrice = basePrice * (1 - pricing.monthlyDiscount / 100);
    } else if (days >= 7 && pricing.weeklyDiscount) {
      basePrice = basePrice * (1 - pricing.weeklyDiscount / 100);
    }
    
    return Math.round(basePrice);
  };

  const getPlacementLabel = (placement: AdPlacement): string => {
    const labels: Record<AdPlacement, string> = {
      [AdPlacement.HEADER_BANNER]: 'Header Banner',
      [AdPlacement.SIDEBAR_RIGHT]: 'Right Sidebar',
      [AdPlacement.SIDEBAR_LEFT]: 'Left Sidebar',
      [AdPlacement.IN_FEED]: 'In Content Feed',
      [AdPlacement.FOOTER_BANNER]: 'Footer Banner',
      [AdPlacement.MODAL_OVERLAY]: 'Modal Overlay',
      [AdPlacement.BETWEEN_CONTENT]: 'Between Content',
      [AdPlacement.EVENT_DETAIL_TOP]: 'Event Page Top',
      [AdPlacement.EVENT_DETAIL_BOTTOM]: 'Event Page Bottom',
      [AdPlacement.BLOG_POST_TOP]: 'Blog Post Top',
      [AdPlacement.BLOG_POST_BOTTOM]: 'Blog Post Bottom',
      [AdPlacement.SEARCH_RESULTS]: 'Search Results'
    };
    return labels[placement];
  };

  const getPlacementIcon = (placement: AdPlacement) => {
    const isHighVisibility = [
      AdPlacement.HEADER_BANNER,
      AdPlacement.EVENT_DETAIL_TOP,
      AdPlacement.MODAL_OVERLAY
    ].includes(placement);

    return isHighVisibility ? <Star className="h-4 w-4" /> : <Monitor className="h-4 w-4" />;
  };

  return (
    <Card className="relative transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getPlacementIcon(placement)}
            <CardTitle className="text-lg">{name}</CardTitle>
            {pricing.isPremium && (
              <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500">
                <Zap className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          {isRandomPlacement && (
            <Badge variant="secondary" className="text-xs">
              Random Placement
            </Badge>
          )}
        </div>
        
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Badge variant="outline" className="text-xs">
            {getPlacementLabel(placement)}
          </Badge>
          <span>•</span>
          <span>{dimensions.width} × {dimensions.height}px</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-lg">${pricing.basePricePerDay}/day</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-semibold">${calculatePrice(7)}</div>
              <div className="text-gray-600">7 days</div>
              {pricing.weeklyDiscount && (
                <div className="text-green-600 text-xs">-{pricing.weeklyDiscount}%</div>
              )}
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-semibold">${calculatePrice(14)}</div>
              <div className="text-gray-600">14 days</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-semibold">${calculatePrice(30)}</div>
              <div className="text-gray-600">30 days</div>
              {pricing.monthlyDiscount && (
                <div className="text-green-600 text-xs">-{pricing.monthlyDiscount}%</div>
              )}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <h4 className="font-medium text-sm text-gray-700">Specifications</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Formats:</span> {supportedFormats.join(', ').toUpperCase()}
            </div>
            <div>
              <span className="font-medium">Max size:</span> {maxFileSize}MB
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onSelect}
          className="w-full group-hover:bg-primary/90 transition-colors"
          size="sm"
        >
          Select This Zone
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>

      {/* Premium Indicator */}
      {pricing.isPremium && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
        </div>
      )}
    </Card>
  );
}; 