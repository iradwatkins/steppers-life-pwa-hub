import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap,
  Database,
  Cpu,
  MemoryStick,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import { EventComparison } from '@/services/comparativeAnalyticsService';

// Performance monitoring utilities
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  dataSize: number;
  cacheHitRate: number;
  apiCallCount: number;
  lastOptimized: Date;
}

interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in ms
  maxSize: number; // Max items in cache
  strategy: 'lru' | 'fifo' | 'lfu';
  compression: boolean;
}

interface OptimizationConfig {
  virtualization: boolean;
  lazyLoading: boolean;
  dataChunking: boolean;
  componentMemoization: boolean;
  imageOptimization: boolean;
  bundleSplitting: boolean;
}

interface MobileOptimization {
  responsiveCharts: boolean;
  touchOptimization: boolean;
  reducedAnimations: boolean;
  simplifiedUI: boolean;
  offlineMode: boolean;
}

// Mock cache implementation
class AnalyticsCache {
  private cache = new Map<string, { data: any; timestamp: number; accessCount: number }>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  set(key: string, data: any): void {
    if (!this.config.enabled) return;

    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, {
      data: this.config.compression ? this.compress(data) : data,
      timestamp: Date.now(),
      accessCount: 0
    });
  }

  get(key: string): any {
    if (!this.config.enabled) return null;

    const item = this.cache.get(key);
    if (!item) return null;

    // Check TTL
    if (Date.now() - item.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }

    item.accessCount++;
    return this.config.compression ? this.decompress(item.data) : item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToRemove: string;
    
    switch (this.config.strategy) {
      case 'lru':
        keyToRemove = Array.from(this.cache.entries())
          .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
        break;
      case 'lfu':
        keyToRemove = Array.from(this.cache.entries())
          .sort((a, b) => a[1].accessCount - b[1].accessCount)[0][0];
        break;
      default: // fifo
        keyToRemove = this.cache.keys().next().value;
    }
    
    this.cache.delete(keyToRemove);
  }

  private compress(data: any): string {
    // Mock compression - in reality use LZ4 or similar
    return JSON.stringify(data);
  }

  private decompress(data: string): any {
    return JSON.parse(data);
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.cache.size > 0 ? 
        Array.from(this.cache.values()).reduce((sum, item) => sum + item.accessCount, 0) / this.cache.size : 0
    };
  }
}

interface PerformanceOptimizationProps {
  comparison?: EventComparison;
  onOptimizationChange?: (config: OptimizationConfig) => void;
}

