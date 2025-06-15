import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WidgetConfig } from '../../../services/custom-dashboard/customDashboardTypes';

interface BarChartWidgetProps {
  widget: WidgetConfig;
  data: any[]; // Expects an array of data points, e.g., [{ name: 'Page A', uv: 4000, pv: 2400 }]
  isLoading: boolean;
  error?: Error | null;
}

const BarChartWidget: React.FC<BarChartWidgetProps> = ({ widget, data, isLoading, error }) => {
  const chartStyle: React.CSSProperties = {
    backgroundColor: widget.themeOptions?.backgroundColor || '#ffffff',
    color: widget.themeOptions?.textColor || '#333333',
    fontFamily: 'sans-serif',
    fontSize: '0.75rem',
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0.5rem'
  };

  if (isLoading) {
    return <div style={chartStyle} className="animate-pulse">Loading chart data...</div>;
  }

  if (error) {
    return <div style={chartStyle} className="text-red-500">Error: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div style={chartStyle}>No data available for this chart.</div>;
  }

  const xAxisKey = widget.chartOptions?.xAxisKey || 'name';
  // For bar charts, yAxisKeys often map to multiple bars per x-axis category
  const yAxisKeys = widget.chartOptions?.yAxisKeys || (data[0] ? Object.keys(data[0]).filter(key => key !== xAxisKey && typeof data[0][key] === 'number') : []);
  const barColors = widget.chartOptions?.colors || ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];
  const layout = widget.chartOptions?.layout || 'vertical'; // 'vertical' or 'horizontal'

  if (yAxisKeys.length === 0) {
    return <div style={chartStyle}>Chart configuration error: No Y-axis keys found.</div>;
  }

  return (
    <div style={{...chartStyle, padding: '10px 0px 0px 0px'}} className="bar-chart-widget">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
            data={data} 
            layout={layout as any} // Recharts type expects 'horizontal' | 'vertical'
            margin={{ top: 5, right: 20, left: layout === 'vertical' ? -25 : 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          {layout === 'vertical' ? (
            <>
              <XAxis dataKey={xAxisKey} tick={{ fontSize: 10, fill: widget.themeOptions?.textColor || '#666' }} stroke={widget.themeOptions?.borderColor || '#ccc'} />
              <YAxis tick={{ fontSize: 10, fill: widget.themeOptions?.textColor || '#666' }} stroke={widget.themeOptions?.borderColor || '#ccc'} />
            </>
          ) : (
            <>
              <XAxis type="number" tick={{ fontSize: 10, fill: widget.themeOptions?.textColor || '#666' }} stroke={widget.themeOptions?.borderColor || '#ccc'} />
              <YAxis dataKey={xAxisKey} type="category" tick={{ fontSize: 10, fill: widget.themeOptions?.textColor || '#666' }} stroke={widget.themeOptions?.borderColor || '#ccc'} width={80} />
            </>
          )}
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', fontSize: '12px'}} 
            itemStyle={{color: widget.themeOptions?.textColor || '#333'}}
          />
          {yAxisKeys.length > 1 && <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>}
          {yAxisKeys.map((yKey: string, index: number) => (
            <Bar
              key={yKey}
              dataKey={yKey}
              fill={barColors[index % barColors.length]}
              name={yKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} // Prettify name for legend
              barSize={widget.chartOptions?.barSize || undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartWidget; 