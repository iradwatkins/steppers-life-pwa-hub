import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations
const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Create Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/events/create',
  '/events/manage',
  '/tickets',
  '/checkout',
  '/admin',
];

// Define admin-only routes
const adminOnlyRoutes = [
  '/admin',
  '/admin/users',
  '/admin/events',
  '/admin/analytics',
];

// Define organizer-only routes
const organizerOnlyRoutes = [
  '/events/create',
  '/events/manage',
];

/**
 * Authentication and authorization middleware
 */
export async function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for API routes and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  
  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Get the auth cookie
  const supabaseCookie = req.cookies.get('sb-auth-token')?.value;
  
  if (!supabaseCookie) {
    // Redirect to login page if no auth cookie
    const url = new URL('/auth/login', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verify the token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(supabaseCookie);
    
    if (error || !user) {
      // Invalid token, redirect to login
      const url = new URL('/auth/login', req.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // Check role-based access for admin routes
    if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
      // Get user role from user_roles table
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleError || !roleData || roleData.role !== 'admin') {
        // User doesn't have admin role, redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
    
    // Check role-based access for organizer routes
    if (organizerOnlyRoutes.some(route => pathname.startsWith(route))) {
      // Get user role from user_roles table
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleError || !roleData || (roleData.role !== 'organizer' && roleData.role !== 'admin')) {
        // User doesn't have organizer role, redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
    
    // User is authenticated and authorized
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Redirect to login on error
    const url = new URL('/auth/login', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
}

/**
 * Token forwarding middleware to include auth token in requests to backend
 */
export async function apiMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Only apply middleware to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Get the auth cookie
  const supabaseCookie = req.cookies.get('sb-auth-token')?.value;
  
  if (!supabaseCookie) {
    // No token, continue without adding headers
    return NextResponse.next();
  }
  
  // Create a new request with the auth token added to headers
  const headers = new Headers(req.headers);
  headers.set('Authorization', `Bearer ${supabaseCookie}`);
  
  // Clone the request with the new headers
  const newRequest = new Request(req.url, {
    method: req.method,
    headers,
    body: req.body,
    cache: req.cache,
    credentials: req.credentials,
    integrity: req.integrity,
    keepalive: req.keepalive,
    mode: req.mode,
    redirect: req.redirect,
    referrer: req.referrer,
    referrerPolicy: req.referrerPolicy,
    signal: req.signal,
  });
  
  return NextResponse.next({
    request: newRequest,
  });
}

/**
 * Combined middleware function
 */
export default async function middleware(req: NextRequest) {
  // First check authentication and authorization
  const authResponse = await authMiddleware(req);
  
  // If the auth middleware redirected, return that response
  if (authResponse.status !== 200) {
    return authResponse;
  }
  
  // Then apply API token forwarding
  return apiMiddleware(req);
} 