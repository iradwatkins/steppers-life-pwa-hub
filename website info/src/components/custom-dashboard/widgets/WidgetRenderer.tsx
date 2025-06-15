import React, { useState, useEffect } from 'react';
import { WidgetConfig, WidgetType } from '../../../services/custom-dashboard/customDashboardTypes';
import KpiCardWidget from './KpiCardWidget';
import LineChartWidget from './LineChartWidget';
import BarChartWidget from './BarChartWidget';
import PieChartWidget from './PieChartWidget';
import TableWidget from './TableWidget';
import TextBoxWidget from './TextBoxWidget';
// Import other widget types here as they are created
// import TableWidget from './TableWidget';
// import TextBoxWidget from './TextBoxWidget';

interface WidgetRendererProps {
  widget: WidgetConfig;
  getWidgetData: (widgetId: string) => Promise<any>; // From useCustomDashboards hook
  // Potentially pass through other dashboard-level context if needed by specific widgets
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, getWidgetData }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!widget?.id) return;
      // For TextBoxWidget, content might be static and directly in widget.textConte_nt
      // Only fetch if it's not a textbox with predefined content or if data source is specified.
      if (widget.widgetType === WidgetType.TEXT_BOX && widget.textConte_nt && !widget.dataSourceId && !widget.metricId) {
        setData({ textConte_nt: widget.textConte_nt });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await getWidgetData(widget.id);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [widget, getWidgetData]); // Refetch if widget config or data fetching fn changes

  // Render specific widget based on type
  switch (widget.widgetType) {
    case WidgetType.KPI_CARD:
      return <KpiCardWidget widget={widget} data={data} isLoading={isLoading} error={error} />;
    case WidgetType.LINE_CHART:
      return <LineChartWidget widget={widget} data={data} isLoading={isLoading} error={error} />;
    case WidgetType.BAR_CHART:
      return <BarChartWidget widget={widget} data={data} isLoading={isLoading} error={error} />;
    case WidgetType.PIE_CHART:
      return <PieChartWidget widget={widget} data={data} isLoading={isLoading} error={error} />;
    case WidgetType.TABLE:
      return <TableWidget widget={widget} data={data} isLoading={isLoading} error={error} />;
    case WidgetType.TEXT_BOX:
      return <TextBoxWidget widget={widget} data={data} isLoading={isLoading} error={error} />;
    // case WidgetType.TABLE:
    //   return <TableWidget widget={widget} data={data} isLoading={isLoading} error={error} />;
    // case WidgetType.TEXT_BOX:
    //   return <TextBoxWidget widget={widget} data={data} isLoading={isLoading} error={error} />;
    default:
      return (
        <div className="p-4 bg-gray-50 h-full flex items-center justify-center">
          <p className="text-sm text-red-500">
            Unsupported widget type: {widget.widgetType} (ID: {widget.id})
          </p>
        </div>
      );
  }
};

export default WidgetRenderer; 