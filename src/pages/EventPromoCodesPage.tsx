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
import { DatePicker } from '@/components/ui/date-picker';
import { useAuth } from '@/hooks/useAuth';
import { PromoCodeService } from '@/services/promoCodeService';
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
  BarChart3,
  RefreshCw
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type PromoCode = Database['public']['Tables']['promo_codes']['Row'];

const promoCodeSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code must be less than 20 characters'),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  maxUses: z.string().optional(),
  minimumOrderAmount: z.string().optional(),
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
      discountType: 'percentage',
      discountValue: '',
      description: '',
      validFrom: '',
      validUntil: '',
      maxUses: '',
      minimumOrderAmount: '',
      isActive: true
    }
  });

  // Load promo codes from database
  useEffect(() => {
    const loadPromoCodes = async () => {
      if (!eventId) return;
      
      setIsLoading(true);
      try {
        const codes = await PromoCodeService.getPromoCodesByEvent(eventId);
        setPromoCodes(codes);
      } catch (error) {
        console.error('Error loading promo codes:', error);
        toast.error('Failed to load promo codes');
      } finally {
        setIsLoading(false);
      }
    };

    loadPromoCodes();
  }, [eventId]);

  const onSubmit = async (data: PromoCodeFormData) => {
    if (!eventId) return;
    
    setIsSubmitting(true);
    try {
      if (editingCode) {
        // Update existing promo code
        const updated = await PromoCodeService.updatePromoCode(editingCode.id, {
          code: data.code.toUpperCase(),
          discount_type: data.discountType,
          discount_value: parseFloat(data.discountValue),
          description: data.description || null,
          valid_from: data.validFrom || null,
          valid_until: data.validUntil || null,
          max_uses: data.maxUses ? parseInt(data.maxUses) : null,
          minimum_order_amount: data.minimumOrderAmount ? parseFloat(data.minimumOrderAmount) : null,
          is_active: data.isActive,
        });

        if (updated) {
          setPromoCodes(prev => prev.map(pc => 
            pc.id === editingCode.id ? updated : pc
          ));
          toast.success('Promo code updated successfully');
          setEditingCode(null);
        } else {
          throw new Error('Failed to update promo code');
        }
      } else {
        // Create new promo code
        const created = await PromoCodeService.createPromoCode({
          eventId,
          code: data.code.toUpperCase(),
          discountType: data.discountType,
          discountValue: parseFloat(data.discountValue),
          description: data.description || undefined,
          validFrom: data.validFrom || undefined,
          validUntil: data.validUntil || undefined,
          maxUses: data.maxUses ? parseInt(data.maxUses) : undefined,
          minimumOrderAmount: data.minimumOrderAmount ? parseFloat(data.minimumOrderAmount) : undefined,
          isActive: data.isActive,
        });

        if (created) {
          setPromoCodes(prev => [...prev, created]);
          toast.success('Promo code created successfully');
        } else {
          throw new Error('Failed to create promo code');
        }
      }

      form.reset();
    } catch (error) {
      console.error('Error saving promo code:', error);
      toast.error('Failed to save promo code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingCode(promoCode);
    form.reset({
      code: promoCode.code,
      discountType: promoCode.discount_type,
      discountValue: promoCode.discount_value.toString(),
      description: promoCode.description || '',
      validFrom: promoCode.valid_from ? promoCode.valid_from.split('T')[0] : '',
      validUntil: promoCode.valid_until ? promoCode.valid_until.split('T')[0] : '',
      maxUses: promoCode.max_uses?.toString() || '',
      minimumOrderAmount: promoCode.minimum_order_amount?.toString() || '',
      isActive: promoCode.is_active
    });
  };

  const handleToggleActive = async (promoCodeId: string) => {
    try {
      const promoCode = promoCodes.find(pc => pc.id === promoCodeId);
      if (!promoCode) return;

      const success = await PromoCodeService.togglePromoCodeStatus(promoCodeId, !promoCode.is_active);
      if (success) {
        setPromoCodes(prev => prev.map(pc => 
          pc.id === promoCodeId ? { ...pc, is_active: !pc.is_active } : pc
        ));
        toast.success('Promo code status updated');
      } else {
        toast.error('Failed to update promo code status');
      }
    } catch (error) {
      console.error('Error toggling promo code status:', error);
      toast.error('Failed to update promo code status');
    }
  };

  const handleDelete = async (promoCodeId: string) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      try {
        const success = await PromoCodeService.deletePromoCode(promoCodeId);
        if (success) {
          setPromoCodes(prev => prev.filter(pc => pc.id !== promoCodeId));
          toast.success('Promo code deleted successfully');
        } else {
          toast.error('Failed to delete promo code');
        }
      } catch (error) {
        console.error('Error deleting promo code:', error);
        toast.error('Failed to delete promo code');
      }
    }
  };

  const formatValue = (type: 'percentage' | 'fixed_amount', value: number) => {
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
                    name="discountType"
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
                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch('discountType') === 'percentage' ? 'Percentage' : 'Dollar Amount'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step={form.watch('discountType') === 'percentage' ? '1' : '0.01'}
                            min="0"
                            max={form.watch('discountType') === 'percentage' ? '100' : undefined}
                            placeholder={form.watch('discountType') === 'percentage' ? '20' : '50.00'}
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
                        <FormLabel>Valid From (Optional)</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                            placeholder="Select start date"
                          />
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
                        <FormLabel>Valid Until (Optional)</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value ? new Date(field.value) : undefined}
                            onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                            placeholder="Select end date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxUses"
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
                    name="minimumOrderAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Amount (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="50.00"
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Existing Promo Codes ({promoCodes.length})
                </CardTitle>
                <CardDescription>
                  Manage your current promotional codes
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (eventId) {
                    setIsLoading(true);
                    PromoCodeService.getPromoCodesByEvent(eventId).then(setPromoCodes).finally(() => setIsLoading(false));
                  }
                }}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
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
                            {formatValue(promoCode.discount_type, promoCode.discount_value)} off
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
                        <p>
                          {promoCode.valid_from ? formatDate(promoCode.valid_from) : 'No start date'} - {promoCode.valid_until ? formatDate(promoCode.valid_until) : 'No end date'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Usage</p>
                        <p>
                          {promoCode.used_count}
                          {promoCode.max_uses && ` / ${promoCode.max_uses}`} used
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