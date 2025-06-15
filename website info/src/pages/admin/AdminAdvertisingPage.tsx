import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Settings, 
  Shield, 
  Plus, 
  Download,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Eye,
  MousePointer
} from 'lucide-react';
import { useAdvertising } from '@/hooks/useAdvertising';
import { AdZoneManagement } from '@/components/advertising/AdZoneManagement';
import { DirectAdsManagement } from '@/components/advertising/DirectAdsManagement';
import { AdSettingsManagement } from '@/components/advertising/AdSettingsManagement';
import { AdAnalyticsDashboard } from '@/components/advertising/AdAnalyticsDashboard';
import { AdModerationPanel } from '@/components/advertising/AdModerationPanel';
import { CreateAdZoneDialog } from '@/components/advertising/CreateAdZoneDialog';
import { toast } from 'sonner';

const AdminAdvertisingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateZoneDialog, setShowCreateZoneDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    adZones,
    directUserAds,
    moderationReports,
    displaySettings,
    analytics,
    loadingZones,
    loadingAds,
    loadingAnalytics,
    refreshAllData
  } = useAdvertising();

  // Calculate overview statistics
  const totalRevenue = analytics?.overview?.totalRevenue || 0;
  const totalImpressions = analytics?.overview?.totalImpressions || 0;
  const totalClicks = analytics?.overview?.totalClicks || 0;
  const averageCTR = analytics?.overview?.averageCTR || 0;
  const activeAds = analytics?.overview?.activeAds || 0;
  const pendingAds = analytics?.overview?.pendingAds || 0;

  const pendingModerationCount = moderationReports.filter(report => 
    report.status === 'pending'
  ).length;

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshAllData();
      toast.success('All advertising data refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = () => {
    // Create CSV export of advertising data
    const csvData = [
      ['Ad ID', 'Title', 'Advertiser', 'Zone', 'Status', 'Revenue', 'Impressions', 'Clicks', 'CTR'],
      ...directUserAds.map(ad => [
        ad.id,
        ad.title,
        ad.advertiserInfo.name,
        adZones.find(z => z.id === ad.adZoneId)?.name || 'Unknown',
        ad.status,
        ad.performance?.totalRevenue || 0,
        ad.performance?.impressions || 0,
        ad.performance?.clicks || 0,
        ad.performance?.clickThroughRate || 0
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advertising-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advertising Management</h1>
          <p className="text-gray-600 mt-1">
            Manage ad zones, direct user ads, and advertising settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loadingZones || loadingAds || loadingAnalytics || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button
            onClick={() => setShowCreateZoneDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Ad Zone
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.performance?.revenueGrowth || 0}% from last month
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
              +{analytics?.performance?.impressionGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {averageCTR.toFixed(2)}% average CTR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAds}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{pendingAds} pending approval</span>
              {pendingModerationCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {pendingModerationCount} moderation
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending moderation */}
      {pendingModerationCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Attention Required</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              {pendingModerationCount} ad(s) require moderation review. 
              <Button 
                variant="link" 
                className="p-0 h-auto text-orange-700 underline"
                onClick={() => setActiveTab('moderation')}
              >
                Review now
              </Button>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="zones" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ad Zones
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Direct Ads
            {pendingAds > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingAds}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Moderation
            {pendingModerationCount > 0 && (
              <Badge variant="destructive" className="ml-1">{pendingModerationCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AdAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <AdZoneManagement />
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          <DirectAdsManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AdSettingsManagement />
        </TabsContent>

        <TabsContent value="moderation" className="space-y-4">
          <AdModerationPanel />
        </TabsContent>
      </Tabs>

      {/* Create Ad Zone Dialog */}
      <CreateAdZoneDialog 
        open={showCreateZoneDialog}
        onClose={() => setShowCreateZoneDialog(false)}
      />
    </div>
  );
};

export default AdminAdvertisingPage; 