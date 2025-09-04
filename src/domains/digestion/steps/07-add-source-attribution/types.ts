/* ==========================================================================*/
// types.ts — Step 07: Add Source Attribution Types
/* ==========================================================================*/
// Purpose: Type definitions for adding source attribution to the final article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for add source attribution step - includes the revised article.
 */
interface AddSourceAttributionContext {
  /** Polished article from step 06 */
  revisedArticle: string;
}

/**
 * Output from adding source attribution.
 */
interface AddSourceAttributionOutput {
  /** Final article with proper source attribution */
  attributedArticle: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type AddSourceAttributionRequest = StepRequest<AddSourceAttributionContext>;
export type AddSourceAttributionResponse = StepResponse<AddSourceAttributionOutput>;
