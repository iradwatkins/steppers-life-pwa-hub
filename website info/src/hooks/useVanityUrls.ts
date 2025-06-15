import { useState, useEffect } from 'react';
import { vanityUrlService, VanityUrl, VanityUrlRequest } from '../services/vanityUrlService';
import { toast } from 'sonner';

export const useVanityUrls = (userId?: string) => {
  const [vanityUrls, setVanityUrls] = useState<VanityUrl[]>([]);
  const [requests, setRequests] = useState<VanityUrlRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyVanityUrls = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const urls = await vanityUrlService.getMyVanityUrls(userId);
      setVanityUrls(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vanity URLs');
      toast.error('Failed to load vanity URLs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const reqs = await vanityUrlService.getMyRequests(userId);
      setRequests(reqs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const requestVanityUrl = async (userType: 'organizer' | 'sales_agent', requestedUrl: string) => {
    if (!userId) return false;
    
    setLoading(true);
    setError(null);
    try {
      const newRequest = await vanityUrlService.requestVanityUrl(userId, userType, requestedUrl);
      setRequests(prev => [...prev, newRequest]);
      toast.success('Vanity URL request submitted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request vanity URL';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (requestedUrl: string) => {
    try {
      return await vanityUrlService.checkUrlAvailability(requestedUrl);
    } catch (err) {
      toast.error('Failed to check URL availability');
      return { available: false, reason: 'Error checking availability' };
    }
  };

  const toggleVanityUrl = async (id: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUrl = await vanityUrlService.toggleVanityUrl(id, isActive);
      setVanityUrls(prev => prev.map(url => url.id === id ? updatedUrl : url));
      toast.success(`Vanity URL ${isActive ? 'activated' : 'deactivated'} successfully`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vanity URL';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteVanityUrl = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await vanityUrlService.deleteVanityUrl(id);
      setVanityUrls(prev => prev.filter(url => url.id !== id));
      toast.success('Vanity URL deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vanity URL';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyVanityUrls();
      fetchMyRequests();
    }
  }, [userId]);

  return {
    vanityUrls,
    requests,
    loading,
    error,
    requestVanityUrl,
    checkAvailability,
    toggleVanityUrl,
    deleteVanityUrl,
    refetch: () => {
      fetchMyVanityUrls();
      fetchMyRequests();
    },
  };
};

export const useAdminVanityUrls = () => {
  const [allRequests, setAllRequests] = useState<VanityUrlRequest[]>([]);
  const [allVanityUrls, setAllVanityUrls] = useState<VanityUrl[]>([]);
  const [stats, setStats] = useState<{
    totalUrls: number;
    activeUrls: number;
    totalClicks: number;
    pendingRequests: number;
  }>({ totalUrls: 0, activeUrls: 0, totalClicks: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const requests = await vanityUrlService.getAllRequests();
      setAllRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVanityUrls = async () => {
    setLoading(true);
    setError(null);
    try {
      const urls = await vanityUrlService.getAllVanityUrls();
      setAllVanityUrls(urls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vanity URLs');
      toast.error('Failed to load vanity URLs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const urlStats = await vanityUrlService.getVanityUrlStats();
      setStats(urlStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string, adminId: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRequest = await vanityUrlService.approveRequest(requestId, adminId);
      setAllRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
      toast.success('Request approved successfully');
      // Refresh data to show new vanity URL
      fetchAllVanityUrls();
      fetchStats();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve request';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId: string, adminId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const updatedRequest = await vanityUrlService.rejectRequest(requestId, adminId, reason);
      setAllRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
      toast.success('Request rejected');
      fetchStats();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject request';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
    fetchAllVanityUrls();
    fetchStats();
  }, []);

  return {
    allRequests,
    allVanityUrls,
    stats,
    loading,
    error,
    approveRequest,
    rejectRequest,
    refetch: () => {
      fetchAllRequests();
      fetchAllVanityUrls();
      fetchStats();
    },
  };
}; 