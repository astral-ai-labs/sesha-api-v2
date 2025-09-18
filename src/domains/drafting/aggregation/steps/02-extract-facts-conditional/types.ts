/* ==========================================================================*/
// types.ts — Step 02: Extract Facts Conditional Types
/* ==========================================================================*/
// Purpose: Type definitions for conditional facts extraction processing
/* ==========================================================================*/

// Internal Modules ----
import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";
import type { LLMTokenUsage } from "@/core/usage/types";

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

/**
 * Result from step 01 extract facts for a single source.
 */
interface SourceFactsResult {
  sourceNumber: number;
  extractedFacts: string;
  usage: LLMTokenUsage[];
}

/**
 * Result from step 02 conditional processing for a single source.
 */
interface SourceFactsConditionalResult {
  sourceNumber: number;
  factsBitSplitting2: string;
  usage: LLMTokenUsage[];
}

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
 * Output from conditional facts processing for a single source.
 */
interface ExtractFactsConditionalOutput {
  /** Conditionally processed facts for this source */
  factsBitSplitting2: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type ExtractFactsConditionalRequest = StepRequest<ExtractFactsConditionalContext>;
export type ExtractFactsConditionalResponse = StepResponse<ExtractFactsConditionalOutput>;
export type { SourceFactsResult, SourceFactsConditionalResult };
