import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Table, Section, Event } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { tableService } from '../../services/tableService';

interface TableSelectionProps {
  event: Event;
  onSelectionComplete: (selectedTable: {
    tableId: number;
    attendeeName: string;
    attendeeEmail: string;
    attendeePhone?: string;
  }) => void;
}

const tableSelectionSchema = z.object({
  tableId: z.number().min(1, 'Please select a table'),
  attendeeName: z.string().min(1, 'Name is required'),
  attendeeEmail: z.string().email('Invalid email address'),
  attendeePhone: z.string().optional()
});

type TableSelectionFormData = z.infer<typeof tableSelectionSchema>;

export const TableSelection: React.FC<TableSelectionProps> = ({
  event,
  onSelectionComplete
}) => {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TableSelectionFormData>({
    resolver: zodResolver(tableSelectionSchema)
  });

  React.useEffect(() => {
    const loadSections = async () => {
      try {
        const response = await tableService.getSections(event.id);
        if (response.success && response.data) {
          setSections(response.data);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load table sections',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, [event.id, toast]);

  const handleTableSelect = (table: Table) => {
    if (tableService.isTableAvailable(table)) {
      setSelectedTable(table);
    } else {
      toast({
        title: 'Table Unavailable',
        description: 'This table is not available for reservation',
        variant: 'destructive'
      });
    }
  };

  const onSubmit = (data: TableSelectionFormData) => {
    if (!selectedTable) {
      toast({
        title: 'Error',
        description: 'Please select a table',
        variant: 'destructive'
      });
      return;
    }

    onSelectionComplete({
      tableId: selectedTable.id,
      attendeeName: data.attendeeName,
      attendeeEmail: data.attendeeEmail,
      attendeePhone: data.attendeePhone
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.name}</CardTitle>
            {section.description && (
              <p className="text-sm text-text-secondary">{section.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.tables.map((table) => (
                <div
                  key={table.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTable?.id === table.id
                      ? 'border-brand-primary bg-brand-primary/5'
                      : tableService.isTableAvailable(table)
                      ? 'border-border-default hover:border-brand-primary/50'
                      : 'border-border-default opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleTableSelect(table)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-text-primary">{table.name}</h4>
                      <p className="text-sm text-text-secondary">
                        {table.capacity} seats
                      </p>
                    </div>
                    <span className="text-xl font-bold text-brand-primary">
                      ${table.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge
                      variant={
                        tableService.isTableAvailable(table)
                          ? 'default'
                          : tableService.isTableReserved(table)
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {tableService.getTableStatusText(table.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Reservation Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="attendeeName">Name</Label>
                <Input
                  id="attendeeName"
                  {...register('attendeeName')}
                  placeholder="Enter your name"
                />
                {errors.attendeeName && (
                  <p className="text-sm text-feedback-error">{errors.attendeeName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendeeEmail">Email</Label>
                <Input
                  id="attendeeEmail"
                  type="email"
                  {...register('attendeeEmail')}
                  placeholder="Enter your email"
                />
                {errors.attendeeEmail && (
                  <p className="text-sm text-feedback-error">{errors.attendeeEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendeePhone">Phone (Optional)</Label>
                <Input
                  id="attendeePhone"
                  type="tel"
                  {...register('attendeePhone')}
                  placeholder="Enter your phone number"
                />
                {errors.attendeePhone && (
                  <p className="text-sm text-feedback-error">{errors.attendeePhone.message}</p>
                )}
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-secondary">Table Price</span>
                  <span className="font-semibold">
                    ${selectedTable.price.toFixed(2)}
                  </span>
                </div>
                <Button type="submit" className="w-full">
                  Reserve Table
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 