/* ==========================================================================*/
// route.ts — Main application health check endpoint
/* ==========================================================================*/
// Purpose: Provide health status for the main API service
// Sections: Types, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
}

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Health check endpoint for the main API service.
 */
async function getHealthStatus(): Promise<Response> {
  const healthData: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  return Response.json(healthData);
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { getHealthStatus as GET };
