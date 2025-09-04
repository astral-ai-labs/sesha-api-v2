/* ==========================================================================*/
// types.ts — Step 05: Draft Article Types
/* ==========================================================================*/
// Purpose: Type definitions for drafting the aggregated article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";
import type { SourceFactsResult, SourceFactsConditionalResult } from "../../types";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for draft article step - includes all preparation from previous steps.
 */
interface DraftArticleContext {
  /** Facts extracted from each source from step 01 */
  extractedFactsResults: SourceFactsResult[];
  /** Conditionally processed facts from each source from step 02 */
  extractedFactsConditionalResults: SourceFactsConditionalResult[];
  /** Generated headlines from step 03 */
  generatedHeadlines: string;
  /** Generated content blobs from step 03 */
  generatedBlobs: string[];
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
