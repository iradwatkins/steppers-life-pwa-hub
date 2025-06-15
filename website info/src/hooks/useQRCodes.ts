import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  qrCodeService,
  QRCodeConfig,
  QRCodeTemplate,
  QRCodeAnalytics,
  QRCodeCampaign,
  QRCodeTestResult,
  QRCodeBatchOperation,
  QRCodeDesign,
  QRCodeFormat
} from '../services/qrCodeService';

interface UseQRCodesState {
  qrCodes: QRCodeConfig[];
  templates: QRCodeTemplate[];
  analytics: QRCodeAnalytics[];
  campaigns: QRCodeCampaign[];
  selectedQRCode: QRCodeConfig | null;
  selectedTemplate: QRCodeTemplate | null;
  selectedCampaign: QRCodeCampaign | null;
  qrCodePreview: string | null;
  testResult: QRCodeTestResult | null;
  isLoading: boolean;
  isGenerating: boolean;
  isTesting: boolean;
  error: string | null;
}

interface UseQRCodesActions {
  // QR Code management
  loadQRCodes: (eventId?: string) => Promise<void>;
  createQRCode: (config: Omit<QRCodeConfig, 'id' | 'createdAt' | 'updatedAt'>) => Promise<QRCodeConfig>;
  updateQRCode: (id: string, updates: Partial<QRCodeConfig>) => Promise<void>;
  deleteQRCode: (id: string) => Promise<void>;
  selectQRCode: (qrCode: QRCodeConfig | null) => void;
  duplicateQRCode: (id: string) => Promise<QRCodeConfig>;
  
  // QR Code generation and preview
  generatePreview: (config: QRCodeConfig) => Promise<void>;
  generateQRCodeImage: (config: QRCodeConfig) => Promise<string>;
  generateQRCodeSVG: (config: QRCodeConfig) => Promise<string>;
  downloadQRCode: (config: QRCodeConfig, format: 'png' | 'svg') => Promise<void>;
  
  // Batch operations
  generateBatchQRCodes: (operation: QRCodeBatchOperation) => Promise<QRCodeConfig[]>;
  
