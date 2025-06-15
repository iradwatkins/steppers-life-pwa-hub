import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WidgetConfig } from '../../../services/custom-dashboard/customDashboardTypes';

interface LineChartWidgetProps {
  widget: WidgetConfig;
  data: any[]; // Expects an array of data points, e.g., [{ date: '2023-01-01', sales: 100, visits: 200 }]
  isLoading: boolean;
  error?: Error | null;
}

const LineChartWidget: React.FC<LineChartWidgetProps> = ({ widget, data, isLoading, error }) => {
  const chartStyle: React.CSSProperties = {
    backgroundColor: widget.themeOptions?.backgroundColor || '#ffffff',
    color: widget.themeOptions?.textColor || '#333333',
    fontFamily: 'sans-serif',
    fontSize: '0.75rem', // 12px
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0.5rem' // Reduced padding for more chart space
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

  // Determine keys for X and Y axes from widget.chartOptions or make sensible defaults
  const xAxisKey = widget.chartOptions?.xAxisKey || 'name'; // Default to 'name' or 'date' often
  const yAxisKeys = widget.chartOptions?.yAxisKeys || (data[0] ? Object.keys(data[0]).filter(key => key !== xAxisKey && typeof data[0][key] === 'number') : []);
  const lineColors = widget.chartOptions?.colors || ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];

  if (yAxisKeys.length === 0) {
    return <div style={chartStyle}>Chart configuration error: No Y-axis keys found.</div>;
  }

  return (
    <div style={{...chartStyle, padding: '10px 0px 0px 0px'}} className="line-chart-widget">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}> {/* Adjusted left margin for YAxis labels */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 10, fill: widget.themeOptions?.textColor || '#666' }} 
            stroke={widget.themeOptions?.borderColor || '#ccc'}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: widget.themeOptions?.textColor || '#666' }} 
            stroke={widget.themeOptions?.borderColor || '#ccc'}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', fontSize: '12px'}} 
            itemStyle={{color: widget.themeOptions?.textColor || '#333'}}
          />
          {yAxisKeys.length > 1 && <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}}/>}
          {yAxisKeys.map((yKey: string, index: number) => (
            <Line
              key={yKey}
              type="monotone"
              dataKey={yKey}
              stroke={lineColors[index % lineColors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name={yKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} // Prettify name for legend
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartWidget; 