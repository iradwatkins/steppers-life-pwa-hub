import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, PlusCircle, Edit3, Percent, Tag, CalendarOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker'; // Assuming a DatePicker component exists

interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usageLimit?: number;
  expiryDate?: Date;
  isActive: boolean;
}

const EventPromoCodesPage = () => {
  const eventId = 'mock-event-123'; // Placeholder
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([
    { id: 'promo1', code: 'SAVE10', discountType: 'fixed', discountValue: 10, usageLimit: 100, isActive: true, expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { id: 'promo2', code: 'SUMMER20', discountType: 'percentage', discountValue: 20, isActive: true },
    { id: 'promo3', code: 'EXPIRED', discountType: 'fixed', discountValue: 5, isActive: false, expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  ]);
  const [currentPromoCode, setCurrentPromoCode] = useState<Partial<PromoCode>>({
    code: '',
    discountType: 'fixed',
    discountValue: 0,
    isActive: true,
  });
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCurrentPromoCode(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleSelectChange = (name: keyof PromoCode, value: string | boolean) => {
    setCurrentPromoCode(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setCurrentPromoCode(prev => ({ ...prev, expiryDate: date }));
  };

  const handleAddOrUpdatePromoCode = () => {
    if (!currentPromoCode.code?.trim() || !currentPromoCode.discountType || (currentPromoCode.discountValue || 0) <= 0) {
      return alert('Please fill in code, discount type, and a valid discount value.');
    }

    if (editingPromoId) {
      setPromoCodes(promoCodes.map(p => p.id === editingPromoId ? { ...currentPromoCode, id: editingPromoId } as PromoCode : p));
      setEditingPromoId(null);
    } else {
      setPromoCodes([...promoCodes, { ...currentPromoCode, id: Date.now().toString(), isActive: currentPromoCode.isActive === undefined ? true : currentPromoCode.isActive } as PromoCode]);
    }
    setCurrentPromoCode({ code: '', discountType: 'fixed', discountValue: 0, isActive: true, usageLimit: undefined, expiryDate: undefined });
  };

  const handleEditPromoCode = (promo: PromoCode) => {
    setEditingPromoId(promo.id);
    setCurrentPromoCode(promo);
  };

  const handleDeletePromoCode = (id: string) => { // This will just toggle isActive for now
    setPromoCodes(promoCodes.map(p => p.id === id ? { ...p, isActive: false } : p));
  };
  
  const handleToggleActive = (id: string) => {
      setPromoCodes(promoCodes.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  return (
    <div className="min-h-screen bg-background-main py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-surface-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <Tag className="mr-2 h-6 w-6 text-brand-primary" />
              Manage Promotional Codes for Event: {eventId}
            </CardTitle>
            <CardDescription className="text-text-secondary">
              Create and manage discount codes to offer to your attendees.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Form for Adding/Editing Promo Code */}
            <div className="border border-border-default p-6 rounded-lg bg-background-main shadow space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingPromoId ? 'Edit Promo Code' : 'Add New Promo Code'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code" className="text-text-primary font-medium">Promo Code</Label>
                  <Input id="code" name="code" value={currentPromoCode.code || ''} onChange={handleInputChange} placeholder="e.g., SAVE20" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="discountType" className="text-text-primary font-medium">Discount Type</Label>
                  <Select onValueChange={(val) => handleSelectChange('discountType', val)} value={currentPromoCode.discountType || 'fixed'}>
                    <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountValue" className="text-text-primary font-medium">Discount Value</Label>
                  <Input id="discountValue" name="discountValue" type="number" value={currentPromoCode.discountValue || ''} onChange={handleInputChange} placeholder="e.g., 10 or 20" className="mt-1" min="0" />
                </div>
                <div>
                    <Label htmlFor="usageLimit" className="text-text-primary font-medium">Usage Limit (Optional)</Label>
                    <Input id="usageLimit" name="usageLimit" type="number" value={currentPromoCode.usageLimit || ''} onChange={handleInputChange} placeholder="e.g., 100" className="mt-1" min="0" />
                </div>
              </div>
               <div>
                  <Label htmlFor="expiryDate" className="text-text-primary font-medium">Expiry Date (Optional)</Label>
                  {/* Assuming you have a DatePicker component. If not, use Input type="date" */}
                  <DatePicker date={currentPromoCode.expiryDate} setDate={handleDateChange} />
                  {/* <Input id="expiryDate" name="expiryDate" type="date" value={currentPromoCode.expiryDate ? currentPromoCode.expiryDate.toISOString().split('T')[0] : ''} onChange={(e) => handleDateChange(new Date(e.target.value))} className="mt-1" /> */}
               </div>
              <Button onClick={handleAddOrUpdatePromoCode} className="mt-4 bg-brand-primary hover:bg-brand-primary-hover text-text-on-primary">
                <PlusCircle className="mr-2 h-4 w-4" /> {editingPromoId ? 'Update Code' : 'Add Code'}
              </Button>
              {editingPromoId && <Button onClick={() => { setEditingPromoId(null); setCurrentPromoCode({ code: '', discountType: 'fixed', discountValue: 0, isActive: true }); }} variant="outline" className="mt-4 ml-2">Cancel Edit</Button>}
            </div>

            <Separator />

            {/* List of Existing Promo Codes */}
            <div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Current Promo Codes ({promoCodes.length})</h3>
              {promoCodes.length === 0 ? (
                <p className="text-text-secondary">No promo codes defined yet.</p>
              ) : (
                <div className="space-y-4">
                  {promoCodes.map((p) => (
                    <Card key={p.id} className={`bg-background-main border-border-default ${!p.isActive ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className='flex-grow'>
                            <div className="flex items-center mb-1">
                                <span className={`font-bold text-lg mr-2 ${p.isActive ? 'text-text-primary' : 'text-text-tertiary line-through'}`}>{p.code}</span>
                                <Badge variant={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                            </div>
                            <p className="text-sm text-text-secondary">
                                Discount: {p.discountType === 'fixed' ? `$${p.discountValue}` : `${p.discountValue}%`}
                                {p.usageLimit && `, Limit: ${p.usageLimit}`}
                                {p.expiryDate && `, Expires: ${p.expiryDate.toLocaleDateString()}`}
                            </p>
                        </div>
                        <div className="flex space-x-2 flex-shrink-0">
                          <Button variant="outline" size="sm" onClick={() => handleEditPromoCode(p)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                            <Edit3 className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant={p.isActive ? "destructive" : "outline"} size="sm" onClick={() => handleToggleActive(p.id)}>
                            {p.isActive ? <><CalendarOff className="h-4 w-4 mr-1" /> Deactivate</> : <><PlusCircle className="h-4 w-4 mr-1"/> Activate</>}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventPromoCodesPage; 