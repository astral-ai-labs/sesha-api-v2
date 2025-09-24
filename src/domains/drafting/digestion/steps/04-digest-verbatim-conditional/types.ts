/* ==========================================================================*/
// types.ts — Step 04: Digest Verbatim Conditional Types
/* ==========================================================================*/
// Purpose: Type definitions for conditional verbatim content processing
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for digest verbatim conditional step - no previous step results needed.
 * This step operates directly on source content when copySourceVerbatim flag is true.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
