/* ==========================================================================*/
// types.ts — Step 01: Extract Facts Types
/* ==========================================================================*/
// Purpose: Type definitions for extracting facts from multiple sources in parallel
/* ==========================================================================*/

// External Modules ----
import type { StepRequest, StepResponse } from "@/domains/drafting/common/types/runner";

// Internal Modules ----
import type { SourceFactsResult } from "../../../common/types";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for extract facts step - no previous step results needed.
 */
interface ExtractFactsContext {}

/**
 * Output from extracting facts from multiple sources via Promise.all.
 */
interface ExtractFactsOutput {
  /** Array of facts extracted from each source, maintaining source relationship */
  extractedFactsResults: SourceFactsResult[];
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type ExtractFactsRequest = StepRequest<ExtractFactsContext>;
export type ExtractFactsResponse = StepResponse<ExtractFactsOutput>;
