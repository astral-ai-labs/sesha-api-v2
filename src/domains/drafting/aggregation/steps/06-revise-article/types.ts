/* ==========================================================================*/
// types.ts — Step 06: Revise Article Types
/* ==========================================================================*/
// Purpose: Type definitions for revising the aggregated article
/* ==========================================================================*/

import type { StepRequest, StepResponse } from "@/core/types/step";
import type { SourceFactsResult, SourceFactsConditionalResult } from "../../types";

/* ==========================================================================*/
// Context & Output Types
/* ==========================================================================*/

/**
 * Context for revise article step - includes draft plus all supporting materials.
 */
interface ReviseArticleContext {
  /** Facts extracted from each source from step 01 */
  extractedFactsResults: SourceFactsResult[];
  /** Conditionally processed facts from each source from step 02 */
  extractedFactsConditionalResults: SourceFactsConditionalResult[];
  /** Generated headlines from step 03 */
  generatedHeadlines: string;
  /** Generated content blobs from step 03 */
  generatedBlobs: string[];
  /** Structured outline from step 04 */
  createdOutline: string;
  /** Initial draft from step 05 */
  draftedArticle: string;
}

/**
 * Output from revising the aggregated article.
 */
interface ReviseArticleOutput {
  /** Revised version of the aggregated article */
  revisedArticle: string;
}

/* ==========================================================================*/
// Step Request & Response Types
/* ==========================================================================*/

export type ReviseArticleRequest = StepRequest<ReviseArticleContext>;
export type ReviseArticleResponse = StepResponse<ReviseArticleOutput>;
