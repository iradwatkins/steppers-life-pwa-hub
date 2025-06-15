import React, { useState } from 'react';
import { Download, FileText, Table, BarChart3, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportConfig } from '@/services/financialReportsService';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (config: ExportConfig) => Promise<void>;
  exporting: boolean;
}

const EXPORT_SECTIONS = [
  { id: 'overview', label: 'Financial Overview', description: 'Key metrics and summary data' },
  { id: 'revenue', label: 'Revenue Analytics', description: 'Revenue breakdown by type and channel' },
  { id: 'expenses', label: 'Expense Analysis', description: 'Detailed expense categorization' },
  { id: 'profitLoss', label: 'Profit & Loss', description: 'P&L statement and margins' },
  { id: 'paymentFees', label: 'Payment Processing Fees', description: 'Fee analysis and optimization' },
  { id: 'forecast', label: 'Financial Forecasting', description: 'Future projections and trends' },
  { id: 'cashFlow', label: 'Cash Flow Analysis', description: 'Cash flow projections and alerts' },
  { id: 'commissions', label: 'Commission Tracking', description: 'Sales agent and affiliate commissions' },
  { id: 'tax', label: 'Tax Information', description: 'Tax calculations and compliance' },
  { id: 'accounting', label: 'Accounting Integration', description: 'Sync status and transaction data' },
];

const EXPORT_FORMATS = [
  { 
    id: 'pdf', 
    label: 'PDF Report', 
    description: 'Professional formatted report with charts',
    icon: FileText,
    features: ['Charts included', 'Professional formatting', 'Print-ready']
  },
  { 
    id: 'excel', 
    label: 'Excel Workbook', 
    description: 'Spreadsheet with multiple worksheets',
    icon: Table,
    features: ['Multiple worksheets', 'Editable data', 'Formulas included']
  },
  { 
    id: 'csv', 
    label: 'CSV Data', 
    description: 'Raw data in comma-separated format',
    icon: BarChart3,
    features: ['Raw data export', 'Import into tools', 'Lightweight format']
  },
  { 
    id: 'json', 
    label: 'JSON Data', 
    description: 'Structured data for developers',
    icon: Calendar,
    features: ['Structured format', 'API-compatible', 'Developer-friendly']
  },
];

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  onExport,
  exporting
}) => {
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>(['overview', 'revenue', 'expenses', 'profitLoss']);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedSections(EXPORT_SECTIONS.map(section => section.id));
  };

  const handleSelectNone = () => {
    setSelectedSections([]);
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      return;
    }

    const config: ExportConfig = {
      format,
      sections: selectedSections,
      includeCharts: includeCharts && (format === 'pdf' || format === 'excel'),
      includeRawData,
    };

    await onExport(config);
  };

  const selectedFormat = EXPORT_FORMATS.find(f => f.id === format);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Financial Report</span>
          </DialogTitle>
          <DialogDescription>
            Customize your financial report export with the format and sections you need.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Format Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Export Format</Label>
              <p className="text-sm text-gray-600 mb-4">Choose the format that best suits your needs</p>
            </div>

            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
              <div className="space-y-3">
                {EXPORT_FORMATS.map((formatOption) => (
                  <Card 
                    key={formatOption.id} 
                    className={`cursor-pointer transition-colors ${
                      format === formatOption.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setFormat(formatOption.id as any)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value={formatOption.id} id={formatOption.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <formatOption.icon className="h-4 w-4" />
                            <Label htmlFor={formatOption.id} className="font-medium cursor-pointer">
                              {formatOption.label}
                            </Label>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{formatOption.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {formatOption.features.map((feature, index) => (
                              <span 
                                key={index} 
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>

            {/* Export Options */}
            <div className="space-y-4">
              <Separator />
              <div>
                <Label className="text-base font-semibold">Export Options</Label>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                      disabled={format === 'csv' || format === 'json'}
                    />
                    <Label htmlFor="includeCharts" className="text-sm">
                      Include charts and visualizations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeRawData"
                      checked={includeRawData}
                      onCheckedChange={(checked) => setIncludeRawData(checked as boolean)}
                    />
                    <Label htmlFor="includeRawData" className="text-sm">
                      Include raw data tables
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Report Sections</Label>
                <p className="text-sm text-gray-600">Select which sections to include in your export</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedSections.length === EXPORT_SECTIONS.length}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectNone}
                  disabled={selectedSections.length === 0}
                >
                  Select None
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {EXPORT_SECTIONS.map((section) => (
                <Card 
                  key={section.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedSections.includes(section.id) ? 'ring-1 ring-blue-300 bg-blue-25' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSectionToggle(section.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={() => handleSectionToggle(section.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label className="font-medium cursor-pointer">
                          {section.label}
                        </Label>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Selected:</strong> {selectedSections.length} of {EXPORT_SECTIONS.length} sections
            </div>
          </div>
        </div>

        {/* Preview Information */}
        {selectedFormat && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800">Export Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-blue-700">
                <p><strong>Format:</strong> {selectedFormat.label}</p>
                <p><strong>Sections:</strong> {selectedSections.length} selected</p>
                <p><strong>Charts:</strong> {includeCharts && (format === 'pdf' || format === 'excel') ? 'Included' : 'Not included'}</p>
                <p><strong>Raw Data:</strong> {includeRawData ? 'Included' : 'Not included'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={selectedSections.length === 0 || exporting}
            className="min-w-[120px]"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 