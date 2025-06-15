export interface ThemeSettings {
  primaryButtonColor: string;
  secondaryButtonColor: string;
  mainBackground: string;
  headerFooterBackground: string;
  defaultTextLinkColor: string;
  predefinedPaletteId: string | null; // ID of a predefined palette if selected
}

export interface PredefinedPalette {
  id: string;
  name: string;
  colors: { // Corresponds to ThemeSettings fields
    primaryButtonColor: string;
    secondaryButtonColor: string;
    mainBackground: string;
    headerFooterBackground: string;
    defaultTextLinkColor: string;
  };
}

const defaultTheme: ThemeSettings = {
  primaryButtonColor: '#6366F1', // indigo-500
  secondaryButtonColor: '#6B7280', // gray-500
  mainBackground: '#F9FAFB', // gray-50
  headerFooterBackground: '#FFFFFF',
  defaultTextLinkColor: '#4F46E5', // indigo-600
  predefinedPaletteId: null,
};

const mockPredefinedPalettes: PredefinedPalette[] = [
  {
    id: 'palette-1',
    name: 'Default SteppersLife',
    colors: {
      primaryButtonColor: '#6366F1',
      secondaryButtonColor: '#6B7280',
      mainBackground: '#F9FAFB',
      headerFooterBackground: '#FFFFFF',
      defaultTextLinkColor: '#4F46E5',
    },
  },
  {
    id: 'palette-2',
    name: 'Warm Sunset',
    colors: {
      primaryButtonColor: '#F59E0B', // amber-500
      secondaryButtonColor: '#EF4444', // red-500
      mainBackground: '#FFFBEB', // amber-50
      headerFooterBackground: '#FEF3C7', // amber-100
      defaultTextLinkColor: '#D97706', // amber-600
    },
  },
  {
    id: 'palette-3',
    name: 'Cool Breeze',
    colors: {
      primaryButtonColor: '#06B6D4', // cyan-500
      secondaryButtonColor: '#60A5FA', // blue-400
      mainBackground: '#ECFEFF', // cyan-50
      headerFooterBackground: '#CFFAFE', // cyan-100
      defaultTextLinkColor: '#0891B2', // cyan-600
    },
  },
];

class ThemeConfigService {
  private currentTheme: ThemeSettings = { ...defaultTheme };
  private predefinedPalettes: PredefinedPalette[] = [...mockPredefinedPalettes];

  async getThemeSettings(): Promise<ThemeSettings> {
    console.log('ThemeConfigService: Fetching theme settings.');
    return new Promise((resolve) => setTimeout(() => resolve({ ...this.currentTheme }), 300));
  }

  async updateThemeSettings(newSettings: Partial<ThemeSettings>): Promise<ThemeSettings> {
    console.log('ThemeConfigService: Updating theme settings.');
    this.currentTheme = { ...this.currentTheme, ...newSettings };
    console.log('AUDIT: Theme settings updated.');
    return new Promise((resolve) => setTimeout(() => resolve({ ...this.currentTheme }), 500));
  }

  async getPredefinedPalettes(): Promise<PredefinedPalette[]> {
    console.log('ThemeConfigService: Fetching predefined palettes.');
    return new Promise((resolve) => setTimeout(() => resolve([...this.predefinedPalettes]), 300));
  }

  async resetToDefault(): Promise<ThemeSettings> {
    console.log('ThemeConfigService: Resetting to default theme.');
    this.currentTheme = { ...defaultTheme };
    console.log('AUDIT: Theme reset to default.');
    return new Promise((resolve) => setTimeout(() => resolve({ ...this.currentTheme }), 500));
  }
}

export const themeConfigService = new ThemeConfigService(); 