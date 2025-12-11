/* ==========================================================================*/
// types.ts — Next Steps data type definitions
/* ==========================================================================*/
// Purpose: Type definitions for next steps functionality
// Sections: Imports, Interfaces & Schemas, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

import { z } from "zod";

/* ==========================================================================*/
// Interfaces & Schemas
/* ==========================================================================*/

interface NextStepsApiRequest {
  orgId: number;
  slug: string;
  version: string;
}

interface NextStepsResponse {
  mustDo: string[];                   // HTML formatted
  important: string[];                // HTML formatted
  optional: string[];                 // HTML formatted
  otherRelevantInformation: string;   // HTML formatted
  linksToSources: string[];           // HTML anchor (<a>) tags
}

const NextStepsSchema = z.object({
  mustDo: z.array(z.string()),
  important: z.array(z.string()),
  optional: z.array(z.string()),
  otherRelevantInformation: z.string(),
  linksToSources: z.array(z.string())
});

//* ==========================================================================*/
// Public API
/* ==========================================================================*/

export type { NextStepsApiRequest, NextStepsResponse }
export { NextStepsSchema }