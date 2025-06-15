import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WidgetConfig } from '../../../services/custom-dashboard/customDashboardTypes';

interface PieChartWidgetProps {
  widget: WidgetConfig;
  data: any[]; // Expects an array of data points, e.g., [{ name: 'Group A', value: 400 }, { name: 'Group B', value: 300 }]
  isLoading: boolean;
  error?: Error | null;
}

const PieChartWidget: React.FC<PieChartWidgetProps> = ({ widget, data, isLoading, error }) => {
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

  const nameKey = widget.chartOptions?.nameKey || 'name';
  const dataKey = widget.chartOptions?.dataKey || 'value';
  const colors = widget.chartOptions?.colors || ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const innerRadius = widget.chartOptions?.innerRadius || '50%'; // For donut chart effect
  const outerRadius = widget.chartOptions?.outerRadius || '80%';

  return (
    <div style={{...chartStyle, padding: '10px 0px 0px 0px'}} className="pie-chart-widget">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            // label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
            //   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            //   const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
            //   const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
            //   return (
            //     <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
            //       {`${(percent * 100).toFixed(0)}%`}
            //     </text>
            //   );
            // }}
            outerRadius={outerRadius}
            innerRadius={innerRadius} // This makes it a donut chart
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', fontSize: '12px'}} 
          />
          <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartWidget; 