/* ==========================================================================*/
// types.ts — Step 06: Revise Article Types
/* ==========================================================================*/
// Purpose: Type definitions for revising and polishing the article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for revise article step - only needs the drafted article.
 */
interface ReviseArticleContext {
  /** Initial draft from step 05 */
  draftedArticle: string;
}

/**
 * Output from revising the article.
 */
interface ReviseArticleOutput {
  /** Polished and revised article */
  revisedArticle: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type ReviseArticleRequest = StepRequest<ReviseArticleContext>;
export type ReviseArticleResponse = StepResponse<ReviseArticleOutput>;
