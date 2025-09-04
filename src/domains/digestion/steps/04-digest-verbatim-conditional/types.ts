/* ==========================================================================*/
// types.ts — Step 04: Digest Verbatim Conditional Types
/* ==========================================================================*/
// Purpose: Type definitions for conditional verbatim content processing
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for digest verbatim conditional step - no previous step results needed.
 * This step operates directly on source content when copySourceVerbatim flag is true.
 */
interface DigestVerbatimConditionalContext {}

/**
 * Output from processing source content verbatim.
 */
interface DigestVerbatimConditionalOutput {
  /** Source content formatted for verbatim output */
  digestedVerbatim: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type DigestVerbatimConditionalRequest = StepRequest<DigestVerbatimConditionalContext>;
export type DigestVerbatimConditionalResponse = StepResponse<DigestVerbatimConditionalOutput>;
