import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  CreditCard, 
  Bell, 
  UserX, 
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useBuyerAccount } from '@/hooks/useBuyerAccount';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';

const AccountSettings = () => {
  const {
    loading,
    paymentMethods,
    securityActivity,
    preferences,
    addPaymentMethod,
    removePaymentMethod,
    changePassword,
    requestAccountDeletion,
    exportAccountData,
    updatePreferences
  } = useBuyerAccount();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Payment method form
  const [paymentForm, setPaymentForm] = useState({
    type: 'card' as 'card' | 'paypal' | 'apple_pay' | 'google_pay',
    last_four: '',
    brand: '',
    expiry_month: '',
    expiry_year: '',
    nickname: '',
    is_default: false
  });

  // Account deletion form
  const [deletionForm, setDeletionForm] = useState({
    reason: ''
  });

  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [paymentMethodLoading, setPaymentMethodLoading] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setPasswordChangeLoading(true);
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (result.success) {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    setPasswordChangeLoading(false);
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentMethodLoading(true);
    const result = await addPaymentMethod({
      type: paymentForm.type,
      last_four: paymentForm.last_four,
      brand: paymentForm.brand,
      expiry_month: paymentForm.expiry_month ? parseInt(paymentForm.expiry_month) : undefined,
      expiry_year: paymentForm.expiry_year ? parseInt(paymentForm.expiry_year) : undefined,
      nickname: paymentForm.nickname,
      is_default: paymentForm.is_default
    });
    
    if (result.success) {
      setPaymentForm({
        type: 'card',
        last_four: '',
        brand: '',
        expiry_month: '',
        expiry_year: '',
        nickname: '',
        is_default: false
      });
    }
    setPaymentMethodLoading(false);
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    await removePaymentMethod(paymentMethodId);
  };

  const handleRequestDeletion = async () => {
    setDeletionLoading(true);
    await requestAccountDeletion(deletionForm.reason);
    setDeletionLoading(false);
  };

  const handleExportData = async () => {
    setExportLoading(true);
    await exportAccountData();
    setExportLoading(false);
  };

  const handleNotificationPreferenceChange = async (setting: string, value: boolean) => {
    if (preferences) {
      const updatedPreferences = {
        ...preferences,
        notification_settings: {
          ...preferences.notification_settings,
          [setting]: value
        }
      };
      await updatePreferences(updatedPreferences);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return { minLength, hasUpper, hasLower, hasNumber };
  };

  const passwordValidation = validatePassword(passwordForm.newPassword);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  return (
    <div className="min-h-screen bg-background-main py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">Account Settings</h1>
          <p className="text-text-secondary">Manage your security, privacy, and account preferences</p>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Password Change */}
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {/* Password validation */}
                    {passwordForm.newPassword && (
                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-text-secondary">Password requirements:</p>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className={`flex items-center gap-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-text-secondary'}`}>
                            <CheckCircle className="h-3 w-3" />
                            At least 6 characters
                          </div>
                          <div className={`flex items-center gap-1 ${passwordValidation.hasUpper ? 'text-green-600' : 'text-text-secondary'}`}>
                            <CheckCircle className="h-3 w-3" />
                            Uppercase letter
                          </div>
                          <div className={`flex items-center gap-1 ${passwordValidation.hasLower ? 'text-green-600' : 'text-text-secondary'}`}>
                            <CheckCircle className="h-3 w-3" />
                            Lowercase letter
                          </div>
                          <div className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-text-secondary'}`}>
                            <CheckCircle className="h-3 w-3" />
                            Number
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={passwordChangeLoading || !isPasswordValid || passwordForm.newPassword !== passwordForm.confirmPassword}
                    className="flex items-center gap-2"
                  >
                    {passwordChangeLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Security Activity */}
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <CardTitle>Recent Security Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {securityActivity.length > 0 ? (
                  <div className="space-y-3">
                    {securityActivity.slice(0, 5).map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          activity.is_suspicious 
                            ? 'bg-destructive/10 border-destructive/20' 
                            : 'bg-background-main border-border-default'
                        }`}
                      >
                        {activity.is_suspicious && (
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                        <Shield className={`h-4 w-4 flex-shrink-0 ${
                          activity.is_suspicious ? 'text-destructive' : 'text-brand-primary'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary">{activity.action}</p>
                          <p className="text-xs text-text-secondary">{activity.description}</p>
                        </div>
                        <div className="text-xs text-text-secondary">
                          {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent security activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment" className="space-y-6">
            {/* Saved Payment Methods */}
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Saved Payment Methods</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Payment Method</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddPaymentMethod} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nickname">Nickname</Label>
                          <Input
                            id="nickname"
                            value={paymentForm.nickname}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, nickname: e.target.value }))}
                            placeholder="My Credit Card"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="last_four">Last 4 Digits</Label>
                          <Input
                            id="last_four"
                            value={paymentForm.last_four}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, last_four: e.target.value }))}
                            placeholder="1234"
                            maxLength={4}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="brand">Card Brand</Label>
                            <Input
                              id="brand"
                              value={paymentForm.brand}
                              onChange={(e) => setPaymentForm(prev => ({ ...prev, brand: e.target.value }))}
                              placeholder="Visa"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              <input
                                type="checkbox"
                                checked={paymentForm.is_default}
                                onChange={(e) => setPaymentForm(prev => ({ ...prev, is_default: e.target.checked }))}
                                className="mr-2"
                              />
                              Set as default
                            </Label>
                          </div>
                        </div>

                        <Button type="submit" disabled={paymentMethodLoading} className="w-full">
                          {paymentMethodLoading ? 'Adding...' : 'Add Payment Method'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 bg-background-main rounded-lg border border-border-default"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-brand-primary" />
                          <div>
                            <p className="font-medium text-text-primary">
                              {method.nickname || `${method.brand} ending in ${method.last_four}`}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {method.brand} •••• {method.last_four}
                              {method.expiry_month && method.expiry_year && 
                                ` • Expires ${method.expiry_month}/${method.expiry_year}`
                              }
                            </p>
                          </div>
                          {method.is_default && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this payment method? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleRemovePaymentMethod(method.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No saved payment methods</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Recommendations</Label>
                      <p className="text-sm text-text-secondary">Receive event recommendations via email</p>
                    </div>
                    <Switch
                      checked={preferences?.notification_settings?.email_recommendations || false}
                      onCheckedChange={(checked) => handleNotificationPreferenceChange('email_recommendations', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Reminders</Label>
                      <p className="text-sm text-text-secondary">Get text message reminders for events</p>
                    </div>
                    <Switch
                      checked={preferences?.notification_settings?.sms_reminders || false}
                      onCheckedChange={(checked) => handleNotificationPreferenceChange('sms_reminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-text-secondary">Browser push notifications for updates</p>
                    </div>
                    <Switch
                      checked={preferences?.notification_settings?.push_notifications || false}
                      onCheckedChange={(checked) => handleNotificationPreferenceChange('push_notifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-text-secondary">Promotional emails and special offers</p>
                    </div>
                    <Switch
                      checked={preferences?.notification_settings?.marketing_emails || false}
                      onCheckedChange={(checked) => handleNotificationPreferenceChange('marketing_emails', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Management Tab */}
          <TabsContent value="account" className="space-y-6">
            {/* Data Export */}
            <Card className="bg-surface-card border-border-default">
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary mb-4">
                  Download a copy of your account data including profile information, purchase history, and preferences.
                </p>
                <Button 
                  onClick={handleExportData} 
                  disabled={exportLoading}
                  className="flex items-center gap-2"
                >
                  {exportLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {exportLoading ? 'Exporting...' : 'Export Account Data'}
                </Button>
              </CardContent>
            </Card>

            {/* Account Deletion */}
            <Card className="bg-surface-card border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-destructive">Warning</h4>
                        <p className="text-sm text-text-secondary mt-1">
                          Account deletion is permanent and cannot be undone. All your data, including purchase history, 
                          saved events, and preferences will be permanently deleted.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deletion_reason">Reason for deletion (optional)</Label>
                    <Textarea
                      id="deletion_reason"
                      value={deletionForm.reason}
                      onChange={(e) => setDeletionForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Please let us know why you're deleting your account..."
                      rows={3}
                    />
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <UserX className="h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all 
                          your data from our servers including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Profile information and preferences</li>
                            <li>Purchase history and tickets</li>
                            <li>Saved events and wishlist</li>
                            <li>Payment methods and settings</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleRequestDeletion}
                          disabled={deletionLoading}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deletionLoading ? 'Processing...' : 'Delete Account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountSettings; 