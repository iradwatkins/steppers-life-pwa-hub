import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  MapPin, 
  Users, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Play,
  Upload,
  DollarSign,
  BarChart3,
  Bell
} from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/useAuth';
import { useClasses } from '@/hooks/useClasses';
import { SteppingClass, ClassSubmissionData, ClassLocation, ClassSchedule } from '@/services/classService';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const InstructorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    classes,
    vodClasses,
    loading,
    error,
    loadInstructorClasses,
    loadInstructorVODClasses,
    createClass,
    updateClass,
    deleteClass,
    confirmClass,
    getClassAttendees,
    uploadClassImages,
    clearError
  } = useClasses();

  const [activeTab, setActiveTab] = useState<'overview' | 'physical' | 'vod' | 'attendees' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  
  // Class creation dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<SteppingClass | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for class creation/editing
  const [classForm, setClassForm] = useState<ClassSubmissionData>({
    title: '',
    description: '',
    classType: 'Regular Class',
    level: 'Beginner',
    category: 'Technique',
    location: {
      type: 'physical',
      venue: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      specialInstructions: ''
    },
    schedule: {
      type: 'weekly',
      startDate: '',
      endDate: '',
      time: '',
      duration: 90,
      daysOfWeek: [],
      notes: ''
    },
    price: 0,
    capacity: undefined,
    hasRSVP: true,
    contactInfo: {
      email: user?.email || '',
      phone: '',
      preferredContact: 'email'
    },
    prerequisites: '',
    whatToBring: '',
    extras: '',
    tags: []
  });

  useEffect(() => {
    if (user) {
      loadInstructorClasses();
      loadInstructorVODClasses();
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateClass = async () => {
    if (!classForm.title.trim() || !classForm.description.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingClass) {
        await updateClass(editingClass.id, classForm);
      } else {
        await createClass(classForm);
      }
      
      setShowCreateDialog(false);
      resetClassForm();
      setEditingClass(null);
    } catch (error) {
      console.error('Failed to save class:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetClassForm = () => {
    setClassForm({
      title: '',
      description: '',
      classType: 'Regular Class',
      level: 'Beginner',
      category: 'Technique',
      location: {
        type: 'physical',
        venue: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        specialInstructions: ''
      },
      schedule: {
        type: 'weekly',
        startDate: '',
        endDate: '',
        time: '',
        duration: 90,
        daysOfWeek: [],
        notes: ''
      },
      price: 0,
      capacity: undefined,
      hasRSVP: true,
      contactInfo: {
        email: user?.email || '',
        phone: '',
        preferredContact: 'email'
      },
      prerequisites: '',
      whatToBring: '',
      extras: '',
      tags: []
    });
  };

  const handleEditClass = (classToEdit: SteppingClass) => {
    setEditingClass(classToEdit);
    setClassForm({
      title: classToEdit.title,
      description: classToEdit.description,
      classType: classToEdit.classType,
      level: classToEdit.level,
      category: classToEdit.category,
      location: classToEdit.location,
      schedule: classToEdit.schedule,
      price: classToEdit.price,
      capacity: classToEdit.capacity,
      hasRSVP: classToEdit.hasRSVP,
      contactInfo: classToEdit.contactInfo,
      prerequisites: classToEdit.prerequisites,
      whatToBring: classToEdit.whatToBring,
      extras: classToEdit.extras,
      tags: classToEdit.tags
    });
    setShowCreateDialog(true);
  };

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      await deleteClass(classId);
    }
  };

  const handleConfirmClass = async (classId: string) => {
    await confirmClass(classId);
  };

  const handleDayOfWeekChange = (dayIndex: number, checked: boolean) => {
    setClassForm(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        daysOfWeek: checked 
          ? [...(prev.schedule.daysOfWeek || []), dayIndex]
          : (prev.schedule.daysOfWeek || []).filter(day => day !== dayIndex)
      }
    }));
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && cls.isActive && !cls.isPending) ||
                         (statusFilter === 'pending' && cls.isPending) ||
                         (statusFilter === 'inactive' && !cls.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Dashboard overview stats
  const stats = {
    totalClasses: classes.length,
    activeClasses: classes.filter(c => c.isActive && !c.isPending).length,
    pendingClasses: classes.filter(c => c.isPending).length,
    totalStudents: classes.reduce((sum, c) => sum + c.attendeeCount, 0),
    averageRating: classes.length > 0 
      ? classes.reduce((sum, c) => sum + c.averageRating, 0) / classes.length 
      : 0,
    monthlyRevenue: classes.reduce((sum, c) => sum + (c.price * c.attendeeCount), 0)
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-secondary">Please sign in to access the instructor dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-text-primary mb-2">
            Instructor Dashboard
          </h1>
          <p className="text-text-secondary text-lg">
            Manage your classes and connect with students
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-8">
            {['overview', 'physical', 'vod', 'attendees', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 px-1 border-b-2 font-medium capitalize ${
                  activeTab === tab
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab === 'vod' ? 'VOD Classes' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <Calendar className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalClasses}</div>
                  <p className="text-xs text-text-secondary">
                    {stats.activeClasses} active, {stats.pendingClasses} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-text-secondary">Across all classes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                  <p className="text-xs text-text-secondary">Student feedback</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.monthlyRevenue}</div>
                  <p className="text-xs text-text-secondary">Current enrollment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">VOD Classes</CardTitle>
                  <Play className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vodClasses.length}</div>
                  <p className="text-xs text-text-secondary">Online courses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Confirmations</CardTitle>
                  <Bell className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingClasses}</div>
                  <p className="text-xs text-text-secondary">Require attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Class
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload VOD Content
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classes.slice(0, 3).map((cls) => (
                      <div key={cls.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{cls.title}</p>
                          <p className="text-xs text-text-secondary">
                            {cls.attendeeCount} students enrolled
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Physical Classes Tab */}
        {activeTab === 'physical' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-text-primary">Physical Classes</h2>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Classes List */}
            <div className="space-y-4">
              {filteredClasses.map((cls) => (
                <Card key={cls.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-text-primary">{cls.title}</h3>
                          <Badge variant={cls.isPending ? "destructive" : cls.isActive ? "default" : "secondary"}>
                            {cls.isPending ? 'Pending' : cls.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{cls.level}</Badge>
                        </div>
                        
                        <p className="text-text-secondary text-sm mb-3">{cls.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-text-secondary" />
                            <span>{cls.location.venue}, {cls.location.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-text-secondary" />
                            <span>{cls.schedule.type} - {cls.schedule.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-text-secondary" />
                            <span>{cls.attendeeCount} students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-text-secondary" />
                            <span>${cls.price}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClass(cls)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('View attendees:', cls.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {cls.isPending && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmClass(cls.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClass(cls.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* VOD Classes Tab */}
        {activeTab === 'vod' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-text-primary">Video-on-Demand Classes</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create VOD Course
              </Button>
            </div>

            <Card>
              <CardContent className="p-8 text-center">
                <Play className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-text-primary mb-2">VOD Feature Coming Soon</h3>
                <p className="text-text-secondary mb-6">
                  Video-on-demand class creation and management will be available soon. Subscribe to get notified when this feature launches.
                </p>
                <Button>Subscribe for VOD Hosting ($40/month)</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendees Tab */}
        {activeTab === 'attendees' && (
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Class Attendees</h2>
            
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-text-primary mb-2">Attendee Management</h3>
                <p className="text-text-secondary mb-6">
                  Select a class from the Physical Classes tab to view and manage attendees.
                </p>
                <Button onClick={() => setActiveTab('physical')}>
                  View Classes
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-6">Analytics & Reports</h2>
            
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-text-primary mb-2">Analytics Dashboard</h3>
                <p className="text-text-secondary mb-6">
                  Detailed analytics and reporting features will be available in a future update.
                </p>
                <Button variant="outline">Request Analytics Access</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create/Edit Class Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClass ? 'Edit Class' : 'Create New Class'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Class Title</Label>
                  <Input
                    id="title"
                    value={classForm.title}
                    onChange={(e) => setClassForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Fundamentals of Chicago Stepping"
                  />
                </div>
                <div>
                  <Label htmlFor="classType">Class Type</Label>
                  <Select 
                    value={classForm.classType} 
                    onValueChange={(value: any) => setClassForm(prev => ({ ...prev, classType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regular Class">Regular Class</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Private Lesson">Private Lesson</SelectItem>
                      <SelectItem value="Group Session">Group Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={classForm.description}
                  onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your class, what students will learn, and any special features..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select 
                    value={classForm.level} 
                    onValueChange={(value: any) => setClassForm(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Footwork">Footwork</SelectItem>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={classForm.category} 
                    onValueChange={(value: any) => setClassForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technique">Technique</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Competition">Competition</SelectItem>
                      <SelectItem value="Style">Style</SelectItem>
                      <SelectItem value="Youth">Youth</SelectItem>
                      <SelectItem value="Fusion">Fusion</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={classForm.price}
                    onChange={(e) => setClassForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue">Venue Name</Label>
                    <Input
                      id="venue"
                      value={classForm.location.venue}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        location: { ...prev.location, venue: e.target.value }
                      }))}
                      placeholder="e.g., Chicago Cultural Center"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={classForm.location.address}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        location: { ...prev.location, address: e.target.value }
                      }))}
                      placeholder="Street address"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={classForm.location.city}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        location: { ...prev.location, city: e.target.value }
                      }))}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={classForm.location.state}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        location: { ...prev.location, state: e.target.value }
                      }))}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={classForm.location.zipCode}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        location: { ...prev.location, zipCode: e.target.value }
                      }))}
                      placeholder="Zip code"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduleType">Schedule Type</Label>
                    <Select 
                      value={classForm.schedule.type} 
                      onValueChange={(value: any) => setClassForm(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, type: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Session</SelectItem>
                        <SelectItem value="weekly">Weekly Recurring</SelectItem>
                        <SelectItem value="monthly">Monthly Recurring</SelectItem>
                        <SelectItem value="custom">Custom Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={classForm.schedule.time}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, time: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={classForm.schedule.startDate}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, startDate: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={classForm.schedule.endDate}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, endDate: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={classForm.schedule.duration}
                      onChange={(e) => setClassForm(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, duration: Number(e.target.value) }
                      }))}
                      placeholder="90"
                    />
                  </div>
                </div>

                {classForm.schedule.type === 'weekly' && (
                  <div>
                    <Label>Days of Week</Label>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {daysOfWeek.map((day, index) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${index}`}
                            checked={(classForm.schedule.daysOfWeek || []).includes(index)}
                            onCheckedChange={(checked) => handleDayOfWeekChange(index, checked as boolean)}
                          />
                          <Label htmlFor={`day-${index}`} className="text-sm">{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Options */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacity (optional)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={classForm.capacity || ''}
                    onChange={(e) => setClassForm(prev => ({
                      ...prev,
                      capacity: e.target.value ? Number(e.target.value) : undefined
                    }))}
                    placeholder="Maximum students"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasRSVP"
                    checked={classForm.hasRSVP}
                    onCheckedChange={(checked) => setClassForm(prev => ({
                      ...prev,
                      hasRSVP: checked as boolean
                    }))}
                  />
                  <Label htmlFor="hasRSVP">Enable RSVP tracking</Label>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prerequisites">Prerequisites (optional)</Label>
                  <Textarea
                    id="prerequisites"
                    value={classForm.prerequisites}
                    onChange={(e) => setClassForm(prev => ({ ...prev, prerequisites: e.target.value }))}
                    placeholder="Any requirements or experience needed..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="whatToBring">What to Bring (optional)</Label>
                  <Textarea
                    id="whatToBring"
                    value={classForm.whatToBring}
                    onChange={(e) => setClassForm(prev => ({ ...prev, whatToBring: e.target.value }))}
                    placeholder="Dance shoes, water bottle, comfortable clothes..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="extras">Additional Notes (optional)</Label>
                  <Textarea
                    id="extras"
                    value={classForm.extras}
                    onChange={(e) => setClassForm(prev => ({ ...prev, extras: e.target.value }))}
                    placeholder="Any extra information for students..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateClass}
                disabled={isSubmitting || !classForm.title.trim()}
              >
                {isSubmitting ? 'Saving...' : editingClass ? 'Update Class' : 'Create Class'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default InstructorDashboardPage; 