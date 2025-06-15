import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import middleware from './middleware/supabaseMiddleware';

export function config() {
  return {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       * - public folder
       */
      '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
      
      // Also include API routes that need authentication
      '/api/:path*',
    ],
  }
}

export default middleware; 