  // Template management
  loadTemplates: () => Promise<void>;
  createTemplate: (template: Omit<QRCodeTemplate, 'id'>) => Promise<QRCodeTemplate>;
  updateTemplate: (id: string, updates: Partial<QRCodeTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  selectTemplate: (template: QRCodeTemplate | null) => void;
  applyTemplate: (templateId: string, qrCodeId: string) => Promise<void>;
  
  // Analytics
  loadAnalytics: (eventId?: string) => Promise<void>;
  getQRCodeAnalytics: (qrCodeId: string) => Promise<QRCodeAnalytics | null>;
  trackScan: (qrCodeId: string, source?: string, device?: string, location?: string) => Promise<void>;
  trackConversion: (qrCodeId: string) => Promise<void>;
  exportAnalytics: (qrCodeId: string, format: 'csv' | 'json') => Promise<void>;
  
  // Testing and validation
  testQRCode: (config: QRCodeConfig) => Promise<void>;
  validateQRCode: (config: QRCodeConfig) => Promise<boolean>;
  
  // Campaign management
  loadCampaigns: () => Promise<void>;
  createCampaign: (campaign: Omit<QRCodeCampaign, 'id' | 'createdAt' | 'analytics'>) => Promise<QRCodeCampaign>;
  updateCampaign: (id: string, updates: Partial<QRCodeCampaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  selectCampaign: (campaign: QRCodeCampaign | null) => void;
  addQRCodeToCampaign: (qrCodeId: string, campaignId: string) => Promise<void>;
  removeQRCodeFromCampaign: (qrCodeId: string, campaignId: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  refresh: () => Promise<void>;
}

export function useQRCodes(eventId?: string): UseQRCodesState & UseQRCodesActions {
  const [state, setState] = useState<UseQRCodesState>({
    qrCodes: [],
    templates: [],
    analytics: [],
    campaigns: [],
    selectedQRCode: null,
    selectedTemplate: null,
    selectedCampaign: null,
    qrCodePreview: null,
    testResult: null,
    isLoading: false,
    isGenerating: false,
    isTesting: false,
    error: null,
  });

  // QR Code management
  const loadQRCodes = useCallback(async (filterEventId?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const targetEventId = filterEventId || eventId;
      const qrCodes = targetEventId 
        ? await qrCodeService.getQRCodesByEvent(targetEventId)
        : await qrCodeService.getAllQRCodes();
      
      setState(prev => ({ ...prev, qrCodes, isLoading: false }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load QR codes', 
        isLoading: false 
      }));
      toast.error('Failed to load QR codes');
    }
  }, [eventId]);

  const createQRCode = useCallback(async (config: Omit<QRCodeConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));
    
    try {
      const qrCode = await qrCodeService.generateQRCode(config);
      setState(prev => ({ 
        ...prev, 
        qrCodes: [...prev.qrCodes, qrCode],
        isGenerating: false 
      }));
      
      toast.success('QR code created successfully');
      return qrCode;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create QR code', 
        isGenerating: false 
      }));
      toast.error('Failed to create QR code');
      throw error;
    }
  }, []);

  const updateQRCode = useCallback(async (id: string, updates: Partial<QRCodeConfig>) => {
    try {
      const updated = await qrCodeService.updateQRCode(id, updates);
      setState(prev => ({
        ...prev,
        qrCodes: prev.qrCodes.map(qr => qr.id === id ? updated : qr),
        selectedQRCode: prev.selectedQRCode?.id === id ? updated : prev.selectedQRCode,
      }));
      
      toast.success('QR code updated successfully');
    } catch (error) {
      toast.error('Failed to update QR code');
      throw error;
    }
  }, []);

  const deleteQRCode = useCallback(async (id: string) => {
    try {
      await qrCodeService.deleteQRCode(id);
      setState(prev => ({
        ...prev,
        qrCodes: prev.qrCodes.filter(qr => qr.id !== id),
        selectedQRCode: prev.selectedQRCode?.id === id ? null : prev.selectedQRCode,
      }));
      
      toast.success('QR code deleted successfully');
    } catch (error) {
      toast.error('Failed to delete QR code');
      throw error;
    }
  }, []);

  const selectQRCode = useCallback((qrCode: QRCodeConfig | null) => {
    setState(prev => ({ ...prev, selectedQRCode: qrCode }));
  }, []);

  const duplicateQRCode = useCallback(async (id: string) => {
    const original = await qrCodeService.getQRCode(id);
    if (!original) {
      throw new Error('QR code not found');
    }

    const config = {
      ...original,
      name: `${original.name} (Copy)`,
      isActive: false, // Duplicates start as inactive
    };

    delete (config as any).id;
    delete (config as any).createdAt;
    delete (config as any).updatedAt;

    return createQRCode(config);
  }, [createQRCode]);

  // QR Code generation and preview
  const generatePreview = useCallback(async (config: QRCodeConfig) => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const preview = await qrCodeService.generateQRCodeImage(config);
      setState(prev => ({ ...prev, qrCodePreview: preview, isGenerating: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isGenerating: false }));
      toast.error('Failed to generate preview');
    }
  }, []);

  const generateQRCodeImage = useCallback(async (config: QRCodeConfig) => {
    return await qrCodeService.generateQRCodeImage(config);
  }, []);

  const generateQRCodeSVG = useCallback(async (config: QRCodeConfig) => {
    return await qrCodeService.generateQRCodeSVG(config);
  }, []);

  const downloadQRCode = useCallback(async (config: QRCodeConfig, format: 'png' | 'svg') => {
    try {
      let dataUrl: string;
      let filename: string;
      
      if (format === 'png') {
        dataUrl = await qrCodeService.generateQRCodeImage(config);
        filename = `${config.name}.png`;
      } else {
        const svgString = await qrCodeService.generateQRCodeSVG(config);
        dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
        filename = `${config.name}.svg`;
      }
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  }, []);

  // Batch operations
  const generateBatchQRCodes = useCallback(async (operation: QRCodeBatchOperation) => {
    setState(prev => ({ ...prev, isGenerating: true }));
    
    try {
      const qrCodes = await qrCodeService.generateBatchQRCodes(operation);
      setState(prev => ({ 
        ...prev, 
        qrCodes: [...prev.qrCodes, ...qrCodes],
        isGenerating: false 
      }));
      
      toast.success(`Generated ${qrCodes.length} QR codes successfully`);
      return qrCodes;
    } catch (error) {
      setState(prev => ({ ...prev, isGenerating: false }));
      toast.error('Failed to generate batch QR codes');
      throw error;
    }
  }, []);

  // Template management
  const loadTemplates = useCallback(async () => {
    try {
      const templates = await qrCodeService.getTemplates();
      setState(prev => ({ ...prev, templates }));
    } catch (error) {
      toast.error('Failed to load templates');
    }
  }, []);

  const createTemplate = useCallback(async (template: Omit<QRCodeTemplate, 'id'>) => {
    try {
      const newTemplate = await qrCodeService.createTemplate(template);
      setState(prev => ({ 
        ...prev, 
        templates: [...prev.templates, newTemplate] 
      }));
      
      toast.success('Template created successfully');
      return newTemplate;
    } catch (error) {
      toast.error('Failed to create template');
      throw error;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<QRCodeTemplate>) => {
    try {
      const updated = await qrCodeService.updateTemplate(id, updates);
      setState(prev => ({
        ...prev,
        templates: prev.templates.map(t => t.id === id ? updated : t),
        selectedTemplate: prev.selectedTemplate?.id === id ? updated : prev.selectedTemplate,
      }));
      
      toast.success('Template updated successfully');
    } catch (error) {
      toast.error('Failed to update template');
      throw error;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await qrCodeService.deleteTemplate(id);
      setState(prev => ({
        ...prev,
        templates: prev.templates.filter(t => t.id !== id),
        selectedTemplate: prev.selectedTemplate?.id === id ? null : prev.selectedTemplate,
      }));
      
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
      throw error;
    }
  }, []);

  const selectTemplate = useCallback((template: QRCodeTemplate | null) => {
    setState(prev => ({ ...prev, selectedTemplate: template }));
  }, []);

  const applyTemplate = useCallback(async (templateId: string, qrCodeId: string) => {
    try {
      const template = await qrCodeService.getTemplates().then(templates => 
        templates.find(t => t.id === templateId)
      );
      
      if (!template) {
        throw new Error('Template not found');
      }

      await updateQRCode(qrCodeId, {
        design: template.design,
        format: template.format,
      });
      
      toast.success('Template applied successfully');
    } catch (error) {
      toast.error('Failed to apply template');
    }
  }, [updateQRCode]);

  // Analytics
  const loadAnalytics = useCallback(async (filterEventId?: string) => {
    try {
      const targetEventId = filterEventId || eventId;
      const analytics = targetEventId
        ? await qrCodeService.getAnalyticsByEvent(targetEventId)
        : [];
      
      setState(prev => ({ ...prev, analytics }));
    } catch (error) {
      toast.error('Failed to load analytics');
    }
  }, [eventId]);

  const getQRCodeAnalytics = useCallback(async (qrCodeId: string) => {
    return await qrCodeService.getAnalytics(qrCodeId);
  }, []);

  const trackScan = useCallback(async (qrCodeId: string, source?: string, device?: string, location?: string) => {
    try {
      await qrCodeService.trackScan(qrCodeId, source, device, location);
      // Refresh analytics for this QR code
      const analytics = await qrCodeService.getAnalytics(qrCodeId);
      if (analytics) {
        setState(prev => ({
          ...prev,
          analytics: prev.analytics.map(a => a.qrCodeId === qrCodeId ? analytics : a),
        }));
      }
    } catch (error) {
      console.error('Failed to track scan:', error);
    }
  }, []);

  const trackConversion = useCallback(async (qrCodeId: string) => {
    try {
      await qrCodeService.trackConversion(qrCodeId);
      // Refresh analytics for this QR code
      const analytics = await qrCodeService.getAnalytics(qrCodeId);
      if (analytics) {
        setState(prev => ({
          ...prev,
          analytics: prev.analytics.map(a => a.qrCodeId === qrCodeId ? analytics : a),
        }));
      }
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }, []);

  const exportAnalytics = useCallback(async (qrCodeId: string, format: 'csv' | 'json') => {
    try {
      const analytics = await qrCodeService.getAnalytics(qrCodeId);
      if (!analytics) {
        throw new Error('Analytics not found');
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        const csvRows = [
          'Date,Scans',
          ...analytics.scansByDate.map(s => `${s.date},${s.scans}`)
        ];
        content = csvRows.join('\n');
        filename = `qr-analytics-${qrCodeId}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(analytics, null, 2);
        filename = `qr-analytics-${qrCodeId}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  }, []);

  // Testing and validation
  const testQRCode = useCallback(async (config: QRCodeConfig) => {
    setState(prev => ({ ...prev, isTesting: true }));
    
    try {
      const result = await qrCodeService.testQRCode(config);
      setState(prev => ({ ...prev, testResult: result, isTesting: false }));
    } catch (error) {
      setState(prev => ({ ...prev, isTesting: false }));
      toast.error('Failed to test QR code');
    }
  }, []);

  const validateQRCode = useCallback(async (config: QRCodeConfig) => {
    const result = await qrCodeService.testQRCode(config);
    return result.isValid;
  }, []);

  // Campaign management
  const loadCampaigns = useCallback(async () => {
    try {
      const campaigns = await qrCodeService.getCampaigns();
      setState(prev => ({ ...prev, campaigns }));
    } catch (error) {
      toast.error('Failed to load campaigns');
    }
  }, []);

  const createCampaign = useCallback(async (campaign: Omit<QRCodeCampaign, 'id' | 'createdAt' | 'analytics'>) => {
    try {
      const newCampaign = await qrCodeService.createCampaign(campaign);
      setState(prev => ({ 
        ...prev, 
        campaigns: [...prev.campaigns, newCampaign] 
      }));
      
      toast.success('Campaign created successfully');
      return newCampaign;
    } catch (error) {
      toast.error('Failed to create campaign');
      throw error;
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, updates: Partial<QRCodeCampaign>) => {
    try {
      const campaign = state.campaigns.find(c => c.id === id);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const updated = { ...campaign, ...updates };
      setState(prev => ({
        ...prev,
        campaigns: prev.campaigns.map(c => c.id === id ? updated : c),
        selectedCampaign: prev.selectedCampaign?.id === id ? updated : prev.selectedCampaign,
      }));
      
      toast.success('Campaign updated successfully');
    } catch (error) {
      toast.error('Failed to update campaign');
      throw error;
    }
  }, [state.campaigns]);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      setState(prev => ({
        ...prev,
        campaigns: prev.campaigns.filter(c => c.id !== id),
        selectedCampaign: prev.selectedCampaign?.id === id ? null : prev.selectedCampaign,
      }));
      
      toast.success('Campaign deleted successfully');
    } catch (error) {
      toast.error('Failed to delete campaign');
      throw error;
    }
  }, []);

  const selectCampaign = useCallback((campaign: QRCodeCampaign | null) => {
    setState(prev => ({ ...prev, selectedCampaign: campaign }));
  }, []);

  const addQRCodeToCampaign = useCallback(async (qrCodeId: string, campaignId: string) => {
    try {
      const campaign = state.campaigns.find(c => c.id === campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (!campaign.qrCodeIds.includes(qrCodeId)) {
        campaign.qrCodeIds.push(qrCodeId);
        await updateCampaign(campaignId, { qrCodeIds: campaign.qrCodeIds });
      }
    } catch (error) {
      toast.error('Failed to add QR code to campaign');
    }
  }, [state.campaigns, updateCampaign]);

  const removeQRCodeFromCampaign = useCallback(async (qrCodeId: string, campaignId: string) => {
    try {
      const campaign = state.campaigns.find(c => c.id === campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const qrCodeIds = campaign.qrCodeIds.filter(id => id !== qrCodeId);
      await updateCampaign(campaignId, { qrCodeIds });
    } catch (error) {
      toast.error('Failed to remove QR code from campaign');
    }
  }, [state.campaigns, updateCampaign]);

  // Utility functions
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadQRCodes(),
      loadTemplates(),
      loadAnalytics(),
      loadCampaigns(),
    ]);
  }, [loadQRCodes, loadTemplates, loadAnalytics, loadCampaigns]);

  // Initialize data on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    loadQRCodes,
    createQRCode,
    updateQRCode,
    deleteQRCode,
    selectQRCode,
    duplicateQRCode,
    generatePreview,
    generateQRCodeImage,
    generateQRCodeSVG,
    downloadQRCode,
    generateBatchQRCodes,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
    applyTemplate,
    loadAnalytics,
    getQRCodeAnalytics,
    trackScan,
    trackConversion,
    exportAnalytics,
    testQRCode,
    validateQRCode,
    loadCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    selectCampaign,
    addQRCodeToCampaign,
    removeQRCodeFromCampaign,
    clearError,
    refresh,
  };
} 