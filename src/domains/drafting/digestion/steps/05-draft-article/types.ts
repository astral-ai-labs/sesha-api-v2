/* ==========================================================================*/
// types.ts — Step 05: Draft Article Types
/* ==========================================================================*/
// Purpose: Type definitions for drafting the initial article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for draft article step - includes all preparation from previous steps.
 */
interface DraftArticleContext {
  /** Extracted fact quotes from step 01 */
  extractedFacts: string;
  /** Condensed summary from step 02 */
  extractedFactsSummary: string;
  /** Generated headline from step 03 */
  generatedHeadline: string;
  /** Generated content blobs from step 03 */
  generatedBlobs: string[];
  /** Structured outline from step 04 */
  createdOutline: string;
}

/**
 * Output from drafting the initial article.
 */
interface DraftArticleOutput {
  /** Initial draft of the article */
  draftedArticle: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type DraftArticleRequest = StepRequest<DraftArticleContext>;
export type DraftArticleResponse = StepResponse<DraftArticleOutput>;
