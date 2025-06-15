import React, { useEffect, useMemo } from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import useCustomDashboards from '../../hooks/useCustomDashboards';
import { WidgetConfig, WidgetLayout } from '../../services/custom-dashboard/customDashboardTypes';
import WidgetRenderer from './widgets/WidgetRenderer';

// Apply WidthProvider to make ResponsiveReactGridLayout work correctly
const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardBuilderProps {
  dashboardId: string;
  ownerId: string; // Needed for the hook to fetch initial dashboards if not already loaded
  isEditable?: boolean;
}

const DashboardBuilder: React.FC<DashboardBuilderProps> = ({ dashboardId, ownerId, isEditable = true }) => {
  const {
    currentDashboard,
    fetchDashboardById,
    updateDashboard,
    getWidgetData,
    isLoading,
    error,
  } = useCustomDashboards(ownerId);

  useEffect(() => {
    if (dashboardId) {
      fetchDashboardById(dashboardId);
    }
  }, [dashboardId, fetchDashboardById]);

  const onLayoutChange = (newLayout: Layout[], allLayouts: Layouts) => {
    if (currentDashboard && isEditable) {
        // We only update the 'lg' layout for simplicity here, 
        // but a real app should handle all breakpoints present in allLayouts.
        // The `layouts` object in DashboardConfig already supports multiple breakpoints.
        // So we should update the specific breakpoint that changed, or all of them if react-grid-layout provides them.
        console.log('Layout changed:', newLayout, allLayouts);
        
        const updatedLayouts = { ...currentDashboard.layouts };

        // react-grid-layout's `allLayouts` gives us the current state for each breakpoint it manages.
        // We should iterate over these and update our stored layouts.
        Object.keys(allLayouts).forEach(breakpoint => {
            const bpKey = breakpoint as keyof typeof updatedLayouts;
            if (updatedLayouts[bpKey]) { // Check if our config has this breakpoint
                 updatedLayouts[bpKey] = allLayouts[bpKey]! as WidgetLayout[];
            }
        });

      updateDashboard(currentDashboard.id, { layouts: updatedLayouts });
    }
  };

  const memoizedLayouts = useMemo(() => {
    // Convert our DashboardLayout format to react-grid-layout's Layouts format if they differ
    // For now, assuming they are compatible (DashboardLayout directly usable by ResponsiveGridLayout)
    return currentDashboard?.layouts || {};
  }, [currentDashboard?.layouts]);

  if (isLoading && !currentDashboard) {
    return <div className="p-4 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading dashboard: {error.message}</div>;
  }

  if (!currentDashboard) {
    return <div className="p-4 text-center">Dashboard not found or no dashboard selected.</div>;
  }

  return (
    <div className="dashboard-builder p-4 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-slate-700">{currentDashboard.name}</h2>
        {/* Placeholder for Add Widget Button */}
      </div>
      {currentDashboard.widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] bg-white rounded-lg shadow">
          <svg className="w-16 h-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m-9 4H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2zm14 0h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2zM9 7V5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-slate-500 text-lg">This dashboard is empty.</p>
          {isEditable && <p className="text-slate-400 mt-1">Click "Add Widget" to get started.</p>}
        </div>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={memoizedLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={50} // Adjusted row height for potentially finer control
          isDraggable={isEditable}
          isResizable={isEditable}
          onLayoutChange={onLayoutChange}
          draggableHandle=".widget-drag-handle"
          margin={[10, 10]} // Margin between items [horizontal, vertical]
          containerPadding={[10,10]} // Padding for the container [horizontal, vertical]
        >
          {currentDashboard.widgets.map((widget: WidgetConfig) => (
            <div 
              key={widget.id} 
              className="widget bg-white shadow-lg rounded-lg overflow-hidden border border-slate-200 flex flex-col"
              // data-grid is automatically managed by ResponsiveGridLayout using widget.id from layouts
            >
              <div className="widget-header p-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center h-10 min-h-10">
                <h3 className="text-sm font-semibold widget-drag-handle cursor-move truncate text-slate-600 flex-grow">
                  {widget.title || 'Untitled Widget'}
                </h3>
                {/* Add widget controls (edit, delete) here later */}
                {isEditable && (
                    <div className="widget-controls flex items-center space-x-1">
                        <button className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700 text-xs">E</button>
                        <button className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700 text-xs">X</button>
                    </div>
                )}
              </div>
              <div className="widget-content p-1 flex-grow overflow-auto" style={{height: 'calc(100% - 40px)'}}>
                <WidgetRenderer widget={widget} getWidgetData={getWidgetData} />
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
};

export default DashboardBuilder; 