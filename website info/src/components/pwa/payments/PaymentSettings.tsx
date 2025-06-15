import React, { useState } from 'react';
import { Settings, Wifi, WifiOff, RefreshCw, CreditCard, Shield, Save, AlertTriangle } from 'lucide-react';
import { PaymentMethod, PaymentSettings as PaymentSettingsType } from '../../../lib/services/pwaPaymentService';

interface PaymentSettingsProps {
  settings: PaymentSettingsType;
  paymentMethods: PaymentMethod[];
  pendingSyncCount: number;
  isOnline: boolean;
  onUpdateSettings: (settings: Partial<PaymentSettingsType>) => Promise<void>;
  onTogglePaymentMethod: (methodId: string, enabled: boolean) => Promise<void>;
  onSyncTransactions: () => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({
  settings,
  paymentMethods,
  pendingSyncCount,
  isOnline,
  onUpdateSettings,
  onTogglePaymentMethod,
  onSyncTransactions,
  formatCurrency
}) => {
  const [localSettings, setLocalSettings] = useState<PaymentSettingsType>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'methods' | 'security' | 'sync'>('general');
  
  // Handle settings save
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await onUpdateSettings(localSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle sync
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncTransactions();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Check if settings have changed
  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
  
  const sections = [
    { id: 'general' as const, label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'methods' as const, label: 'Payment Methods', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security' as const, label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'sync' as const, label: 'Sync & Offline', icon: <RefreshCw className="w-4 h-4" /> }
  ];
  
  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="flex">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* General Settings */}
      {activeSection === 'general' && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={localSettings.currency}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={localSettings.taxRate * 100}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  taxRate: parseFloat(e.target.value) / 100 || 0 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="8.25"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Number Prefix
              </label>
              <input
                type="text"
                value={localSettings.receiptPrefix}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, receiptPrefix: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="RCP"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-print receipts</label>
                <p className="text-sm text-gray-500">Automatically print receipts after successful payments</p>
              </div>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, autoPrintReceipts: !prev.autoPrintReceipts }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  localSettings.autoPrintReceipts ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localSettings.autoPrintReceipts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Require signatures</label>
                <p className="text-sm text-gray-500">Require digital signatures for transactions over threshold</p>
              </div>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, requireSignature: !prev.requireSignature }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  localSettings.requireSignature ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localSettings.requireSignature ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            {localSettings.requireSignature && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={localSettings.signatureThreshold}
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    signatureThreshold: parseFloat(e.target.value) || 0 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25.00"
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Payment Methods */}
      {activeSection === 'methods' && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{method.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{method.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{method.type.replace('_', ' ')}</p>
                    {method.processingFee && (
                      <p className="text-sm text-gray-500">
                        Processing fee: {(method.processingFee * 100).toFixed(2)}%
                      </p>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => onTogglePaymentMethod(method.id, !method.enabled)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    method.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      method.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Security Settings */}
      {activeSection === 'security' && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable PCI compliance mode</label>
                <p className="text-sm text-gray-500">Enhanced security for card transactions</p>
              </div>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, pciCompliant: !prev.pciCompliant }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  localSettings.pciCompliant ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localSettings.pciCompliant ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Encrypt offline data</label>
                <p className="text-sm text-gray-500">Encrypt payment data stored locally</p>
              </div>
              <button
                onClick={() => setLocalSettings(prev => ({ ...prev, encryptOfflineData: !prev.encryptOfflineData }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  localSettings.encryptOfflineData ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    localSettings.encryptOfflineData ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction timeout (seconds)
              </label>
              <input
                type="number"
                min="10"
                max="300"
                value={localSettings.transactionTimeout}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  transactionTimeout: parseInt(e.target.value) || 60 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    These security settings affect how payment data is handled. Changes may require app restart.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sync & Offline Settings */}
      {activeSection === 'sync' && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Sync & Offline</h3>
          
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <span className="font-medium text-gray-900">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                  <p className="text-sm text-gray-500">
                    {isOnline 
                      ? 'Connected to server' 
                      : 'Working in offline mode'
                    }
                  </p>
                </div>
              </div>
              
              {pendingSyncCount > 0 && (
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {pendingSyncCount} pending
                </div>
              )}
            </div>
            
            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing 
                  ? 'Syncing...' 
                  : isOnline 
                    ? `Sync Now${pendingSyncCount > 0 ? ` (${pendingSyncCount})` : ''}` 
                    : 'Offline - Cannot Sync'
                }
              </span>
            </button>
            
            {/* Offline Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-sync when online</label>
                  <p className="text-sm text-gray-500">Automatically sync pending transactions when connection is restored</p>
                </div>
                <button
                  onClick={() => setLocalSettings(prev => ({ ...prev, autoSync: !prev.autoSync }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    localSettings.autoSync ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      localSettings.autoSync ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sync interval (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={localSettings.syncInterval}
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    syncInterval: parseInt(e.target.value) || 30 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max offline transactions
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={localSettings.maxOfflineTransactions}
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    maxOfflineTransactions: parseInt(e.target.value) || 100 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Save Button */}
      {hasChanges && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">You have unsaved changes</p>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettings; 