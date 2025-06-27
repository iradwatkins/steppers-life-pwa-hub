/**
 * Theme Customization Page - Epic H.006: Admin Theme Color Customization
 * 
 * Comprehensive theme color customization interface for platform administrators
 * with real-time preview, predefined palettes, and persistent storage.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Palette, RefreshCw, Save, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ThemeColor {
  name: string;
  cssVariable: string;
  defaultValue: string;
  currentValue: string;
  description: string;
}

interface ColorPalette {
  name: string;
  description: string;
  colors: Record<string, string>;
}

const ThemeCustomizationPage: React.FC = () => {
  const { toast } = useToast();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);

  // Define theme colors that can be customized
  const [themeColors, setThemeColors] = useState<ThemeColor[]>([
    {
      name: 'Primary',
      cssVariable: '--primary',
      defaultValue: '#1f2937',
      currentValue: '#1f2937',
      description: 'Main brand color used for buttons, links, and primary elements'
    },
    {
      name: 'Primary Foreground',
      cssVariable: '--primary-foreground',
      defaultValue: '#ffffff',
      currentValue: '#ffffff',
      description: 'Text color on primary background'
    },
    {
      name: 'Secondary',
      cssVariable: '--secondary',
      defaultValue: '#f3f4f6',
      currentValue: '#f3f4f6',
      description: 'Secondary elements and subtle backgrounds'
    },
    {
      name: 'Secondary Foreground',
      cssVariable: '--secondary-foreground',
      defaultValue: '#374151',
      currentValue: '#374151',
      description: 'Text color on secondary background'
    },
    {
      name: 'Accent',
      cssVariable: '--accent',
      defaultValue: '#3b82f6',
      currentValue: '#3b82f6',
      description: 'Accent color for highlights and interactive elements'
    },
    {
      name: 'Accent Foreground',
      cssVariable: '--accent-foreground',
      defaultValue: '#ffffff',
      currentValue: '#ffffff',
      description: 'Text color on accent background'
    },
    {
      name: 'Destructive',
      cssVariable: '--destructive',
      defaultValue: '#ef4444',
      currentValue: '#ef4444',
      description: 'Error states and destructive actions'
    },
    {
      name: 'Destructive Foreground',
      cssVariable: '--destructive-foreground',
      defaultValue: '#ffffff',
      currentValue: '#ffffff',
      description: 'Text color on destructive background'
    },
    {
      name: 'Background',
      cssVariable: '--background',
      defaultValue: '#ffffff',
      currentValue: '#ffffff',
      description: 'Main background color'
    },
    {
      name: 'Foreground',
      cssVariable: '--foreground',
      defaultValue: '#1f2937',
      currentValue: '#1f2937',
      description: 'Main text color'
    },
    {
      name: 'Card',
      cssVariable: '--card',
      defaultValue: '#ffffff',
      currentValue: '#ffffff',
      description: 'Card and panel backgrounds'
    },
    {
      name: 'Card Foreground',
      cssVariable: '--card-foreground',
      defaultValue: '#1f2937',
      currentValue: '#1f2937',
      description: 'Text color on card backgrounds'
    },
    {
      name: 'Border',
      cssVariable: '--border',
      defaultValue: '#e5e7eb',
      currentValue: '#e5e7eb',
      description: 'Border color for elements'
    },
    {
      name: 'Input',
      cssVariable: '--input',
      defaultValue: '#e5e7eb',
      currentValue: '#e5e7eb',
      description: 'Input field borders'
    },
    {
      name: 'Ring',
      cssVariable: '--ring',
      defaultValue: '#3b82f6',
      currentValue: '#3b82f6',
      description: 'Focus ring color'
    }
  ]);

  // Predefined color palettes
  const colorPalettes: ColorPalette[] = [
    {
      name: 'Default SteppersLife',
      description: 'Original platform colors',
      colors: {
        '--primary': '#1f2937',
        '--primary-foreground': '#ffffff',
        '--secondary': '#f3f4f6',
        '--secondary-foreground': '#374151',
        '--accent': '#3b82f6',
        '--accent-foreground': '#ffffff',
        '--destructive': '#ef4444',
        '--destructive-foreground': '#ffffff',
        '--background': '#ffffff',
        '--foreground': '#1f2937',
        '--card': '#ffffff',
        '--card-foreground': '#1f2937',
        '--border': '#e5e7eb',
        '--input': '#e5e7eb',
        '--ring': '#3b82f6'
      }
    },
    {
      name: 'Chicago Deep Blue',
      description: 'Deep blue theme inspired by Chicago stepping',
      colors: {
        '--primary': '#1e3a8a',
        '--primary-foreground': '#ffffff',
        '--secondary': '#dbeafe',
        '--secondary-foreground': '#1e3a8a',
        '--accent': '#3b82f6',
        '--accent-foreground': '#ffffff',
        '--destructive': '#dc2626',
        '--destructive-foreground': '#ffffff',
        '--background': '#f8fafc',
        '--foreground': '#0f172a',
        '--card': '#ffffff',
        '--card-foreground': '#0f172a',
        '--border': '#cbd5e1',
        '--input': '#cbd5e1',
        '--ring': '#3b82f6'
      }
    },
    {
      name: 'Elegant Purple',
      description: 'Sophisticated purple theme for events',
      colors: {
        '--primary': '#7c3aed',
        '--primary-foreground': '#ffffff',
        '--secondary': '#ede9fe',
        '--secondary-foreground': '#5b21b6',
        '--accent': '#8b5cf6',
        '--accent-foreground': '#ffffff',
        '--destructive': '#dc2626',
        '--destructive-foreground': '#ffffff',
        '--background': '#fafaf9',
        '--foreground': '#0c0a09',
        '--card': '#ffffff',
        '--card-foreground': '#0c0a09',
        '--border': '#e7e5e4',
        '--input': '#e7e5e4',
        '--ring': '#8b5cf6'
      }
    },
    {
      name: 'Warm Gold',
      description: 'Warm gold theme for premium feel',
      colors: {
        '--primary': '#d97706',
        '--primary-foreground': '#ffffff',
        '--secondary': '#fef3c7',
        '--secondary-foreground': '#92400e',
        '--accent': '#f59e0b',
        '--accent-foreground': '#ffffff',
        '--destructive': '#dc2626',
        '--destructive-foreground': '#ffffff',
        '--background': '#fffbeb',
        '--foreground': '#1c1917',
        '--card': '#ffffff',
        '--card-foreground': '#1c1917',
        '--border': '#d6d3d1',
        '--input': '#d6d3d1',
        '--ring': '#f59e0b'
      }
    },
    {
      name: 'Dark Mode',
      description: 'Dark theme for low-light environments',
      colors: {
        '--primary': '#fbbf24',
        '--primary-foreground': '#1f2937',
        '--secondary': '#374151',
        '--secondary-foreground': '#f9fafb',
        '--accent': '#60a5fa',
        '--accent-foreground': '#1f2937',
        '--destructive': '#f87171',
        '--destructive-foreground': '#1f2937',
        '--background': '#111827',
        '--foreground': '#f9fafb',
        '--card': '#1f2937',
        '--card-foreground': '#f9fafb',
        '--border': '#374151',
        '--input': '#374151',
        '--ring': '#60a5fa'
      }
    }
  ];

  // Load saved theme on component mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Load saved theme from localStorage
  const loadSavedTheme = () => {
    try {
      const savedTheme = localStorage.getItem('adminCustomTheme');
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme);
        setThemeColors(current => 
          current.map(color => ({
            ...color,
            currentValue: parsedTheme[color.cssVariable] || color.defaultValue
          }))
        );
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  };

  // Update color value
  const updateColor = (cssVariable: string, newValue: string) => {
    // Validate hex color
    if (!/^#[0-9A-F]{6}$/i.test(newValue) && newValue !== '') {
      return;
    }

    setThemeColors(current =>
      current.map(color =>
        color.cssVariable === cssVariable
          ? { ...color, currentValue: newValue }
          : color
      )
    );
    setHasChanges(true);

    // Apply to CSS if in preview mode
    if (isPreviewMode && newValue) {
      document.documentElement.style.setProperty(cssVariable, newValue);
    }
  };

  // Apply predefined palette
  const applyPalette = (palette: ColorPalette) => {
    setThemeColors(current =>
      current.map(color => ({
        ...color,
        currentValue: palette.colors[color.cssVariable] || color.currentValue
      }))
    );
    setSelectedPalette(palette.name);
    setHasChanges(true);

    // Apply to CSS if in preview mode
    if (isPreviewMode) {
      Object.entries(palette.colors).forEach(([variable, value]) => {
        document.documentElement.style.setProperty(variable, value);
      });
    }
  };

  // Toggle preview mode
  const togglePreview = () => {
    if (isPreviewMode) {
      // Disable preview - restore original styles
      themeColors.forEach(color => {
        document.documentElement.style.removeProperty(color.cssVariable);
      });
    } else {
      // Enable preview - apply current colors
      themeColors.forEach(color => {
        if (color.currentValue) {
          document.documentElement.style.setProperty(color.cssVariable, color.currentValue);
        }
      });
    }
    setIsPreviewMode(!isPreviewMode);
  };

  // Save theme
  const saveTheme = () => {
    try {
      const themeData: Record<string, string> = {};
      themeColors.forEach(color => {
        if (color.currentValue) {
          themeData[color.cssVariable] = color.currentValue;
        }
      });

      localStorage.setItem('adminCustomTheme', JSON.stringify(themeData));
      
      // Apply theme permanently
      Object.entries(themeData).forEach(([variable, value]) => {
        document.documentElement.style.setProperty(variable, value);
      });

      setHasChanges(false);
      toast({
        title: "Theme Saved",
        description: "Your custom theme has been saved and applied.",
      });
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save theme. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset to default theme
  const resetToDefault = () => {
    setThemeColors(current =>
      current.map(color => ({
        ...color,
        currentValue: color.defaultValue
      }))
    );
    setSelectedPalette('Default SteppersLife');
    setHasChanges(true);

    // Apply default colors if in preview mode
    if (isPreviewMode) {
      themeColors.forEach(color => {
        document.documentElement.style.setProperty(color.cssVariable, color.defaultValue);
      });
    }

    // Clear saved theme
    localStorage.removeItem('adminCustomTheme');
    
    toast({
      title: "Theme Reset",
      description: "Theme has been reset to default colors.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Customization</h1>
          <p className="text-muted-foreground">
            Customize platform colors and branding
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            onClick={togglePreview}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{isPreviewMode ? 'Exit Preview' : 'Preview Changes'}</span>
          </Button>
        </div>
      </div>

      {/* Preview Mode Alert */}
      {isPreviewMode && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Preview mode is active. Changes are temporarily applied to see how they look.
            Save your changes to make them permanent.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="colors">Custom Colors</TabsTrigger>
          <TabsTrigger value="palettes">Predefined Palettes</TabsTrigger>
        </TabsList>

        {/* Custom Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Color Customization</span>
              </CardTitle>
              <CardDescription>
                Customize individual theme colors. Use hex color codes (#000000 format).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themeColors.map((color) => (
                  <div key={color.cssVariable} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={color.cssVariable} className="font-medium">
                        {color.name}
                      </Label>
                      <div
                        className="w-8 h-8 rounded border-2 border-gray-300"
                        style={{ backgroundColor: color.currentValue }}
                      />
                    </div>
                    <Input
                      id={color.cssVariable}
                      type="text"
                      value={color.currentValue}
                      onChange={(e) => updateColor(color.cssVariable, e.target.value)}
                      placeholder="#000000"
                      className="font-mono"
                    />
                    <p className="text-sm text-muted-foreground">
                      {color.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predefined Palettes Tab */}
        <TabsContent value="palettes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predefined Color Palettes</CardTitle>
              <CardDescription>
                Choose from carefully crafted color palettes designed for different moods and occasions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colorPalettes.map((palette) => (
                  <Card
                    key={palette.name}
                    className={`cursor-pointer transition-colors ${
                      selectedPalette === palette.name
                        ? 'ring-2 ring-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => applyPalette(palette)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{palette.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {palette.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-1 mb-3">
                        {Object.entries(palette.colors)
                          .filter(([key]) => ['--primary', '--secondary', '--accent', '--background', '--card'].includes(key))
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: value }}
                              title={key}
                            />
                          ))}
                      </div>
                      {selectedPalette === palette.name && (
                        <Badge variant="default" className="text-xs">
                          Currently Selected
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={resetToDefault}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reset to Default</span>
        </Button>

        <div className="flex items-center space-x-3">
          <Button
            onClick={saveTheme}
            disabled={!hasChanges}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Theme</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizationPage;