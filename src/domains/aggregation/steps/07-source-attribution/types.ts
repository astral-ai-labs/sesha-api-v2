/* ==========================================================================*/
// types.ts — Step 07: Source Attribution Types
/* ==========================================================================*/
// Purpose: Type definitions for adding source attribution to the aggregated article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for source attribution step - includes the revised article.
 */
interface SourceAttributionContext {
  /** Revised article from step 06 */
  revisedArticle: string;
}

/**
 * Output from adding source attribution.
 */
interface SourceAttributionOutput {
  /** Article with proper multi-source attribution */
  attributedArticle: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type SourceAttributionRequest = StepRequest<SourceAttributionContext>;
export type SourceAttributionResponse = StepResponse<SourceAttributionOutput>;
