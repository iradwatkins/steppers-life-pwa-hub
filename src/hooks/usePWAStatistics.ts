
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PWAStatistics {
  totalInstalls: number;
  activeUsers: number;
  averageSessionDuration: number;
  topPages: Array<{ page: string; views: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
  installationTrend: Array<{ date: string; installs: number }>;
}

export const usePWAStatistics = () => {
  const [statistics, setStatistics] = useState<PWAStatistics>({
    totalInstalls: 0,
    activeUsers: 0,
    averageSessionDuration: 0,
    topPages: [],
    deviceTypes: [],
    installationTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch session data
      const { data: sessions, error: sessionsError } = await supabase
        .from('web_analytics_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (sessionsError) throw sessionsError;

      // Fetch page views
      const { data: pageViews, error: pageViewsError } = await supabase
        .from('web_analytics_page_views')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (pageViewsError) throw pageViewsError;

      // Calculate statistics
      const totalInstalls = sessions?.length || 0;
      const activeUsers = new Set(sessions?.map(s => s.user_id).filter(Boolean)).size;
      const averageSessionDuration = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / (sessions?.length || 1);

      // Calculate top pages
      const pageViewCounts = pageViews?.reduce((acc, pv) => {
        acc[pv.page_url] = (acc[pv.page_url] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topPages = Object.entries(pageViewCounts)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Calculate device types (mock data for now)
      const deviceTypes = [
        { type: 'Mobile', count: Math.floor(totalInstalls * 0.6) },
        { type: 'Desktop', count: Math.floor(totalInstalls * 0.3) },
        { type: 'Tablet', count: Math.floor(totalInstalls * 0.1) },
      ];

      // Calculate installation trend (last 30 days)
      const installationTrend = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const installs = sessions?.filter(s => 
          s.created_at?.startsWith(dateStr)
        ).length || 0;
        
        installationTrend.push({ date: dateStr, installs });
      }

      setStatistics({
        totalInstalls,
        activeUsers,
        averageSessionDuration: Math.round(averageSessionDuration),
        topPages,
        deviceTypes,
        installationTrend,
      });

    } catch (error) {
      console.error('Error fetching PWA statistics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const updateStatistics = async (newData: Partial<PWAStatistics>) => {
    setStatistics(prev => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
    updateStatistics,
  };
};
