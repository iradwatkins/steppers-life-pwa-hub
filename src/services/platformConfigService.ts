import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions for platform configuration
type PlatformCategory = Database['public']['Tables']['platform_categories']['Row'];
type PlatformCategoryInsert = Database['public']['Tables']['platform_categories']['Insert'];
type PlatformCategoryUpdate = Database['public']['Tables']['platform_categories']['Update'];

type PlatformSetting = Database['public']['Tables']['platform_settings']['Row'];
type PlatformSettingInsert = Database['public']['Tables']['platform_settings']['Insert'];
type PlatformSettingUpdate = Database['public']['Tables']['platform_settings']['Update'];

type VodConfiguration = Database['public']['Tables']['vod_configuration']['Row'];
type VodConfigurationUpdate = Database['public']['Tables']['vod_configuration']['Update'];

type PickupLocation = Database['public']['Tables']['pickup_locations']['Row'];
type PickupLocationInsert = Database['public']['Tables']['pickup_locations']['Insert'];
type PickupLocationUpdate = Database['public']['Tables']['pickup_locations']['Update'];

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  type: 'event' | 'class' | 'content';
  colorHex?: string;
  iconName?: string;
  parentId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  colorHex?: string;
  iconName?: string;
  isActive?: boolean;
  sortOrder?: number;
  parentId?: string;
  metadata?: Record<string, any>;
}

export interface CreateSettingData {
  key: string;
  value: string;
  type?: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  category?: string;
  isPublic?: boolean;
  validationRules?: Record<string, any>;
}

export interface UpdateSettingData {
  value?: string;
  type?: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description?: string;
  category?: string;
  isPublic?: boolean;
  validationRules?: Record<string, any>;
}

export interface CreatePickupLocationData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  hoursOfOperation?: Record<string, string>;
  specialInstructions?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdatePickupLocationData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  hoursOfOperation?: Record<string, string>;
  specialInstructions?: string;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UpdateVodConfigData {
  hostingFeeAmount?: number;
  hostingFeeCurrency?: string;
  introductoryOfferEnabled?: boolean;
  introductoryOfferAmount?: number;
  introductoryOfferDescription?: string;
  introductoryOfferExpiresAt?: string;
  isActive?: boolean;
}

export class PlatformConfigService {
  // ========== CATEGORY MANAGEMENT ==========
  
  // Get all categories with optional filtering
  static async getCategories(filters?: {
    type?: 'event' | 'class' | 'content';
    isActive?: boolean;
    parentId?: string;
  }): Promise<PlatformCategory[]> {
    console.log('🔧 PlatformConfigService.getCategories called with filters:', filters);
    
    let query = supabase
      .from('platform_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    
    if (filters?.parentId !== undefined) {
      if (filters.parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', filters.parentId);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
    
    console.log('✅ Categories fetched successfully:', data?.length);
    return data || [];
  }
  
  // Get a single category by ID
  static async getCategory(id: string): Promise<PlatformCategory | null> {
    console.log('🔧 PlatformConfigService.getCategory called with ID:', id);
    
    const { data, error } = await supabase
      .from('platform_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('❌ Error fetching category:', error);
      throw new Error(`Failed to fetch category: ${error.message}`);
    }
    
    console.log('✅ Category fetched successfully');
    return data;
  }
  
  // Create a new category
  static async createCategory(categoryData: CreateCategoryData): Promise<PlatformCategory> {
    console.log('🔧 PlatformConfigService.createCategory called with:', categoryData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create categories');
    }
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('platform_categories')
      .select('id')
      .eq('slug', categoryData.slug)
      .single();
    
    if (existing) {
      throw new Error(`A category with slug "${categoryData.slug}" already exists`);
    }
    
    const categoryInsert: PlatformCategoryInsert = {
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description,
      type: categoryData.type,
      color_hex: categoryData.colorHex || '#3B82F6',
      icon_name: categoryData.iconName,
      parent_id: categoryData.parentId,
      metadata: categoryData.metadata || {},
      created_by: user.id,
      updated_by: user.id
    };
    
    const { data, error } = await supabase
      .from('platform_categories')
      .insert(categoryInsert)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating category:', error);
      throw new Error(`Failed to create category: ${error.message}`);
    }
    
    console.log('✅ Category created successfully:', data.id);
    return data;
  }
  
  // Update an existing category
  static async updateCategory(id: string, updateData: UpdateCategoryData): Promise<PlatformCategory> {
    console.log('🔧 PlatformConfigService.updateCategory called with:', { id, updateData });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update categories');
    }
    
    // Check if new slug already exists (if slug is being updated)
    if (updateData.slug) {
      const { data: existing } = await supabase
        .from('platform_categories')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single();
      
      if (existing) {
        throw new Error(`A category with slug "${updateData.slug}" already exists`);
      }
    }
    
    const categoryUpdate: PlatformCategoryUpdate = {
      ...updateData,
      color_hex: updateData.colorHex,
      icon_name: updateData.iconName,
      is_active: updateData.isActive,
      sort_order: updateData.sortOrder,
      parent_id: updateData.parentId,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('platform_categories')
      .update(categoryUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating category:', error);
      throw new Error(`Failed to update category: ${error.message}`);
    }
    
    console.log('✅ Category updated successfully');
    return data;
  }
  
  // Delete a category
  static async deleteCategory(id: string): Promise<void> {
    console.log('🔧 PlatformConfigService.deleteCategory called with ID:', id);
    
    const { error } = await supabase
      .from('platform_categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting category:', error);
      throw new Error(`Failed to delete category: ${error.message}`);
    }
    
    console.log('✅ Category deleted successfully');
  }
  
  // Reorder categories using the database function
  static async reorderCategories(categoryIds: string[]): Promise<void> {
    console.log('🔧 PlatformConfigService.reorderCategories called with:', categoryIds);
    
    const { error } = await supabase.rpc('reorder_categories', {
      category_ids: categoryIds
    });
    
    if (error) {
      console.error('❌ Error reordering categories:', error);
      throw new Error(`Failed to reorder categories: ${error.message}`);
    }
    
    console.log('✅ Categories reordered successfully');
  }
  
  // ========== SETTINGS MANAGEMENT ==========
  
  // Get all platform settings with optional filtering
  static async getSettings(filters?: {
    category?: string;
    isPublic?: boolean;
  }): Promise<PlatformSetting[]> {
    console.log('🔧 PlatformConfigService.getSettings called with filters:', filters);
    
    let query = supabase
      .from('platform_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.isPublic !== undefined) {
      query = query.eq('is_public', filters.isPublic);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching settings:', error);
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }
    
    console.log('✅ Settings fetched successfully:', data?.length);
    return data || [];
  }
  
  // Get a single setting by key
  static async getSetting(key: string): Promise<PlatformSetting | null> {
    console.log('🔧 PlatformConfigService.getSetting called with key:', key);
    
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('key', key)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('❌ Error fetching setting:', error);
      throw new Error(`Failed to fetch setting: ${error.message}`);
    }
    
    console.log('✅ Setting fetched successfully');
    return data;
  }
  
