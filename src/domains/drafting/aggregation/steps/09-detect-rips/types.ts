/* ==========================================================================*/
// types.ts — Step 09: Detect Rips Types
/* ==========================================================================*/
// Purpose: Type definitions for detecting rips in final article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";
import type { RipQuoteComparison } from "@/domains/drafting/common/types/primitives";



/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for apply color coding step - includes the attributed article.
 */
interface DetectRipsContext {
  /** Article with source attribution from step 07 */
  colorCodedArticle: string;
}

/**
 * Output from applying color coding and rich formatting.
 */
interface DetectRipsOutput {
  /** Analysis of the rip analysis */
  overallRipAnalysis: string;
  /** Score of the rip analysis */
  overallRipScore: number;
  /** Comparisons of quotes from the article and sources */
  ripComparisons: RipQuoteComparison[];
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type DetectRipsRequest = StepRequest<DetectRipsContext>;
export type DetectRipsResponse = StepResponse<DetectRipsOutput>;
