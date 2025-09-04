/* ==========================================================================*/
// types.ts — Step 02: Extract Facts Conditional Types
/* ==========================================================================*/
// Purpose: Type definitions for conditional facts extraction processing
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";
import type { SourceFactsResult, SourceFactsConditionalResult } from "../../types";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for extract facts conditional step - includes results from step 01.
 */
interface ExtractFactsConditionalContext {
  /** Facts extracted from each source from step 01 */
  extractedFactsResults: SourceFactsResult[];
}

/**
 * Output from conditional facts processing via Promise.all.
 */
interface ExtractFactsConditionalOutput {
  /** Array of conditionally processed facts from each source */
  extractedFactsConditionalResults: SourceFactsConditionalResult[];
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type ExtractFactsConditionalRequest = StepRequest<ExtractFactsConditionalContext>;
export type ExtractFactsConditionalResponse = StepResponse<ExtractFactsConditionalOutput>;
