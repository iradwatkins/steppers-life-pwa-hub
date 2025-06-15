import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle, Mail, Ban, PlayCircle, PauseCircle } from 'lucide-react';
import { User, adminUserService } from '@/services/adminUserService';
import { toast } from 'sonner';

interface UserDetailDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

const UserDetailDialog: React.FC<UserDetailDialogProps> = ({ user, isOpen, onClose, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [statusReason, setStatusReason] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<User['status'] | ''>('');
  const [selectedVODStatus, setSelectedVODStatus] = useState<User['vodSubscriptionStatus'] | ''>('');

  useEffect(() => {
    if (user) {
      setSelectedStatus(user.status);
      setSelectedVODStatus(user.vodSubscriptionStatus || '');
      setStatusReason('');
    }
  }, [user]);

  const handleUpdateStatus = async () => {
    if (!user || !selectedStatus || (user.status === selectedStatus && statusReason === '')) return;
    if (['suspended', 'deactivated'].includes(selectedStatus) && statusReason.trim() === '') {
      toast.error('Reason is required for suspending or deactivating accounts.');
      return;
    }
    setLoading(true);
    try {
      const updatedUser = await adminUserService.updateUserStatus(user.id, selectedStatus as User['status'], statusReason);
      onUserUpdated(updatedUser);
      toast.success(`User ${user.name}'s status updated to ${selectedStatus}.`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to update user status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrganizer = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updatedUser = await adminUserService.approveOrganizerAccount(user.id);
      onUserUpdated(updatedUser);
      toast.success(`Organizer ${user.name} account approved.`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to approve organizer: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManageVODSubscription = async () => {
    if (!user || !selectedVODStatus || user.role !== 'instructor') return;
    setLoading(true);
    try {
      const updatedUser = await adminUserService.manageInstructorVODSubscription(user.id, selectedVODStatus as User['vodSubscriptionStatus']);
      onUserUpdated(updatedUser);
      toast.success(`Instructor ${user.name}'s VOD subscription updated to ${selectedVODStatus}.`);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to update VOD subscription: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await adminUserService.resetUserPassword(user.id);
      toast.success(response.message);
      onClose();
    } catch (error: any) {
      toast.error(`Failed to send password reset: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active': return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1"/> Active</Badge>;
      case 'pending_approval': return <Badge variant="warning"><Loader2 className="h-3 w-3 mr-1 animate-spin"/> Pending Approval</Badge>;
      case 'suspended': return <Badge variant="destructive"><Ban className="h-3 w-3 mr-1"/> Suspended</Badge>;
      case 'deactivated': return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1"/> Deactivated</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderVODStatusBadge = (status?: User['vodSubscriptionStatus']) => {
    if (!status) return null;
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'inactive': return <Badge variant="destructive">Inactive</Badge>;
      case 'trialing': return <Badge variant="info">Trialing</Badge>;
      default: return null;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>User Details: {user.name}</DialogTitle>
          <DialogDescription>Manage user account information and status.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={user.name} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input id="email" value={user.email} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <div className="col-span-3 flex items-center gap-2">
              <Badge variant="secondary">{user.role}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <div className="col-span-3 flex items-center gap-2">
              {renderStatusBadge(user.status)}
              <Select onValueChange={(value) => setSelectedStatus(value as User['status'])} value={selectedStatus} disabled={loading}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {user.status !== selectedStatus && (selectedStatus === 'suspended' || selectedStatus === 'deactivated') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">Reason</Label>
              <Textarea 
                id="reason" 
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Reason for status change (required)"
                className="col-span-3"
                disabled={loading}
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="registrationDate" className="text-right">Registered</Label>
            <Input id="registrationDate" value={user.registrationDate} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastLogin" className="text-right">Last Login</Label>
            <Input id="lastLogin" value={user.lastLogin} readOnly className="col-span-3" />
          </div>
          {user.contactPhone && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPhone" className="text-right">Phone</Label>
              <Input id="contactPhone" value={user.contactPhone} readOnly className="col-span-3" />
            </div>
          )}
          {user.address && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Address</Label>
              <Input id="address" value={user.address} readOnly className="col-span-3" />
            </div>
          )}
          {user.bio && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">Bio</Label>
              <Textarea id="bio" value={user.bio} readOnly className="col-span-3 resize-none" rows={3} />
            </div>
          )}

          {/* Instructor VOD Subscription Management */}
          {user.role === 'instructor' && (
            <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-4">
              <Label htmlFor="vodSubscription" className="text-right">VOD Subscription</Label>
              <div className="col-span-3 flex items-center gap-2">
                {renderVODStatusBadge(user.vodSubscriptionStatus)}
                <Select onValueChange={(value) => setSelectedVODStatus(value as User['vodSubscriptionStatus'])} value={selectedVODStatus} disabled={loading}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Manage VOD Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleResetPassword} 
              disabled={loading} 
              className="flex items-center"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Reset Email
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {user.role === 'organizer' && user.status === 'pending_approval' && (
              <Button onClick={handleApproveOrganizer} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Approve Organizer
              </Button>
            )}
            {user.role === 'instructor' && selectedVODStatus && selectedVODStatus !== user.vodSubscriptionStatus && (
              <Button onClick={handleManageVODSubscription} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                Update VOD
              </Button>
            )}
            {selectedStatus && selectedStatus !== user.status && (
              <Button onClick={handleUpdateStatus} disabled={loading || (['suspended', 'deactivated'].includes(selectedStatus) && statusReason.trim() === '')}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                Update Status
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailDialog; 