const PerformanceOptimization: React.FC<PerformanceOptimizationProps> = memo(({
  comparison,
  onOptimizationChange
}) => {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    dataSize: 0,
    cacheHitRate: 0,
    apiCallCount: 0,
    lastOptimized: new Date()
  });

  const [cacheConfig, setCacheConfig] = useState<CacheConfig>({
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 100,
    strategy: 'lru',
    compression: true
  });

  const [optimizationConfig, setOptimizationConfig] = useState<OptimizationConfig>({
    virtualizations: true,
    lazyLoading: true,
    dataChunking: true,
    componentMemoization: true,
    imageOptimization: true,
    bundleSplitting: true
  });

  const [mobileOptimization, setMobileOptimization] = useState<MobileOptimization>({
    responsiveCharts: true,
    touchOptimization: true,
    reducedAnimations: false,
    simplifiedUI: false,
    offlineMode: false
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // Initialize cache
  const cache = useMemo(() => new AnalyticsCache(cacheConfig), [cacheConfig]);

  // Detect device type
  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    // Mock performance metrics calculation
    const updateMetrics = () => {
      const memoryInfo = (performance as any).memory;
      const dataSize = comparison ? JSON.stringify(comparison).length : 0;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        loadTime: performance.now() - startTime,
        renderTime: Math.random() * 100 + 50, // Mock render time
        memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0, // MB
        componentCount: document.querySelectorAll('[data-component]').length,
        dataSize: dataSize / 1024, // KB
        cacheHitRate: cache.getStats().hitRate,
        apiCallCount: prev.apiCallCount + 1
      }));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [comparison, cache]);

  // Optimized data processing with memoization
  const processedData = useMemo(() => {
    if (!comparison) return null;

    const cacheKey = `processed-${comparison.id}-${JSON.stringify(optimizationConfig)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    // Simulate expensive data processing
    const processed = {
      events: comparison.events.map(event => ({
        ...event,
        // Add computed fields
        efficiency: event.revenue.gross / event.operational.total_cost,
        attendanceRatio: event.tickets_sold / event.capacity,
        profitMargin: (event.revenue.gross - event.operational.total_cost) / event.revenue.gross
      })),
      aggregations: {
        totalRevenue: comparison.events.reduce((sum, e) => sum + e.revenue.gross, 0),
        totalAttendees: comparison.events.reduce((sum, e) => sum + e.tickets_sold, 0),
        avgSatisfaction: comparison.events.reduce((sum, e) => sum + e.metrics.customer_satisfaction, 0) / comparison.events.length
      }
    };

    cache.set(cacheKey, processed);
    return processed;
  }, [comparison, optimizationConfig, cache]);

  // Auto-optimization based on performance metrics
  const runAutoOptimization = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      const newConfig = { ...optimizationConfig };
      
      // Optimize based on device type
      if (deviceType === 'mobile') {
        newConfig.virtualizations = true;
        newConfig.lazyLoading = true;
        setMobileOptimization(prev => ({
          ...prev,
          reducedAnimations: true,
          simplifiedUI: true
        }));
      }

      // Optimize based on performance metrics
      if (performanceMetrics.loadTime > 1000) {
        newConfig.bundleSplitting = true;
        newConfig.lazyLoading = true;
      }

      if (performanceMetrics.memoryUsage > 100) {
        newConfig.dataChunking = true;
        newConfig.componentMemoization = true;
      }

      if (performanceMetrics.cacheHitRate < 0.8) {
        setCacheConfig(prev => ({
          ...prev,
          maxSize: Math.min(prev.maxSize * 1.5, 500),
          ttl: Math.max(prev.ttl * 1.2, 600000)
        }));
      }

      setOptimizationConfig(newConfig);
      onOptimizationChange?.(newConfig);
      
      // Simulate optimization delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPerformanceMetrics(prev => ({
        ...prev,
        lastOptimized: new Date()
      }));
      
    } finally {
      setIsOptimizing(false);
    }
  }, [deviceType, performanceMetrics, optimizationConfig, onOptimizationChange]);

  // Performance score calculation
  const performanceScore = useMemo(() => {
    const loadScore = Math.max(0, 100 - (performanceMetrics.loadTime / 10));
    const memoryScore = Math.max(0, 100 - (performanceMetrics.memoryUsage / 2));
    const cacheScore = performanceMetrics.cacheHitRate * 100;
    
    return Math.round((loadScore + memoryScore + cacheScore) / 3);
  }, [performanceMetrics]);

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const performanceLevel = getPerformanceLevel(performanceScore);

  return (
    <div className="space-y-6">
      {/* Performance Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-primary" />
              Performance Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={performanceLevel.bg + ' ' + performanceLevel.color}>
                {performanceLevel.level} ({performanceScore}/100)
              </Badge>
              {deviceType === 'mobile' && <Smartphone className="h-4 w-4 text-muted-foreground" />}
              {deviceType === 'tablet' && <Tablet className="h-4 w-4 text-muted-foreground" />}
              {deviceType === 'desktop' && <Monitor className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics.loadTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-blue-600 font-medium">Load Time</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <MemoryStick className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.memoryUsage.toFixed(1)}MB
              </div>
              <div className="text-sm text-green-600 font-medium">Memory Usage</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Database className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-purple-600">
                {(performanceMetrics.cacheHitRate * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-purple-600 font-medium">Cache Hit Rate</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Cpu className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-orange-600">
                {performanceMetrics.componentCount}
              </div>
              <div className="text-sm text-orange-600 font-medium">Components</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Overall Performance</span>
              <span className="text-sm text-muted-foreground">{performanceScore}/100</span>
            </div>
            <Progress value={performanceScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Optimization Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cache Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-brand-primary" />
              Cache Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Enable Caching</label>
              <Switch
                checked={cacheConfig.enabled}
                onCheckedChange={(checked) => 
                  setCacheConfig(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">Cache Strategy</label>
              <Select 
                value={cacheConfig.strategy} 
                onValueChange={(value: CacheConfig['strategy']) => 
                  setCacheConfig(prev => ({ ...prev, strategy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lru">Least Recently Used</SelectItem>
                  <SelectItem value="lfu">Least Frequently Used</SelectItem>
                  <SelectItem value="fifo">First In, First Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground">
                Cache Size: {cacheConfig.maxSize} items
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                value={cacheConfig.maxSize}
                onChange={(e) => 
                  setCacheConfig(prev => ({ ...prev, maxSize: parseInt(e.target.value) }))
                }
                className="w-full mt-2"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Compression</label>
              <Switch
                checked={cacheConfig.compression}
                onCheckedChange={(checked) => 
                  setCacheConfig(prev => ({ ...prev, compression: checked }))
                }
              />
            </div>
            
            <div className="pt-3 border-t">
              <div className="text-sm text-muted-foreground">
                Cache Stats: {cache.getStats().size} items, {(cache.getStats().hitRate * 100).toFixed(1)}% hit rate
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => cache.clear()}
                className="mt-2 w-full"
              >
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-brand-primary" />
              Performance Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Virtualization</label>
              <Switch
                checked={optimizationConfig.virtualizations}
                onCheckedChange={(checked) => 
                  setOptimizationConfig(prev => ({ ...prev, virtualizations: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Lazy Loading</label>
              <Switch
                checked={optimizationConfig.lazyLoading}
                onCheckedChange={(checked) => 
                  setOptimizationConfig(prev => ({ ...prev, lazyLoading: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Data Chunking</label>
              <Switch
                checked={optimizationConfig.dataChunking}
                onCheckedChange={(checked) => 
                  setOptimizationConfig(prev => ({ ...prev, dataChunking: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Component Memoization</label>
              <Switch
                checked={optimizationConfig.componentMemoization}
                onCheckedChange={(checked) => 
                  setOptimizationConfig(prev => ({ ...prev, componentMemoization: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Bundle Splitting</label>
              <Switch
                checked={optimizationConfig.bundleSplitting}
                onCheckedChange={(checked) => 
                  setOptimizationConfig(prev => ({ ...prev, bundleSplitting: checked }))
                }
              />
            </div>
            
            <Button
              onClick={runAutoOptimization}
              disabled={isOptimizing}
              className="w-full mt-4"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Auto-Optimize
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Mobile Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-brand-primary" />
              Mobile Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Responsive Charts</label>
              <Switch
                checked={mobileOptimization.responsiveCharts}
                onCheckedChange={(checked) => 
                  setMobileOptimization(prev => ({ ...prev, responsiveCharts: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Touch Optimization</label>
              <Switch
                checked={mobileOptimization.touchOptimization}
                onCheckedChange={(checked) => 
                  setMobileOptimization(prev => ({ ...prev, touchOptimization: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Reduced Animations</label>
              <Switch
                checked={mobileOptimization.reducedAnimations}
                onCheckedChange={(checked) => 
                  setMobileOptimization(prev => ({ ...prev, reducedAnimations: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Simplified UI</label>
              <Switch
                checked={mobileOptimization.simplifiedUI}
                onCheckedChange={(checked) => 
                  setMobileOptimization(prev => ({ ...prev, simplifiedUI: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Offline Mode</label>
              <Switch
                checked={mobileOptimization.offlineMode}
                onCheckedChange={(checked) => 
                  setMobileOptimization(prev => ({ ...prev, offlineMode: checked }))
                }
              />
            </div>
            
            {deviceType !== 'desktop' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Mobile optimizations are automatically applied on this device.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-brand-primary" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Analytics Infrastructure</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Event Performance (E-001)</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Financial Reports</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Marketing Analytics</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer Analytics</span>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Data Sources</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Event Database</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Financial System</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Marketing Platform</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">External APIs</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Performance Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data Size</span>
                  <span className="text-sm font-medium">{performanceMetrics.dataSize.toFixed(1)}KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">API Calls</span>
                  <span className="text-sm font-medium">{performanceMetrics.apiCallCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last Optimized</span>
                  <span className="text-sm font-medium">
                    {performanceMetrics.lastOptimized.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand-primary" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceMetrics.loadTime > 1000 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Load time is above 1 second. Consider enabling bundle splitting and lazy loading.
                </AlertDescription>
              </Alert>
            )}
            
            {performanceMetrics.memoryUsage > 100 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  High memory usage detected. Enable data chunking and component memoization.
                </AlertDescription>
              </Alert>
            )}
            
            {performanceMetrics.cacheHitRate < 0.5 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Low cache hit rate. Increase cache size or adjust TTL settings.
                </AlertDescription>
              </Alert>
            )}
            
            {deviceType === 'mobile' && !mobileOptimization.simplifiedUI && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Mobile device detected. Consider enabling simplified UI and reduced animations.
                </AlertDescription>
              </Alert>
            )}
            
            {performanceScore >= 90 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Excellent performance! Your comparative analytics are optimized for the best user experience.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PerformanceOptimization.displayName = 'PerformanceOptimization';

export default PerformanceOptimization; 