export interface Category {
  id: string;
  name: string;
  type: 'event' | 'class';
  isActive: boolean;
  order: number;
}

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  defaultTimezone: string;
  logoUrl: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface VODSettings {
  hostingFeePercentage: number; // e.g., 0.15 for 15%
  introductoryOfferActive: boolean;
  introductoryOfferDetails: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isActive: boolean;
}

const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Hip Hop', type: 'class', isActive: true, order: 1 },
  { id: 'cat-2', name: 'Afrobeat', type: 'class', isActive: true, order: 2 },
  { id: 'cat-3', name: 'Jazz Dance', type: 'class', isActive: true, order: 3 },
  { id: 'cat-4', name: 'Salsa Night', type: 'event', isActive: true, order: 1 },
  { id: 'cat-5', name: 'Workshop Series', type: 'event', isActive: true, order: 2 },
];

const mockSiteSettings: SiteSettings = {
  siteName: 'Steppers Life',
  contactEmail: 'info@stepperslife.com',
  defaultTimezone: 'America/New_York',
  logoUrl: '/logos/stepperslife-logo.png',
  socialLinks: {
    facebook: 'https://facebook.com/stepperslife',
    twitter: 'https://twitter.com/stepperslife',
    instagram: 'https://instagram.com/stepperslife',
  },
};

const mockVODSettings: VODSettings = {
  hostingFeePercentage: 0.10,
  introductoryOfferActive: true,
  introductoryOfferDetails: 'First month free for new instructors!',
};

const mockPickupLocations: PickupLocation[] = [
  { id: 'loc-1', name: 'Main Studio', address: '123 Dance St', city: 'New York', state: 'NY', zip: '10001', isActive: true },
  { id: 'loc-2', name: 'Downtown Hub', address: '456 Beat Ave', city: 'New York', state: 'NY', zip: '10005', isActive: false },
];

class PlatformConfigService {
  private categories: Category[] = [...mockCategories];
  private siteSettings: SiteSettings = { ...mockSiteSettings };
  private vodSettings: VODSettings = { ...mockVODSettings };
  private pickupLocations: PickupLocation[] = [...mockPickupLocations];

  // Category Management
  async getCategories(type?: 'event' | 'class'): Promise<Category[]> {
    console.log(`PlatformConfigService: Fetching categories of type: ${type || 'all'}.`);
    let filteredCategories = this.categories;
    if (type) {
      filteredCategories = this.categories.filter(cat => cat.type === type);
    }
    return new Promise((resolve) => setTimeout(() => resolve(filteredCategories.sort((a, b) => a.order - b.order)), 300));
  }

