import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Play, 
  Pause, 
  Search,
  DollarSign,
  Monitor,
  Calendar
} from 'lucide-react';
import { useAdvertising } from '@/hooks/useAdvertising';
import { CreateAdZoneDialog } from './CreateAdZoneDialog';
import { AdZone } from '@/types/advertising';
import { toast } from 'sonner';

export const AdZoneManagement: React.FC = () => {
  const { 
    adZones, 
    loadingZones, 
    deleteAdZone, 
    toggleAdZoneStatus 
  } = useAdvertising();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created'>('name');

  const filteredZones = adZones
    .filter(zone => 
      zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return b.pricing.basePricePerDay - a.pricing.basePricePerDay;
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

  const handleDeleteZone = async (zoneId: string) => {
    if (window.confirm('Are you sure you want to delete this ad zone? This action cannot be undone.')) {
      try {
        await deleteAdZone(zoneId);
        toast.success('Ad zone deleted successfully');
      } catch (error) {
        toast.error('Failed to delete ad zone');
      }
    }
  };

  const handleToggleStatus = async (zoneId: string) => {
    try {
      await toggleAdZoneStatus(zoneId);
    } catch (error) {
      toast.error('Failed to update zone status');
    }
  };

  const formatPlacement = (placement: string) => {
    return placement
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusBadge = (zone: AdZone) => {
    return zone.isActive ? (
      <Badge variant="default" className="bg-green-500">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getPremiumBadge = (isPremium: boolean) => {
    return isPremium ? (
      <Badge variant="default" className="bg-purple-500">Premium</Badge>
    ) : null;
  };

  if (loadingZones) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad Zone Management</CardTitle>
          <CardDescription>Loading ad zones...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ad Zone Management</CardTitle>
              <CardDescription>
                Manage advertising zones and their settings ({adZones.length} total zones)
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Zone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search zones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('name')}
              >
                Name
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('price')}
              >
                Price
              </Button>
              <Button
                variant={sortBy === 'created' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('created')}
              >
                Recent
              </Button>
            </div>
          </div>

          {filteredZones.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Monitor className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No zones found' : 'No ad zones yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create your first advertising zone to get started'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Zone
                </Button>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone Name</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{zone.name}</div>
                          <div className="text-sm text-gray-500">{zone.description}</div>
                          <div className="flex gap-1 mt-1">
                            {getPremiumBadge(zone.pricing.isPremium)}
                            {zone.isRandomPlacement && (
                              <Badge variant="outline" className="text-xs">Random</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatPlacement(zone.placement)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {zone.dimensions.width} × {zone.dimensions.height}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium">{zone.pricing.basePricePerDay}</span>
                        </div>
                        {zone.pricing.weeklyDiscount && (
                          <div className="text-xs text-green-600">
                            -{zone.pricing.weeklyDiscount}% weekly
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(zone)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {zone.createdAt.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(zone.id)}
                            >
                              {zone.isActive ? (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Zone
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteZone(zone.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Zone
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAdZoneDialog 
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </>
  );
}; 