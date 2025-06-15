import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Palette, Settings, Save, RotateCcw, Eye, Upload, Image, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderRadius: string;
  fontFamily: string;
  darkMode: boolean;
  lightLogo?: string;
  darkLogo?: string;
  favicon?: string;
}

interface HolidayTheme {
  light: ThemeSettings;
  dark: ThemeSettings;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  accentColor: '#10b981',
  borderRadius: 'medium',
  fontFamily: 'Inter',
  darkMode: false
};

const holidayThemes = [
  {
    name: 'Christmas',
    emoji: '🎄',
    description: 'Festive red and green for the holidays',
    light: {
      primaryColor: '#dc2626',
      secondaryColor: '#16a34a',
      backgroundColor: '#fef2f2',
      textColor: '#1f2937',
      accentColor: '#ca8a04',
      borderRadius: 'large',
      fontFamily: 'Inter',
      darkMode: false,
    },
    dark: {
      primaryColor: '#ef4444',
      secondaryColor: '#22c55e',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
      accentColor: '#eab308',
      borderRadius: 'large',
      fontFamily: 'Inter',
      darkMode: true,
    }
  },
  {
    name: 'Easter',
    emoji: '🐰',
    description: 'Soft pastels for spring celebration',
    light: {
      primaryColor: '#ec4899',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#fdf4ff',
      textColor: '#1f2937',
      accentColor: '#06b6d4',
      borderRadius: 'rounded',
      fontFamily: 'Inter',
      darkMode: false,
    },
    dark: {
      primaryColor: '#f472b6',
      secondaryColor: '#a78bfa',
      backgroundColor: '#1e1b4b',
      textColor: '#f8fafc',
      accentColor: '#22d3ee',
      borderRadius: 'rounded',
      fontFamily: 'Inter',
      darkMode: true,
    }
  },
  {
    name: 'Halloween',
    emoji: '🎃',
    description: 'Spooky orange and purple theme',
    light: {
      primaryColor: '#ea580c',
      secondaryColor: '#7c2d12',
      backgroundColor: '#fff7ed',
      textColor: '#1c1917',
      accentColor: '#a855f7',
      borderRadius: 'medium',
      fontFamily: 'Inter',
      darkMode: false,
    },
    dark: {
      primaryColor: '#fb923c',
      secondaryColor: '#a16207',
      backgroundColor: '#0c0a09',
      textColor: '#fafaf9',
      accentColor: '#c084fc',
      borderRadius: 'medium',
      fontFamily: 'Inter',
      darkMode: true,
    }
  },
  {
    name: 'Thanksgiving',
    emoji: '🦃',
    description: 'Warm autumn colors for gratitude',
    light: {
      primaryColor: '#d97706',
      secondaryColor: '#92400e',
      backgroundColor: '#fffbeb',
      textColor: '#1c1917',
      accentColor: '#dc2626',
      borderRadius: 'medium',
      fontFamily: 'Inter',
      darkMode: false,
    },
    dark: {
      primaryColor: '#f59e0b',
      secondaryColor: '#b45309',
      backgroundColor: '#1c1917',
      textColor: '#fafaf9',
      accentColor: '#ef4444',
      borderRadius: 'medium',
      fontFamily: 'Inter',
      darkMode: true,
    }
  },
  {
    name: 'Fourth of July',
    emoji: '🇺🇸',
    description: 'Patriotic red, white, and blue',
    light: {
      primaryColor: '#dc2626',
      secondaryColor: '#1d4ed8',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#ffffff',
      borderRadius: 'small',
      fontFamily: 'Inter',
      darkMode: false,
    },
    dark: {
      primaryColor: '#ef4444',
      secondaryColor: '#3b82f6',
      backgroundColor: '#0f172a',
      textColor: '#f1f5f9',
      accentColor: '#e2e8f0',
      borderRadius: 'small',
      fontFamily: 'Inter',
      darkMode: true,
    }
  },
  {
    name: 'Default',
    emoji: '⚡',
    description: 'Clean and modern default theme',
    light: {
      ...defaultTheme,
    },
    dark: {
      primaryColor: '#60a5fa',
      secondaryColor: '#64748b',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
      accentColor: '#34d399',
      borderRadius: 'medium',
      fontFamily: 'Inter',
      darkMode: true,
    }
  }
];

