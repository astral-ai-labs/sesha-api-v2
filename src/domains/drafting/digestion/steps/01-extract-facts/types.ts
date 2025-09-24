/* ==========================================================================*/
// types.ts — Step 01: Extract Facts Types
/* ==========================================================================*/
// Purpose: Type definitions for extracting fact quotes from source content
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for extract facts step - no previous step results needed.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ExtractFactsContext {}

/**
 * Output from extracting fact quotes from source content.
 */
interface ExtractFactsOutput {
  /** Extracted fact quotes from the source material */
  extractedFacts: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type ExtractFactsRequest = StepRequest<ExtractFactsContext>;
export type ExtractFactsResponse = StepResponse<ExtractFactsOutput>;
