import { supabase } from '@/integrations/supabase/client';
import type { 
  PhysicalClass, 
  VODClass, 
  ClassSeries, 
  InstructorProfile, 
  InstructorSubscription,
  InstructorTier,
  ClassFilters,
  CreateVODClassData,
  CreatePhysicalClassData,
  CreateSeriesData,
  ClassAttendee,
  ClassProgress,
  ClassPurchase,
  ClassAccess
} from '@/types/classes';

class ClassesService {
  // Instructor Subscription Management
  async getInstructorTiers() {
    try {
      const { data, error } = await supabase
        .from('instructor_tiers')
        .select('*')
        .order('monthly_fee', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching instructor tiers:', error);
      return { success: false, error: 'Failed to fetch instructor tiers' };
    }
  }

  async subscribeToInstructorTier(tierId: string, paymentMethodId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('create-instructor-subscription', {
        body: { tier_id: tierId, payment_method_id: paymentMethodId }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating instructor subscription:', error);
      return { success: false, error: 'Failed to create subscription' };
    }
  }

  async getInstructorSubscription(instructorId: string) {
    try {
      const { data, error } = await supabase
        .from('instructor_subscriptions')
        .select(`
          *,
          tier:instructor_tiers(*)
        `)
        .eq('instructor_id', instructorId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching instructor subscription:', error);
      return { success: false, error: 'Failed to fetch subscription' };
    }
  }

  async cancelInstructorSubscription(subscriptionId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('cancel-instructor-subscription', {
        body: { subscription_id: subscriptionId }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: 'Failed to cancel subscription' };
    }
  }

  // VOD Class Management
  async createVODClass(classData: CreateVODClassData) {
    try {
      // First upload the video file
      const videoUpload = await this.uploadVideo(classData.video_file);
      if (!videoUpload.success) {
        return { success: false, error: 'Failed to upload video' };
      }

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (classData.thumbnail_file) {
        const thumbnailUpload = await this.uploadThumbnail(classData.thumbnail_file);
        if (thumbnailUpload.success) {
          thumbnailUrl = thumbnailUpload.data.url;
        }
      }

      // Upload preview if provided
      let previewUrl = null;
      if (classData.preview_file) {
        const previewUpload = await this.uploadPreview(classData.preview_file);
        if (previewUpload.success) {
          previewUrl = previewUpload.data.url;
        }
      }

      const { data, error } = await supabase
        .from('vod_classes')
        .insert({
          title: classData.title,
          description: classData.description,
          category: classData.category,
          level: classData.level,
          price: classData.price,
          series_id: classData.series_id,
          video_url: videoUpload.data.url,
          video_duration_seconds: videoUpload.data.duration,
          thumbnail_url: thumbnailUrl,
          preview_url: previewUrl,
          skill_level_detailed: classData.skill_level_detailed,
          prerequisites: classData.prerequisites,
          learning_outcomes: classData.learning_outcomes,
          tags: classData.tags,
          chapters: classData.chapters,
          resources: classData.resources,
          downloads_included: classData.downloads_included,
          lifetime_access: classData.lifetime_access,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating VOD class:', error);
      return { success: false, error: 'Failed to create VOD class' };
    }
  }

  async uploadVideo(file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `vod-classes/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('class-videos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('class-videos')
        .getPublicUrl(filePath);

      // Get video duration using video element
      const duration = await this.getVideoDuration(file);

      return { 
        success: true, 
        data: { 
          url: urlData.publicUrl, 
          duration: duration,
          path: filePath 
        } 
      };
    } catch (error) {
      console.error('Error uploading video:', error);
      return { success: false, error: 'Failed to upload video' };
    }
  }

  async uploadThumbnail(file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `thumb-${Date.now()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { data, error } = await supabase.storage
        .from('class-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('class-images')
        .getPublicUrl(filePath);

      return { success: true, data: { url: urlData.publicUrl, path: filePath } };
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      return { success: false, error: 'Failed to upload thumbnail' };
    }
  }

  async uploadPreview(file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `preview-${Date.now()}.${fileExt}`;
      const filePath = `previews/${fileName}`;

      const { data, error } = await supabase.storage
        .from('class-videos')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('class-videos')
        .getPublicUrl(filePath);

      return { success: true, data: { url: urlData.publicUrl, path: filePath } };
    } catch (error) {
      console.error('Error uploading preview:', error);
      return { success: false, error: 'Failed to upload preview' };
    }
  }

  private getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  // Class Series Management
  async createClassSeries(seriesData: CreateSeriesData) {
    try {
      let featuredImageUrl = null;
      if (seriesData.featured_image) {
        const imageUpload = await this.uploadSeriesImage(seriesData.featured_image);
        if (imageUpload.success) {
          featuredImageUrl = imageUpload.data.url;
        }
      }

      const { data, error } = await supabase
        .from('class_series')
        .insert({
          title: seriesData.title,
          description: seriesData.description,
          category: seriesData.category,
          level: seriesData.level,
          price: seriesData.price,
          discount_percentage: seriesData.discount_percentage,
          featured_image: featuredImageUrl,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating class series:', error);
      return { success: false, error: 'Failed to create class series' };
    }
  }

  async uploadSeriesImage(file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `series-${Date.now()}.${fileExt}`;
      const filePath = `series/${fileName}`;

      const { data, error } = await supabase.storage
        .from('class-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('class-images')
        .getPublicUrl(filePath);

      return { success: true, data: { url: urlData.publicUrl, path: filePath } };
    } catch (error) {
      console.error('Error uploading series image:', error);
      return { success: false, error: 'Failed to upload series image' };
    }
  }

  // Class Browsing and Filtering
  async getVODClasses(filters: ClassFilters = {}) {
    try {
      let query = supabase
        .from('vod_classes')
        .select(`
          *,
          instructor:instructor_profiles(*),
          series:class_series(*)
        `)
        .eq('status', 'published');

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.level) {
        query = query.eq('level', filters.level);
      }

      if (filters.instructor_id) {
        query = query.eq('instructor_id', filters.instructor_id);
      }

      if (filters.price_min !== undefined) {
        query = query.gte('price', filters.price_min);
      }

      if (filters.price_max !== undefined) {
        query = query.lte('price', filters.price_max);
      }

      // Sorting
      const sortBy = filters.sort_by || 'rating';
      const sortOrder = filters.sort_order || 'desc';
      
      switch (sortBy) {
        case 'price':
          query = query.order('price', { ascending: sortOrder === 'asc' });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
          break;
        case 'popularity':
          query = query.order('student_count', { ascending: sortOrder === 'asc' });
          break;
        default:
          query = query.order('rating_average', { ascending: sortOrder === 'asc' });
      }

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching VOD classes:', error);
      return { success: false, error: 'Failed to fetch VOD classes' };
    }
  }

  async getClassSeries(filters: ClassFilters = {}) {
    try {
      let query = supabase
        .from('class_series')
        .select(`
          *,
          instructor:instructor_profiles(*),
          classes:vod_classes(count)
        `)
        .eq('status', 'published');

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.level) {
        query = query.eq('level', filters.level);
      }

      if (filters.instructor_id) {
        query = query.eq('instructor_id', filters.instructor_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching class series:', error);
      return { success: false, error: 'Failed to fetch class series' };
    }
  }

  // Purchase and Access Management
  async purchaseVODClass(classId: string, paymentMethodId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('purchase-vod-class', {
        body: { class_id: classId, payment_method_id: paymentMethodId }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error purchasing VOD class:', error);
      return { success: false, error: 'Failed to purchase class' };
    }
  }

  async purchaseClassSeries(seriesId: string, paymentMethodId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('purchase-class-series', {
        body: { series_id: seriesId, payment_method_id: paymentMethodId }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error purchasing class series:', error);
      return { success: false, error: 'Failed to purchase series' };
    }
  }

  async getUserClassAccess(userId: string) {
    try {
      const { data, error } = await supabase
        .from('class_access')
        .select(`
          *,
          vod_class:vod_classes(*),
          series:class_series(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user class access:', error);
      return { success: false, error: 'Failed to fetch class access' };
    }
  }

  async getClassProgress(userId: string, classId: string) {
    try {
      const { data, error } = await supabase
        .from('class_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('class_id', classId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching class progress:', error);
      return { success: false, error: 'Failed to fetch progress' };
    }
  }

  async updateClassProgress(userId: string, classId: string, watchTimeSeconds: number, lastPositionSeconds: number) {
    try {
      const { data, error } = await supabase
        .from('class_progress')
        .upsert({
          user_id: userId,
          class_id: classId,
          watch_time_seconds: watchTimeSeconds,
          last_position_seconds: lastPositionSeconds,
          completion_percentage: Math.min(100, (lastPositionSeconds / watchTimeSeconds) * 100),
          completed: lastPositionSeconds >= watchTimeSeconds * 0.9 // 90% completion
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating class progress:', error);
      return { success: false, error: 'Failed to update progress' };
    }
  }

  // Instructor Analytics
  async getInstructorAnalytics(instructorId: string, dateFrom?: string, dateTo?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('get-instructor-analytics', {
        body: { instructor_id: instructorId, date_from: dateFrom, date_to: dateTo }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching instructor analytics:', error);
      return { success: false, error: 'Failed to fetch analytics' };
    }
  }

  async getInstructorEarnings(instructorId: string, dateFrom?: string, dateTo?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('get-instructor-earnings', {
        body: { instructor_id: instructorId, date_from: dateFrom, date_to: dateTo }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching instructor earnings:', error);
      return { success: false, error: 'Failed to fetch earnings' };
    }
  }

  // Physical Classes
  async createPhysicalClass(classData: CreatePhysicalClassData) {
    try {
      const { data, error } = await supabase
        .from('physical_classes')
        .insert({
          title: classData.title,
          description: classData.description,
          category: classData.category,
          level: classData.level,
          price: classData.price,
          location: classData.location,
          address: classData.address,
          city: classData.city,
          state: classData.state,
          zip_code: classData.zip_code,
          max_students: classData.max_students,
          duration_minutes: classData.duration_minutes,
          recurring_pattern: classData.recurring_pattern,
          requirements: classData.requirements,
          what_to_expect: classData.what_to_expect,
          tags: classData.tags,
          rsvp_required: classData.rsvp_required,
          rsvp_deadline: classData.rsvp_deadline,
          waitlist_enabled: classData.waitlist_enabled,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Create class dates
      if (classData.class_dates && classData.class_dates.length > 0) {
        const classDates = classData.class_dates.map(date => ({
          ...date,
          class_id: data.id,
          current_students: 0,
          cancelled: false
        }));

        const { error: datesError } = await supabase
          .from('class_dates')
          .insert(classDates);

        if (datesError) throw datesError;
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creating physical class:', error);
      return { success: false, error: 'Failed to create physical class' };
    }
  }

  async rsvpToClass(classId: string, classDateId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('rsvp-to-class', {
        body: { class_id: classId, class_date_id: classDateId }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error RSVPing to class:', error);
      return { success: false, error: 'Failed to RSVP to class' };
    }
  }
}

export const classesService = new ClassesService();