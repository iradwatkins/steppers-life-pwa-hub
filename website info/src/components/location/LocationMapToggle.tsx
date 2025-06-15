import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid, List, Map, MapPin, Target } from 'lucide-react';

interface LocationMapToggleProps {
  viewMode: 'grid' | 'list' | 'map';
  onViewModeChange: (mode: 'grid' | 'list' | 'map') => void;
  resultsCount: number;
  locationEnabled: boolean;
  userLocation?: { lat: number; lng: number } | null;
  radius?: number;
  className?: string;
  showResultsCount?: boolean;
  showLocationInfo?: boolean;
}

const LocationMapToggle: React.FC<LocationMapToggleProps> = ({
  viewMode,
  onViewModeChange,
  resultsCount,
  locationEnabled,
  userLocation,
  radius,
  className = "",
  showResultsCount = true,
  showLocationInfo = true
}) => {
  const viewOptions = [
    { mode: 'grid' as const, icon: Grid, label: 'Grid' },
    { mode: 'list' as const, icon: List, label: 'List' },
    { mode: 'map' as const, icon: Map, label: 'Map' }
  ];

  const getResultsText = () => {
    if (resultsCount === 0) return 'No results';
    if (resultsCount === 1) return '1 result';
    return `${resultsCount} results`;
  };

  const getLocationText = () => {
    if (!locationEnabled || !userLocation) return '';
    if (radius) {
      return `within ${radius} mile${radius !== 1 ? 's' : ''}`;
    }
    return 'near you';
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Results Info */}
      <div className="flex items-center gap-3">
        {showResultsCount && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-text-primary">
              {getResultsText()}
            </span>
            
            {locationEnabled && userLocation && showLocationInfo && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {getLocationText()}
              </Badge>
            )}
          </div>
        )}
        
        {!locationEnabled && showLocationInfo && (
          <div className="flex items-center gap-2 text-text-secondary">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">All locations</span>
          </div>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-1 bg-surface-accent rounded-lg p-1">
        {viewOptions.map(({ mode, icon: Icon, label }) => (
          <Button
            key={mode}
            variant={viewMode === mode ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange(mode)}
            className={`px-3 py-2 h-8 ${
              viewMode === mode 
                ? 'bg-background-main shadow-sm' 
                : 'hover:bg-surface-card'
            }`}
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="sr-only">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LocationMapToggle; 