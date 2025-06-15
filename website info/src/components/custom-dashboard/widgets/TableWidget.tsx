import React from 'react';
import { WidgetConfig } from '../../../services/custom-dashboard/customDashboardTypes';

interface TableWidgetProps {
  widget: WidgetConfig;
  data: any[]; // Expects an array of objects, e.g., [{ col1: 'dataA1', col2: 'dataB1' }]
  isLoading: boolean;
  error?: Error | null;
}

const TableWidget: React.FC<TableWidgetProps> = ({ widget, data, isLoading, error }) => {
  const tableContainerStyle: React.CSSProperties = {
    backgroundColor: widget.themeOptions?.backgroundColor || '#ffffff',
    color: widget.themeOptions?.textColor || '#333333',
    fontFamily: 'sans-serif',
    fontSize: '0.875rem', // 14px
    height: '100%',
    width: '100%',
    overflow: 'auto', // Important for tables that might exceed widget dimensions
    padding: '0.5rem'
  };

  if (isLoading) {
    return <div style={tableContainerStyle} className="animate-pulse p-4">Loading table data...</div>;
  }

  if (error) {
    return <div style={tableContainerStyle} className="text-red-500 p-4">Error: {error.message}</div>;
  }

  if (!data || data.length === 0) {
    return <div style={tableContainerStyle} className="p-4">No data available for this table.</div>;
  }

  // Determine columns from widget.tableColumns or infer from data keys
  const columns = widget.tableColumns && widget.tableColumns.length > 0 
    ? widget.tableColumns 
    : Object.keys(data[0] || {}).map(key => ({ 
        key: key, 
        header: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
      }));

  if (columns.length === 0) {
    return <div style={tableContainerStyle} className="p-4">Table configuration error: No columns defined or inferable.</div>;
  }

  return (
    <div style={tableContainerStyle} className="table-widget-container">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
        <thead className="bg-gray-50" style={{backgroundColor: widget.themeOptions?.borderColor || '#f9fafb'}}>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{color: widget.themeOptions?.textColor || '#6b7280'}}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200" style={{backgroundColor: widget.themeOptions?.backgroundColor, color: widget.themeOptions?.textColor}}>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} style={{backgroundColor: rowIndex % 2 === 0 ? widget.themeOptions?.backgroundColor : widget.themeOptions?.borderColor}}>
              {columns.map((col) => (
                <td key={`${rowIndex}-${col.key}`} className="px-3 py-2 whitespace-nowrap text-xs text-gray-700" style={{color: widget.themeOptions?.textColor}}>
                  {String(row[col.key] === undefined || row[col.key] === null ? '-' : row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableWidget; 