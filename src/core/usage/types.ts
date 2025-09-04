/* ==========================================================================*/
// types.ts — AI model pricing type definitions
/* ==========================================================================*/
// Purpose: Define types for AI model pricing calculations and mappings
// Sections: Types & Interfaces, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

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
export type { ModelPricing, ModelPricingMap };