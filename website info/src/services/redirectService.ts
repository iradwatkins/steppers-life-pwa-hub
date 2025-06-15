import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RedirectRule {
  sourcePath: string;
  targetUrl: string;
  isExact?: boolean;
}

// Function to get redirect rules from localStorage or use defaults
export const getRedirectRules = (): RedirectRule[] => {
  try {
    const savedRules = localStorage.getItem('redirect_rules');
    if (savedRules) {
      const parsedRules = JSON.parse(savedRules);
      // Filter to only include active rules and map to the expected format
      return parsedRules
        .filter((rule: any) => rule.isActive !== false)
        .map((rule: any) => ({
          sourcePath: rule.sourcePath,
          targetUrl: rule.targetUrl,
          isExact: rule.isExact
        }));
    }
  } catch (error) {
    console.error('Error loading redirect rules:', error);
  }
  
  // Default rules if none are in localStorage
  return [
    {
      sourcePath: '/1',
      targetUrl: 'https://stepperslifeapr30.vercel.app',
      isExact: true
    }
  ];
};

/**
 * Hook to handle redirects based on current path
 */
export const useRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    const rules = getRedirectRules();
    
    // Check if the current path matches any redirect rule
    for (const rule of rules) {
      if (
        (rule.isExact && currentPath === rule.sourcePath) || 
        (!rule.isExact && currentPath.startsWith(rule.sourcePath))
      ) {
        // For external redirects, use window.location
        if (rule.targetUrl.startsWith('http')) {
          window.location.href = rule.targetUrl;
          return;
        }
        
        // For internal redirects, use navigate
        navigate(rule.targetUrl, { replace: true });
        return;
      }
    }
  }, [location.pathname, navigate]);
};

/**
 * Component that can be used at the app root to handle redirects
 */
export const RedirectHandler = () => {
  useRedirectHandler();
  return null;
};

/**
 * Function to check if a path should be redirected
 * @param path Path to check for redirect
 * @returns Target URL if redirect exists, null otherwise
 */
export const getRedirectTarget = (path: string): string | null => {
  const rules = getRedirectRules();
  for (const rule of rules) {
    if (
      (rule.isExact && path === rule.sourcePath) || 
      (!rule.isExact && path.startsWith(rule.sourcePath))
    ) {
      return rule.targetUrl;
    }
  }
  return null;
};

/**
 * Server-side redirect handler (for SSR/middleware)
 * @param req Request object
 * @param res Response object
 * @returns Boolean indicating if redirect was handled
 */
export const handleServerRedirect = (req: any, res: any): boolean => {
  const path = req.path || req.url || '';
  const target = getRedirectTarget(path);
  
  if (target) {
    res.redirect(301, target);
    return true;
  }
  
  return false;
}; 