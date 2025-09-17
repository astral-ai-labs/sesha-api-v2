/* ==========================================================================*/
// middleware.ts — Supabase middleware for session management
/* ==========================================================================*/
// Purpose: Handle authentication state and session refresh in middleware
// Sections: Imports, Session Handler, Exports

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// React & Next.js Core ---
import { NextResponse, type NextRequest } from "next/server";

// External Packages ---
import { createServerClient } from "@supabase/ssr";

/* ==========================================================================*/
// Session Handler
/* ==========================================================================*/

/**
 * Update user session and handle authentication redirects
 * 
 * Refreshes Supabase auth tokens and redirects unauthenticated users.
 * Must be called from Next.js middleware.
 */
export async function updateSession(request: NextRequest) {
  // 1️⃣ Initialize response -----
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 2️⃣ Create Supabase client for middleware -----
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => 
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3️⃣ Get current user -----
  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
  // A simple mistake could make it very hard to debug issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4️⃣ Handle unauthenticated users -----
  const isPublicPath = request.nextUrl.pathname.startsWith("/welcome") || 
                      request.nextUrl.pathname.startsWith("/auth") || 
                      request.nextUrl.pathname.startsWith("/error");

  if (!user && !isPublicPath) {
    // Redirect unauthenticated users to welcome page
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
