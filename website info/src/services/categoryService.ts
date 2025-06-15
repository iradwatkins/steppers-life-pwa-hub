import { apiClient } from './apiClient';

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

class CategoryService {
  private static instance: CategoryService;
  private categoriesCache: Category[] | null = null;
  private cacheTimestamp: number = 0;
  private cacheExpiryTime: number = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  // Check if cache is valid
  private isCacheValid(): boolean {
    return this.categoriesCache !== null && 
           (Date.now() - this.cacheTimestamp) < this.cacheExpiryTime;
  }

  // Clear cache
  private clearCache(): void {
    this.categoriesCache = null;
    this.cacheTimestamp = 0;
  }

  // Update cache
  private updateCache(categories: Category[]): void {
    this.categoriesCache = categories;
    this.cacheTimestamp = Date.now();
  }

  // Get all categories
  async getCategories(forceRefresh: boolean = false): Promise<{
    success: boolean;
    categories?: Category[];
    error?: string;
  }> {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && this.isCacheValid()) {
      return {
        success: true,
        categories: this.categoriesCache!
      };
    }

    try {
      const response = await apiClient.getCategories();
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      const categories = response.data || [];
      this.updateCache(categories);

      return {
        success: true,
        categories
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories'
      };
    }
  }

  // Get category by ID
  async getCategory(categoryId: number): Promise<{
    success: boolean;
    category?: Category;
    error?: string;
  }> {
    try {
      // First try to get from cache
      if (this.isCacheValid()) {
        const category = this.categoriesCache!.find(cat => cat.id === categoryId);
        if (category) {
          return { success: true, category };
        }
      }

      // If not in cache, fetch all categories and find the one we need
      const response = await this.getCategories(true);
      
      if (!response.success) {
        return { success: false, error: response.error };
      }

      const category = response.categories!.find(cat => cat.id === categoryId);
      
      if (!category) {
        return { success: false, error: 'Category not found' };
      }

      return { success: true, category };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch category'
      };
    }
  }

  // Get category by name
  async getCategoryByName(name: string): Promise<{
    success: boolean;
    category?: Category;
    error?: string;
  }> {
    try {
      const response = await this.getCategories();
      
      if (!response.success) {
        return { success: false, error: response.error };
      }

      const category = response.categories!.find(
        cat => cat.name.toLowerCase() === name.toLowerCase()
      );
      
      if (!category) {
        return { success: false, error: 'Category not found' };
      }

      return { success: true, category };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch category'
      };
    }
  }

  // Create new category
  async createCategory(categoryData: CreateCategoryData): Promise<{
    success: boolean;
    category?: Category;
    error?: string;
  }> {
    try {
      const response = await apiClient.createCategory(categoryData);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      // Clear cache so it will be refreshed on next request
      this.clearCache();

      return {
        success: true,
        category: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create category'
      };
    }
  }

  // Update existing category
  async updateCategory(categoryId: number, categoryData: UpdateCategoryData): Promise<{
    success: boolean;
    category?: Category;
    error?: string;
  }> {
    try {
      const response = await apiClient.updateCategory(categoryId, categoryData);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      // Clear cache so it will be refreshed on next request
      this.clearCache();

      return {
        success: true,
        category: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update category'
      };
    }
  }

  // Delete category
  async deleteCategory(categoryId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await apiClient.deleteCategory(categoryId);
      
      if (response.error) {
        return { success: false, error: response.error };
      }

      // Clear cache so it will be refreshed on next request
      this.clearCache();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete category'
      };
    }
  }

  // Get categories formatted for dropdown/select components
  async getCategoriesForSelect(): Promise<{
    success: boolean;
    options?: Array<{ value: number; label: string; description?: string }>;
    error?: string;
  }> {
    try {
      const response = await this.getCategories();
      
      if (!response.success) {
        return { success: false, error: response.error };
      }

      const options = response.categories!.map(category => ({
        value: category.id,
        label: category.name,
        description: category.description
      }));

      return { success: true, options };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to format categories'
      };
    }
  }

  // Search categories by name
  searchCategories(query: string): Promise<{
    success: boolean;
    categories?: Category[];
    error?: string;
  }> {
    return new Promise(async (resolve) => {
      try {
        const response = await this.getCategories();
        
        if (!response.success) {
          resolve({ success: false, error: response.error });
          return;
        }

        const filteredCategories = response.categories!.filter(category =>
          category.name.toLowerCase().includes(query.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(query.toLowerCase()))
        );

        resolve({
          success: true,
          categories: filteredCategories
        });
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to search categories'
        });
      }
    });
  }

  // Validate category data
  validateCategoryData(data: CreateCategoryData | UpdateCategoryData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if ('name' in data && data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Category name is required');
      } else if (data.name.trim().length < 2) {
        errors.push('Category name must be at least 2 characters long');
      } else if (data.name.trim().length > 100) {
        errors.push('Category name must be less than 100 characters');
      }
    }

    if (data.description !== undefined && data.description !== null) {
      if (data.description.length > 500) {
        errors.push('Category description must be less than 500 characters');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Check if category name is available
  async isCategoryNameAvailable(name: string, excludeId?: number): Promise<{
    available: boolean;
    error?: string;
  }> {
    try {
      const response = await this.getCategories();
      
      if (!response.success) {
        return { available: false, error: response.error };
      }

      const existingCategory = response.categories!.find(category => 
        category.name.toLowerCase() === name.toLowerCase() &&
        category.id !== excludeId
      );

      return { available: !existingCategory };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Failed to check category name availability'
      };
    }
  }

  // Sort categories by name
  sortCategories(categories: Category[], direction: 'asc' | 'desc' = 'asc'): Category[] {
    return [...categories].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  // Get category statistics (if needed)
  async getCategoryStatistics(categoryId: number): Promise<{
    success: boolean;
    statistics?: {
      eventCount: number;
      totalTicketsSold: number;
      totalRevenue: number;
    };
    error?: string;
  }> {
    try {
      // This would require integration with event and ticket services
      // For now, return placeholder data
      return {
        success: true,
        statistics: {
          eventCount: 0,
          totalTicketsSold: 0,
          totalRevenue: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get category statistics'
      };
    }
  }

  // Export categories to CSV
  exportCategoriesToCSV(categories?: Category[]): string {
    const categoriesToExport = categories || this.categoriesCache || [];
    
    const headers = ['ID', 'Name', 'Description', 'Created At', 'Updated At'];
    const rows = categoriesToExport.map(category => [
      category.id.toString(),
      category.name,
      category.description || '',
      category.created_at,
      category.updated_at
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Import categories from CSV (validation only)
  validateCategoriesFromCSV(csvContent: string): {
    valid: boolean;
    categories?: CreateCategoryData[];
    errors: string[];
  } {
    try {
      const lines = csvContent.split('\n').filter(line => line.trim());
      const errors: string[] = [];
      const categories: CreateCategoryData[] = [];

      if (lines.length < 2) {
        return { valid: false, errors: ['CSV must contain at least a header and one data row'] };
      }

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const fields = line.split(',').map(field => field.replace(/^"|"$/g, '').trim());

        if (fields.length < 2) {
          errors.push(`Row ${i + 1}: Invalid format - must have at least name and description`);
          continue;
        }

        const [name, description] = fields;
        const categoryData: CreateCategoryData = { name, description };
        
        const validation = this.validateCategoryData(categoryData);
        if (!validation.valid) {
          errors.push(`Row ${i + 1}: ${validation.errors.join(', ')}`);
          continue;
        }

        categories.push(categoryData);
      }

      return {
        valid: errors.length === 0,
        categories: errors.length === 0 ? categories : undefined,
        errors
      };
    } catch (error) {
      return {
        valid: false,
        errors: ['Failed to parse CSV content']
      };
    }
  }
}

// Export singleton instance
export const categoryService = CategoryService.getInstance();
export default categoryService; 