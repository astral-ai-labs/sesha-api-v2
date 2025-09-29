/* ==========================================================================*/
// types.ts — Step 05: Draft Article Types
/* ==========================================================================*/
// Purpose: Type definitions for drafting the aggregated article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for draft article step - includes all preparation from previous steps.
 */
interface DraftArticleContext {
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
  /** Finalized headlines from step 03 */
  finalizedHeadline: string;
  /** Finalized content blobs from step 03 */
  finalizedBlobs: string[];
  /** Structured outline from step 04 */
  createdOutline: string;
}

/**
 * Output from drafting the aggregated article.
 */
interface DraftArticleOutput {
  /** Initial draft of the aggregated article */
  draftedArticle: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type DraftArticleRequest = StepRequest<DraftArticleContext>;
export type DraftArticleResponse = StepResponse<DraftArticleOutput>;
