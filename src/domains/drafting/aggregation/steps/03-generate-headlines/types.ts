/* ==========================================================================*/
// types.ts — Step 03: Generate Headlines Types
/* ==========================================================================*/
// Purpose: Type definitions for generating headlines and content blobs from multiple sources
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
  generatedHeadline: string;
  /** Generated content blobs for article sections */
  generatedBlobs: string[];
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type GenerateHeadlinesRequest = StepRequest<GenerateHeadlinesContext>;
export type GenerateHeadlinesResponse = StepResponse<GenerateHeadlinesOutput>;