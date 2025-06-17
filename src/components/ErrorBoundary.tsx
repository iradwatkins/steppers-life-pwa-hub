import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error caught by boundary:', error);
    console.error('📍 Error location info:', errorInfo);
    console.error('📝 Component stack:', errorInfo.componentStack);
    console.error('🔍 Error stack:', error.stack);
    
    // Log specific details for map errors
    if (error.message?.includes('map')) {
      console.error('🗺️ MAP ERROR DETECTED - This is likely an undefined array being mapped');
      console.error('🔧 Check for arrays that should have || [] fallbacks');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              An error occurred while loading the application.
            </p>
            <pre className="text-xs bg-muted p-4 rounded mb-4 overflow-auto text-left">
              {this.state.error?.message}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;