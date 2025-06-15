import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  X,
  Calculator,
  BarChart3
} from 'lucide-react';
import { EventComparison, ComparisonEvent } from '@/services/comparativeAnalyticsService';

interface PerformanceMetricsTableProps {
  comparison: EventComparison;
  onEventSelect?: (eventId: string) => void;
  onExport?: () => void;
  showCalculations?: boolean;
}

type SortField = keyof ComparisonEvent['metrics'] | 'name' | 'date' | 'revenue' | 'capacity' | 'tickets_sold';
type SortDirection = 'asc' | 'desc';

const PerformanceMetricsTable: React.FC<PerformanceMetricsTableProps> = ({
  comparison,
  onEventSelect,
  onExport,
  showCalculations = true
}) => {
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showMetricDetails, setShowMetricDetails] = useState(false);

  // Define metrics configuration
  const metricsConfig = [
    {
      key: 'revenue' as const,
      label: 'Revenue',
      format: (value: number, event: ComparisonEvent) => `$${event.revenue.gross.toLocaleString()}`,
      getValue: (event: ComparisonEvent) => event.revenue.gross,
      description: 'Total gross revenue generated',
      benchmark: 'Higher is better'
    },
    {
      key: 'attendance_rate' as const,
      label: 'Attendance Rate',
      format: (value: number) => `${value.toFixed(1)}%`,
      getValue: (event: ComparisonEvent) => event.metrics.attendance_rate,
      description: 'Percentage of ticket holders who attended',
      benchmark: '85%+ is excellent'
    },
    {
      key: 'customer_satisfaction' as const,
      label: 'Customer Satisfaction',
      format: (value: number) => `${value.toFixed(1)}/5.0`,
      getValue: (event: ComparisonEvent) => event.metrics.customer_satisfaction,
      description: 'Average customer rating',
      benchmark: '4.5+ is excellent'
    },
    {
      key: 'marketing_roi' as const,
      label: 'Marketing ROI',
      format: (value: number) => `${value.toFixed(1)}x`,
      getValue: (event: ComparisonEvent) => event.metrics.marketing_roi,
      description: 'Return on marketing investment',
      benchmark: '3.0x+ is excellent'
    },
    {
      key: 'check_in_rate' as const,
      label: 'Check-in Rate',
      format: (value: number) => `${value.toFixed(1)}%`,
      getValue: (event: ComparisonEvent) => event.metrics.check_in_rate,
      description: 'Percentage of attendees who checked in',
      benchmark: '90%+ is excellent'
    },
    {
      key: 'refund_rate' as const,
      label: 'Refund Rate',
      format: (value: number) => `${value.toFixed(1)}%`,
      getValue: (event: ComparisonEvent) => event.metrics.refund_rate,
      description: 'Percentage of tickets refunded',
      benchmark: 'Lower is better (<5%)'
    },
    {
      key: 'repeat_customer_rate' as const,
      label: 'Repeat Customers',
      format: (value: number) => `${value.toFixed(1)}%`,
      getValue: (event: ComparisonEvent) => event.metrics.repeat_customer_rate,
      description: 'Percentage of returning customers',
      benchmark: '60%+ is excellent'
    }
  ];

  // Calculate performance indicators
  const getPerformanceIndicator = (value: number, metricKey: string) => {
    const metric = metricsConfig.find(m => m.key === metricKey);
    if (!metric) return { icon: Minus, color: 'text-gray-500' };

    const allValues = comparison.events.map(metric.getValue);
    const average = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    const threshold = average * 0.1; // 10% threshold

    if (value > average + threshold) {
      return { icon: TrendingUp, color: 'text-green-500' };
    } else if (value < average - threshold) {
      return { icon: TrendingDown, color: 'text-red-500' };
    } else {
      return { icon: Minus, color: 'text-yellow-500' };
    }
  };

  // Sorting logic
  const sortedEvents = useMemo(() => {
    let filtered = comparison.events.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortField) {
        case 'name':
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'revenue':
          aValue = a.revenue.gross;
          bValue = b.revenue.gross;
          break;
        case 'capacity':
          aValue = a.capacity;
          bValue = b.capacity;
          break;
        case 'tickets_sold':
          aValue = a.tickets_sold;
          bValue = b.tickets_sold;
          break;
        default:
          aValue = a.metrics[sortField as keyof typeof a.metrics] as number;
          bValue = b.metrics[sortField as keyof typeof b.metrics] as number;
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [comparison.events, sortField, sortDirection, searchTerm, categoryFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return ArrowUpDown;
    return sortDirection === 'asc' ? ArrowUp : ArrowDown;
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats: Record<string, { total: number; average: number; best: number; worst: number }> = {};
    
    metricsConfig.forEach(metric => {
      const values = sortedEvents.map(metric.getValue);
      stats[metric.key] = {
        total: values.reduce((sum, val) => sum + val, 0),
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        best: Math.max(...values),
        worst: Math.min(...values)
      };
    });

    return stats;
  }, [sortedEvents]);

  const categories = Array.from(new Set(comparison.events.map(e => e.category)));

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ 
    field, 
    children, 
    className = '' 
  }) => {
    const Icon = getSortIcon(field);
    return (
      <TableHead className={`cursor-pointer hover:bg-muted/50 ${className}`} onClick={() => handleSort(field)}>
        <div className="flex items-center gap-2">
          {children}
          <Icon className="h-4 w-4" />
        </div>
      </TableHead>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-primary" />
              Performance Metrics Comparison
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMetricDetails(!showMetricDetails)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                {showMetricDetails ? 'Hide' : 'Show'} Details
              </Button>
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(searchTerm || categoryFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Showing {sortedEvents.length} of {comparison.events.length} events
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {showCalculations && (
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {metricsConfig.slice(0, 4).map(metric => {
                const stats = summaryStats[metric.key];
                return (
                  <div key={metric.key} className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-foreground">
                      {metric.format(stats.average, comparison.events[0])}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Avg {metric.label}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Best: {metric.format(stats.best, comparison.events[0])}</span>
                      <span>Worst: {metric.format(stats.worst, comparison.events[0])}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="name" className="min-w-[200px]">Event Name</SortableHeader>
                  <SortableHeader field="date">Date</SortableHeader>
                  <TableHead>Category</TableHead>
                  <SortableHeader field="tickets_sold">Attendance</SortableHeader>
                  <SortableHeader field="revenue">Revenue</SortableHeader>
                  <SortableHeader field="attendance_rate">Attendance %</SortableHeader>
                  <SortableHeader field="customer_satisfaction">Satisfaction</SortableHeader>
                  <SortableHeader field="marketing_roi">Marketing ROI</SortableHeader>
                  <SortableHeader field="check_in_rate">Check-in %</SortableHeader>
                  {showMetricDetails && (
                    <>
                      <SortableHeader field="refund_rate">Refund %</SortableHeader>
                      <SortableHeader field="repeat_customer_rate">Repeat %</SortableHeader>
                    </>
                  )}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEvents.map((event, index) => (
                  <TableRow key={event.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-foreground truncate max-w-[180px]">
                          {event.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.venue}, {event.location.city}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">{event.category}</Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{event.tickets_sold}/{event.capacity}</div>
                        <div className="text-xs text-muted-foreground">
                          {((event.tickets_sold / event.capacity) * 100).toFixed(0)}% full
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${event.revenue.gross.toLocaleString()}</span>
                        {(() => {
                          const indicator = getPerformanceIndicator(event.revenue.gross, 'revenue');
                          const Icon = indicator.icon;
                          return <Icon className={`h-4 w-4 ${indicator.color}`} />;
                        })()}
                      </div>
                      {showMetricDetails && (
                        <div className="text-xs text-muted-foreground">
                          Net: ${event.revenue.net.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{event.metrics.attendance_rate.toFixed(1)}%</span>
                        {(() => {
                          const indicator = getPerformanceIndicator(event.metrics.attendance_rate, 'attendance_rate');
                          const Icon = indicator.icon;
                          return <Icon className={`h-4 w-4 ${indicator.color}`} />;
                        })()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{event.metrics.customer_satisfaction.toFixed(1)}/5.0</span>
                        {(() => {
                          const indicator = getPerformanceIndicator(event.metrics.customer_satisfaction, 'customer_satisfaction');
                          const Icon = indicator.icon;
                          return <Icon className={`h-4 w-4 ${indicator.color}`} />;
                        })()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{event.metrics.marketing_roi.toFixed(1)}x</span>
                        {(() => {
                          const indicator = getPerformanceIndicator(event.metrics.marketing_roi, 'marketing_roi');
                          const Icon = indicator.icon;
                          return <Icon className={`h-4 w-4 ${indicator.color}`} />;
                        })()}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{event.metrics.check_in_rate.toFixed(1)}%</span>
                        {(() => {
                          const indicator = getPerformanceIndicator(event.metrics.check_in_rate, 'check_in_rate');
                          const Icon = indicator.icon;
                          return <Icon className={`h-4 w-4 ${indicator.color}`} />;
                        })()}
                      </div>
                    </TableCell>
                    
                    {showMetricDetails && (
                      <>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{event.metrics.refund_rate.toFixed(1)}%</span>
                            {(() => {
                              const indicator = getPerformanceIndicator(event.metrics.refund_rate, 'refund_rate');
                              const Icon = indicator.icon;
                              return <Icon className={`h-4 w-4 ${indicator.color === 'text-green-500' ? 'text-red-500' : indicator.color === 'text-red-500' ? 'text-green-500' : indicator.color}`} />;
                            })()}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{event.metrics.repeat_customer_rate.toFixed(1)}%</span>
                            {(() => {
                              const indicator = getPerformanceIndicator(event.metrics.repeat_customer_rate, 'repeat_customer_rate');
                              const Icon = indicator.icon;
                              return <Icon className={`h-4 w-4 ${indicator.color}`} />;
                            })()}
                          </div>
                        </TableCell>
                      </>
                    )}
                    
                    <TableCell>
                      {onEventSelect && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEventSelect(event.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Metric Explanations */}
      {showMetricDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Metric Explanations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metricsConfig.map(metric => (
                <div key={metric.key} className="p-4 border rounded-lg">
                  <div className="font-medium text-foreground mb-2">{metric.label}</div>
                  <div className="text-sm text-muted-foreground mb-2">{metric.description}</div>
                  <div className="text-xs text-green-600 font-medium">
                    Benchmark: {metric.benchmark}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceMetricsTable; 