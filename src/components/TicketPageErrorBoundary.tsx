import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface TicketPageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface TicketPageErrorBoundaryProps {
  children: React.ReactNode;
  eventId?: string;
}

export class TicketPageErrorBoundary extends React.Component<
  TicketPageErrorBoundaryProps,
  TicketPageErrorBoundaryState
> {
  constructor(props: TicketPageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TicketPageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Ticket Page Error Boundary caught an error:', error);
    console.error('🚨 Error Info:', errorInfo);
    console.error('🚨 Event ID:', this.props.eventId);
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Page Error
              </CardTitle>
              <CardDescription>
                The ticket page encountered an error and couldn't load properly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">Error Details:</p>
                <p className="text-xs text-red-700 mt-1">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
                {this.props.eventId && (
                  <p className="text-xs text-red-600 mt-1">
                    Event ID: {this.props.eventId}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={this.handleRetry} 
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/events'} 
                  className="w-full"
                  variant="secondary"
                >
                  Browse Events
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="text-xs text-gray-600 cursor-pointer">
                    Developer Info (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
} 