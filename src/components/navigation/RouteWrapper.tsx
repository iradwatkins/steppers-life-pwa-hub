import React from 'react';
import { useLocationChange } from '@/utils/navigationFix';

interface RouteWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * RouteWrapper component that ensures proper re-rendering on route changes
 * Wraps page components to fix navigation issues
 */
export const RouteWrapper: React.FC<RouteWrapperProps> = ({ 
  children, 
  className 
}) => {
  const location = useLocationChange();
  
  return (
    <div 
      key={`${location.pathname}${location.search}`}
      className={className}
    >
      {children}
    </div>
  );
};

/**
 * Higher-order component to wrap page components with route fixing
 */
export const withRouteWrapper = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent = (props: P) => (
    <RouteWrapper>
      <Component {...props} />
    </RouteWrapper>
  );
  
  WrappedComponent.displayName = `withRouteWrapper(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default RouteWrapper; 