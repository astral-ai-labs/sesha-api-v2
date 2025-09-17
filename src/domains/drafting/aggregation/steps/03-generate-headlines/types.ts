/* ==========================================================================*/
// types.ts — Step 03: Generate Headlines Types
/* ==========================================================================*/
// Purpose: Type definitions for generating headlines and content blobs
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";
import type { SourceFactsResult, SourceFactsConditionalResult } from "../../types";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for generate headlines step - includes results from previous steps.
 */
interface GenerateHeadlinesContext {
  /** Facts extracted from each source from step 01 */
  extractedFactsResults: SourceFactsResult[];
  /** Conditionally processed facts from each source from step 02 */
  extractedFactsConditionalResults: SourceFactsConditionalResult[];
}

/**
 * Output from generating headlines and content blobs.
 */
interface GenerateHeadlinesOutput {
  /** Generated headlines for the aggregated article */
  generatedHeadlines: string;
  /** Generated content blobs for article sections */
  generatedBlobs: string[];
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type GenerateHeadlinesRequest = StepRequest<GenerateHeadlinesContext>;
export type GenerateHeadlinesResponse = StepResponse<GenerateHeadlinesOutput>;