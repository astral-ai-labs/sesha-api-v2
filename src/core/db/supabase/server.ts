/* ==========================================================================*/
// server.ts — Supabase server client
/* ==========================================================================*/
// Purpose: Create Supabase client for server-side operations
// Sections: Imports, Client Factory, Exports

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// React & Next.js Core ---
import { cookies } from "next/headers";

// External Packages ---
import { createServerClient } from "@supabase/ssr";

/* ==========================================================================*/
// Client Factory
/* ==========================================================================*/

/**
 * Create Supabase server client
 *
 * Used for server-side operations in Server Components and API routes.
 * Handles cookie management for authentication state.
 */
export async function createClient() {
  // 1️⃣ Get cookie store -----
  const cookieStore = await cookies();

  // 2️⃣ Create server client with cookie handlers -----
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

/**
 * Get authenticated user from Supabase server-side.
 */
export async function getAuthUserServer() {
  // 1️⃣ Create server client -----
  const supabase = await createClient();

  // 2️⃣ Get authenticated user -----
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  // 3️⃣ Return user and error -----
  return { user: authUser, error: authError };
}
