import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CustomerDemographics,
  CustomerLifetimeValue,
  ChurnAnalysis
} from '@/services/customerAnalyticsService';

interface CustomerAnalyticsFiltersProps {
  demographicFilters: {
    ageGroups: string[];
    locations: string[];
    incomelevels: string[];
    interests: string[];
  };
  behaviorFilters: {
    valueSegments: string[];
    churnRisks: string[];
    engagementLevels: string[];
  };
  onApplyDemographicFilters: (filters: any) => void;
  onApplyBehaviorFilters: (filters: any) => void;
  onClearAllFilters: () => void;
  demographics: CustomerDemographics[];
  clvData: CustomerLifetimeValue[];
  churnAnalysis: ChurnAnalysis[];
}

export function CustomerAnalyticsFilters({
  demographicFilters,
  behaviorFilters,
  onApplyDemographicFilters,
  onApplyBehaviorFilters,
  onClearAllFilters,
  demographics,
  clvData,
  churnAnalysis
}: CustomerAnalyticsFiltersProps) {
  // Extract unique values from data for filter options
  const ageGroups = Array.from(new Set(demographics.map(d => d.ageGroup)));
  const locations = Array.from(new Set(demographics.map(d => d.location.city)));
  const incomeLevels = Array.from(new Set(demographics.map(d => d.incomeLevel)));
  const interests = Array.from(new Set(demographics.flatMap(d => d.interests)));
  const valueSegments = Array.from(new Set(clvData.map(c => c.valueSegment)));
  const churnRisks = Array.from(new Set(churnAnalysis.map(c => c.churnRisk)));
  const engagementLevels = ['High', 'Medium', 'Low'];

  // Count active filters
  const activeFiltersCount = 
    demographicFilters.ageGroups.length +
    demographicFilters.locations.length +
    demographicFilters.incomelevels.length +
    demographicFilters.interests.length +
    behaviorFilters.valueSegments.length +
    behaviorFilters.churnRisks.length +
    behaviorFilters.engagementLevels.length;

  // Handle demographic filter changes
  const handleAgeGroupChange = (ageGroup: string, checked: boolean) => {
    const updated = checked
      ? [...demographicFilters.ageGroups, ageGroup]
      : demographicFilters.ageGroups.filter(ag => ag !== ageGroup);
    onApplyDemographicFilters({ ageGroups: updated });
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const updated = checked
      ? [...demographicFilters.locations, location]
      : demographicFilters.locations.filter(l => l !== location);
    onApplyDemographicFilters({ locations: updated });
  };

  const handleIncomeLevelChange = (incomeLevel: string, checked: boolean) => {
    const updated = checked
      ? [...demographicFilters.incomelevels, incomeLevel]
      : demographicFilters.incomelevels.filter(il => il !== incomeLevel);
    onApplyDemographicFilters({ incomelevels: updated });
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    const updated = checked
      ? [...demographicFilters.interests, interest]
      : demographicFilters.interests.filter(i => i !== interest);
    onApplyDemographicFilters({ interests: updated });
  };

  // Handle behavioral filter changes
  const handleValueSegmentChange = (segment: string, checked: boolean) => {
    const updated = checked
      ? [...behaviorFilters.valueSegments, segment]
      : behaviorFilters.valueSegments.filter(vs => vs !== segment);
    onApplyBehaviorFilters({ valueSegments: updated });
  };

  const handleChurnRiskChange = (risk: string, checked: boolean) => {
    const updated = checked
      ? [...behaviorFilters.churnRisks, risk]
      : behaviorFilters.churnRisks.filter(cr => cr !== risk);
    onApplyBehaviorFilters({ churnRisks: updated });
  };

  const handleEngagementLevelChange = (level: string, checked: boolean) => {
    const updated = checked
      ? [...behaviorFilters.engagementLevels, level]
      : behaviorFilters.engagementLevels.filter(el => el !== level);
    onApplyBehaviorFilters({ engagementLevels: updated });
  };

  // Remove specific filter
  const removeFilter = (category: string, value: string) => {
    switch (category) {
      case 'ageGroups':
        onApplyDemographicFilters({ ageGroups: demographicFilters.ageGroups.filter(ag => ag !== value) });
        break;
      case 'locations':
        onApplyDemographicFilters({ locations: demographicFilters.locations.filter(l => l !== value) });
        break;
      case 'incomelevels':
        onApplyDemographicFilters({ incomelevels: demographicFilters.incomelevels.filter(il => il !== value) });
        break;
      case 'interests':
        onApplyDemographicFilters({ interests: demographicFilters.interests.filter(i => i !== value) });
        break;
      case 'valueSegments':
        onApplyBehaviorFilters({ valueSegments: behaviorFilters.valueSegments.filter(vs => vs !== value) });
        break;
      case 'churnRisks':
        onApplyBehaviorFilters({ churnRisks: behaviorFilters.churnRisks.filter(cr => cr !== value) });
        break;
      case 'engagementLevels':
        onApplyBehaviorFilters({ engagementLevels: behaviorFilters.engagementLevels.filter(el => el !== value) });
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Active Filters ({activeFiltersCount})</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Demographic filters */}
            {demographicFilters.ageGroups.map(ageGroup => (
              <Badge key={ageGroup} variant="secondary" className="bg-blue-100 text-blue-800">
                Age: {ageGroup}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeFilter('ageGroups', ageGroup)}
                />
              </Badge>
            ))}
            
            {demographicFilters.locations.map(location => (
              <Badge key={location} variant="secondary" className="bg-green-100 text-green-800">
                Location: {location}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeFilter('locations', location)}
                />
              </Badge>
            ))}
            
            {demographicFilters.incomelevels.map(income => (
              <Badge key={income} variant="secondary" className="bg-purple-100 text-purple-800">
                Income: {income}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeFilter('incomelevels', income)}
                />
              </Badge>
            ))}
            
            {demographicFilters.interests.map(interest => (
              <Badge key={interest} variant="secondary" className="bg-orange-100 text-orange-800">
                Interest: {interest}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeFilter('interests', interest)}
                />
              </Badge>
            ))}
            
            {/* Behavioral filters */}
            {behaviorFilters.valueSegments.map(segment => (
              <Badge key={segment} variant="secondary" className="bg-emerald-100 text-emerald-800">
                Value: {segment}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeFilter('valueSegments', segment)}
                />
              </Badge>
            ))}
            
            {behaviorFilters.churnRisks.map(risk => (
              <Badge key={risk} variant="secondary" className="bg-red-100 text-red-800">
                Churn: {risk}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeFilter('churnRisks', risk)}
                />
              </Badge>
            ))}
            
            {behaviorFilters.engagementLevels.map(level => (
              <Badge key={level} variant="secondary" className="bg-indigo-100 text-indigo-800">
                Engagement: {level}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeFilter('engagementLevels', level)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filter Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Demographics Filters */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Demographics</h4>
          
          {/* Age Groups */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Age Groups</Label>
            <ScrollArea className="h-24">
              <div className="space-y-2">
                {ageGroups.map(ageGroup => (
                  <div key={ageGroup} className="flex items-center space-x-2">
                    <Checkbox
                      id={`age-${ageGroup}`}
                      checked={demographicFilters.ageGroups.includes(ageGroup)}
                      onCheckedChange={(checked) => handleAgeGroupChange(ageGroup, checked as boolean)}
                    />
                    <Label htmlFor={`age-${ageGroup}`} className="text-sm">
                      {ageGroup}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Locations */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Locations</Label>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {locations.map(location => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={demographicFilters.locations.includes(location)}
                      onCheckedChange={(checked) => handleLocationChange(location, checked as boolean)}
                    />
                    <Label htmlFor={`location-${location}`} className="text-sm">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Income Levels */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Income Levels</Label>
            <div className="space-y-2">
              {incomeLevels.map(income => (
                <div key={income} className="flex items-center space-x-2">
                  <Checkbox
                    id={`income-${income}`}
                    checked={demographicFilters.incomelevels.includes(income)}
                    onCheckedChange={(checked) => handleIncomeLevelChange(income, checked as boolean)}
                  />
                  <Label htmlFor={`income-${income}`} className="text-sm">
                    {income}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Interests</h4>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Customer Interests</Label>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {interests.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={`interest-${interest}`}
                      checked={demographicFilters.interests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                    />
                    <Label htmlFor={`interest-${interest}`} className="text-sm">
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Behavioral Filters */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Behavior & Value</h4>
          
          {/* Value Segments */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Value Segments</Label>
            <div className="space-y-2">
              {valueSegments.map(segment => (
                <div key={segment} className="flex items-center space-x-2">
                  <Checkbox
                    id={`value-${segment}`}
                    checked={behaviorFilters.valueSegments.includes(segment)}
                    onCheckedChange={(checked) => handleValueSegmentChange(segment, checked as boolean)}
                  />
                  <Label htmlFor={`value-${segment}`} className="text-sm">
                    {segment}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Churn Risk */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Churn Risk</Label>
            <div className="space-y-2">
              {churnRisks.map(risk => (
                <div key={risk} className="flex items-center space-x-2">
                  <Checkbox
                    id={`churn-${risk}`}
                    checked={behaviorFilters.churnRisks.includes(risk)}
                    onCheckedChange={(checked) => handleChurnRiskChange(risk, checked as boolean)}
                  />
                  <Label htmlFor={`churn-${risk}`} className="text-sm">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      risk === 'Critical' ? 'bg-red-500' :
                      risk === 'High' ? 'bg-orange-500' :
                      risk === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    {risk} Risk
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Levels */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Engagement Levels</Label>
            <div className="space-y-2">
              {engagementLevels.map(level => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`engagement-${level}`}
                    checked={behaviorFilters.engagementLevels.includes(level)}
                    onCheckedChange={(checked) => handleEngagementLevelChange(level, checked as boolean)}
                  />
                  <Label htmlFor={`engagement-${level}`} className="text-sm">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      level === 'High' ? 'bg-green-500' :
                      level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    {level} Engagement
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 