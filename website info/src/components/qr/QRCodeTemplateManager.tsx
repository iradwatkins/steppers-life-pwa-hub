import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Settings, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Star, 
  StarOff,
  Download,
  QrCode,
  Palette,
  FileImage,
  Printer,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useQRCodes } from '../../hooks/useQRCodes';
import { QRCodeTemplate, QRCodeDesign, QRCodeFormat } from '../../services/qrCodeService';

interface QRCodeTemplateManagerProps {
  eventId?: string;
}

export const QRCodeTemplateManager: React.FC<QRCodeTemplateManagerProps> = ({ eventId }) => {
  const { templates, createTemplate, updateTemplate, deleteTemplate, isLoading } = useQRCodes(eventId);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QRCodeTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowCreateDialog(true);
  };

  const handleEditTemplate = (template: QRCodeTemplate) => {
    setEditingTemplate(template);
    setShowCreateDialog(true);
  };

  const handleDuplicateTemplate = async (template: QRCodeTemplate) => {
    const duplicatedTemplate: Omit<QRCodeTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      design: { ...template.design },
      format: template.format,
      isDefault: false,
      usageCount: 0,
      lastUsed: null
    };
    
    await createTemplate(duplicatedTemplate);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(templateId);
    }
  };

  const toggleFavorite = async (template: QRCodeTemplate) => {
    await updateTemplate(template.id, {
      ...template,
      isDefault: !template.isDefault
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">QR Code Templates</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage reusable templates for consistent QR code styling
          </p>
        </div>
        <Button onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={handleEditTemplate}
            onDuplicate={handleDuplicateTemplate}
            onDelete={handleDeleteTemplate}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No templates found</p>
          {searchQuery || filterCategory !== 'all' ? (
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleCreateTemplate}
              className="mt-4"
            >
              Create your first template
            </Button>
          )}
        </div>
      )}

      {/* Create/Edit Template Dialog */}
      <TemplateEditDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        template={editingTemplate}
        onSave={async (templateData) => {
          if (editingTemplate) {
            await updateTemplate(editingTemplate.id, templateData);
          } else {
            await createTemplate(templateData);
          }
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};

interface TemplateCardProps {
  template: QRCodeTemplate;
  onEdit: (template: QRCodeTemplate) => void;
  onDuplicate: (template: QRCodeTemplate) => void;
  onDelete: (templateId: string) => void;
  onToggleFavorite: (template: QRCodeTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return FileImage;
      case 'marketing': return Printer;
      case 'social': return Smartphone;
      case 'event': return Monitor;
      default: return QrCode;
    }
  };

  const CategoryIcon = getCategoryIcon(template.category);

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CategoryIcon className="h-5 w-5 text-gray-600" />
            <div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(template)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {template.isDefault ? (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div 
            className="inline-block p-2 bg-white rounded shadow-sm"
            style={{ backgroundColor: template.design.lightColor }}
          >
            <QrCode 
              className="w-16 h-16"
              style={{ color: template.design.darkColor }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {template.design.size}px {template.format.toUpperCase()}
          </p>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Category:</span>
            <Badge variant="secondary">{template.category}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Usage:</span>
            <span>{template.usageCount} times</span>
          </div>
          {template.lastUsed && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last used:</span>
              <span>{new Date(template.lastUsed).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(template)}
            className="flex-1"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(template)}
            className="flex-1"
          >
            <Copy className="h-3 w-3 mr-1" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(template.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface TemplateEditDialogProps {
  open: boolean;
  onClose: () => void;
  template?: QRCodeTemplate | null;
  onSave: (templateData: Omit<QRCodeTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const TemplateEditDialog: React.FC<TemplateEditDialogProps> = ({
  open,
  onClose,
  template,
  onSave
}) => {
  const [formData, setFormData] = useState<Omit<QRCodeTemplate, 'id' | 'createdAt' | 'updatedAt'>>({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'business',
    design: template?.design || {
      size: 256,
      errorCorrectionLevel: 'M',
      margin: 4,
      darkColor: '#000000',
      lightColor: '#FFFFFF',
      logoUrl: '',
      logoSize: 20,
      cornerRadius: 0,
      dotStyle: 'square',
      eyeStyle: 'square',
      gradientType: 'none',
      gradientColors: ['#000000', '#000000']
    },
    format: template?.format || 'png',
    isDefault: template?.isDefault || false,
    usageCount: template?.usageCount || 0,
    lastUsed: template?.lastUsed || null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSave(formData);
  };

  const updateFormData = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateDesign = (updates: Partial<QRCodeDesign>) => {
    setFormData(prev => ({
      ...prev,
      design: { ...prev.design, ...updates }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            {template ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
          <DialogDescription>
            Configure a reusable template for consistent QR code styling.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  placeholder="e.g., Business Card Style, Event Flyer"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <Label htmlFor="templateDescription">Description *</Label>
                <Textarea
                  id="templateDescription"
                  placeholder="Describe when to use this template"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  className={errors.description ? 'border-red-500' : ''}
                  rows={2}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData({ category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="print">Print</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value: QRCodeFormat) => updateFormData({ format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Design Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div 
                  className="inline-block p-4 bg-white rounded-lg shadow-sm"
                  style={{ backgroundColor: formData.design.lightColor }}
                >
                  <QrCode 
                    className="w-20 h-20"
                    style={{ color: formData.design.darkColor }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {formData.design.size}×{formData.design.size}px {formData.format.toUpperCase()}
                </p>
                <div className="flex justify-center space-x-4 mt-3 text-xs text-gray-500">
                  <span>Margin: {formData.design.margin}</span>
                  <span>Error Correction: {formData.design.errorCorrectionLevel}</span>
                  <span>Style: {formData.design.dotStyle}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Style Options */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Style Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Size</Label>
                  <Select
                    value={formData.design.size.toString()}
                    onValueChange={(value) => updateDesign({ size: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="128">128px (Small)</SelectItem>
                      <SelectItem value="256">256px (Medium)</SelectItem>
                      <SelectItem value="512">512px (Large)</SelectItem>
                      <SelectItem value="1024">1024px (Extra Large)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Style</Label>
                  <Select
                    value={formData.design.dotStyle}
                    onValueChange={(value: any) => updateDesign({ dotStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="darkColor">Foreground Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="darkColor"
                      type="color"
                      value={formData.design.darkColor}
                      onChange={(e) => updateDesign({ darkColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.design.darkColor}
                      onChange={(e) => updateDesign({ darkColor: e.target.value })}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="lightColor">Background Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="lightColor"
                      type="color"
                      value={formData.design.lightColor}
                      onChange={(e) => updateDesign({ lightColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.design.lightColor}
                      onChange={(e) => updateDesign({ lightColor: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 