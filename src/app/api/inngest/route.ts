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
import digestionPipeline from "@/domains/drafting/digestion/pipeline";
import aggregationPipeline from "@/domains/drafting/aggregation/pipeline";
import { helloWorld } from "@/domains/inngest_health/function";

/* ==========================================================================*/
// Configuration
/* ==========================================================================*/

/**
 * Inngest API configuration for serving drafting pipeline functions.
 */
const inngestApi = serve({
  client: inngest,
  functions: [
    digestionPipeline,
    aggregationPipeline,
    helloWorld,
  ],
});

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export const { GET, POST, PUT } = inngestApi;
