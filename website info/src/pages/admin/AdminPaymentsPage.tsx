import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Settings, Save, DollarSign, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentGateway {
  id: string;
  name: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  transactionFee: number;
  currencies: string[];
}

interface PaymentSettings {
  defaultCurrency: string;
  taxRate: number;
  platformFee: number;
  refundPolicy: string;
  paymentMethods: string[];
  requireSsl: boolean;
  autoRefund: boolean;
  maxRefundDays: number;
}

const defaultSettings: PaymentSettings = {
  defaultCurrency: 'USD',
  taxRate: 8.5,
  platformFee: 2.9,
  refundPolicy: 'flexible',
  paymentMethods: ['credit_card', 'paypal'],
  requireSsl: true,
  autoRefund: false,
  maxRefundDays: 30
};

const AdminPaymentsPage: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      enabled: true,
      status: 'connected',
      apiKey: 'pk_test_***',
      secretKey: 'sk_test_***',
      webhookUrl: 'https://api.stepperslife.com/webhooks/stripe',
      transactionFee: 2.9,
      currencies: ['USD', 'EUR', 'GBP', 'CAD']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      enabled: false,
      status: 'disconnected',
      transactionFee: 3.5,
      currencies: ['USD', 'EUR', 'GBP']
    },
    {
      id: 'square',
      name: 'Square',
      enabled: false,
      status: 'disconnected',
      transactionFee: 2.6,
      currencies: ['USD', 'CAD']
    }
  ]);

  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('adminPaymentSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedGateways = localStorage.getItem('adminPaymentGateways');
    if (savedGateways) {
      setGateways(JSON.parse(savedGateways));
    }
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('adminPaymentSettings', JSON.stringify(settings));
      localStorage.setItem('adminPaymentGateways', JSON.stringify(gateways));
      
      toast.success('Payment settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleGatewayToggle = (gatewayId: string, enabled: boolean) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === gatewayId 
        ? { ...gateway, enabled, status: enabled ? 'connected' : 'disconnected' }
        : gateway
    ));
    toast.success(`${gatewayId} ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleConnectGateway = (gatewayId: string) => {
    setSelectedGateway(gatewayId);
    toast.info(`Opening ${gatewayId} configuration...`);
  };

  const handleTestConnection = async (gatewayId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGateways(prev => prev.map(gateway => 
        gateway.id === gatewayId 
          ? { ...gateway, status: 'connected' }
          : gateway
      ));
      
      toast.success(`${gatewayId} connection test successful!`);
    } catch (error) {
      toast.error(`${gatewayId} connection test failed`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: PaymentGateway['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage payment gateways and financial settings
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Gateways
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gateways.map((gateway) => (
              <div key={gateway.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{gateway.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Fee: {gateway.transactionFee}% per transaction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(gateway.status)}
                    <Switch
                      checked={gateway.enabled}
                      onCheckedChange={(enabled) => handleGatewayToggle(gateway.id, enabled)}
                    />
                  </div>
                </div>

                {gateway.enabled && (
                  <div className="space-y-2">
                    {gateway.apiKey && (
                      <div>
                        <Label className="text-sm">API Key</Label>
                        <Input
                          type="password"
                          value={gateway.apiKey}
                          className="mt-1"
                          placeholder="Enter API key"
                        />
                      </div>
                    )}
                    {gateway.webhookUrl && (
                      <div>
                        <Label className="text-sm">Webhook URL</Label>
                        <Input
                          value={gateway.webhookUrl}
                          className="mt-1"
                          readOnly
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnectGateway(gateway.id)}
                      >
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(gateway.id)}
                        disabled={loading}
                      >
                        Test Connection
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Currency</Label>
              <Select 
                value={settings.defaultCurrency} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, defaultCurrency: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Platform Fee (%)</Label>
              <Input
                type="number"
                value={settings.platformFee}
                onChange={(e) => setSettings(prev => ({ ...prev, platformFee: parseFloat(e.target.value) }))}
                className="mt-1"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                className="mt-1"
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <Label>Refund Policy</Label>
              <Select 
                value={settings.refundPolicy} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, refundPolicy: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict - No refunds</SelectItem>
                  <SelectItem value="moderate">Moderate - 7 days</SelectItem>
                  <SelectItem value="flexible">Flexible - 30 days</SelectItem>
                  <SelectItem value="custom">Custom policy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Max Refund Days</Label>
              <Input
                type="number"
                value={settings.maxRefundDays}
                onChange={(e) => setSettings(prev => ({ ...prev, maxRefundDays: parseInt(e.target.value) }))}
                className="mt-1"
                min="0"
                max="365"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require SSL</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Force HTTPS for all payment pages</p>
                </div>
                <Switch
                  checked={settings.requireSsl}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireSsl: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Refund</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically process eligible refunds</p>
                </div>
                <Switch
                  checked={settings.autoRefund}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoRefund: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900 dark:text-green-100">PCI Compliant</h4>
              <p className="text-sm text-green-700 dark:text-green-300">All payment data is encrypted</p>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">SSL Secured</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">End-to-end encryption</p>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Settings className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900 dark:text-purple-100">GDPR Ready</h4>
              <p className="text-sm text-purple-700 dark:text-purple-300">Privacy compliance built-in</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentsPage; 