/* ==========================================================================*/
// types.ts — Step 02: Summarize Facts Types
/* ==========================================================================*/
// Purpose: Type definitions for summarizing extracted facts
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for summarize facts step - includes results from extract facts.
 */
interface SummarizeFactsContext {
  /** Extracted fact quotes from step 01 */
  extractedFacts: string;
}

/**
 * Output from summarizing the extracted facts.
 */
interface SummarizeFactsOutput {
  /** Condensed summary of the extracted facts */
  extractedFactsSummary: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type SummarizeFactsRequest = StepRequest<SummarizeFactsContext>;
export type SummarizeFactsResponse = StepResponse<SummarizeFactsOutput>;
