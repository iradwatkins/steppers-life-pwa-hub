export interface ClassBase {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  instructor_avatar?: string;
  instructor_bio?: string;
  category: ClassCategory;
  level: ClassLevel;
  price: number;
  status: ClassStatus;
  created_at: string;
  updated_at: string;
  rating_average: number;
  rating_count: number;
  student_count: number;
  view_count: number;
  tags: string[];
  featured_image?: string;
}

export interface PhysicalClass extends ClassBase {
  type: 'physical';
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  max_students: number;
  current_students: number;
  class_dates: ClassDate[];
  recurring_pattern?: RecurringPattern;
  requirements?: string[];
  what_to_expect?: string;
  duration_minutes: number;
  rsvp_required: boolean;
  rsvp_deadline?: string;
  waitlist_enabled: boolean;
  attendees: ClassAttendee[];
}

export interface VODClass extends ClassBase {
  type: 'vod';
  series_id?: string;
  series_title?: string;
  video_url: string;
  video_duration_seconds: number;
  thumbnail_url?: string;
  preview_url?: string;
  chapters?: VideoChapter[];
  downloads_included: boolean;
  lifetime_access: boolean;
  skill_level_detailed: string;
  prerequisites?: string[];
  learning_outcomes: string[];
  resources?: ClassResource[];
  completion_rate?: number;
  average_watch_time?: number;
}

export interface ClassSeries {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  total_classes: number;
  price: number;
  discount_percentage?: number;
  level: ClassLevel;
  category: ClassCategory;
  featured_image?: string;
  estimated_duration_hours: number;
  classes: VODClass[];
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived';
}

export interface InstructorTier {
  id: string;
  name: string;
  monthly_fee: number;
  features: string[];
  max_vod_classes?: number;
  max_series?: number;
  analytics_included: boolean;
  priority_support: boolean;
  commission_rate: number;
}

export interface InstructorSubscription {
  id: string;
  instructor_id: string;
  tier_id: string;
  tier: InstructorTier;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface InstructorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  specialties: string[];
  years_experience: number;
  certifications: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_youtube?: string;
  location: string;
  profile_image?: string;
  cover_image?: string;
  subscription?: InstructorSubscription;
  followers_count: number;
  total_students: number;
  total_classes: number;
  average_rating: number;
  total_revenue: number;
  verification_status: 'none' | 'pending' | 'verified';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassDate {
  id: string;
  class_id: string;
  date: string;
  start_time: string;
  end_time: string;
  cancelled: boolean;
  cancellation_reason?: string;
  max_students?: number;
  current_students: number;
}

export interface RecurringPattern {
  type: 'weekly' | 'biweekly' | 'monthly';
  days_of_week: number[]; // 0 = Sunday, 1 = Monday, etc.
  start_date: string;
  end_date?: string;
  total_sessions?: number;
  exclude_dates?: string[];
}

export interface ClassAttendee {
  id: string;
  class_id: string;
  class_date_id?: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  status: 'registered' | 'attended' | 'no_show' | 'cancelled';
  registered_at: string;
  attended_at?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_amount: number;
  notes?: string;
}

export interface VideoChapter {
  id: string;
  title: string;
  start_time_seconds: number;
  end_time_seconds: number;
  description?: string;
}

export interface ClassResource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'link' | 'image';
  url: string;
  file_size?: number;
  description?: string;
}

export interface ClassPurchase {
  id: string;
  user_id: string;
  class_id?: string;
  series_id?: string;
  instructor_id: string;
  amount: number;
  commission_amount: number;
  platform_fee: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  access_granted: boolean;
  purchase_date: string;
  access_expires_at?: string;
  refund_eligible_until?: string;
}

export interface ClassAccess {
  id: string;
  user_id: string;
  class_id?: string;
  series_id?: string;
  purchase_id: string;
  granted_at: string;
  expires_at?: string;
  lifetime_access: boolean;
  watch_time_seconds: number;
  last_watched_at?: string;
  completion_percentage: number;
  completed: boolean;
  completed_at?: string;
}

export interface ClassProgress {
  id: string;
  user_id: string;
  class_id: string;
  watch_time_seconds: number;
  last_position_seconds: number;
  completion_percentage: number;
  completed: boolean;
  completed_at?: string;
  notes?: string;
  bookmarks: VideoBookmark[];
}

export interface VideoBookmark {
  id: string;
  title: string;
  time_seconds: number;
  notes?: string;
  created_at: string;
}

export type ClassType = 'physical' | 'vod';
export type ClassCategory = 'stepping' | 'walkin' | 'linedancing' | 'freestyle' | 'choreography' | 'competition';
export type ClassLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
export type ClassStatus = 'draft' | 'published' | 'cancelled' | 'completed' | 'archived';

export interface ClassFilters {
  search?: string;
  type?: ClassType;
  category?: ClassCategory;
  level?: ClassLevel;
  location?: string;
  instructor_id?: string;
  price_min?: number;
  price_max?: number;
  date_from?: string;
  date_to?: string;
  has_availability?: boolean;
  sort_by?: 'rating' | 'price' | 'date' | 'popularity' | 'newest';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateVODClassData {
  title: string;
  description: string;
  category: ClassCategory;
  level: ClassLevel;
  price: number;
  series_id?: string;
  video_file: File;
  thumbnail_file?: File;
  preview_file?: File;
  skill_level_detailed: string;
  prerequisites?: string[];
  learning_outcomes: string[];
  tags: string[];
  chapters?: Omit<VideoChapter, 'id'>[];
  resources?: Omit<ClassResource, 'id'>[];
  downloads_included: boolean;
  lifetime_access: boolean;
}

export interface CreatePhysicalClassData {
  title: string;
  description: string;
  category: ClassCategory;
  level: ClassLevel;
  price: number;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  max_students: number;
  duration_minutes: number;
  class_dates: Omit<ClassDate, 'id' | 'class_id' | 'current_students' | 'cancelled'>[];
  recurring_pattern?: RecurringPattern;
  requirements?: string[];
  what_to_expect?: string;
  tags: string[];
  rsvp_required: boolean;
  rsvp_deadline?: string;
  waitlist_enabled: boolean;
}

export interface CreateSeriesData {
  title: string;
  description: string;
  category: ClassCategory;
  level: ClassLevel;
  price: number;
  discount_percentage?: number;
  featured_image?: File;
}