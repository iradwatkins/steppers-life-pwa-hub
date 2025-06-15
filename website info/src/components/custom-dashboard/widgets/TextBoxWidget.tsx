import React from 'react';
import { WidgetConfig } from '../../../services/custom-dashboard/customDashboardTypes';

interface TextBoxWidgetProps {
  widget: WidgetConfig;
  // Text box data might not be fetched asynchronously, could be part of widget.textConte_nt
  // However, we keep data, isLoading, error for consistency if some text boxes become dynamic
  data?: { textConte_nt?: string }; 
  isLoading: boolean;
  error?: Error | null;
}

const TextBoxWidget: React.FC<TextBoxWidgetProps> = ({ widget, data, isLoading, error }) => {
  const textStyle: React.CSSProperties = {
    backgroundColor: widget.themeOptions?.backgroundColor || '#ffffff',
    color: widget.themeOptions?.textColor || '#333333',
    fontFamily: 'sans-serif',
    fontSize: widget.chartOptions?.fontSize || '0.875rem', // Allow fontSize from chartOptions as a generic styling prop
    height: '100%',
    width: '100%',
    overflowY: 'auto',
    padding: '1rem',
    lineHeight: widget.chartOptions?.lineHeight || '1.5',
    textAlign: widget.chartOptions?.textAlign || 'left' as any,
  };

  if (isLoading && !widget.textConte_nt && !data?.textConte_nt) {
    return <div style={textStyle} className="animate-pulse">Loading text...</div>;
  }

  if (error && !widget.textConte_nt && !data?.textConte_nt) {
    return <div style={textStyle} className="text-red-500">Error: {error.message}</div>;
  }

  // Prioritize fetched data, then widget config, then placeholder
  const content = data?.textConte_nt || widget.textConte_nt || 'No text content available.';
  
  // Basic check for common HTML tags to avoid rendering them as plain text.
  // For full HTML/Markdown, a dedicated parser/renderer would be needed (e.g., react-markdown).
  const looksLikeHtml = /[<>]/.test(content) && /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/.test(content);

  return (
    <div style={textStyle} className="text-box-widget">
      {looksLikeHtml ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p>{content}</p>
      )}
    </div>
  );
};

export default TextBoxWidget; 