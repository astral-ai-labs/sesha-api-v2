/* ==========================================================================*/
// route.ts — Inngest API endpoint for function serving
/* ==========================================================================*/
// Purpose: Serve Inngest functions through Next.js API routes
// Sections: Imports, Configuration, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { serve } from "inngest/next";

// Internal Modules ----
import { inngest } from "@/core/inngest/client";

/* ==========================================================================*/
// Configuration
/* ==========================================================================*/

/**
 * Inngest API configuration for serving functions.
 * Currently serves zero functions - functions will be added later.
 */
const inngestApi = serve({
  client: inngest,
  functions: [
    /* TODO:your functions will be passed here later! */
  ],
});

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export const { GET, POST, PUT } = inngestApi;
