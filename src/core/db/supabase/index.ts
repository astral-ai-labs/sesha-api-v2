/* ==========================================================================*/
// index.ts — Supabase public API
/* ==========================================================================*/
// Purpose: Export Supabase client factories and authentication utilities
// Sections: Client Exports, Auth Exports
/* ==========================================================================*/

/* ==========================================================================*/
// Client Exports
/* ==========================================================================*/
export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";

/* ==========================================================================*/
// Auth Exports
/* ==========================================================================*/
export { getAuthUserClient } from "./client";
export { getAuthUserServer } from "./server"; 