import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  DollarSign, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';

interface PaymentMethod {
  id: string;
  type: 'paypal' | 'cashapp' | 'bank';
  identifier: string; // email, $cashtag, or account number
  isDefault: boolean;
  isVerified: boolean;
  displayName?: string;
}

interface PaymentSettings {
  preferredMethod: string;
  methods: PaymentMethod[];
  minimumPayout: number;
  autoPayoutEnabled: boolean;
  payoutFrequency: 'daily' | 'weekly' | 'monthly';
  taxInfo: {
    businessName?: string;
    taxId?: string;
    address?: string;
  };
}

interface PaymentSettingsProps {
  userRole: string;
  onSettingsChange?: (settings: PaymentSettings) => void;
}

const PaymentSettingsComponent: React.FC<PaymentSettingsProps> = ({ 
  userRole, 
  onSettingsChange 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [editingMethod, setEditingMethod] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<PaymentSettings>({
    preferredMethod: '',
    methods: [],
    minimumPayout: 50.00,
    autoPayoutEnabled: true,
    payoutFrequency: 'weekly',
    taxInfo: {}
  });

  const [newMethod, setNewMethod] = useState({
    type: 'paypal' as 'paypal' | 'cashapp' | 'bank',
    identifier: '',
    displayName: ''
  });

  // Mock data - in real app this would come from API
  useEffect(() => {
    if (userRole === 'organizer' || userRole === 'sales_agent') {
      const mockSettings: PaymentSettings = {
        preferredMethod: 'paypal-1',
        methods: [
          {
            id: 'paypal-1',
            type: 'paypal',
            identifier: 'organizer@example.com',
            isDefault: true,
            isVerified: true,
            displayName: 'Primary PayPal'
          },
          {
            id: 'cashapp-1',
            type: 'cashapp',
            identifier: '$MyEventCashtag',
            isDefault: false,
            isVerified: true,
            displayName: 'Event Cash App'
          }
        ],
        minimumPayout: 50.00,
        autoPayoutEnabled: true,
        payoutFrequency: 'weekly',
        taxInfo: {
          businessName: 'Event Planning LLC',
          taxId: '12-3456789'
        }
      };
      setSettings(mockSettings);
    }
  }, [userRole]);

  // Only show for roles that can receive payouts
  if (!['organizer', 'sales_agent', 'instructor'].includes(userRole)) {
    return null;
  }

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In real app, this would save to API
      console.log('Saving payment settings:', settings);
      
      toast({
        title: "Settings Saved",
        description: "Your payment preferences have been updated successfully.",
      });
      
      onSettingsChange?.(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save payment settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = () => {
    if (!newMethod.identifier.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid payment identifier.",
        variant: "destructive"
      });
      return;
    }

    // Validate format based on type
    if (newMethod.type === 'cashapp' && !newMethod.identifier.startsWith('$')) {
      toast({
        title: "Invalid Format",
        description: "Cash App tags must start with $",
        variant: "destructive"
      });
      return;
    }

    const method: PaymentMethod = {
      id: `${newMethod.type}-${Date.now()}`,
      type: newMethod.type,
      identifier: newMethod.identifier,
      isDefault: settings.methods.length === 0,
      isVerified: false,
      displayName: newMethod.displayName || `${newMethod.type} account`
    };

    setSettings(prev => ({
      ...prev,
      methods: [...prev.methods, method],
      preferredMethod: prev.preferredMethod || method.id
    }));

    setNewMethod({ type: 'paypal', identifier: '', displayName: '' });
    
    toast({
      title: "Payment Method Added",
      description: "Your new payment method has been added. Verification may be required.",
    });
  };

  const handleRemoveMethod = (methodId: string) => {
    setSettings(prev => {
      const newMethods = prev.methods.filter(m => m.id !== methodId);
      return {
        ...prev,
        methods: newMethods,
        preferredMethod: prev.preferredMethod === methodId 
          ? (newMethods[0]?.id || '') 
          : prev.preferredMethod
      };
    });
    
    toast({
      title: "Payment Method Removed",
      description: "The payment method has been removed from your account.",
    });
  };

  const handleSetDefault = (methodId: string) => {
    setSettings(prev => ({
      ...prev,
      preferredMethod: methodId,
      methods: prev.methods.map(m => ({
        ...m,
        isDefault: m.id === methodId
      }))
    }));
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'paypal': return '💙';
      case 'cashapp': return '💚';
      case 'bank': return '🏦';
      default: return '💳';
    }
  };

  const formatIdentifier = (method: PaymentMethod) => {
    if (!showSensitive && method.type !== 'cashapp') {
      const identifier = method.identifier;
      if (method.type === 'paypal') {
        return identifier.replace(/(.{3}).*(@.*)/, '$1***$2');
      }
      return identifier.slice(0, 4) + '***' + identifier.slice(-4);
    }
    return method.identifier;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment & Payout Settings
            <Badge variant="secondary" className="ml-auto">
              {userRole === 'organizer' ? 'Event Organizer' : 
               userRole === 'sales_agent' ? 'Sales Agent' : 'Instructor'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="methods" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="methods">Payment Methods</TabsTrigger>
              <TabsTrigger value="preferences">Payout Preferences</TabsTrigger>
              <TabsTrigger value="tax">Tax Information</TabsTrigger>
            </TabsList>

            <TabsContent value="methods" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Your Payment Methods</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSensitive(!showSensitive)}
                >
                  {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showSensitive ? 'Hide' : 'Show'} Details
                </Button>
              </div>

              {/* Existing Payment Methods */}
              <div className="space-y-3">
                {settings.methods.map((method) => (
                  <Card key={method.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getMethodIcon(method.type)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{method.type}</span>
                            {method.isDefault && (
                              <Badge variant="default" className="text-xs">Default</Badge>
                            )}
                            {method.isVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{formatIdentifier(method)}</p>
                          {method.displayName && (
                            <p className="text-xs text-gray-500">{method.displayName}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator />

              {/* Add New Payment Method */}
              <div className="space-y-4">
                <h4 className="font-medium">Add New Payment Method</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="method-type">Type</Label>
                    <Select 
                      value={newMethod.type} 
                      onValueChange={(value) => setNewMethod(prev => ({ 
                        ...prev, 
                        type: value as 'paypal' | 'cashapp' | 'bank' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="cashapp">Cash App</SelectItem>
                        <SelectItem value="bank">Bank Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="method-identifier">
                      {newMethod.type === 'paypal' ? 'Email Address' :
                       newMethod.type === 'cashapp' ? '$Cashtag' : 'Account Number'}
                    </Label>
                    <Input
                      id="method-identifier"
                      value={newMethod.identifier}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, identifier: e.target.value }))}
                      placeholder={
                        newMethod.type === 'paypal' ? 'your@email.com' :
                        newMethod.type === 'cashapp' ? '$YourCashtag' : 'Account number'
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="method-name">Display Name (Optional)</Label>
                    <Input
                      id="method-name"
                      value={newMethod.displayName}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="e.g., Business PayPal"
                    />
                  </div>
                </div>
                <Button onClick={handleAddMethod} className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="min-payout">Minimum Payout Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="min-payout"
                        type="number"
                        min="10"
                        max="1000"
                        step="10"
                        value={settings.minimumPayout}
                        onChange={(e) => setSettings(prev => ({ 
                          ...prev, 
                          minimumPayout: parseFloat(e.target.value) || 50 
                        }))}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Payouts will only be sent when your balance reaches this amount
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="payout-frequency">Payout Frequency</Label>
                    <Select 
                      value={settings.payoutFrequency} 
                      onValueChange={(value) => setSettings(prev => ({ 
                        ...prev, 
                        payoutFrequency: value as 'daily' | 'weekly' | 'monthly' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Payouts</Label>
                      <p className="text-sm text-gray-500">
                        Automatically send payouts when balance reaches minimum
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoPayoutEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({ 
                        ...prev, 
                        autoPayoutEnabled: checked 
                      }))}
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Current Balance</h4>
                    <div className="text-2xl font-bold text-green-600">$247.50</div>
                    <p className="text-sm text-gray-500">Available for payout</p>
                    <Button size="sm" className="mt-2">Request Payout</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tax" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="business-name">Business Name (Optional)</Label>
                  <Input
                    id="business-name"
                    value={settings.taxInfo.businessName || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      taxInfo: { ...prev.taxInfo, businessName: e.target.value }
                    }))}
                    placeholder="Your business or organization name"
                  />
                </div>

                <div>
                  <Label htmlFor="tax-id">Tax ID / EIN (Optional)</Label>
                  <Input
                    id="tax-id"
                    value={settings.taxInfo.taxId || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      taxInfo: { ...prev.taxInfo, taxId: e.target.value }
                    }))}
                    placeholder="XX-XXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for tax reporting if earnings exceed $600/year
                  </p>
                </div>

                <div>
                  <Label htmlFor="tax-address">Business Address (Optional)</Label>
                  <Input
                    id="tax-address"
                    value={settings.taxInfo.address || ''}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      taxInfo: { ...prev.taxInfo, address: e.target.value }
                    }))}
                    placeholder="Business address for tax documents"
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Tax Information</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    As a {userRole}, your earnings may be subject to tax reporting. 
                    We'll send you appropriate tax documents at year-end.
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 1099-NEC forms sent for earnings over $600</li>
                    <li>• Keep records of your expenses for tax deductions</li>
                    <li>• Consult a tax professional for specific advice</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? (
                <>Loading...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettingsComponent; 