  async updateCategory(updatedCategory: Category): Promise<Category> {
    console.log(`PlatformConfigService: Updating category ${updatedCategory.id}.`);
    const index = this.categories.findIndex(cat => cat.id === updatedCategory.id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    this.categories[index] = updatedCategory;
    console.log(`AUDIT: Category '${updatedCategory.name}' updated.`);
    return new Promise((resolve) => setTimeout(() => resolve(updatedCategory), 500));
  }

  async addCategory(newCategory: Omit<Category, 'id' | 'order'>): Promise<Category> {
    console.log(`PlatformConfigService: Adding new category: ${newCategory.name}.`);
    const newId = `cat-${Math.random().toString(36).substr(2, 9)}`;
    const newOrder = this.categories.length > 0 ? Math.max(...this.categories.map(c => c.order)) + 1 : 1;
    const categoryToAdd: Category = { ...newCategory, id: newId, order: newOrder };
    this.categories.push(categoryToAdd);
    console.log(`AUDIT: New category '${categoryToAdd.name}' added.`);
    return new Promise((resolve) => setTimeout(() => resolve(categoryToAdd), 500));
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    console.log(`PlatformConfigService: Deleting category ${id}.`);
    const initialLength = this.categories.length;
    this.categories = this.categories.filter(cat => cat.id !== id);
    if (this.categories.length === initialLength) {
      throw new Error('Category not found');
    }
    console.log(`AUDIT: Category '${id}' deleted.`);
    return new Promise((resolve) => setTimeout(() => resolve({ message: `Category ${id} deleted.` }), 300));
  }

  async reorderCategories(orderedCategoryIds: string[]): Promise<Category[]> {
    console.log('PlatformConfigService: Reordering categories.');
    const updatedCategories = orderedCategoryIds.map((id, index) => {
      const category = this.categories.find(cat => cat.id === id);
      if (!category) {
        throw new Error(`Category with id ${id} not found during reorder.`);
      }
      return { ...category, order: index + 1 };
    });
    this.categories = updatedCategories;
    console.log('AUDIT: Categories reordered.');
    return new Promise((resolve) => setTimeout(() => resolve(this.categories.sort((a, b) => a.order - b.order)), 500));
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    console.log('PlatformConfigService: Fetching site settings.');
    return new Promise((resolve) => setTimeout(() => resolve({ ...this.siteSettings }), 300));
  }

  async updateSiteSettings(updatedSettings: Partial<SiteSettings>): Promise<SiteSettings> {
    console.log('PlatformConfigService: Updating site settings.');
    this.siteSettings = { ...this.siteSettings, ...updatedSettings };
    console.log('AUDIT: Site settings updated.');
    return new Promise((resolve) => setTimeout(() => resolve({ ...this.siteSettings }), 500));
  }

  // VOD Settings
  async getVODSettings(): Promise<VODSettings> {
    console.log('PlatformConfigService: Fetching VOD settings.');
    return new Promise((resolve) => setTimeout(() => resolve({ ...this.vodSettings }), 300));
  }

  async updateVODSettings(updatedSettings: Partial<VODSettings>): Promise<VODSettings> {
    console.log('PlatformConfigService: Updating VOD settings.');
    this.vodSettings = { ...this.vodSettings, ...updatedSettings };
    console.log('AUDIT: VOD settings updated.');
    return new Promise((resolve) => setTimeout(() => resolve({ ...this.vodSettings }), 500));
  }

  // Pickup Location Management (if applicable)
  async getPickupLocations(): Promise<PickupLocation[]> {
    console.log('PlatformConfigService: Fetching pickup locations.');
    return new Promise((resolve) => setTimeout(() => resolve([...this.pickupLocations]), 300));
  }

  async addPickupLocation(newLocation: Omit<PickupLocation, 'id' | 'isActive'>): Promise<PickupLocation> {
    console.log(`PlatformConfigService: Adding new pickup location: ${newLocation.name}.`);
    const newId = `loc-${Math.random().toString(36).substr(2, 9)}`;
    const locationToAdd: PickupLocation = { ...newLocation, id: newId, isActive: true };
    this.pickupLocations.push(locationToAdd);
    console.log(`AUDIT: New pickup location '${locationToAdd.name}' added.`);
    return new Promise((resolve) => setTimeout(() => resolve(locationToAdd), 500));
  }

  async updatePickupLocation(updatedLocation: PickupLocation): Promise<PickupLocation> {
    console.log(`PlatformConfigService: Updating pickup location ${updatedLocation.id}.`);
    const index = this.pickupLocations.findIndex(loc => loc.id === updatedLocation.id);
    if (index === -1) {
      throw new Error('Pickup location not found');
    }
    this.pickupLocations[index] = updatedLocation;
    console.log(`AUDIT: Pickup location '${updatedLocation.name}' updated.`);
    return new Promise((resolve) => setTimeout(() => resolve(updatedLocation), 500));
  }

  async deletePickupLocation(id: string): Promise<{ message: string }> {
    console.log(`PlatformConfigService: Deleting pickup location ${id}.`);
    const initialLength = this.pickupLocations.length;
    this.pickupLocations = this.pickupLocations.filter(loc => loc.id !== id);
    if (this.pickupLocations.length === initialLength) {
      throw new Error('Pickup location not found');
    }
    console.log(`AUDIT: Pickup location '${id}' deleted.`);
    return new Promise((resolve) => setTimeout(() => resolve({ message: `Pickup location ${id} deleted.` }), 300));
  }
}

export const platformConfigService = new PlatformConfigService(); 