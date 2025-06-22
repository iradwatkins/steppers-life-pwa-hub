/**
 * Event Collections Management Page
 * Allows organizers to create and manage collections of events
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEventCollections } from '@/hooks/useEventCollections';
import CollectionsList from '@/components/organizer/CollectionsList';
import {
  Plus,
  Search,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Package,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

interface CreateCollectionForm {
  name: string;
  description: string;
  collection_type: 'series' | 'bundle' | 'festival' | 'tour' | 'custom';
  is_public: boolean;
  discount_percentage: number;
  max_attendees: number;
  event_ids: string[];
}

const EventCollectionsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    collections,
    stats,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    refreshCollections
  } = useEventCollections(user?.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateCollectionForm>({
    name: '',
    description: '',
    collection_type: 'series',
    is_public: true,
    discount_percentage: 0,
    max_attendees: 0,
    event_ids: []
  });

  const handleCreateCollection = async () => {
    if (!createForm.name.trim()) {
      toast({
        title: "Error",
        description: "Collection name is required",
        variant: "destructive"
      });
      return;
    }

    const success = await createCollection(createForm);
    if (success) {
      setShowCreateDialog(false);
      setCreateForm({
        name: '',
        description: '',
        collection_type: 'series',
        is_public: true,
        discount_percentage: 0,
        max_attendees: 0,
        event_ids: []
      });
    }
  };

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (!confirm(`Are you sure you want to delete "${collectionName}"? This action cannot be undone.`)) {
      return;
    }

    await deleteCollection(collectionId);
  };

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.collection_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCollectionTypeIcon = (type: string) => {
    switch (type) {
      case 'series':
        return <Calendar className="h-4 w-4" />;
      case 'bundle':
        return <Package className="h-4 w-4" />;
      case 'festival':
        return <Award className="h-4 w-4" />;
      case 'tour':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getCollectionTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'series':
        return 'bg-blue-500';
      case 'bundle':
        return 'bg-green-500';
      case 'festival':
        return 'bg-purple-500';
      case 'tour':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Collections</h1>
          <p className="text-muted-foreground">
            Create and manage collections of related events for better organization and marketing
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Event Collection</DialogTitle>
              <DialogDescription>
                Group related events together for better organization and promotion
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Collection Name</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Summer Dance Series 2024"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this collection includes..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Collection Type</Label>
                <Select 
                  value={createForm.collection_type} 
                  onValueChange={(value: any) => setCreateForm(prev => ({ ...prev, collection_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="series">Event Series</SelectItem>
                    <SelectItem value="bundle">Event Bundle</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="tour">Tour</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={createForm.is_public}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, is_public: checked }))}
                />
                <Label htmlFor="public">Make this collection public</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount %</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={createForm.discount_percentage}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, discount_percentage: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    min="0"
                    value={createForm.max_attendees}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, max_attendees: parseInt(e.target.value) || 0 }))}
                    placeholder="0 = unlimited"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCollection}>
                Create Collection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Collections</p>
                  <p className="text-2xl font-bold">{stats.total_collections}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Events in Collections</p>
                  <p className="text-2xl font-bold">{stats.total_events_in_collections}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${stats.total_revenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Collection Size</p>
                  <p className="text-2xl font-bold">{stats.avg_collection_size.toFixed(1)} events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="collections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="collections">My Collections ({collections.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Collections List */}
          <div className="space-y-4">
            {filteredCollections.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first event collection to group related events together
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Collection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <CollectionsList
                collections={filteredCollections}
                onEdit={(collection) => navigate(`/organizer/collections/${collection.id}/edit`)}
                onDelete={(collection) => handleDeleteCollection(collection.id, collection.name)}
                onView={(collection) => navigate(`/organizer/collections/${collection.id}`)}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Performance</CardTitle>
                <CardDescription>
                  Revenue and attendance by collection type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Most popular type: <span className="font-semibold">{stats.most_popular_type}</span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Trends</CardTitle>
                <CardDescription>
                  Growth and engagement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Analytics dashboard coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventCollectionsPage;