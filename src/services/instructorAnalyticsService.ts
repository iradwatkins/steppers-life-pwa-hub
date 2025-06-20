/**
 * Instructor & Content Performance Analytics Service
 * Epic E.006: Comprehensive instructor performance tracking and analytics
 */

import {
  InstructorProfile,
  InstructorPerformanceMetrics,
  ClassPerformanceMetrics,
  StudentFeedback,
  InstructorRevenueAnalytics,
  ContentAnalytics,
  InstructorComparisonMetrics,
  PerformanceAlert,
  AnalyticsReport,
  AnalyticsPeriod,
  InstructorAnalyticsFilters,
  ClassAnalyticsFilters,
  InstructorAnalyticsResponse,
  AlertType,
  AlertSeverity,
  ReportType,
  ChartType,
  TrendDirection,
  InstructorStatus,
  DifficultyLevel,
  ContentType
} from '../types/instructorAnalytics';

class InstructorAnalyticsService {
  private apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  // Instructor Profile Management
  async getInstructorProfiles(): Promise<InstructorProfile[]> {
    try {
      // Mock data for development
      return [
        {
          id: 'inst-001',
          name: 'Sarah Johnson',
          email: 'sarah@steppers.com',
          bio: 'Certified fitness instructor with 8+ years experience',
          specialties: ['HIIT', 'Strength Training', 'Yoga'],
          certifications: ['ACE-CPT', 'NASM-CES', 'RYT-200'],
          joinDate: new Date('2022-01-15'),
          status: InstructorStatus.ACTIVE,
          profileImageUrl: '/avatars/sarah.jpg'
        },
        {
          id: 'inst-002',
          name: 'Mike Chen',
          email: 'mike@steppers.com',
          bio: 'Former athlete turned fitness coach',
          specialties: ['CrossFit', 'Olympic Lifting', 'Cardio'],
          certifications: ['CrossFit Level 2', 'USAW-L1'],
          joinDate: new Date('2021-08-10'),
          status: InstructorStatus.ACTIVE,
          profileImageUrl: '/avatars/mike.jpg'
        },
        {
          id: 'inst-003',
          name: 'Emily Rodriguez',
          email: 'emily@steppers.com',
          bio: 'Dance and movement specialist',
          specialties: ['Dance Fitness', 'Pilates', 'Barre'],
          certifications: ['PMA-CPT', 'AFAA'],
          joinDate: new Date('2023-03-22'),
          status: InstructorStatus.ACTIVE,
          profileImageUrl: '/avatars/emily.jpg'
        }
      ];
    } catch (error) {
      console.error('Error fetching instructor profiles:', error);
      throw error;
    }
  }

  // Performance Metrics
  async getInstructorPerformanceMetrics(
    instructorId: string,
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS
  ): Promise<InstructorPerformanceMetrics> {
    try {
      // Mock data with realistic metrics
      const mockMetrics: Record<string, InstructorPerformanceMetrics> = {
        'inst-001': {
          instructorId: 'inst-001',
          period,
          classesCount: 42,
          totalStudents: 156,
          uniqueStudents: 89,
          averageRating: 4.8,
          totalRatings: 134,
          totalRevenue: 8240,
          averageClassSize: 12,
          cancellationRate: 0.08,
          noShowRate: 0.12,
          retentionRate: 0.76,
          popularityScore: 92,
          engagementScore: 88
        },
        'inst-002': {
          instructorId: 'inst-002',
          period,
          classesCount: 38,
          totalStudents: 142,
          uniqueStudents: 78,
          averageRating: 4.6,
          totalRatings: 98,
          totalRevenue: 7560,
          averageClassSize: 10,
          cancellationRate: 0.12,
          noShowRate: 0.15,
          retentionRate: 0.68,
          popularityScore: 85,
          engagementScore: 82
        },
        'inst-003': {
          instructorId: 'inst-003',
          period,
          classesCount: 35,
          totalStudents: 128,
          uniqueStudents: 72,
          averageRating: 4.7,
          totalRatings: 89,
          totalRevenue: 6890,
          averageClassSize: 11,
          cancellationRate: 0.06,
          noShowRate: 0.09,
          retentionRate: 0.82,
          popularityScore: 89,
          engagementScore: 91
        }
      };

      return mockMetrics[instructorId] || mockMetrics['inst-001'];
    } catch (error) {
      console.error('Error fetching instructor performance metrics:', error);
      throw error;
    }
  }

  // Class Performance Analytics
  async getClassPerformanceMetrics(filters: ClassAnalyticsFilters): Promise<ClassPerformanceMetrics[]> {
    try {
      // Mock data for class performance
      return [
        {
          classId: 'class-001',
          className: 'Morning HIIT Blast',
          instructorId: 'inst-001',
          instructorName: 'Sarah Johnson',
          category: 'HIIT',
          difficulty: DifficultyLevel.INTERMEDIATE,
          duration: 45,
          averageRating: 4.9,
          totalRatings: 67,
          totalBookings: 284,
          completionRate: 0.87,
          repeatedBookings: 156,
          revenue: 4260,
          profitMargin: 0.68,
          popularityTrend: TrendDirection.INCREASING,
          lastOffered: new Date('2024-06-19')
        },
        {
          classId: 'class-002',
          className: 'Strength & Power',
          instructorId: 'inst-002',
          instructorName: 'Mike Chen',
          category: 'Strength Training',
          difficulty: DifficultyLevel.ADVANCED,
          duration: 60,
          averageRating: 4.7,
          totalRatings: 43,
          totalBookings: 198,
          completionRate: 0.92,
          repeatedBookings: 89,
          revenue: 3960,
          profitMargin: 0.72,
          popularityTrend: TrendDirection.STABLE,
          lastOffered: new Date('2024-06-18')
        },
        {
          classId: 'class-003',
          className: 'Dance Cardio Flow',
          instructorId: 'inst-003',
          instructorName: 'Emily Rodriguez',
          category: 'Dance Fitness',
          difficulty: DifficultyLevel.BEGINNER,
          duration: 50,
          averageRating: 4.8,
          totalRatings: 52,
          totalBookings: 167,
          completionRate: 0.84,
          repeatedBookings: 78,
          revenue: 3340,
          profitMargin: 0.65,
          popularityTrend: TrendDirection.INCREASING,
          lastOffered: new Date('2024-06-19')
        }
      ];
    } catch (error) {
      console.error('Error fetching class performance metrics:', error);
      throw error;
    }
  }

  // Student Feedback
  async getStudentFeedback(instructorId?: string, classId?: string): Promise<StudentFeedback[]> {
    try {
      // Mock feedback data
      return [
        {
          id: 'feedback-001',
          classId: 'class-001',
          instructorId: 'inst-001',
          studentId: 'student-123',
          rating: 5,
          review: 'Amazing energy and great modifications for all fitness levels!',
          aspects: {
            instruction: 5,
            clarity: 5,
            engagement: 5,
            difficulty: 4,
            environment: 5,
            value: 5
          },
          submittedAt: new Date('2024-06-18'),
          verified: true
        },
        {
          id: 'feedback-002',
          classId: 'class-002',
          instructorId: 'inst-002',
          studentId: 'student-456',
          rating: 4,
          review: 'Challenging workout but very effective. Would like more beginner options.',
          aspects: {
            instruction: 4,
            clarity: 4,
            engagement: 4,
            difficulty: 5,
            environment: 4,
            value: 4
          },
          submittedAt: new Date('2024-06-17'),
          verified: true
        }
      ];
    } catch (error) {
      console.error('Error fetching student feedback:', error);
      throw error;
    }
  }

  // Revenue Analytics
  async getInstructorRevenueAnalytics(
    instructorId: string,
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS
  ): Promise<InstructorRevenueAnalytics> {
    try {
      // Mock revenue data
      return {
        instructorId,
        period,
        totalRevenue: 8240,
        netRevenue: 6592,
        commissionRate: 0.2,
        commissionEarned: 1648,
        averageRevenuePerClass: 196,
        revenueGrowth: 0.15,
        topPerformingClasses: [
          {
            classId: 'class-001',
            className: 'Morning HIIT Blast',
            totalRevenue: 4260,
            sessionsCount: 28,
            averageRevenuePerSession: 152,
            profitability: 0.68
          },
          {
            classId: 'class-004',
            className: 'Yoga Flow',
            totalRevenue: 2380,
            sessionsCount: 14,
            averageRevenuePerSession: 170,
            profitability: 0.72
          }
        ],
        monthlyBreakdown: [
          { month: 'May', year: 2024, revenue: 7160, growth: 0.08, classesCount: 38 },
          { month: 'April', year: 2024, revenue: 6630, growth: 0.12, classesCount: 35 },
          { month: 'March', year: 2024, revenue: 5920, growth: 0.18, classesCount: 32 }
        ]
      };
    } catch (error) {
      console.error('Error fetching instructor revenue analytics:', error);
      throw error;
    }
  }

  // Performance Alerts
  async getPerformanceAlerts(instructorId?: string): Promise<PerformanceAlert[]> {
    try {
      // Mock alert data
      return [
        {
          id: 'alert-001',
          type: AlertType.LOW_RATING,
          severity: AlertSeverity.MEDIUM,
          instructorId: 'inst-002',
          message: 'Average rating dropped below 4.5 threshold',
          threshold: 4.5,
          currentValue: 4.3,
          triggeredAt: new Date('2024-06-18'),
          acknowledged: false,
          actions: ['Review recent feedback', 'Schedule coaching session', 'Adjust class difficulty']
        },
        {
          id: 'alert-002',
          type: AlertType.HIGH_CANCELLATION,
          severity: AlertSeverity.HIGH,
          instructorId: 'inst-001',
          classId: 'class-005',
          message: 'High cancellation rate detected for evening classes',
          threshold: 0.15,
          currentValue: 0.22,
          triggeredAt: new Date('2024-06-17'),
          acknowledged: true,
          actions: ['Investigate scheduling conflicts', 'Survey participants', 'Consider time slot changes']
        }
      ];
    } catch (error) {
      console.error('Error fetching performance alerts:', error);
      throw error;
    }
  }

  // Analytics Reports
  async generateAnalyticsReport(
    type: ReportType,
    filters: InstructorAnalyticsFilters
  ): Promise<AnalyticsReport> {
    try {
      // Mock report generation
      return {
        id: `report-${Date.now()}`,
        type,
        title: 'Instructor Performance Report',
        description: 'Comprehensive analysis of instructor performance metrics',
        period: filters.period,
        generatedAt: new Date(),
        data: {
          totalInstructors: 12,
          averageRating: 4.7,
          totalRevenue: 45680,
          topPerformer: 'Sarah Johnson'
        },
        insights: [
          'Sarah Johnson leads in student retention with 82% rate',
          'Dance fitness classes show highest growth trend',
          'Morning time slots have 23% higher completion rates'
        ],
        recommendations: [
          'Invest in advanced training for Mike Chen',
          'Expand dance fitness offerings',
          'Add more morning class options'
        ],
        charts: [
          {
            type: ChartType.LINE,
            title: 'Revenue Trend',
            data: [],
            xAxis: 'month',
            yAxis: 'revenue',
            colors: ['#3b82f6', '#10b981']
          }
        ]
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  // Comparison Analytics
  async compareInstructors(instructorAId: string, instructorBId: string): Promise<InstructorComparisonMetrics> {
    try {
      const metricsA = await this.getInstructorPerformanceMetrics(instructorAId);
      const metricsB = await this.getInstructorPerformanceMetrics(instructorBId);

      const compareMetric = (valueA: number, valueB: number) => ({
        valueA,
        valueB,
        difference: valueA - valueB,
        percentageDifference: ((valueA - valueB) / valueB) * 100,
        winner: valueA > valueB ? 'A' as const : valueA < valueB ? 'B' as const : 'tie' as const
      });

      return {
        instructorA: instructorAId,
        instructorB: instructorBId,
        metrics: {
          rating: compareMetric(metricsA.averageRating, metricsB.averageRating),
          revenue: compareMetric(metricsA.totalRevenue, metricsB.totalRevenue),
          studentCount: compareMetric(metricsA.uniqueStudents, metricsB.uniqueStudents),
          retention: compareMetric(metricsA.retentionRate, metricsB.retentionRate),
          engagement: compareMetric(metricsA.engagementScore, metricsB.engagementScore),
          growth: compareMetric(0.15, 0.12) // Mock growth rates
        },
        recommendations: [
          'Instructor A excels in student retention - share best practices',
          'Instructor B shows strong revenue performance in group classes',
          'Both instructors could benefit from cross-training opportunities'
        ]
      };
    } catch (error) {
      console.error('Error comparing instructors:', error);
      throw error;
    }
  }

  // Dashboard Analytics
  async getInstructorAnalyticsDashboard(filters: InstructorAnalyticsFilters): Promise<InstructorAnalyticsResponse> {
    try {
      const instructors = await Promise.all([
        this.getInstructorPerformanceMetrics('inst-001', filters.period),
        this.getInstructorPerformanceMetrics('inst-002', filters.period),
        this.getInstructorPerformanceMetrics('inst-003', filters.period)
      ]);

      const alerts = await this.getPerformanceAlerts();

      return {
        instructors,
        summary: {
          totalInstructors: 12,
          activeInstructors: 10,
          averageRating: 4.7,
          totalRevenue: 45680,
          totalClasses: 156,
          totalStudents: 892,
          topPerformers: ['inst-001', 'inst-003'],
          improvementNeeded: ['inst-002']
        },
        trends: {
          revenue: {
            current: 45680,
            previous: 42150,
            change: 3530,
            direction: TrendDirection.INCREASING,
            data: [
              { date: '2024-05', value: 42150 },
              { date: '2024-06', value: 45680 }
            ]
          },
          ratings: {
            current: 4.7,
            previous: 4.6,
            change: 0.1,
            direction: TrendDirection.INCREASING,
            data: [
              { date: '2024-05', value: 4.6 },
              { date: '2024-06', value: 4.7 }
            ]
          },
          bookings: {
            current: 1247,
            previous: 1189,
            change: 58,
            direction: TrendDirection.INCREASING,
            data: [
              { date: '2024-05', value: 1189 },
              { date: '2024-06', value: 1247 }
            ]
          },
          newInstructors: {
            current: 2,
            previous: 1,
            change: 1,
            direction: TrendDirection.INCREASING,
            data: [
              { date: '2024-05', value: 1 },
              { date: '2024-06', value: 2 }
            ]
          }
        },
        alerts
      };
    } catch (error) {
      console.error('Error fetching instructor analytics dashboard:', error);
      throw error;
    }
  }

  // Content Analytics
  async getContentAnalytics(contentId?: string): Promise<ContentAnalytics[]> {
    try {
      // Mock content analytics
      return [
        {
          contentId: 'content-001',
          contentType: ContentType.CLASS,
          title: 'Morning HIIT Blast',
          instructorId: 'inst-001',
          category: 'HIIT',
          views: 2847,
          uniqueViews: 1923,
          averageViewDuration: 38.5,
          completionRate: 0.87,
          likes: 234,
          shares: 45,
          bookmarks: 89,
          conversionRate: 0.34,
          revenue: 4260,
          performance: {
            engagementScore: 92,
            qualityScore: 88,
            popularityScore: 95,
            trending: true,
            peakPerformancePeriod: {
              start: new Date('2024-06-01'),
              end: new Date('2024-06-15')
            },
            audienceRetention: [100, 95, 90, 87, 82, 78, 75],
            demographics: {
              ageGroups: { '18-25': 15, '26-35': 45, '36-45': 30, '46+': 10 },
              experienceLevels: { 'beginner': 20, 'intermediate': 60, 'advanced': 20 },
              locations: { 'urban': 70, 'suburban': 25, 'rural': 5 },
              devices: { 'mobile': 65, 'desktop': 25, 'tablet': 10 }
            }
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      throw error;
    }
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1
    }).format(value);
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  calculateGrowthRate(current: number, previous: number): number {
    return previous === 0 ? 0 : ((current - previous) / previous) * 100;
  }
}

export default new InstructorAnalyticsService();