  // Create a new setting
  static async createSetting(settingData: CreateSettingData): Promise<PlatformSetting> {
    console.log('🔧 PlatformConfigService.createSetting called with:', settingData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create settings');
    }
    
    const settingInsert: PlatformSettingInsert = {
      key: settingData.key,
      value: settingData.value,
      type: settingData.type || 'string',
      description: settingData.description,
      category: settingData.category || 'general',
      is_public: settingData.isPublic || false,
      validation_rules: settingData.validationRules || {},
      updated_by: user.id
    };
    
    const { data, error } = await supabase
      .from('platform_settings')
      .insert(settingInsert)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating setting:', error);
      throw new Error(`Failed to create setting: ${error.message}`);
    }
    
    console.log('✅ Setting created successfully:', data.key);
    return data;
  }
  
  // Update an existing setting
  static async updateSetting(key: string, updateData: UpdateSettingData): Promise<PlatformSetting> {
    console.log('🔧 PlatformConfigService.updateSetting called with:', { key, updateData });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update settings');
    }
    
    const settingUpdate: PlatformSettingUpdate = {
      ...updateData,
      is_public: updateData.isPublic,
      validation_rules: updateData.validationRules,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('platform_settings')
      .update(settingUpdate)
      .eq('key', key)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating setting:', error);
      throw new Error(`Failed to update setting: ${error.message}`);
    }
    
    console.log('✅ Setting updated successfully');
    return data;
  }
  
  // Delete a setting
  static async deleteSetting(key: string): Promise<void> {
    console.log('🔧 PlatformConfigService.deleteSetting called with key:', key);
    
    const { error } = await supabase
      .from('platform_settings')
      .delete()
      .eq('key', key);
    
    if (error) {
      console.error('❌ Error deleting setting:', error);
      throw new Error(`Failed to delete setting: ${error.message}`);
    }
    
    console.log('✅ Setting deleted successfully');
  }
  
  // ========== VOD CONFIGURATION ==========
  
  // Get VOD configuration
  static async getVodConfiguration(): Promise<VodConfiguration | null> {
    console.log('🔧 PlatformConfigService.getVodConfiguration called');
    
    const { data, error } = await supabase
      .from('vod_configuration')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('❌ Error fetching VOD configuration:', error);
      throw new Error(`Failed to fetch VOD configuration: ${error.message}`);
    }
    
    console.log('✅ VOD configuration fetched successfully');
    return data;
  }
  
  // Update VOD configuration
  static async updateVodConfiguration(updateData: UpdateVodConfigData): Promise<VodConfiguration> {
    console.log('🔧 PlatformConfigService.updateVodConfiguration called with:', updateData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update VOD configuration');
    }
    
    // Get the current configuration to update
    const currentConfig = await this.getVodConfiguration();
    if (!currentConfig) {
      throw new Error('No VOD configuration found');
    }
    
    const vodUpdate: VodConfigurationUpdate = {
      hosting_fee_amount: updateData.hostingFeeAmount,
      hosting_fee_currency: updateData.hostingFeeCurrency,
      introductory_offer_enabled: updateData.introductoryOfferEnabled,
      introductory_offer_amount: updateData.introductoryOfferAmount,
      introductory_offer_description: updateData.introductoryOfferDescription,
      introductory_offer_expires_at: updateData.introductoryOfferExpiresAt,
      is_active: updateData.isActive,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('vod_configuration')
      .update(vodUpdate)
      .eq('id', currentConfig.id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating VOD configuration:', error);
      throw new Error(`Failed to update VOD configuration: ${error.message}`);
    }
    
    console.log('✅ VOD configuration updated successfully');
    return data;
  }
  
  // ========== PICKUP LOCATIONS ==========
  
  // Get all pickup locations with optional filtering
  static async getPickupLocations(filters?: {
    isActive?: boolean;
    city?: string;
    state?: string;
  }): Promise<PickupLocation[]> {
    console.log('🔧 PlatformConfigService.getPickupLocations called with filters:', filters);
    
    let query = supabase
      .from('pickup_locations')
      .select('*')
      .order('city', { ascending: true })
      .order('name', { ascending: true });
    
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    
    if (filters?.city) {
      query = query.eq('city', filters.city);
    }
    
    if (filters?.state) {
      query = query.eq('state', filters.state);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching pickup locations:', error);
      throw new Error(`Failed to fetch pickup locations: ${error.message}`);
    }
    
    console.log('✅ Pickup locations fetched successfully:', data?.length);
    return data || [];
  }
  
  // Get a single pickup location by ID
  static async getPickupLocation(id: string): Promise<PickupLocation | null> {
    console.log('🔧 PlatformConfigService.getPickupLocation called with ID:', id);
    
    const { data, error } = await supabase
      .from('pickup_locations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('❌ Error fetching pickup location:', error);
      throw new Error(`Failed to fetch pickup location: ${error.message}`);
    }
    
    console.log('✅ Pickup location fetched successfully');
    return data;
  }
  
  // Create a new pickup location
  static async createPickupLocation(locationData: CreatePickupLocationData): Promise<PickupLocation> {
    console.log('🔧 PlatformConfigService.createPickupLocation called with:', locationData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create pickup locations');
    }
    
    const locationInsert: PickupLocationInsert = {
      name: locationData.name,
      address: locationData.address,
      city: locationData.city,
      state: locationData.state,
      zip_code: locationData.zipCode,
      country: locationData.country || 'US',
      phone: locationData.phone,
      email: locationData.email,
      hours_of_operation: locationData.hoursOfOperation,
      special_instructions: locationData.specialInstructions,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      created_by: user.id,
      updated_by: user.id
    };
    
    const { data, error } = await supabase
      .from('pickup_locations')
      .insert(locationInsert)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating pickup location:', error);
      throw new Error(`Failed to create pickup location: ${error.message}`);
    }
    
    console.log('✅ Pickup location created successfully:', data.id);
    return data;
  }
  
  // Update an existing pickup location
  static async updatePickupLocation(id: string, updateData: UpdatePickupLocationData): Promise<PickupLocation> {
    console.log('🔧 PlatformConfigService.updatePickupLocation called with:', { id, updateData });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to update pickup locations');
    }
    
    const locationUpdate: PickupLocationUpdate = {
      ...updateData,
      zip_code: updateData.zipCode,
      hours_of_operation: updateData.hoursOfOperation,
      special_instructions: updateData.specialInstructions,
      is_active: updateData.isActive,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('pickup_locations')
      .update(locationUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating pickup location:', error);
      throw new Error(`Failed to update pickup location: ${error.message}`);
    }
    
    console.log('✅ Pickup location updated successfully');
    return data;
  }
  
  // Delete a pickup location
  static async deletePickupLocation(id: string): Promise<void> {
    console.log('🔧 PlatformConfigService.deletePickupLocation called with ID:', id);
    
    const { error } = await supabase
      .from('pickup_locations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting pickup location:', error);
      throw new Error(`Failed to delete pickup location: ${error.message}`);
    }
    
    console.log('✅ Pickup location deleted successfully');
  }
  
  // ========== UTILITY METHODS ==========
  
  // Get audit log for configuration changes
  static async getConfigurationAuditLog(filters?: {
    tableName?: string;
    recordId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    console.log('🔧 PlatformConfigService.getConfigurationAuditLog called with filters:', filters);
    
    let query = supabase
      .from('configuration_audit_log')
      .select(`
        *,
        changed_by_profile:changed_by(full_name, email)
      `)
      .order('changed_at', { ascending: false });
    
    if (filters?.tableName) {
      query = query.eq('table_name', filters.tableName);
    }
    
    if (filters?.recordId) {
      query = query.eq('record_id', filters.recordId);
    }
    
    if (filters?.startDate) {
      query = query.gte('changed_at', filters.startDate);
    }
    
    if (filters?.endDate) {
      query = query.lte('changed_at', filters.endDate);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100); // Default limit
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching audit log:', error);
      throw new Error(`Failed to fetch audit log: ${error.message}`);
    }
    
    console.log('✅ Audit log fetched successfully:', data?.length);
    return data || [];
  }
}

export default PlatformConfigService;