/* ==========================================================================*/
// modelPricing.ts — AI model pricing configuration and constants
/* ==========================================================================*/
// Purpose: Centralized pricing data for AI models (Anthropic, OpenAI)
// Sections: Imports, Constants, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import { ModelPricingMap } from "./types";

/* ==========================================================================*/
// Constants
/* ==========================================================================*/

/**
 * Maps AI model names to their input/output token prices (per 1M tokens, USD).
 * Update this map when Anthropic/OpenAI pricing or model names change.
 */
const MODEL_PRICING: ModelPricingMap = {
  // Claude 3.5 -----
  "claude-3-5-sonnet": { inputCostPerMToken: 3, outputCostPerMToken: 15 },

  // Claude 3.7 -----
  "claude-3-7-sonnet": { inputCostPerMToken: 3, outputCostPerMToken: 15 },

  // Claude 4 Sonnet -----
  "claude-4-sonnet": { inputCostPerMToken: 3, outputCostPerMToken: 15 },

  // Claude 4 Opus -----
  "claude-4-opus": { inputCostPerMToken: 15, outputCostPerMToken: 75 },

  // Claude 3 Opus -----
  "claude-3-opus": { inputCostPerMToken: 15, outputCostPerMToken: 75 },

  // Claude 3.5 Haiku -----
  "claude-3-5-haiku": { inputCostPerMToken: 0.8, outputCostPerMToken: 4 },

  // Claude 3 Haiku -----
  "claude-3-haiku": { inputCostPerMToken: 0.25, outputCostPerMToken: 1.25 },

  // OpenAI GPT-4o -----
  "gpt-4o": { inputCostPerMToken: 2.5, outputCostPerMToken: 10 },
  "gpt-4o-mini": { inputCostPerMToken: 0.15, outputCostPerMToken: 0.6 },
};

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { MODEL_PRICING };
