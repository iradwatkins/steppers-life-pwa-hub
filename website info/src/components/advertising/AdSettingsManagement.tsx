import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Globe, 
  DollarSign, 
  Shield, 
  Save, 
  RefreshCw,
  X,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useAdvertising } from '@/hooks/useAdvertising';
import { AdDisplaySettings, AdSenseConfig } from '@/types/advertising';
import { toast } from 'sonner';

export const AdSettingsManagement: React.FC = () => {
  const {
    displaySettings,
    adSenseConfig,
    loadingSettings,
    updateDisplaySettings,
    updateAdSenseConfig,
    fetchDisplaySettings,
    fetchAdSenseConfig
  } = useAdvertising();

  const [localDisplaySettings, setLocalDisplaySettings] = useState<AdDisplaySettings>({
    globalAdEnabled: true,
    adSenseEnabled: true,
    directAdsEnabled: true,
    inFeedFrequency: 6,
    maxAdsPerPage: 3,
    excludedPages: [],
    loadingStrategy: 'lazy',
    fallbackBehavior: 'adSense'
  });

  const [localAdSenseConfig, setLocalAdSenseConfig] = useState<AdSenseConfig>({
    publisherId: '',
    adUnitIds: {},
    isEnabled: true,
    fallbackEnabled: true,
    revenueShare: 70
  });

  const [newExcludedPage, setNewExcludedPage] = useState('');
  const [newAdUnitZone, setNewAdUnitZone] = useState('');
  const [newAdUnitId, setNewAdUnitId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (displaySettings) {
      setLocalDisplaySettings(displaySettings);
    }
  }, [displaySettings]);

  useEffect(() => {
    if (adSenseConfig) {
      setLocalAdSenseConfig(adSenseConfig);
    }
  }, [adSenseConfig]);

  const handleSaveDisplaySettings = async () => {
    try {
      setSaving(true);
      await updateDisplaySettings(localDisplaySettings);
      toast.success('Display settings saved successfully');
    } catch (error) {
      toast.error('Failed to save display settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdSenseConfig = async () => {
    try {
      setSaving(true);
      await updateAdSenseConfig(localAdSenseConfig);
      toast.success('AdSense configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save AdSense configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([fetchDisplaySettings(), fetchAdSenseConfig()]);
      toast.success('Settings refreshed');
    } catch (error) {
      toast.error('Failed to refresh settings');
    }
  };

  const addExcludedPage = () => {
    if (newExcludedPage.trim() && !localDisplaySettings.excludedPages.includes(newExcludedPage.trim())) {
      setLocalDisplaySettings(prev => ({
        ...prev,
        excludedPages: [...prev.excludedPages, newExcludedPage.trim()]
      }));
      setNewExcludedPage('');
    }
  };

  const removeExcludedPage = (page: string) => {
    setLocalDisplaySettings(prev => ({
      ...prev,
      excludedPages: prev.excludedPages.filter(p => p !== page)
    }));
  };

  const addAdUnit = () => {
    if (newAdUnitZone.trim() && newAdUnitId.trim() && !localAdSenseConfig.adUnitIds[newAdUnitZone.trim()]) {
      setLocalAdSenseConfig(prev => ({
        ...prev,
        adUnitIds: {
          ...prev.adUnitIds,
          [newAdUnitZone.trim()]: newAdUnitId.trim()
        }
      }));
      setNewAdUnitZone('');
      setNewAdUnitId('');
    }
  };

  const removeAdUnit = (zoneId: string) => {
    setLocalAdSenseConfig(prev => ({
      ...prev,
      adUnitIds: Object.fromEntries(
        Object.entries(prev.adUnitIds).filter(([key]) => key !== zoneId)
      )
    }));
  };

  if (loadingSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ad Settings Management</CardTitle>
          <CardDescription>Loading advertising settings...</CardDescription>
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
    <div className="space-y-6">
      {/* Display Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <div>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>Configure how ads are displayed across your platform</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleSaveDisplaySettings} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Ad Controls */}
          <div className="space-y-4">
            <h4 className="font-medium">Global Ad Controls</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="globalAdEnabled" className="font-medium">Enable Advertising</Label>
                  <p className="text-sm text-gray-500">Turn all advertising on or off globally</p>
                </div>
                <Switch
                  id="globalAdEnabled"
                  checked={localDisplaySettings.globalAdEnabled}
                  onCheckedChange={(checked) => 
                    setLocalDisplaySettings(prev => ({ ...prev, globalAdEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="directAdsEnabled" className="font-medium">Direct User Ads</Label>
                  <p className="text-sm text-gray-500">Allow user-submitted advertisements</p>
                </div>
                <Switch
                  id="directAdsEnabled"
                  checked={localDisplaySettings.directAdsEnabled}
                  onCheckedChange={(checked) => 
                    setLocalDisplaySettings(prev => ({ ...prev, directAdsEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="adSenseEnabled" className="font-medium">Google AdSense</Label>
                  <p className="text-sm text-gray-500">Show AdSense ads when no direct ads</p>
                </div>
                <Switch
                  id="adSenseEnabled"
                  checked={localDisplaySettings.adSenseEnabled}
                  onCheckedChange={(checked) => 
                    setLocalDisplaySettings(prev => ({ ...prev, adSenseEnabled: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Display Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium">Display Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="inFeedFrequency">In-Feed Ad Frequency</Label>
                <Input
                  id="inFeedFrequency"
                  type="number"
                  min="1"
                  max="20"
                  value={localDisplaySettings.inFeedFrequency}
                  onChange={(e) => setLocalDisplaySettings(prev => ({
                    ...prev,
                    inFeedFrequency: parseInt(e.target.value) || 6
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">Show ad after every N items</p>
              </div>

              <div>
                <Label htmlFor="maxAdsPerPage">Max Ads Per Page</Label>
                <Input
                  id="maxAdsPerPage"
                  type="number"
                  min="1"
                  max="10"
                  value={localDisplaySettings.maxAdsPerPage}
                  onChange={(e) => setLocalDisplaySettings(prev => ({
                    ...prev,
                    maxAdsPerPage: parseInt(e.target.value) || 3
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">Maximum ads shown per page</p>
              </div>

              <div>
                <Label htmlFor="loadingStrategy">Loading Strategy</Label>
                <select
                  id="loadingStrategy"
                  className="w-full p-2 border rounded-md"
                  value={localDisplaySettings.loadingStrategy}
                  onChange={(e) => setLocalDisplaySettings(prev => ({
                    ...prev,
                    loadingStrategy: e.target.value as 'eager' | 'lazy'
                  }))}
                >
                  <option value="lazy">Lazy Loading</option>
                  <option value="eager">Eager Loading</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">How ads are loaded</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Excluded Pages */}
          <div className="space-y-4">
            <h4 className="font-medium">Excluded Pages</h4>
            <p className="text-sm text-gray-500">Pages where ads should not be displayed</p>
            
            <div className="flex gap-2">
              <Input
                placeholder="e.g., /checkout, /payment/*"
                value={newExcludedPage}
                onChange={(e) => setNewExcludedPage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addExcludedPage()}
              />
              <Button onClick={addExcludedPage} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {localDisplaySettings.excludedPages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {localDisplaySettings.excludedPages.map((page, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {page}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeExcludedPage(page)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AdSense Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <div>
                <CardTitle>Google AdSense Configuration</CardTitle>
                <CardDescription>Configure AdSense integration and revenue sharing</CardDescription>
              </div>
            </div>
            <Button onClick={handleSaveAdSenseConfig} disabled={saving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publisherId">Publisher ID</Label>
                <Input
                  id="publisherId"
                  placeholder="pub-1234567890123456"
                  value={localAdSenseConfig.publisherId}
                  onChange={(e) => setLocalAdSenseConfig(prev => ({
                    ...prev,
                    publisherId: e.target.value
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">Your Google AdSense Publisher ID</p>
              </div>

              <div>
                <Label htmlFor="revenueShare">Revenue Share (%)</Label>
                <Input
                  id="revenueShare"
                  type="number"
                  min="0"
                  max="100"
                  value={localAdSenseConfig.revenueShare}
                  onChange={(e) => setLocalAdSenseConfig(prev => ({
                    ...prev,
                    revenueShare: parseInt(e.target.value) || 70
                  }))}
                />
                <p className="text-xs text-gray-500 mt-1">Platform's share of AdSense revenue</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="adSenseConfigEnabled" className="font-medium">Enable AdSense</Label>
                <p className="text-sm text-gray-500">Activate Google AdSense integration</p>
              </div>
              <Switch
                id="adSenseConfigEnabled"
                checked={localAdSenseConfig.isEnabled}
                onCheckedChange={(checked) => 
                  setLocalAdSenseConfig(prev => ({ ...prev, isEnabled: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="fallbackEnabled" className="font-medium">Fallback Enabled</Label>
                <p className="text-sm text-gray-500">Show AdSense when direct ads unavailable</p>
              </div>
              <Switch
                id="fallbackEnabled"
                checked={localAdSenseConfig.fallbackEnabled}
                onCheckedChange={(checked) => 
                  setLocalAdSenseConfig(prev => ({ ...prev, fallbackEnabled: checked }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* Ad Unit Mapping */}
          <div className="space-y-4">
            <h4 className="font-medium">Ad Unit Mapping</h4>
            <p className="text-sm text-gray-500">Map ad zones to AdSense ad units</p>
            
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Zone ID (e.g., zone_header_banner)"
                value={newAdUnitZone}
                onChange={(e) => setNewAdUnitZone(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="AdSense Ad Unit ID"
                  value={newAdUnitId}
                  onChange={(e) => setNewAdUnitId(e.target.value)}
                />
                <Button onClick={addAdUnit} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {Object.keys(localAdSenseConfig.adUnitIds).length > 0 && (
              <div className="space-y-2">
                {Object.entries(localAdSenseConfig.adUnitIds).map(([zoneId, adUnitId]) => (
                  <div key={zoneId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{zoneId}</div>
                      <div className="text-sm text-gray-500">{adUnitId}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdUnit(zoneId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status Information */}
          {localAdSenseConfig.lastSyncAt && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Last synced: {localAdSenseConfig.lastSyncAt.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 