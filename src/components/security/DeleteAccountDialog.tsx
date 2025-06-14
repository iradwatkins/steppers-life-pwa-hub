import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Trash2, AlertTriangle, Download } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [step, setStep] = useState<'confirm' | 'final'>('confirm');
  const [confirmationText, setConfirmationText] = useState('');
  const [agreements, setAgreements] = useState({
    dataLoss: false,
    noRecovery: false,
    contactSupport: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const { user, deleteAccount } = useAuth();

  const handleAgreementChange = (field: string, value: boolean) => {
    setAgreements(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    return (
      Object.values(agreements).every(Boolean) &&
      confirmationText.toLowerCase() === 'delete my account'
    );
  };

  const handleDataExport = () => {
    // In a real implementation, this would trigger a data export
    toast.info('Data export feature coming soon. Please contact support for data export requests.');
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAccount();
      // This won't actually delete the account due to Supabase limitations
      // but will show the support contact message
    } catch (error) {
      // Error handling is done in the useAuth hook
    } finally {
      setIsLoading(false);
      setShowFinalConfirm(false);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setStep('confirm');
    setConfirmationText('');
    setAgreements({ dataLoss: false, noRecovery: false, contactSupport: false });
    onOpenChange(false);
  };

  const handleContinueToFinal = () => {
    if (canProceed()) {
      setShowFinalConfirm(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please read the information below carefully.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Data Export Option */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 mt-1 text-stepping-purple" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download a copy of your profile, preferences, and activity history before deleting your account.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleDataExport}>
                    Request Data Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Consequences */}
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">What will be deleted:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Your profile and personal information</li>
                <li>• Event preferences and interests</li>
                <li>• Saved events and activity history</li>
                <li>• All account settings and preferences</li>
                <li>• Access to any purchased tickets or memberships</li>
              </ul>
            </div>

            {/* Agreements */}
            <div className="space-y-3">
              <h4 className="font-medium">Please confirm you understand:</h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="dataLoss"
                    checked={agreements.dataLoss}
                    onCheckedChange={(checked) => handleAgreementChange('dataLoss', checked)}
                  />
                  <Label htmlFor="dataLoss" className="text-sm leading-relaxed">
                    I understand that all my data will be permanently deleted and cannot be recovered.
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="noRecovery"
                    checked={agreements.noRecovery}
                    onCheckedChange={(checked) => handleAgreementChange('noRecovery', checked)}
                  />
                  <Label htmlFor="noRecovery" className="text-sm leading-relaxed">
                    I understand that this action is permanent and my account cannot be restored.
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="contactSupport"
                    checked={agreements.contactSupport}
                    onCheckedChange={(checked) => handleAgreementChange('contactSupport', checked)}
                  />
                  <Label htmlFor="contactSupport" className="text-sm leading-relaxed">
                    I understand that account deletion requires contacting support and may take up to 30 days to complete.
                  </Label>
                </div>
              </div>
            </div>

            {/* Confirmation Text */}
            <div className="space-y-2">
              <Label htmlFor="confirmText">
                Type "delete my account" to confirm:
              </Label>
              <Input
                id="confirmText"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="delete my account"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleContinueToFinal}
              disabled={!canProceed()}
            >
              Continue to Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Alert */}
      <AlertDialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete your account for{' '}
              <strong>{user?.email}</strong>. This action cannot be undone.
              
              <br /><br />
              
              Are you absolutely sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowFinalConfirm(false)}>
              No, Keep My Account
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Processing...' : 'Yes, Delete Forever'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteAccountDialog;