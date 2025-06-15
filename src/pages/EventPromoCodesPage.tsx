import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Percent,
  ArrowLeft,
  Edit3,
  Eye,
  BarChart3
} from 'lucide-react';
import type { PromoCode } from '@/types/ticket';

const promoCodeSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code must be less than 20 characters'),
  type: z.enum(['percentage', 'fixed']),
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
  validFrom: z.string().min(1, 'Start date is required'),
  validUntil: z.string().min(1, 'End date is required'),
  usageLimit: z.string().optional(),
  isActive: z.boolean().default(true)
});

type PromoCodeFormData = z.infer<typeof promoCodeSchema>;

const EventPromoCodesPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

  const form = useForm<PromoCodeFormData>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      isActive: true
    }
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockPromoCodes: PromoCode[] = [
      {
        id: 1,
        event_id: parseInt(eventId || '1'),
        code: 'EARLY20',
        type: 'percentage',
        value: 20,
        description: 'Early bird discount',
        is_active: true,
        valid_from: '2024-01-01T00:00:00Z',
        valid_until: '2024-12-31T23:59:59Z',
        usage_limit: 100,
        used_count: 25,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        event_id: parseInt(eventId || '1'),
        code: 'SAVE50',
        type: 'fixed',
        value: 50,
        description: 'Fixed $50 discount',
        is_active: false,
        valid_from: '2024-06-01T00:00:00Z',
        valid_until: '2024-06-30T23:59:59Z',
        usage_limit: 50,
        used_count: 12,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
    
    setPromoCodes(mockPromoCodes);
    setIsLoading(false);
  }, [eventId]);

  const onSubmit = async (data: PromoCodeFormData) => {
    setIsSubmitting(true);
    try {
      const newPromoCode: PromoCode = {
        id: Date.now(), // Mock ID generation
        event_id: parseInt(eventId || '1'),
        code: data.code.toUpperCase(),
        type: data.type,
        value: parseFloat(data.value),
        description: data.description,
        is_active: data.isActive,
        valid_from: new Date(data.validFrom).toISOString(),
        valid_until: new Date(data.validUntil).toISOString(),
        usage_limit: data.usageLimit ? parseInt(data.usageLimit) : undefined,
        used_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingCode) {
        // Update existing promo code
        setPromoCodes(prev => prev.map(pc => 
          pc.id === editingCode.id ? { ...newPromoCode, id: editingCode.id, used_count: editingCode.used_count } : pc
        ));
        toast('Promo code updated successfully');
        setEditingCode(null);
      } else {
        // Add new promo code
        setPromoCodes(prev => [...prev, newPromoCode]);
        toast('Promo code created successfully');
      }

      form.reset();
    } catch (error) {
      toast('Failed to save promo code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    form.reset({
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value.toString(),
      description: promoCode.description || '',
      validFrom: promoCode.valid_from.split('T')[0],
      validUntil: promoCode.valid_until.split('T')[0],
      usageLimit: promoCode.usage_limit?.toString() || '',
      isActive: promoCode.is_active
    });
  };

  const handleToggleActive = async (promoCodeId: number) => {
    setPromoCodes(prev => prev.map(pc => 
      pc.id === promoCodeId ? { ...pc, is_active: !pc.is_active } : pc
    ));
    toast('Promo code status updated');
  };

  const handleDelete = async (promoCodeId: number) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      setPromoCodes(prev => prev.filter(pc => pc.id !== promoCodeId));
      toast('Promo code deleted successfully');
    }
  };

  const formatValue = (type: 'percentage' | 'fixed', value: number) => {
    return type === 'percentage' ? `${value}%` : `$${value}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Promo Codes</h1>
          <p className="text-muted-foreground">Create and manage promotional discount codes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Promo Code Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingCode ? 'Edit Promo Code' : 'Create New Promo Code'}
            </CardTitle>
            <CardDescription>
              {editingCode ? 'Update existing promo code details' : 'Add a new promotional discount code for your event'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promo Code</FormLabel>
                      <FormControl>
                        <Input placeholder="SUMMER25" {...field} className="uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch('type') === 'percentage' ? 'Percentage' : 'Dollar Amount'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step={form.watch('type') === 'percentage' ? '1' : '0.01'}
                            min="0"
                            max={form.watch('type') === 'percentage' ? '100' : undefined}
                            placeholder={form.watch('type') === 'percentage' ? '20' : '50.00'}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Early bird special discount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid From</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valid Until</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Limit (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="100"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable this promo code for use
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editingCode ? 'Update Code' : 'Create Code'}
                  </Button>
                  {editingCode && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingCode(null);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Existing Promo Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Existing Promo Codes ({promoCodes.length})
            </CardTitle>
            <CardDescription>
              Manage your current promotional codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {promoCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No promo codes created yet</p>
                <p className="text-sm">Create your first promo code to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {promoCodes.map((promoCode) => (
                  <div
                    key={promoCode.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{promoCode.code}</h3>
                          <Badge variant={promoCode.is_active ? 'default' : 'secondary'}>
                            {promoCode.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {formatValue(promoCode.type, promoCode.value)} off
                          </Badge>
                        </div>
                        {promoCode.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {promoCode.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(promoCode)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(promoCode.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(promoCode.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valid Period</p>
                        <p>{formatDate(promoCode.valid_from)} - {formatDate(promoCode.valid_until)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Usage</p>
                        <p>
                          {promoCode.used_count}
                          {promoCode.usage_limit && ` / ${promoCode.usage_limit}`} used
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventPromoCodesPage;