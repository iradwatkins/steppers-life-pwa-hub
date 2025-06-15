import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Grid, List, Calendar, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEventCollections } from '@/hooks/useEventCollections';
import CollectionsList from '@/components/collections/CollectionsList';
import CreateCollectionDialog from '@/components/collections/CreateCollectionDialog';
import EventSeriesManager from '@/components/collections/EventSeriesManager';
import EventTemplateManager from '@/components/collections/EventTemplateManager';
import CollectionAnalyticsDashboard from '@/components/collections/CollectionAnalyticsDashboard';
import BulkOperationsPanel from '@/components/collections/BulkOperationsPanel';

type ViewMode = 'grid' | 'list' | 'calendar';

const EventCollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  
  // Mock organizer ID - in real app, this would come from auth context
  const organizerId = 'org-1';
  
  const {
    collections,
    collectionsLoading,
    collectionsError,
    eventSeries,
    seriesLoading,
    eventTemplates,
    templatesLoading,
    bulkOperations,
    bulkOperationLoading,
    refreshData,
    clearError,
  } = useEventCollections(organizerId);

  const [activeTab, setActiveTab] = useState('collections');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Filter data based on search query
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSeries = eventSeries.filter(series =>
    series.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    series.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = eventTemplates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle navigation
  const handleGoBack = () => {
    if (eventId) {
      navigate(`/organizer/event/${eventId}/manage`);
    } else {
      navigate('/organizer/dashboard'); // Or wherever the organizer's main dashboard is
    }
  };

  // Clear any errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const getActiveTabCount = () => {
    switch (activeTab) {
      case 'collections':
        return filteredCollections.length;
      case 'series':
        return filteredSeries.length;
      case 'templates':
        return filteredTemplates.length;
      case 'analytics':
        return collections.length; // All collections for analytics
      default:
        return 0;
    }
  };

  const isLoading = collectionsLoading || seriesLoading || templatesLoading;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Event Collections & Organization</h1>
          <p className="text-muted-foreground">
            Manage your event collections, series, templates, and bulk operations
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections, series, templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-l-none"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <Button
            variant="outline"
            onClick={() => setShowBulkOperations(!showBulkOperations)}
            disabled={isLoading}
          >
            Bulk Operations
            {bulkOperations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {bulkOperations.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={() => setShowCreateDialog(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            New {activeTab === 'collections' ? 'Collection' : 
                 activeTab === 'series' ? 'Series' : 
                 activeTab === 'templates' ? 'Template' : 'Item'}
          </Button>
        </div>
      </div>

      {/* Bulk Operations Panel */}
      {showBulkOperations && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bulk Operations</CardTitle>
            <CardDescription>
              Perform operations across multiple events at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BulkOperationsPanel
              organizerId={organizerId}
              operations={bulkOperations}
              isLoading={bulkOperationLoading}
              onClose={() => setShowBulkOperations(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collections" className="flex items-center gap-2">
            Collections
            <Badge variant="secondary" className="text-xs">
              {filteredCollections.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="series" className="flex items-center gap-2">
            Event Series
            <Badge variant="secondary" className="text-xs">
              {filteredSeries.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            Templates
            <Badge variant="secondary" className="text-xs">
              {filteredTemplates.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            Analytics
            <Badge variant="secondary" className="text-xs">
              {collections.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-6">
          <CollectionsList
            collections={filteredCollections}
            loading={collectionsLoading}
            error={collectionsError}
            viewMode={viewMode}
            organizerId={organizerId}
            onSelectCollection={setSelectedCollectionId}
            selectedCollectionId={selectedCollectionId}
          />
        </TabsContent>

        {/* Event Series Tab */}
        <TabsContent value="series" className="space-y-6">
          <EventSeriesManager
            series={filteredSeries}
            templates={eventTemplates}
            loading={seriesLoading}
            organizerId={organizerId}
            viewMode={viewMode}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <EventTemplateManager
            templates={filteredTemplates}
            loading={templatesLoading}
            organizerId={organizerId}
            viewMode={viewMode}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <CollectionAnalyticsDashboard
            collections={collections}
            loading={collectionsLoading}
            organizerId={organizerId}
          />
        </TabsContent>
      </Tabs>

      {/* Create Collection Dialog */}
      <CreateCollectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        organizerId={organizerId}
        currentTab={activeTab}
      />
    </div>
  );
};

export default EventCollectionsPage; 