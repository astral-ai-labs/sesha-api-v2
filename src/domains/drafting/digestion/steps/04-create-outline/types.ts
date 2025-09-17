/* ==========================================================================*/
// types.ts — Step 04: Create Outline Types
/* ==========================================================================*/
// Purpose: Type definitions for creating article outline
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for create outline step - includes results from all previous steps.
 */
interface CreateOutlineContext {
  /** Extracted fact quotes from step 01 */
  extractedFacts: string;
  /** Condensed summary from step 02 */
  extractedFactsSummary: string;
  /** Generated headlines from step 03 */
  generatedHeadline: string;
  /** Generated content blobs from step 03 */
  generatedBlobs: string[];
}

/**
 * Output from creating the article outline.
 */
interface CreateOutlineOutput {
  /** Structured outline for the article */
  createdOutline: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type CreateOutlineRequest = StepRequest<CreateOutlineContext>;
export type CreateOutlineResponse = StepResponse<CreateOutlineOutput>;
