/* ==========================================================================*/
// types.ts — Step 07: Source Attribution Types
/* ==========================================================================*/
// Purpose: Type definitions for adding multi-source attribution to aggregated article
// Sections: Imports, Context Types, Output Types, Request/Response Types
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for source attribution step - includes the revised aggregated article.
 */
interface SourceAttributionContext {
  /** Revised article from step 06 with multi-source content */
  revisedArticle: string;
}

/**
 * Output from adding proper multi-source attribution.
 */
interface SourceAttributionOutput {
  /** Article with in-sentence attribution for each source used */
  attributedArticle: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type SourceAttributionRequest = StepRequest<SourceAttributionContext>;
export type SourceAttributionResponse = StepResponse<SourceAttributionOutput>;