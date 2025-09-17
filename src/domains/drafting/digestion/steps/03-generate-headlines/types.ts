/* ==========================================================================*/
// types.ts — Step 03: Generate Headlines Types
/* ==========================================================================*/
// Purpose: Type definitions for generating headlines and content blobs
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for generate headlines step - includes results from previous steps.
 */
interface GenerateHeadlinesContext {
  /** Extracted fact quotes from step 01 */
  extractedFacts: string;
  /** Condensed summary from step 02 */
  extractedFactsSummary: string;
}

/**
 * Output from generating headlines and content blobs.
 */
interface GenerateHeadlinesOutput {
  /** Generated headline for the article */
  generatedHeadline: string;
  generatedBlobs: string[];
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type GenerateHeadlinesRequest = StepRequest<GenerateHeadlinesContext>;
export type GenerateHeadlinesResponse = StepResponse<GenerateHeadlinesOutput>;
