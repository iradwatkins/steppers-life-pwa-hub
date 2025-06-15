import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { adminUserService, User } from '@/services/adminUserService';

interface CreateUserForm {
  name: string;
  email: string;
  role: User['role'];
  status: User['status'];
  contactPhone?: string;
  address?: string;
  bio?: string;
  sendWelcomeEmail: boolean;
  requirePasswordReset: boolean;
}

const AdminUserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    email: '',
    role: 'buyer',
    status: 'active',
    contactPhone: '',
    address: '',
    bio: '',
    sendWelcomeEmail: true,
    requirePasswordReset: true
  });

  const roleOptions: { value: User['role']; label: string; description: string }[] = [
    { value: 'buyer', label: 'Buyer', description: 'Can purchase tickets and attend events' },
    { value: 'organizer', label: 'Event Organizer', description: 'Can create and manage events' },
    { value: 'instructor', label: 'Instructor', description: 'Can teach classes and create content' },
    { value: 'event_staff', label: 'Event Staff', description: 'Can manage event check-ins and operations' },
    { value: 'sales_agent', label: 'Sales Agent', description: 'Can promote events and earn commissions' },
    { value: 'admin', label: 'Administrator', description: 'Full platform access and management' }
  ];

  const statusOptions: { value: User['status']; label: string; description: string }[] = [
    { value: 'active', label: 'Active', description: 'User can access all features' },
    { value: 'pending_approval', label: 'Pending Approval', description: 'Account awaiting admin approval' },
    { value: 'suspended', label: 'Suspended', description: 'Account temporarily disabled' },
    { value: 'deactivated', label: 'Deactivated', description: 'Account permanently disabled' }
  ];

  const handleInputChange = (field: keyof CreateUserForm, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and email are required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // In a real implementation, this would call a create user API
      console.log('Creating user with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "User Created Successfully",
        description: `${formData.name} has been created with ${formData.role} role.`,
      });
      
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error Creating User",
        description: "There was an error creating the user account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin/users')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New User</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add a new user account to the platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.contactPhone || ''}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio/Description</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Enter user bio or description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">User Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleInputChange('role', value as User['role'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleInputChange('status', value as User['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Send Welcome Email</Label>
                      <p className="text-sm text-gray-500">Send account details to user</p>
                    </div>
                    <Switch
                      checked={formData.sendWelcomeEmail}
                      onCheckedChange={(checked) => handleInputChange('sendWelcomeEmail', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Password Reset</Label>
                      <p className="text-sm text-gray-500">User must set password on first login</p>
                    </div>
                    <Switch
                      checked={formData.requirePasswordReset}
                      onCheckedChange={(checked) => handleInputChange('requirePasswordReset', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => navigate('/admin/users')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminUserCreatePage; 