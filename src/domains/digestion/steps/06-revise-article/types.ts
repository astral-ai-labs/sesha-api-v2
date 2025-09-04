/* ==========================================================================*/
// types.ts — Step 06: Revise Article Types
/* ==========================================================================*/
// Purpose: Type definitions for revising and polishing the article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for revise article step - includes draft plus all supporting materials.
 */
interface ReviseArticleContext {
  /** Extracted fact quotes from step 01 */
  extractedFacts: string;
  /** Condensed summary from step 02 */
  extractedFactsSummary: string;
  /** Generated headlines from step 03 */
  generatedHeadlines: string;
  /** Structured outline from step 04 */
  createdOutline: string;
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
