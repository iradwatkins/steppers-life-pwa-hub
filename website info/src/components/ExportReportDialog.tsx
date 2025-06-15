import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Download } from 'lucide-react';

interface ExportReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (format: 'csv' | 'pdf' | 'excel', dateRange: { start: Date; end: Date }) => void;
}

export const ExportReportDialog: React.FC<ExportReportDialogProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [format, setFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      onSubmit(format, {
        start: new Date(startDate),
        end: new Date(endDate)
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export Sales Report
          </DialogTitle>
          <DialogDescription>
            Export your sales data for a specific date range
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={format}
              onValueChange={(value: any) => setFormat(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                <SelectItem value="excel">Excel Workbook</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Report will include:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Sales transactions</li>
              <li>Commission details</li>
              <li>Customer information</li>
              <li>Event performance metrics</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!startDate || !endDate}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 