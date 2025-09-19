/* ==========================================================================*/
// types.ts — Step 04: Create Outline Types
/* ==========================================================================*/
// Purpose: Type definitions for creating article outline from source(s)
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";
import type { SourceFactsResult, SourceFactsConditionalResult } from "../02-extract-facts-conditional/types";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for create outline step - includes results from all previous steps.
 */
interface CreateOutlineContext {
  /** Facts extracted from each source from step 01 */
  extractedFactsResults: SourceFactsResult[];
  /** Conditionally processed facts from each source from step 02 */
  extractedFactsConditionalResults: SourceFactsConditionalResult[];
  /** Generated headline from step 03 */
  generatedHeadline: string;
  /** Generated content blobs from step 03 */
  generatedBlobs: string[];
}

/**
 * Output from creating the article outline.
 */
interface CreateOutlineOutput {
  /** Structured outline for the aggregated article */
  createdOutline: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type CreateOutlineRequest = StepRequest<CreateOutlineContext>;
export type CreateOutlineResponse = StepResponse<CreateOutlineOutput>;
