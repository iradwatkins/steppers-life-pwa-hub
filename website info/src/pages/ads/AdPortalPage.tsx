import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Eye, 
  DollarSign, 
  Target, 
  Calendar,
  Clock,
  Info,
  BarChart3
} from 'lucide-react';
import { useAdvertising } from '@/hooks/useAdvertising';
import { AdZone, DirectUserAd, AdStatus } from '@/types/advertising';
import { CreateAdDialog } from '@/components/advertising/CreateAdDialog';
import { AdZoneCard } from '@/components/advertising/AdZoneCard';
import { UserAdList } from '@/components/advertising/UserAdList';
import { AdPerformanceCard } from '@/components/advertising/AdPerformanceCard';

const AdPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [showCreateAdDialog, setShowCreateAdDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState<AdZone | null>(null);
  
  // Mock current user - in real app, this would come from auth context
  const currentUserId = 'user_organizer_001';
  const currentUserType = 'organizer'; // organizer, instructor, business, service
  
  const {
    adZones,
    directUserAds,
    loadingZones,
    loadingAds,
    fetchDirectUserAds
  } = useAdvertising();

  // Filter user's ads
  const userAds = directUserAds.filter(ad => ad.advertiserId === currentUserId);
  
  // Calculate user's advertising statistics
  const totalSpent = userAds.reduce((sum, ad) => sum + ad.pricing.totalCost, 0);
  const totalImpressions = userAds.reduce((sum, ad) => sum + (ad.performance?.impressions || 0), 0);
  const totalClicks = userAds.reduce((sum, ad) => sum + (ad.performance?.clicks || 0), 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  const runningAds = userAds.filter(ad => ad.status === AdStatus.RUNNING).length;
  const pendingAds = userAds.filter(ad => ad.status === AdStatus.PENDING_APPROVAL).length;

  // Filter active ad zones
  const activeZones = adZones.filter(zone => zone.isActive);

  useEffect(() => {
    fetchDirectUserAds({ advertiserId: currentUserId });
  }, [fetchDirectUserAds, currentUserId]);

  const handleCreateAd = (zone: AdZone) => {
    setSelectedZone(zone);
    setShowCreateAdDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateAdDialog(false);
    setSelectedZone(null);
  };

  // Check if user is eligible to advertise
  const isEligibleUser = ['organizer', 'instructor', 'business', 'service'].includes(currentUserType);

  if (!isEligibleUser) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Advertising is available to organizers, instructors, businesses, and service providers. 
            Please contact support if you believe you should have access to advertising features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertising Portal</h1>
          <p className="text-gray-600 mt-1">
            Promote your services to the SteppersLife community
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab('analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {userAds.length} campaign{userAds.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {averageCTR.toFixed(2)}% click-through rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningAds}</div>
            <p className="text-xs text-muted-foreground">
              {pendingAds} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {totalImpressions.toLocaleString()} impressions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Browse Ad Zones
          </TabsTrigger>
          <TabsTrigger value="my-ads" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            My Ads
            {userAds.length > 0 && (
              <Badge variant="secondary" className="ml-1">{userAds.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Ad Zones</CardTitle>
              <CardDescription>
                Choose the perfect placement for your advertisement. Pricing includes discounts for longer campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingZones ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : activeZones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No ad zones are currently available.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeZones.map((zone) => (
                    <AdZoneCard
                      key={zone.id}
                      zone={zone}
                      onSelect={() => handleCreateAd(zone)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-ads" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">My Advertisements</h3>
              <p className="text-sm text-gray-600">
                Manage your active and past advertising campaigns
              </p>
            </div>
            <Button
              onClick={() => setActiveTab('browse')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Ad
            </Button>
          </div>

          {loadingAds ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <UserAdList ads={userAds} />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userAds.map((ad) => (
              <AdPerformanceCard key={ad.id} ad={ad} />
            ))}
          </div>
          
          {userAds.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
                <p className="text-gray-600 mb-4">
                  Create your first advertisement to see performance analytics here.
                </p>
                <Button onClick={() => setActiveTab('browse')}>
                  Browse Ad Zones
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Ad Dialog */}
      <CreateAdDialog
        open={showCreateAdDialog}
        onClose={handleCloseCreateDialog}
        selectedZone={selectedZone}
        advertiserId={currentUserId}
      />
    </div>
  );
};

export default AdPortalPage; 