const AdminThemePage: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(defaultTheme);
  const [lightTheme, setLightTheme] = useState<ThemeSettings>(defaultTheme);
  const [darkTheme, setDarkTheme] = useState<ThemeSettings>({
    primaryColor: '#60a5fa',
    secondaryColor: '#64748b',
    backgroundColor: '#0f172a',
    textColor: '#f8fafc',
    accentColor: '#34d399',
    borderRadius: 'medium',
    fontFamily: 'Inter',
    darkMode: true,
  });
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load saved themes from localStorage and apply them on mount
    const savedLightTheme = localStorage.getItem('adminLightThemeSettings');
    const savedDarkTheme = localStorage.getItem('adminDarkThemeSettings');
    const savedCurrentMode = localStorage.getItem('adminThemeMode') || 'light';

    if (savedLightTheme) {
      try {
        const lightThemeData = JSON.parse(savedLightTheme);
        setLightTheme(lightThemeData);
      } catch (error) {
        console.error('Error loading saved light theme:', error);
      }
    }

    if (savedDarkTheme) {
      try {
        const darkThemeData = JSON.parse(savedDarkTheme);
        setDarkTheme(darkThemeData);
      } catch (error) {
        console.error('Error loading saved dark theme:', error);
      }
    }

    // Set current theme based on saved mode
    const activeTheme = savedCurrentMode === 'dark' ? 
      (savedDarkTheme ? JSON.parse(savedDarkTheme) : darkTheme) :
      (savedLightTheme ? JSON.parse(savedLightTheme) : lightTheme);
    
    setCurrentTheme(activeTheme);
    applyThemeToDOM(activeTheme);
  }, []);

  const applyThemeToDOM = (theme: ThemeSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-background', theme.backgroundColor);
    root.style.setProperty('--theme-text', theme.textColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    
    const radiusMap = {
      'small': '4px',
      'medium': '6px', 
      'large': '8px',
      'rounded': '12px'
    };
    root.style.setProperty('--theme-radius', radiusMap[theme.borderRadius] || '6px');
    root.style.setProperty('--theme-font', theme.fontFamily);
  };

  // Cleanup effect for preview mode
  useEffect(() => {
    return () => {
      if (isPreviewMode) {
        document.body.classList.remove('theme-preview-mode');
        document.body.style.removeProperty('--preview-border');
      }
    };
  }, [isPreviewMode]);

  const handleColorChange = (field: keyof ThemeSettings, value: string) => {
    const newTheme = { ...currentTheme, [field]: value };
    setCurrentTheme(newTheme);
    
    // Update the corresponding light or dark theme
    if (currentTheme.darkMode) {
      setDarkTheme(newTheme);
    } else {
      setLightTheme(newTheme);
    }
  };

  const handlePresetSelect = (preset: any) => {
    // Set both light and dark themes
    setLightTheme(preset.light);
    setDarkTheme(preset.dark);
    
    // Keep current mode (light or dark) but apply the new theme
    const newCurrentTheme = currentTheme.darkMode ? preset.dark : preset.light;
    setCurrentTheme(newCurrentTheme);
    
    toast.success(`Applied ${preset.name} holiday theme (both light & dark variants)`);
  };

  const toggleThemeMode = () => {
    const newMode = !currentTheme.darkMode;
    const newTheme = newMode ? darkTheme : lightTheme;
    setCurrentTheme(newTheme);
    
    // Save current mode preference
    localStorage.setItem('adminThemeMode', newMode ? 'dark' : 'light');
    
    toast.success(`Switched to ${newMode ? 'dark' : 'light'} mode`);
  };

  const handleFileUpload = async (type: 'lightLogo' | 'darkLogo' | 'favicon', file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = type === 'favicon' 
      ? ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png']
      : ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type. Please use ${validTypes.join(', ')}`);
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    try {
      // Simulate file upload - in real app, this would upload to server
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCurrentTheme(prev => ({ ...prev, [type]: result }));
        toast.success(`${type} uploaded successfully`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call with progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save both light and dark themes to localStorage
      localStorage.setItem('adminLightThemeSettings', JSON.stringify(lightTheme));
      localStorage.setItem('adminDarkThemeSettings', JSON.stringify(darkTheme));
      localStorage.setItem('adminThemeMode', currentTheme.darkMode ? 'dark' : 'light');
      
      // Apply current theme to document root for global effect
      applyThemeToDOM(currentTheme);
      
      // Exit preview mode if active
      if (isPreviewMode) {
        setIsPreviewMode(false);
        document.body.classList.remove('theme-preview-mode');
      }
      
      toast.success('🎨 Theme settings saved successfully! Both light & dark themes configured.');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save theme settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset theme states to defaults
    const defaultDarkTheme = {
      primaryColor: '#60a5fa',
      secondaryColor: '#64748b',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
      accentColor: '#34d399',
      borderRadius: 'medium',
      fontFamily: 'Inter',
      darkMode: true,
    };
    
    setLightTheme(defaultTheme);
    setDarkTheme(defaultDarkTheme);
    setCurrentTheme(defaultTheme);
    
    // Clear localStorage
    localStorage.removeItem('adminLightThemeSettings');
    localStorage.removeItem('adminDarkThemeSettings');
    localStorage.removeItem('adminThemeMode');
    
    // Reset all CSS variables to defaults
    const root = document.documentElement;
    root.style.removeProperty('--theme-primary');
    root.style.removeProperty('--theme-secondary');
    root.style.removeProperty('--theme-background');
    root.style.removeProperty('--theme-text');
    root.style.removeProperty('--theme-accent');
    root.style.removeProperty('--theme-radius');
    root.style.removeProperty('--theme-font');
    
    // Exit preview mode if active
    if (isPreviewMode) {
      setIsPreviewMode(false);
      document.body.classList.remove('theme-preview-mode');
    }
    
    toast.success('🔄 Themes reset to default settings (both light & dark)');
  };

  const togglePreview = () => {
    const newPreviewMode = !isPreviewMode;
    setIsPreviewMode(newPreviewMode);
    
    if (newPreviewMode) {
      // Enter preview mode - apply current theme temporarily
      document.body.classList.add('theme-preview-mode');
      const root = document.documentElement;
      
      // Store original values
      root.setAttribute('data-original-primary', getComputedStyle(root).getPropertyValue('--theme-primary') || '');
      root.setAttribute('data-original-background', getComputedStyle(root).getPropertyValue('--theme-background') || '');
      
      // Apply preview theme
      applyThemeToDOM(currentTheme);
      
      // Apply visual preview indicators
      document.body.style.setProperty('--preview-border', `2px dashed ${currentTheme.primaryColor}`);
      
      toast.info('👁️ Preview mode enabled - you can see how the theme looks');
    } else {
      // Exit preview mode - restore original or saved theme
      document.body.classList.remove('theme-preview-mode');
      document.body.style.removeProperty('--preview-border');
      
      const root = document.documentElement;
      
      // Try to restore saved theme or use defaults
      const savedLightTheme = localStorage.getItem('adminLightThemeSettings');
      const savedDarkTheme = localStorage.getItem('adminDarkThemeSettings');
      const savedMode = localStorage.getItem('adminThemeMode') || 'light';
      
      if (savedLightTheme && savedDarkTheme) {
        const lightThemeData = JSON.parse(savedLightTheme);
        const darkThemeData = JSON.parse(savedDarkTheme);
        const activeTheme = savedMode === 'dark' ? darkThemeData : lightThemeData;
        applyThemeToDOM(activeTheme);
      } else {
        // Clear preview variables to return to defaults
        root.style.removeProperty('--theme-primary');
        root.style.removeProperty('--theme-secondary');
        root.style.removeProperty('--theme-background');
        root.style.removeProperty('--theme-text');
        root.style.removeProperty('--theme-accent');
      }
      
      toast.info('👁️ Preview mode disabled');
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-3 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span className="font-medium">Preview Mode Active</span>
              <span className="text-blue-200 text-sm">- See how your theme changes look</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={togglePreview}
              className="text-blue-600 bg-white hover:bg-gray-100"
            >
              Exit Preview
            </Button>
          </div>
        </div>
      )}
      
      <div className={`flex justify-between items-start ${isPreviewMode ? 'mt-16' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Theme & Design</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize the look and feel of your platform with logos, colors, and themes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={toggleThemeMode}
            disabled={loading}
          >
            {currentTheme.darkMode ? '🌙' : '☀️'} 
            <span className="ml-2">{currentTheme.darkMode ? 'Dark' : 'Light'} Mode</span>
          </Button>
          <Button 
            variant={isPreviewMode ? "default" : "outline"} 
            onClick={togglePreview}
            className={isPreviewMode ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={loading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Logo & Branding */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Logos & Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Light Theme Logo */}
            <div>
              <Label className="text-sm font-medium">Light Theme Logo</Label>
              <div className="mt-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                {currentTheme.lightLogo ? (
                  <div className="text-center">
                    <img 
                      src={currentTheme.lightLogo} 
                      alt="Light logo" 
                      className="max-h-16 mx-auto mb-2"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentTheme(prev => ({ ...prev, lightLogo: undefined }))}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <Label htmlFor="light-logo" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Upload light logo</span>
                      <Input
                        id="light-logo"
                        type="file"
                        className="hidden"
                        accept=".png,.svg,.jpg,.jpeg,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('lightLogo', file);
                        }}
                      />
                    </Label>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, SVG, JPG, WEBP • Max 2MB • Recommended: 200x60px
              </p>
            </div>

            {/* Dark Theme Logo */}
            <div>
              <Label className="text-sm font-medium">Dark Theme Logo</Label>
              <div className="mt-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900">
                {currentTheme.darkLogo ? (
                  <div className="text-center">
                    <img 
                      src={currentTheme.darkLogo} 
                      alt="Dark logo" 
                      className="max-h-16 mx-auto mb-2"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentTheme(prev => ({ ...prev, darkLogo: undefined }))}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <Label htmlFor="dark-logo" className="cursor-pointer">
                      <span className="text-blue-400 hover:text-blue-300">Upload dark logo</span>
                      <Input
                        id="dark-logo"
                        type="file"
                        className="hidden"
                        accept=".png,.svg,.jpg,.jpeg,.webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('darkLogo', file);
                        }}
                      />
                    </Label>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, SVG, JPG, WEBP • Max 2MB • Recommended: 200x60px
              </p>
            </div>

            {/* Favicon */}
            <div>
              <Label className="text-sm font-medium">Favicon</Label>
              <div className="mt-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                {currentTheme.favicon ? (
                  <div className="text-center">
                    <img 
                      src={currentTheme.favicon} 
                      alt="Favicon" 
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentTheme(prev => ({ ...prev, favicon: undefined }))}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <Label htmlFor="favicon" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Upload favicon</span>
                      <Input
                        id="favicon"
                        type="file"
                        className="hidden"
                        accept=".ico,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload('favicon', file);
                        }}
                      />
                    </Label>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ICO, PNG • Max 2MB • Recommended: 32x32px or 16x16px
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Logo Guidelines:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Use transparent backgrounds for best results</li>
                    <li>• SVG format provides the best scalability</li>
                    <li>• Test both logos in light and dark modes</li>
                    <li>• Ensure sufficient contrast for readability</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Customization */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Color Scheme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={currentTheme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={currentTheme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={currentTheme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={currentTheme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1"
                    placeholder="#64748b"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={currentTheme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={currentTheme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="flex-1"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="accentColor"
                    type="color"
                    value={currentTheme.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={currentTheme.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1"
                    placeholder="#10b981"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label>Border Radius</Label>
              <Select value={currentTheme.borderRadius} onValueChange={(value) => handleColorChange('borderRadius', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (4px)</SelectItem>
                  <SelectItem value="medium">Medium (6px)</SelectItem>
                  <SelectItem value="large">Large (8px)</SelectItem>
                  <SelectItem value="rounded">Rounded (12px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Font Family</Label>
              <Select value={currentTheme.fontFamily} onValueChange={(value) => handleColorChange('fontFamily', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Live Preview */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">Live Preview</h4>
                <Badge variant="secondary" className="text-xs">Real-time</Badge>
              </div>
              <div 
                className="p-4 rounded-lg border-2 transition-all duration-200"
                style={{
                  backgroundColor: currentTheme.backgroundColor,
                  color: currentTheme.textColor,
                  borderColor: currentTheme.primaryColor,
                  fontFamily: currentTheme.fontFamily
                }}
              >
                <h5 
                  className="font-semibold mb-2 transition-colors duration-200"
                  style={{ color: currentTheme.primaryColor }}
                >
                  Sample Heading
                </h5>
                <p className="mb-3 text-sm transition-colors duration-200">
                  This preview updates in real-time as you change colors. 
                  Use the Preview button above to see the theme applied to the entire page.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="px-3 py-2 rounded text-white font-medium text-sm transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: currentTheme.primaryColor,
                      borderRadius: currentTheme.borderRadius === 'small' ? '4px' : 
                                   currentTheme.borderRadius === 'medium' ? '6px' :
                                   currentTheme.borderRadius === 'large' ? '8px' : '12px'
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-3 py-2 rounded font-medium text-sm transition-all duration-200 hover:opacity-90"
                    style={{ 
                      backgroundColor: currentTheme.accentColor, 
                      color: currentTheme.backgroundColor,
                      borderRadius: currentTheme.borderRadius === 'small' ? '4px' : 
                                   currentTheme.borderRadius === 'medium' ? '6px' :
                                   currentTheme.borderRadius === 'large' ? '8px' : '12px'
                    }}
                  >
                    Accent Button
                  </button>
                  <button
                    className="px-3 py-2 rounded font-medium text-sm border-2 transition-all duration-200 hover:bg-opacity-10"
                    style={{ 
                      backgroundColor: 'transparent',
                      borderColor: currentTheme.secondaryColor,
                      color: currentTheme.secondaryColor,
                      borderRadius: currentTheme.borderRadius === 'small' ? '4px' : 
                                   currentTheme.borderRadius === 'medium' ? '6px' :
                                   currentTheme.borderRadius === 'large' ? '8px' : '12px'
                    }}
                  >
                    Secondary
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holiday Theme Presets */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Holiday Theme Presets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {holidayThemes.map((preset) => (
                <div
                  key={preset.name}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{preset.emoji}</div>
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: preset.light.primaryColor }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: preset.light.secondaryColor }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border" 
                        style={{ backgroundColor: preset.light.accentColor }}
                      />
                    </div>
                                          <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{preset.name}</p>
                          <Badge variant="secondary" className="text-xs">Light + Dark</Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {preset.description}
                        </p>
                      </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Holiday Themes:</p>
                  <p className="text-xs">
                    Each holiday theme automatically configures both light and dark modes. 
                    Select a holiday to set up both variants, then use the mode toggle to switch between them.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminThemePage; 