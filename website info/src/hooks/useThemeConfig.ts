import { useState, useEffect, useCallback } from 'react';
import { themeConfigService, ThemeSettings, PredefinedPalette } from '@/services/themeConfigService';
import { toast } from 'sonner';

export interface ThemeConfigState {
  currentTheme: ThemeSettings | null;
  predefinedPalettes: PredefinedPalette[];
  loading: boolean;
  error: string | null;
}

export interface ThemeConfigActions {
  fetchThemeConfig: () => Promise<void>;
  updateTheme: (newSettings: Partial<ThemeSettings>) => Promise<void>;
  resetThemeToDefault: () => Promise<void>;
}

export const useThemeConfig = (): ThemeConfigState & ThemeConfigActions => {
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings | null>(null);
  const [predefinedPalettes, setPredefinedPalettes] = useState<PredefinedPalette[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThemeConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [theme, palettes] = await Promise.all([
        themeConfigService.getThemeSettings(),
        themeConfigService.getPredefinedPalettes(),
      ]);
      setCurrentTheme(theme);
      setPredefinedPalettes(palettes);
    } catch (err: any) {
      console.error('Failed to fetch theme configuration:', err);
      setError(err.message || 'Failed to fetch theme configuration');
      toast.error(err.message || 'Failed to fetch theme configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemeConfig();
  }, [fetchThemeConfig]);

  const updateTheme = useCallback(async (newSettings: Partial<ThemeSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTheme = await themeConfigService.updateThemeSettings(newSettings);
      setCurrentTheme(updatedTheme);
      toast.success('Theme settings updated successfully!');
    } catch (err: any) {
      toast.error(`Failed to update theme: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetThemeToDefault = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resetTheme = await themeConfigService.resetToDefault();
      setCurrentTheme(resetTheme);
      toast.success('Theme reset to default successfully!');
    } catch (err: any) {
      toast.error(`Failed to reset theme: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentTheme,
    predefinedPalettes,
    loading,
    error,
    fetchThemeConfig,
    updateTheme,
    resetThemeToDefault,
  };
}; 