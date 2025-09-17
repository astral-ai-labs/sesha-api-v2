/* ==========================================================================*/
// route.ts — Drafting service health check endpoint
/* ==========================================================================*/
// Purpose: Provide health status for the drafting service
// Sections: Types, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

interface DraftingHealthResponse {
  status: "ok" | "error";
  service: "drafting";
  timestamp: string;
}

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Health check endpoint for the drafting service.
 */
async function getDraftingHealthStatus(): Promise<Response> {
  const healthData: DraftingHealthResponse = {
    status: "ok",
    service: "drafting",
    timestamp: new Date().toISOString(),
  };

  return Response.json(healthData);
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { getDraftingHealthStatus as GET };
