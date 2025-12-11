/* ==========================================================================*/
// index.ts — Next Steps domain public API
/* ==========================================================================*/
// Purpose: Export public interface for next steps functionality
/* ==========================================================================*/

// Types
export type { NextStepsApiRequest, NextStepsResponse } from "./types";
export { NextStepsSchema } from "./types";

// Operations
export { getArticleContentBySlugAndVersion } from "./operations";

// Service
export { generateNextSteps, type GenerateNextStepsResult } from "./service";
