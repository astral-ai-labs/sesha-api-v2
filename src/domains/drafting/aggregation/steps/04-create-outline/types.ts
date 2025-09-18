/* ==========================================================================*/
// types.ts — Step 04: Create Outline Types
/* ==========================================================================*/
// Purpose: Type definitions for creating article outline from multiple sources
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for create outline step - includes results from all previous steps.
 */
interface CreateOutlineContext {
  /** Facts extracted from each source from step 01 */
  extractedFactsResults: Array<{
    sourceNumber: number;
    extractedFacts: string;
  }>;
  /** Conditionally processed facts from each source from step 02 */
  extractedFactsConditionalResults: Array<{
    sourceNumber: number;
    factsBitSplitting2: string;
  }>;
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
