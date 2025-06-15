import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useThemeConfig } from '@/hooks/useThemeConfig';
import { ThemeSettings, PredefinedPalette } from '@/services/themeConfigService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ThemeCustomizationPage: React.FC = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const navigate = useNavigate();

  const {
    currentTheme,
    predefinedPalettes,
    loading,
    error,
    updateTheme,
    resetThemeToDefault,
  } = useThemeConfig();

  const [tempThemeSettings, setTempThemeSettings] = useState<Partial<ThemeSettings>>({});

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("You are not authorized to view this page.");
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (currentTheme) {
      setTempThemeSettings(currentTheme);
    }
  }, [currentTheme]);

  const handleColorChange = (key: keyof ThemeSettings, value: string) => {
    setTempThemeSettings(prev => ({
      ...prev,
      [key]: value,
      predefinedPaletteId: null, // Clear predefined palette selection if custom color is chosen
    }));
  };

  const handleSaveTheme = async () => {
    if (tempThemeSettings) {
      await updateTheme(tempThemeSettings);
    }
  };

  const handleResetTheme = async () => {
    if (window.confirm('Are you sure you want to reset all theme settings to default?')) {
      await resetThemeToDefault();
    }
  };

  const handlePaletteSelect = (paletteId: string) => {
    const selectedPalette = predefinedPalettes.find(p => p.id === paletteId);
    if (selectedPalette) {
      setTempThemeSettings({
        ...selectedPalette.colors,
        predefinedPaletteId: selectedPalette.id,
      });
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-primary text-xl">Loading theme configurations...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Theme Customization</h1>
          <p className="text-lg text-muted-foreground">Easily customize the website's color scheme to match your branding.</p>
        </div>

        {error && (
          <div className="text-red-500 text-center py-4 mb-4 border border-red-500 rounded-md">
            Error: {error}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Color Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="primaryButtonColor">Primary Button Color</Label>
                <Input
                  id="primaryButtonColor"
                  type="color"
                  value={tempThemeSettings?.primaryButtonColor || '#000000'}
                  onChange={(e) => handleColorChange('primaryButtonColor', e.target.value)}
                  className="h-10 w-full"
                />
                <Input
                  type="text"
                  value={tempThemeSettings?.primaryButtonColor || ''}
                  onChange={(e) => handleColorChange('primaryButtonColor', e.target.value)}
                  placeholder="#RRGGBB"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="secondaryButtonColor">Secondary Button Color</Label>
                <Input
                  id="secondaryButtonColor"
                  type="color"
                  value={tempThemeSettings?.secondaryButtonColor || '#000000'}
                  onChange={(e) => handleColorChange('secondaryButtonColor', e.target.value)}
                  className="h-10 w-full"
                />
                <Input
                  type="text"
                  value={tempThemeSettings?.secondaryButtonColor || ''}
                  onChange={(e) => handleColorChange('secondaryButtonColor', e.target.value)}
                  placeholder="#RRGGBB"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="mainBackground">Main Background Color</Label>
                <Input
                  id="mainBackground"
                  type="color"
                  value={tempThemeSettings?.mainBackground || '#000000'}
                  onChange={(e) => handleColorChange('mainBackground', e.target.value)}
                  className="h-10 w-full"
                />
                <Input
                  type="text"
                  value={tempThemeSettings?.mainBackground || ''}
                  onChange={(e) => handleColorChange('mainBackground', e.target.value)}
                  placeholder="#RRGGBB"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="headerFooterBackground">Header/Footer Background Color</Label>
                <Input
                  id="headerFooterBackground"
                  type="color"
                  value={tempThemeSettings?.headerFooterBackground || '#000000'}
                  onChange={(e) => handleColorChange('headerFooterBackground', e.target.value)}
                  className="h-10 w-full"
                />
                <Input
                  type="text"
                  value={tempThemeSettings?.headerFooterBackground || ''}
                  onChange={(e) => handleColorChange('headerFooterBackground', e.target.value)}
                  placeholder="#RRGGBB"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="defaultTextLinkColor">Default Text Link Color</Label>
                <Input
                  id="defaultTextLinkColor"
                  type="color"
                  value={tempThemeSettings?.defaultTextLinkColor || '#000000'}
                  onChange={(e) => handleColorChange('defaultTextLinkColor', e.target.value)}
                  className="h-10 w-full"
                />
                <Input
                  type="text"
                  value={tempThemeSettings?.defaultTextLinkColor || ''}
                  onChange={(e) => handleColorChange('defaultTextLinkColor', e.target.value)}
                  placeholder="#RRGGBB"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Label htmlFor="paletteSelect">Select Predefined Palette</Label>
              <Select
                value={tempThemeSettings?.predefinedPaletteId || ''}
                onValueChange={handlePaletteSelect}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Choose a palette" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedPalettes.map(palette => (
                    <SelectItem key={palette.id} value={palette.id}>
                      {palette.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleResetTheme} disabled={loading}>
                Reset to Default
              </Button>
              <Button onClick={handleSaveTheme} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Theme Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Preview Section (Conceptual - would require global CSS/Theming context) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              style={{
                backgroundColor: tempThemeSettings?.mainBackground || currentTheme?.mainBackground || '#F9FAFB',
                color: tempThemeSettings?.defaultTextLinkColor || currentTheme?.defaultTextLinkColor || '#4F46E5',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #E0E0E0',
              }}
            >
              <h3 
                style={{
                  backgroundColor: tempThemeSettings?.headerFooterBackground || currentTheme?.headerFooterBackground || '#FFFFFF',
                  padding: '10px',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  color: tempThemeSettings?.defaultTextLinkColor || currentTheme?.defaultTextLinkColor || '#4F46E5',
                }}
              >
                Header Preview
              </h3>
              <p>This is a sample text to show the default text link color.</p>
              <button 
                style={{
                  backgroundColor: tempThemeSettings?.primaryButtonColor || currentTheme?.primaryButtonColor || '#6366F1',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                Primary Button
              </button>
              <button 
                style={{
                  backgroundColor: tempThemeSettings?.secondaryButtonColor || currentTheme?.secondaryButtonColor || '#6B7280',
                  color: 'white',
                  padding: '10px 15px',
                  borderRadius: '5px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Secondary Button
              </button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Note: Full live preview requires global CSS variable integration, this is a conceptual representation.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThemeCustomizationPage; 