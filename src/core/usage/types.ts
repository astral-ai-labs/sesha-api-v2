/* ==========================================================================*/
// types.ts — AI model pricing type definitions
/* ==========================================================================*/
// Purpose: Define types for AI model pricing mappings, and token usage
// Sections: Types & Interfaces, Public API
/* ==========================================================================*/

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
  /** Model identifier used for the request */
  model?: string;
  /** Total cost in USD for the call */
  costUsd?: number;
}

/**
 * Pricing structure for an AI model with input/output token costs.
 */
type ModelPricing = {
  inputCostPerMToken: number;
  outputCostPerMToken: number;
};

/**
 * Map of model names to their pricing information.
 */
type ModelPricingMap = Record<string, ModelPricing>;

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { ModelPricing, ModelPricingMap, LLMTokenUsage };
