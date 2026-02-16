/* ==========================================================================*/
// modelMappings.ts — Model selection to actual model name mappings
/* ==========================================================================*/
// Purpose: Centralized mapping between user selections and actual model names
/* ==========================================================================*/

// Internal Modules -----
import type { ModelAlias, ModelAndProvider, ModelAndProviderAndPricing } from "../types/primitives";

// Providers ---
import { anthropic } from "@ai-sdk/anthropic";
import { xai } from '@ai-sdk/xai';


/* ==========================================================================*/
// Model Mappings
/* ==========================================================================*/

/**
 * Maps user-selected model enum values to actual Claude model names
 */
export const MODEL_ALIAS_MAPPING: Record<ModelAlias, ModelAndProviderAndPricing> = {

  // XAI models
  "grok-4.1-fast": { modelAlias: "grok-4.1-fast", modelId: "grok-4-1-fast-non-reasoning", provider: xai, providerId: "xai", inputCostPerMToken: 0.20, outputCostPerMToken: 0.50 },
  "grok-4-fast": { modelAlias: "grok-4-fast", modelId: "grok-4-fast-non-reasoning", provider: xai, providerId: "xai", inputCostPerMToken: 0.20, outputCostPerMToken: 0.50 },
  "grok-4": { modelAlias: "grok-4", modelId: "grok-4", provider: xai, providerId: "xai", inputCostPerMToken: 3, outputCostPerMToken: 15 },

  // Haiku models
  "haiku-4.5": { modelAlias: "haiku-4.5", modelId: "claude-haiku-4-5-20251001", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 1, outputCostPerMToken: 5 },

  // Opus models
  "opus-4": { modelAlias: "opus-4", modelId: "claude-opus-4-20250514", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 15, outputCostPerMToken: 75 },
  "opus-4.1": { modelAlias: "opus-4.1", modelId: "claude-opus-4-1-20250805", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 15, outputCostPerMToken: 75 },
  "opus-4.5": { modelAlias: "opus-4.5", modelId: "claude-opus-4-5-20251101", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 5, outputCostPerMToken: 25 },
  "opus-4.6": { modelAlias: "opus-4.6", modelId: "claude-opus-4-6", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 5, outputCostPerMToken: 25 },

  // Sonnet models
  "sonnet-3.7": { modelAlias: "sonnet-3.7", modelId: "claude-3-7-sonnet-20250219", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 3, outputCostPerMToken: 15 },
  "sonnet-4": { modelAlias: "sonnet-4", modelId: "claude-sonnet-4-20250514", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 3, outputCostPerMToken: 15 },
  "sonnet-4.5": { modelAlias: "sonnet-4.5", modelId: "claude-sonnet-4-5-20250929", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 3, outputCostPerMToken: 15 },
  "sonnet-4.5-sonnet-4.0": { modelAlias: "sonnet-4.5-sonnet-4.0", modelId: "claude-sonnet-4-20250514", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 3, outputCostPerMToken: 15 },
  "sonnet-4.5-sonnet-4.0-headlines": { modelAlias: "sonnet-4.5-sonnet-4.0-headlines", modelId: "claude-sonnet-4-20250514", provider: anthropic, providerId: "anthropic", inputCostPerMToken: 3, outputCostPerMToken: 15 },
} as const;

/**
 * Maps user-selected model enum values to structured model names
 * For now, we'll use the same mapping, but you could have different structured models
 */
export const STRUCTURED_MODEL_MAPPING: Record<ModelAlias, string> = {
  "grok-4.1-fast": "gpt-4o",
  "grok-4-fast": "gpt-4o",
  "grok-4": "gpt-4o",
  "haiku-4.5": "gpt-4o",
  "opus-4": "gpt-4o",
  "opus-4.1": "gpt-4o",
  "opus-4.5": "gpt-4o",
  "opus-4.6": "gpt-4o",
  "sonnet-3.7": "gpt-4o",
  "sonnet-4": "gpt-4o",
  "sonnet-4.5": "gpt-4o",
  "sonnet-4.5-sonnet-4.0": "gpt-4o",
  "sonnet-4.5-sonnet-4.0-headlines": "gpt-4o",
} as const;

/* ==========================================================================*/
// Helper Functions
/* ==========================================================================*/

/**
 * Get the actual Claude model name from user selection
 */
export function getModelAndProvider(modelAlias: ModelAlias, defaultModel: ModelAlias): ModelAndProvider {
  const modelAndProviderAndPricing = (MODEL_ALIAS_MAPPING[modelAlias]) || (MODEL_ALIAS_MAPPING[defaultModel]);
  return {
    modelAlias: modelAndProviderAndPricing.modelAlias,
    modelId: modelAndProviderAndPricing.modelId,
    provider: modelAndProviderAndPricing.provider,
    providerId: modelAndProviderAndPricing.providerId,
  };
}

/**
 * Get the model and provider and pricing from user selection
 */
export function getModelAndProviderAndPricing(modelAlias: ModelAlias): ModelAndProviderAndPricing {
  return MODEL_ALIAS_MAPPING[modelAlias];
}

/**
 * Get the structured model name from user selection
 */
export function getStructuredModel(modelAlias: ModelAlias): string {
  return STRUCTURED_MODEL_MAPPING[modelAlias];
}
