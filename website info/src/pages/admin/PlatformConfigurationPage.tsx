import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlusCircle, Loader2, Edit, Trash2, GripVertical, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useNavigate } from 'react-router-dom';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { Category, PickupLocation, SiteSettings, VODSettings } from '@/services/platformConfigService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const PlatformConfigurationPage: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();

  const { 
    categories,
    siteSettings,
    vodSettings,
    pickupLocations,
    loading,
    error,
    fetchConfig,
    updateCategory,
    addCategory,
    deleteCategory,
    reorderCategories,
    updateSiteSettings,
    updateVODSettings,
    addPickupLocation,
    updatePickupLocation,
    deletePickupLocation,
  } = usePlatformConfig();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'event' | 'class'>('event');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

  const [currentSiteSettings, setCurrentSiteSettings] = useState<Partial<SiteSettings>>({});
  const [currentVODSettings, setCurrentVODSettings] = useState<Partial<VODSettings>>({});
  const [newPickupLocation, setNewPickupLocation] = useState<Omit<PickupLocation, 'id' | 'isActive'>>({
    name: '', address: '', city: '', state: '', zip: ''
  });
  const [editingPickupLocation, setEditingPickupLocation] = useState<PickupLocation | null>(null);
  const [isPickupLocationFormOpen, setIsPickupLocationFormOpen] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("You are not authorized to view this page.");
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (siteSettings) {
      setCurrentSiteSettings(siteSettings);
    }
    if (vodSettings) {
      setCurrentVODSettings(vodSettings);
    }
  }, [siteSettings, vodSettings]);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') {
      toast.error('Category name cannot be empty.');
      return;
    }
    try {
      await addCategory({ name: newCategoryName, type: newCategoryType, isActive: true });
      setNewCategoryName('');
      setNewCategoryType('event');
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleUpdateCategoryStatus = async (category: Category) => {
    try {
      await updateCategory({ ...category, isActive: !category.isActive });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleEditCategoryClick = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryType(category.type);
    setIsCategoryFormOpen(true);
  };

  const handleSaveCategory = async () => {
    if (newCategoryName.trim() === '') {
      toast.error('Category name cannot be empty.');
      return;
    }
    try {
      if (editingCategory) {
        await updateCategory({ ...editingCategory, name: newCategoryName, type: newCategoryType });
        toast.success('Category updated.');
      } else {
        await addCategory({ name: newCategoryName, type: newCategoryType, isActive: true });
        toast.success('Category added.');
      }
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryType('event');
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
    } catch (err) {
      // Error handled by hook
    }
  };

  const onDragEndCategory = async (result: any) => {
    if (!result.destination) return;

    const reorderedCategories = Array.from(categories);
    const [removed] = reorderedCategories.splice(result.source.index, 1);
    reorderedCategories.splice(result.destination.index, 0, removed);

    const orderedIds = reorderedCategories.map(cat => cat.id);
    await reorderCategories(orderedIds);
  };

  const handleSaveSiteSettings = async () => {
    try {
      await updateSiteSettings(currentSiteSettings);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleSaveVODSettings = async () => {
    try {
      await updateVODSettings(currentVODSettings);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleAddPickupLocation = async () => {
    if (!newPickupLocation.name || !newPickupLocation.address || !newPickupLocation.city || !newPickupLocation.state || !newPickupLocation.zip) {
      toast.error('All pickup location fields are required.');
      return;
    }
    try {
      await addPickupLocation(newPickupLocation);
      setNewPickupLocation({ name: '', address: '', city: '', state: '', zip: '' });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleEditPickupLocationClick = (location: PickupLocation) => {
    setEditingPickupLocation(location);
    setNewPickupLocation({ name: location.name, address: location.address, city: location.city, state: location.state, zip: location.zip });
    setIsPickupLocationFormOpen(true);
  };

  const handleSavePickupLocation = async () => {
    if (!newPickupLocation.name || !newPickupLocation.address || !newPickupLocation.city || !newPickupLocation.state || !newPickupLocation.zip) {
      toast.error('All pickup location fields are required.');
      return;
    }
    try {
      if (editingPickupLocation) {
        await updatePickupLocation({ ...editingPickupLocation, ...newPickupLocation });
        toast.success('Pickup location updated.');
      } else {
        await addPickupLocation(newPickupLocation);
        toast.success('Pickup location added.');
      }
      setIsPickupLocationFormOpen(false);
      setEditingPickupLocation(null);
      setNewPickupLocation({ name: '', address: '', city: '', state: '', zip: '' });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDeletePickupLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pickup location?')) return;
    try {
      await deletePickupLocation(id);
    } catch (err) {
      // Error handled by hook
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-primary text-xl">Loading configurations...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Platform Configuration</h1>
          <p className="text-lg text-muted-foreground">Manage core platform settings, event categories, VOD pricing, and pickup locations.</p>
        </div>

        {error && (
          <div className="text-red-500 text-center py-4 mb-4 border border-red-500 rounded-md">
            Error: {error}
          </div>
        )}

        {/* Category Management */}
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Event & Class Categories</CardTitle>
            <Button onClick={() => {
              setEditingCategory(null);
              setNewCategoryName('');
              setNewCategoryType('event');
              setIsCategoryFormOpen(true);
            }}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add New Category
            </Button>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEndCategory}>
              <Droppable droppableId="categories">
                {(provided) => (
                  <Table {...provided.droppableProps} ref={provided.innerRef}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category, index) => (
                        <Draggable key={category.id} draggableId={category.id} index={index}>
                          {(provided) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="cursor-grab"
                            >
                              <TableCell className="w-10" {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </TableCell>
                              <TableCell className="font-medium">{category.name}</TableCell>
                              <TableCell>{category.type}</TableCell>
                              <TableCell>
                                <Switch
                                  checked={category.isActive}
                                  onCheckedChange={() => handleUpdateCategoryStatus(category)}
                                />
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditCategoryClick(category)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  </Table>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        {/* Category Form Dialog */}
        <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              <DialogDescription>Enter the details for the category.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryName" className="text-right">Name</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryType" className="text-right">Type</Label>
                <Select value={newCategoryType} onValueChange={(value: 'event' | 'class') => setNewCategoryType(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="class">Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveCategory} disabled={loading || newCategoryName.trim() === ''}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingCategory ? 'Save Changes' : 'Add Category'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* General Site Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">General Site Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={currentSiteSettings?.siteName || ''}
                  onChange={(e) => setCurrentSiteSettings({ ...currentSiteSettings, siteName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={currentSiteSettings?.contactEmail || ''}
                  onChange={(e) => setCurrentSiteSettings({ ...currentSiteSettings, contactEmail: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="defaultTimezone">Default Timezone</Label>
              <Input
                id="defaultTimezone"
                value={currentSiteSettings?.defaultTimezone || ''}
                onChange={(e) => setCurrentSiteSettings({ ...currentSiteSettings, defaultTimezone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook Link</Label>
                <Input
                  id="facebook"
                  value={currentSiteSettings?.socialLinks?.facebook || ''}
                  onChange={(e) => setCurrentSiteSettings({ ...currentSiteSettings, socialLinks: { ...currentSiteSettings.socialLinks, facebook: e.target.value } })}
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram Link</Label>
                <Input
                  id="instagram"
                  value={currentSiteSettings?.socialLinks?.instagram || ''}
                  onChange={(e) => setCurrentSiteSettings({ ...currentSiteSettings, socialLinks: { ...currentSiteSettings.socialLinks, instagram: e.target.value } })}
                />
              </div>
            </div>
            <Button onClick={handleSaveSiteSettings} className="w-fit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Site Settings
            </Button>
          </CardContent>
        </Card>

        {/* VOD Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">VOD Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="hostingFee">Hosting Fee Percentage (%)</Label>
              <Input
                id="hostingFee"
                type="number"
                step="0.01"
                value={(currentVODSettings?.hostingFeePercentage !== undefined ? currentVODSettings.hostingFeePercentage * 100 : '')}
                onChange={(e) => setCurrentVODSettings({ ...currentVODSettings, hostingFeePercentage: parseFloat(e.target.value) / 100 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="introOffer"
                checked={currentVODSettings?.introductoryOfferActive || false}
                onCheckedChange={(checked) => setCurrentVODSettings({ ...currentVODSettings, introductoryOfferActive: checked })}
              />
              <Label htmlFor="introOffer">Introductory Offer Active</Label>
            </div>
            {currentVODSettings?.introductoryOfferActive && (
              <div>
                <Label htmlFor="introOfferDetails">Introductory Offer Details</Label>
                <Textarea
                  id="introOfferDetails"
                  value={currentVODSettings?.introductoryOfferDetails || ''}
                  onChange={(e) => setCurrentVODSettings({ ...currentVODSettings, introductoryOfferDetails: e.target.value })}
                  rows={3}
                />
              </div>
            )}
            <Button onClick={handleSaveVODSettings} className="w-fit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save VOD Settings
            </Button>
          </CardContent>
        </Card>

        {/* Pickup Location Management */}
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xl font-semibold">Pickup Locations</CardTitle>
            <Button onClick={() => {
              setEditingPickupLocation(null);
              setNewPickupLocation({ name: '', address: '', city: '', state: '', zip: '' });
              setIsPickupLocationFormOpen(true);
            }}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add New Location
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Zip</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickupLocations.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No pickup locations found.</TableCell></TableRow>
                ) : (
                  pickupLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.address}</TableCell>
                      <TableCell>{location.city}</TableCell>
                      <TableCell>{location.state}</TableCell>
                      <TableCell>{location.zip}</TableCell>
                      <TableCell>
                        <Switch
                          checked={location.isActive}
                          onCheckedChange={async (checked) => {
                            try {
                              await updatePickupLocation({ ...location, isActive: checked });
                            } catch (err) {
                              // Error handled by hook
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPickupLocationClick(location)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePickupLocation(location.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pickup Location Form Dialog */}
        <Dialog open={isPickupLocationFormOpen} onOpenChange={setIsPickupLocationFormOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingPickupLocation ? 'Edit Pickup Location' : 'Add New Pickup Location'}</DialogTitle>
              <DialogDescription>Enter the details for the pickup location.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locationName" className="text-right">Name</Label>
                <Input
                  id="locationName"
                  value={newPickupLocation.name}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locationAddress" className="text-right">Address</Label>
                <Input
                  id="locationAddress"
                  value={newPickupLocation.address}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, address: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locationCity" className="text-right">City</Label>
                <Input
                  id="locationCity"
                  value={newPickupLocation.city}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, city: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locationState" className="text-right">State</Label>
                <Input
                  id="locationState"
                  value={newPickupLocation.state}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, state: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="locationZip" className="text-right">Zip Code</Label>
                <Input
                  id="locationZip"
                  value={newPickupLocation.zip}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, zip: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSavePickupLocation} disabled={loading || !newPickupLocation.name || !newPickupLocation.address || !newPickupLocation.city || !newPickupLocation.state || !newPickupLocation.zip}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {editingPickupLocation ? 'Save Changes' : 'Add Location'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default PlatformConfigurationPage; 