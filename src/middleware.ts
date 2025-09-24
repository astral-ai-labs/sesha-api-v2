/* ==========================================================================*/
// middleware.ts — Global middleware for API routes
/* ==========================================================================*/
// Purpose: Handle CORS and other cross-cutting concerns for all API endpoints
// Sections: Imports, Implementation, Configuration
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Next.js Core ---
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

export function middleware(request: NextRequest) {
  // 1️⃣ Handle preflight OPTIONS requests first -----
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // 2️⃣ Add CORS headers to actual requests -----
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

/* ==========================================================================*/
// Configuration
/* ==========================================================================*/

export const config = {
  matcher: '/api/:path*', // Apply to all API routes
};
