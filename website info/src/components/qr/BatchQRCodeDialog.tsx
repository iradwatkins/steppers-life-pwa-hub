import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, 
  Download, 
  QrCode, 
  FileText, 
  Settings, 
  Check, 
  X, 
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  FileCheck
} from 'lucide-react';
import { useQRCodes } from '../../hooks/useQRCodes';
import { QRCodeTemplate, QRCodeConfig } from '../../services/qrCodeService';

interface BatchQRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  eventId?: string;
}

interface BatchItem {
  id: string;
  name: string;
  targetUrl: string;
  description?: string;
  campaignName?: string;
  trackingParams?: Record<string, string>;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export const BatchQRCodeDialog: React.FC<BatchQRCodeDialogProps> = ({ 
  open, 
  onClose, 
  eventId 
}) => {
  const { templates, batchCreateQRCodes, isGenerating } = useQRCodes(eventId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('manual');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [csvData, setCsvData] = useState('');
  const [globalSettings, setGlobalSettings] = useState({
    campaignName: '',
    trackingParams: {} as Record<string, string>
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });

  const addManualItem = () => {
    const newItem: BatchItem = {
      id: `item-${Date.now()}`,
      name: '',
      targetUrl: '',
      status: 'pending'
    };
    setBatchItems([...batchItems, newItem]);
  };

  const updateBatchItem = (id: string, updates: Partial<BatchItem>) => {
    setBatchItems(items => 
      items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(items => items.filter(item => item.id !== id));
  };

  const duplicateBatchItem = (id: string) => {
    const item = batchItems.find(item => item.id === id);
    if (item) {
      const duplicated = {
        ...item,
        id: `item-${Date.now()}`,
        name: `${item.name} (Copy)`,
        status: 'pending' as const
      };
      setBatchItems([...batchItems, duplicated]);
    }
  };

  const parseCsvData = () => {
    if (!csvData.trim()) return;
    
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const requiredColumns = ['name', 'url'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      alert(`Missing required columns: ${missingColumns.join(', ')}`);
      return;
    }
    
    const nameIndex = headers.indexOf('name');
    const urlIndex = headers.indexOf('url');
    const descriptionIndex = headers.indexOf('description');
    const campaignIndex = headers.indexOf('campaign');
    
    const newItems: BatchItem[] = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      return {
        id: `csv-${index}`,
        name: values[nameIndex] || `QR Code ${index + 1}`,
        targetUrl: values[urlIndex] || '',
        description: descriptionIndex >= 0 ? values[descriptionIndex] : '',
        campaignName: campaignIndex >= 0 ? values[campaignIndex] : globalSettings.campaignName,
        status: 'pending' as const
      };
    }).filter(item => item.targetUrl);
    
    setBatchItems(newItems);
    setActiveTab('review');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      parseCsvData();
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = `name,url,description,campaign
Event Flyer QR,https://example.com/event/123,QR code for event flyer,Summer Campaign
Social Media QR,https://example.com/event/123?utm_source=social,Social media promotion,Summer Campaign
Business Card QR,https://example.com/event/123?utm_source=business_card,Business card QR code,Summer Campaign`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr_batch_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const validateItems = (): boolean => {
    const errors: string[] = [];
    
    batchItems.forEach((item, index) => {
      if (!item.name.trim()) {
        errors.push(`Row ${index + 1}: Name is required`);
      }
      if (!item.targetUrl.trim()) {
        errors.push(`Row ${index + 1}: URL is required`);
      } else {
        try {
          new URL(item.targetUrl);
        } catch {
          errors.push(`Row ${index + 1}: Invalid URL format`);
        }
      }
    });
    
    if (errors.length > 0) {
      alert(`Please fix the following errors:\n${errors.join('\n')}`);
      return false;
    }
    
    return true;
  };

  const generateBatchQRCodes = async () => {
    if (!validateItems()) return;
    if (batchItems.length === 0) {
      alert('Please add at least one QR code to generate');
      return;
    }
    
    setIsProcessing(true);
    setProcessProgress(0);
    setResults({ success: 0, errors: 0 });
    
    const template = selectedTemplate === 'default' ? undefined : templates.find(t => t.id === selectedTemplate);
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      
      // Update item status to processing
      setBatchItems(items => 
        items.map(it => 
          it.id === item.id ? { ...it, status: 'processing' } : it
        )
      );
      
      try {
        const qrConfig: QRCodeConfig = {
          id: '',
          eventId: eventId || '',
          name: item.name,
          description: item.description || '',
          targetUrl: item.targetUrl,
          trackingParams: {
            ...globalSettings.trackingParams,
            ...item.trackingParams,
            utm_campaign: item.campaignName || globalSettings.campaignName || 'batch_generation'
          },
          design: template?.design || {
            size: 256,
            errorCorrectionLevel: 'M',
            margin: 4,
            darkColor: '#000000',
            lightColor: '#FFFFFF',
            logoUrl: '',
            logoSize: 20,
            cornerRadius: 0,
            dotStyle: 'square',
            eyeStyle: 'square',
            gradientType: 'none',
            gradientColors: ['#000000', '#000000']
          },
          format: template?.format || 'png',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update item status to success
        setBatchItems(items => 
          items.map(it => 
            it.id === item.id ? { ...it, status: 'success' } : it
          )
        );
        
        successCount++;
      } catch (error) {
        // Update item status to error
        setBatchItems(items => 
          items.map(it => 
            it.id === item.id ? { 
              ...it, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Generation failed'
            } : it
          )
        );
        
        errorCount++;
      }
      
      // Update progress
      const progress = ((i + 1) / batchItems.length) * 100;
      setProcessProgress(progress);
      setResults({ success: successCount, errors: errorCount });
    }
    
    setIsProcessing(false);
    
    // Auto-close after successful batch generation
    if (errorCount === 0) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const getStatusIcon = (status: BatchItem['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <QrCode className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: BatchItem['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Batch Generate QR Codes
          </DialogTitle>
          <DialogDescription>
            Generate multiple QR codes at once using manual entry or CSV import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar (shown when processing) */}
          {isProcessing && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generating QR codes...</span>
                    <span className="text-sm text-gray-600">
                      {results.success + results.errors} of {batchItems.length}
                    </span>
                  </div>
                  <Progress value={processProgress} className="w-full" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">{results.success} successful</span>
                    <span className="text-red-600">{results.errors} errors</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="csv">CSV Import</TabsTrigger>
              <TabsTrigger value="review">Review & Generate</TabsTrigger>
            </TabsList>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manual QR Code Entry</CardTitle>
                  <CardDescription>
                    Add QR codes one by one with custom settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={addManualItem} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add QR Code
                  </Button>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {batchItems.map((item, index) => (
                      <Card key={item.id} className="p-4">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-1 text-sm font-medium text-gray-600">
                            {index + 1}
                          </div>
                          
                          <div className="col-span-3">
                            <Input
                              placeholder="QR Code Name"
                              value={item.name}
                              onChange={(e) => updateBatchItem(item.id, { name: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="col-span-4">
                            <Input
                              placeholder="Target URL"
                              value={item.targetUrl}
                              onChange={(e) => updateBatchItem(item.id, { targetUrl: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <Input
                              placeholder="Campaign (optional)"
                              value={item.campaignName || ''}
                              onChange={(e) => updateBatchItem(item.id, { campaignName: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="col-span-2 flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => duplicateBatchItem(item.id)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeBatchItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {batchItems.length > 0 && (
                    <Button 
                      onClick={() => setActiveTab('review')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Review {batchItems.length} QR Code{batchItems.length !== 1 ? 's' : ''}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CSV Import Tab */}
            <TabsContent value="csv" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>CSV Import</CardTitle>
                  <CardDescription>
                    Import multiple QR codes from a CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      CSV format: name, url, description (optional), campaign (optional)
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal ml-2"
                        onClick={downloadTemplate}
                      >
                        Download template
                      </Button>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="csvFile">Upload CSV File</Label>
                      <input
                        ref={fileInputRef}
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    
                    <div className="text-center text-gray-500">or</div>
                    
                    <div>
                      <Label htmlFor="csvData">Paste CSV Data</Label>
                      <Textarea
                        id="csvData"
                        placeholder="name,url,description,campaign&#10;Event QR,https://example.com/event,Main event QR,Summer Campaign"
                        value={csvData}
                        onChange={(e) => setCsvData(e.target.value)}
                        rows={6}
                      />
                    </div>
                    
                    <Button 
                      onClick={parseCsvData}
                      disabled={!csvData.trim()}
                      className="w-full"
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Parse CSV Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review & Generate Tab */}
            <TabsContent value="review" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Review & Generate</CardTitle>
                  <CardDescription>
                    Review your QR codes and configure generation settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Global Settings */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Template (Optional)</Label>
                      <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Settings</SelectItem>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Global Campaign Name</Label>
                      <Input
                        placeholder="Campaign name for all QR codes"
                        value={globalSettings.campaignName}
                        onChange={(e) => setGlobalSettings(prev => ({ 
                          ...prev, 
                          campaignName: e.target.value 
                        }))}
                      />
                    </div>
                  </div>
                  
                  {/* QR Codes List */}
                  <div className="border rounded-lg">
                    <div className="p-3 bg-gray-50 border-b rounded-t-lg">
                      <h4 className="font-medium">QR Codes to Generate ({batchItems.length})</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {batchItems.map((item, index) => (
                        <div key={item.id} className="p-3 border-b last:border-b-0 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(item.status)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-sm text-gray-500 truncate">{item.targetUrl}</p>
                              {item.error && (
                                <p className="text-sm text-red-600">{item.error}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.campaignName && (
                              <Badge variant="outline" className="text-xs">
                                {item.campaignName}
                              </Badge>
                            )}
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {batchItems.length === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No QR codes to generate</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Add QR codes manually or import from CSV
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Cancel'}
          </Button>
          {activeTab === 'review' && batchItems.length > 0 && (
            <Button 
              onClick={generateBatchQRCodes}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate {batchItems.length} QR Code{batchItems.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 