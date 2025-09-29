/* ==========================================================================*/
// types.ts — Step 03: Generate Headlines Types
/* ==========================================================================*/
// Purpose: Type definitions for generating headlines and content blobs from source(s)
/* ==========================================================================*/

// Internal Modules ----
import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";
import type { SourceFactsResult, SourceFactsConditionalResult } from "../02-extract-facts-conditional/types";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for generate headlines step - includes results from previous steps.
 */
interface GenerateHeadlinesContext {
  /** User specified headline */
  userSpecifiedHeadline?: string;
  /** Facts extracted from each source from step 01 */
  extractedFactsResults: SourceFactsResult[];
  /** Conditionally processed facts from each source from step 02 */
  extractedFactsConditionalResults: SourceFactsConditionalResult[];
}

/**
 * Output from generating headlines and content blobs.
 */
interface GenerateHeadlinesOutput {
  /** Generated headline for the aggregated article */
  finalizedHeadline: string;
  /** Generated content blobs for article sections */
  finalizedBlobs: string[];
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type GenerateHeadlinesRequest = StepRequest<GenerateHeadlinesContext>;
export type GenerateHeadlinesResponse = StepResponse<GenerateHeadlinesOutput>;