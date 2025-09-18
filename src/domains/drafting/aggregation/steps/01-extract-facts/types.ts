/* ==========================================================================*/
// types.ts — Step 01: Extract Facts Types
/* ==========================================================================*/
// Purpose: Type definitions for extracting facts from single source content
// Sections: Imports, Context & Output Types, Step Request & Response Types
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for extract facts step - no previous step results needed.
 */
interface ExtractFactsContext {}

/**
 * Output from extracting facts from source content.
 */
interface ExtractFactsOutput {
  /** Extracted and rewritten facts from the source material */
  extractedFacts: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type ExtractFactsRequest = StepRequest<ExtractFactsContext>;
export type ExtractFactsResponse = StepResponse<ExtractFactsOutput>;
