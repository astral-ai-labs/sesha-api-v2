/* ==========================================================================*/
// types.ts — AI model pricing type definitions
/* ==========================================================================*/
// Purpose: Define types for AI model pricing mappings, and token usage
// Sections: Types & Interfaces, Public API
/* ==========================================================================*/

import { ModelAlias } from "@/domains/drafting/common/types/primitives";

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

interface LLMTokenUsage {
  /** Number of input tokens consumed */
  inputTokens: number;
  /** Number of output tokens generated */
  outputTokens: number;
  /** Total tokens consumed */
  totalTokens: number;

}


interface LLMTokenUsageWithCostAndMetadata extends LLMTokenUsage {
  /** Model identifier used for the request */
  modelAlias: ModelAlias;
  /** Model ID used for the request */
  modelId: string;
  /** Provider identifier used for the request */
  providerId: string;
  /** Total cost in USD for the call */
  costUsd?: number;
}
/**
 * Pricing structure for an AI model with input/output token costs.
 */


/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { LLMTokenUsage, LLMTokenUsageWithCostAndMetadata };
