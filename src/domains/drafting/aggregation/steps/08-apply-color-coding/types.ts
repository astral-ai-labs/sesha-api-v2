/* ==========================================================================*/
// types.ts — Step 08: Apply Color Coding Types
/* ==========================================================================*/
// Purpose: Type definitions for applying color coding and rich formatting
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for apply color coding step - includes the attributed article.
 */
interface ApplyColorCodingContext {
  /** Article with source attribution from step 07 */
  attributedArticle: string;
}

/**
 * Output from applying color coding and rich formatting.
 */
interface ApplyColorCodingOutput {
  /** Final article with color coding applied */
  colorCodedArticle: string;
  /** Rich content formatting data */
  richContent: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type ApplyColorCodingRequest = StepRequest<ApplyColorCodingContext>;
export type ApplyColorCodingResponse = StepResponse<ApplyColorCodingOutput>;
