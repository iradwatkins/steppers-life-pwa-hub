import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, QrCode, Plus, Settings, BarChart3, Target, Download, Upload, TestTube, Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useQRCodes } from '../../hooks/useQRCodes';
import { QRCodesList } from '../../components/qr/QRCodesList';
import { CreateQRCodeDialog } from '../../components/qr/CreateQRCodeDialog';
import { QRCodeTemplateManager } from '../../components/qr/QRCodeTemplateManager';
import { QRCodeAnalyticsDashboard } from '../../components/qr/QRCodeAnalyticsDashboard';
import { QRCodeCampaignManager } from '../../components/qr/QRCodeCampaignManager';
import { BatchQRCodeDialog } from '../../components/qr/BatchQRCodeDialog';

export const EventQRCodesPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('qr-codes');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const {
    qrCodes,
    templates,
    analytics,
    campaigns,
    isLoading,
    isGenerating,
    error,
    clearError,
    refresh,
  } = useQRCodes(eventId);

  // Filter QR codes based on search and status
  const filteredQRCodes = qrCodes.filter(qrCode => {
    const matchesSearch = qrCode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         qrCode.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && qrCode.isActive) ||
                         (filterStatus === 'inactive' && !qrCode.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleCreateQRCode = () => {
    setShowCreateDialog(true);
  };

  const handleBatchGenerate = () => {
    setShowBatchDialog(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="mb-6">
            <AlertDescription>
              {error}
              <Button 
                variant="link" 
                className="p-0 h-auto font-normal ml-2" 
                onClick={clearError}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={`/organizer/event/${eventId}/manage`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Event
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <QrCode className="h-6 w-6 mr-2 text-blue-600" />
                  QR Code Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Generate and manage QR codes for your event promotion
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleBatchGenerate}
                disabled={isGenerating}
              >
                <Upload className="h-4 w-4 mr-2" />
                Batch Generate
              </Button>
              
              <Button
                onClick={handleCreateQRCode}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create QR Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="qr-codes" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>QR Codes</span>
              <Badge variant="secondary">{qrCodes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Templates</span>
              <Badge variant="secondary">{templates.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Campaigns</span>
              <Badge variant="secondary">{campaigns.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* QR Codes Tab */}
          <TabsContent value="qr-codes" className="space-y-6">
            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search QR codes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Codes List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-48 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredQRCodes.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || filterStatus !== 'all' ? 'No QR codes found' : 'No QR codes yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || filterStatus !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first QR code to start promoting your event.'
                    }
                  </p>
                  {!searchQuery && filterStatus === 'all' && (
                    <Button onClick={handleCreateQRCode} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create QR Code
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <QRCodesList qrCodes={filteredQRCodes} viewMode={viewMode} />
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <QRCodeTemplateManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <QRCodeAnalyticsDashboard eventId={eventId} />
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <QRCodeCampaignManager eventId={eventId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create QR Code Dialog */}
      <CreateQRCodeDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        eventId={eventId}
      />

      {/* Batch Generate Dialog */}
      <BatchQRCodeDialog
        open={showBatchDialog}
        onClose={() => setShowBatchDialog(false)}
        eventIds={eventId ? [eventId] : []}
      />
    </div>
  );
}; 