import React from 'react';
import { WidgetConfig } from '../../../services/custom-dashboard/customDashboardTypes';

interface KpiCardWidgetProps {
  widget: WidgetConfig;
  data: any; // Data fetched for this widget
  isLoading: boolean;
  error?: Error | null;
}

const KpiCardWidget: React.FC<KpiCardWidgetProps> = ({ widget, data, isLoading, error }) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: widget.themeOptions?.backgroundColor || '#ffffff',
    color: widget.themeOptions?.textColor || '#000000',
    borderColor: widget.themeOptions?.borderColor || '#e0e0e0',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
  };

  if (isLoading) {
    return <div style={cardStyle} className="animate-pulse">Loading KPI...</div>;
  }

  if (error) {
    return <div style={cardStyle} className="text-red-500">Error: {error.message}</div>;
  }

  if (!data) {
    return <div style={cardStyle}>No data available for this KPI.</div>;
  }

  // Assuming data is an object like { value: 75000, name: 'Total Revenue', format: { decimalPlaces: 0, currencySymbol: '$' } }
  const displayValue = () => {
    if (data.value === null || data.value === undefined) return 'N/A';
    let val = data.value;
    if (widget.metricId) { // If it's a custom metric, data might be { value, name, format }
        const format = data.format || {};
        if (typeof val === 'number') {
            if (format.currencySymbol) {
                return `${format.currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: format.decimalPlaces || 0, maximumFractionDigits: format.decimalPlaces || 0 })}`;
            }
            return val.toLocaleString(undefined, { minimumFractionDigits: format.decimalPlaces || 0, maximumFractionDigits: format.decimalPlaces || 0 });
        }
    } else if (widget.predefinedMetric) { // If predefined, data might be { value, name }
         if (typeof val === 'number') {
            // Basic formatting for predefined metrics, can be expanded
            if (widget.title?.toLowerCase().includes('revenue') || widget.title?.toLowerCase().includes('sales')) {
                return `$${val.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
            }
            return val.toLocaleString();
        }
    }
    return String(val);
  };

  return (
    <div style={cardStyle} className="kpi-card-widget">
      <h4 className="text-sm text-gray-500 mb-1 truncate" style={{ color: widget.themeOptions?.textColor || '#6b7280' }}>
        {widget.title || data.name || 'KPI Title'}
      </h4>
      <div className="text-3xl font-bold truncate" style={{ color: widget.themeOptions?.textColor || '#000000' }}>
        {displayValue()}
      </div>
    </div>
  );
};

export default KpiCardWidget; 