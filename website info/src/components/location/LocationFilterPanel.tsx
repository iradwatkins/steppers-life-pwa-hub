import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Target, SlidersHorizontal, X } from 'lucide-react';

interface LocationFilterPanelProps {
  userLocation: { lat: number; lng: number } | null;
  locationEnabled: boolean;
  radius: number;
  onRadiusChange: (radius: number) => void;
  onLocationToggle: () => void;
  onClearLocation: () => void;
  sortByDistance: boolean;
  onSortByDistanceChange: (enabled: boolean) => void;
  className?: string;
  showAdvancedControls?: boolean;
}

const LocationFilterPanel: React.FC<LocationFilterPanelProps> = ({
  userLocation,
  locationEnabled,
  radius,
  onRadiusChange,
  onLocationToggle,
  onClearLocation,
  sortByDistance,
  onSortByDistanceChange,
  className = "",
  showAdvancedControls = true
}) => {
  const radiusOptions = [
    { value: 1, label: '1 mile' },
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 25, label: '25 miles' },
    { value: 50, label: '50 miles' },
    { value: 100, label: '100 miles' },
    { value: 200, label: '200 miles' }
  ];

  const getRadiusLabel = (radiusValue: number) => {
    const option = radiusOptions.find(opt => opt.value === radiusValue);
    return option ? option.label : `${radiusValue} miles`;
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Location Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-text-secondary" />
              <span className="font-medium text-text-primary">Location Filters</span>
            </div>
            
            {locationEnabled && userLocation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                GPS Active
              </Badge>
            )}
          </div>

          {/* GPS Toggle Button */}
          <div className="flex gap-2">
            <Button
              variant={locationEnabled ? "default" : "outline"}
              onClick={onLocationToggle}
              className="flex-1 flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {locationEnabled ? 'GPS Enabled' : 'Enable GPS'}
            </Button>
            
            {locationEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearLocation}
                className="px-3"
                title="Clear location"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Location Status Info */}
          {locationEnabled && userLocation && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Location detected - showing results within {getRadiusLabel(radius)}
                </span>
              </div>
            </div>
          )}

          {/* Distance Radius Control */}
          {locationEnabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-text-primary">
                  Search Radius
                </label>
                <span className="text-sm text-text-secondary">
                  {getRadiusLabel(radius)}
                </span>
              </div>

              {/* Quick Radius Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {radiusOptions.slice(0, 4).map((option) => (
                  <Button
                    key={option.value}
                    variant={radius === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onRadiusChange(option.value)}
                    className="text-xs"
                  >
                    {option.value}mi
                  </Button>
                ))}
              </div>

              {/* Radius Slider */}
              {showAdvancedControls && (
                <div className="space-y-2">
                  <Slider
                    value={[radius]}
                    onValueChange={(value) => onRadiusChange(value[0])}
                    max={200}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>1 mi</span>
                    <span>200 mi</span>
                  </div>
                </div>
              )}

              {/* Radius Dropdown for larger values */}
              <Select value={radius.toString()} onValueChange={(value) => onRadiusChange(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  {radiusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sort by Distance Toggle */}
          {locationEnabled && showAdvancedControls && (
            <div className="flex items-center justify-between p-3 bg-surface-accent rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-text-secondary" />
                <div>
                  <div className="text-sm font-medium text-text-primary">
                    Sort by Distance
                  </div>
                  <div className="text-xs text-text-secondary">
                    Show closest results first
                  </div>
                </div>
              </div>
              
              <Button
                variant={sortByDistance ? "default" : "outline"}
                size="sm"
                onClick={() => onSortByDistanceChange(!sortByDistance)}
                className="ml-2"
              >
                {sortByDistance ? 'On' : 'Off'}
              </Button>
            </div>
          )}

          {/* No Location Message */}
          {!locationEnabled && (
            <div className="p-3 bg-surface-accent rounded-lg text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-text-secondary opacity-50" />
              <p className="text-sm text-text-secondary">
                Enable GPS to find results near you
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Or search for a specific location above
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationFilterPanel; 