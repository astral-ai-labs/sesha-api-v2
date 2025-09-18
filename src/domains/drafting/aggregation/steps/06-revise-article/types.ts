/* ==========================================================================*/
// types.ts — Step 06: Revise Article Types
/* ==========================================================================*/
// Purpose: Type definitions for revising the aggregated article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for revise article step - includes draft and source context for aggregation.
 */
interface ReviseArticleContext {
  /** Initial draft from step 05 */
  draftedArticle: string;
}

/**
 * Output from revising the aggregated article.
 */
interface ReviseArticleOutput {
  /** Revised version of the aggregated article */
  revisedArticle: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type ReviseArticleRequest = StepRequest<ReviseArticleContext>;
export type ReviseArticleResponse = StepResponse<ReviseArticleOutput>;
