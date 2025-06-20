/**
 * Instructor & Content Performance Analytics Types
 * Epic E.006: Instructor & Content Performance Analytics
 */

export interface InstructorProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  specialties: string[];
  certifications: string[];
  joinDate: Date;
  status: InstructorStatus;
  profileImageUrl?: string;
}

export interface InstructorPerformanceMetrics {
  instructorId: string;
  period: AnalyticsPeriod;
  classesCount: number;
  totalStudents: number;
  uniqueStudents: number;
  averageRating: number;
  totalRatings: number;
  totalRevenue: number;
  averageClassSize: number;
  cancellationRate: number;
  noShowRate: number;
  retentionRate: number;
  popularityScore: number;
  engagementScore: number;
}

export interface ClassPerformanceMetrics {
  classId: string;
  className: string;
  instructorId: string;
  instructorName: string;
  category: string;
  difficulty: DifficultyLevel;
  duration: number;
  averageRating: number;
  totalRatings: number;
  totalBookings: number;
  completionRate: number;
  repeatedBookings: number;
  revenue: number;
  profitMargin: number;
  popularityTrend: TrendDirection;
  lastOffered: Date;
}

export interface StudentFeedback {
  id: string;
  classId: string;
  instructorId: string;
  studentId: string;
  rating: number;
  review?: string;
  aspects: FeedbackAspects;
  submittedAt: Date;
  verified: boolean;
}

export interface FeedbackAspects {
  instruction: number;
  clarity: number;
  engagement: number;
  difficulty: number;
  environment: number;
  value: number;
}

export interface InstructorRevenueAnalytics {
  instructorId: string;
  period: AnalyticsPeriod;
  totalRevenue: number;
  netRevenue: number;
  commissionRate: number;
  commissionEarned: number;
  averageRevenuePerClass: number;
  revenueGrowth: number;
  topPerformingClasses: ClassRevenueBreakdown[];
  monthlyBreakdown: MonthlyRevenue[];
}

export interface ClassRevenueBreakdown {
  classId: string;
  className: string;
  totalRevenue: number;
  sessionsCount: number;
  averageRevenuePerSession: number;
  profitability: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  growth: number;
  classesCount: number;
}

export interface ContentAnalytics {
  contentId: string;
  contentType: ContentType;
  title: string;
  instructorId: string;
  category: string;
  views: number;
  uniqueViews: number;
  averageViewDuration: number;
  completionRate: number;
  likes: number;
  shares: number;
  bookmarks: number;
  conversionRate: number;
  revenue: number;
  performance: ContentPerformance;
}

export interface ContentPerformance {
  engagementScore: number;
  qualityScore: number;
  popularityScore: number;
  trending: boolean;
  peakPerformancePeriod: DateRange;
  audienceRetention: number[];
  demographics: ContentDemographics;
}

export interface ContentDemographics {
  ageGroups: Record<string, number>;
  experienceLevels: Record<string, number>;
  locations: Record<string, number>;
  devices: Record<string, number>;
}

export interface InstructorComparisonMetrics {
  instructorA: string;
  instructorB: string;
  metrics: ComparisonMetrics;
  recommendations: string[];
}

export interface ComparisonMetrics {
  rating: MetricComparison;
  revenue: MetricComparison;
  studentCount: MetricComparison;
  retention: MetricComparison;
  engagement: MetricComparison;
  growth: MetricComparison;
}

export interface MetricComparison {
  valueA: number;
  valueB: number;
  difference: number;
  percentageDifference: number;
  winner: 'A' | 'B' | 'tie';
}

export interface PerformanceAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  instructorId?: string;
  classId?: string;
  message: string;
  threshold: number;
  currentValue: number;
  triggeredAt: Date;
  acknowledged: boolean;
  actions: string[];
}

export interface AnalyticsReport {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  period: AnalyticsPeriod;
  generatedAt: Date;
  data: Record<string, any>;
  insights: string[];
  recommendations: string[];
  charts: ChartConfig[];
}

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  colors?: string[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Enums
export enum InstructorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels'
}

export enum AnalyticsPeriod {
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_3_MONTHS = 'last_3_months',
  LAST_6_MONTHS = 'last_6_months',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable'
}

export enum ContentType {
  CLASS = 'class',
  WORKSHOP = 'workshop',
  TUTORIAL = 'tutorial',
  SERIES = 'series'
}

export enum AlertType {
  LOW_RATING = 'low_rating',
  HIGH_CANCELLATION = 'high_cancellation',
  LOW_BOOKING = 'low_booking',
  REVENUE_DROP = 'revenue_drop',
  ENGAGEMENT_DROP = 'engagement_drop'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ReportType {
  INSTRUCTOR_PERFORMANCE = 'instructor_performance',
  CLASS_ANALYTICS = 'class_analytics',
  REVENUE_ANALYSIS = 'revenue_analysis',
  STUDENT_FEEDBACK = 'student_feedback',
  CONTENT_PERFORMANCE = 'content_performance',
  COMPARATIVE_ANALYSIS = 'comparative_analysis'
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  SCATTER = 'scatter',
  HEATMAP = 'heatmap'
}

// Filter and Query Interfaces
export interface InstructorAnalyticsFilters {
  instructorIds?: string[];
  categories?: string[];
  period: AnalyticsPeriod;
  customDateRange?: DateRange;
  minRating?: number;
  minRevenue?: number;
  status?: InstructorStatus[];
}

export interface ClassAnalyticsFilters {
  classIds?: string[];
  instructorIds?: string[];
  categories?: string[];
  difficulties?: DifficultyLevel[];
  period: AnalyticsPeriod;
  customDateRange?: DateRange;
  minBookings?: number;
  minRating?: number;
}

// Response Interfaces
export interface InstructorAnalyticsResponse {
  instructors: InstructorPerformanceMetrics[];
  summary: InstructorAnalyticsSummary;
  trends: AnalyticsTrends;
  alerts: PerformanceAlert[];
}

export interface InstructorAnalyticsSummary {
  totalInstructors: number;
  activeInstructors: number;
  averageRating: number;
  totalRevenue: number;
  totalClasses: number;
  totalStudents: number;
  topPerformers: string[];
  improvementNeeded: string[];
}

export interface AnalyticsTrends {
  revenue: TrendData;
  ratings: TrendData;
  bookings: TrendData;
  newInstructors: TrendData;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  direction: TrendDirection;
  data: { date: string; value: number }[];
}