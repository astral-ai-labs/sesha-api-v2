/* ==========================================================================*/
// client.ts — Supabase browser client
/* ==========================================================================*/
// Purpose: Create Supabase client for browser-side operations
// Sections: Imports, Client Factory, User Operations, Exports
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { createBrowserClient } from '@supabase/ssr';

/* ==========================================================================*/
// Client Factory
/* ==========================================================================*/

/**
 * Create Supabase browser client
 * 
 * Used for client-side operations in React components.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/* ==========================================================================*/
// User Operations
/* ==========================================================================*/

/**
 * Get authenticated user from Supabase client-side.
 */
export async function getAuthUserClient() {
  // 1️⃣ Create browser client -----
  const supabase = createClient();

  // 2️⃣ Get authenticated user -----
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  // 3️⃣ Return user and error -----
  return { user: authUser, error: authError };
}