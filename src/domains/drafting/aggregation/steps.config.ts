/* ==========================================================================*/
// steps.config.ts — Aggregation pipeline step configurations
/* ==========================================================================*/
// Purpose: Centralized configuration for all aggregation pipeline steps
/* ==========================================================================*/

// Internal Modules ----
import type { BaseStepConfig, FinalizedStepConfig } from "../common/types/runner";
import { getModelAndProvider, getStructuredModel } from "../common/utils/modelMappings";
import type { ModelAlias } from "../common/types/primitives";

/* ==========================================================================*/
// Types
/* ==========================================================================*/

export type stepName = "01-extract-facts" | "02-extract-facts-conditional" | "03-generate-headlines" | "04-create-outline" | "05-draft-article" | "06-revise-article" | "07-source-attribution" | "08-apply-color-coding" | "09-detect-rips";

/* ==========================================================================*/
// Step Configurations
/* ==========================================================================*/

export const STEP_CONFIGS: Record<stepName, BaseStepConfig> = {
  "01-extract-facts": {
    stepName: "01-extract-facts",
    temperature: 0.8,
    maxTokens: 4000,
    model: "sonnet-4.5",
    useStructuredModel: false,
  },

  "02-extract-facts-conditional": {
    stepName: "02-extract-facts-conditional",
    temperature: 0.8,
    maxTokens: 4000,
    model: "sonnet-4.5",
    useStructuredModel: false,
  },

  "03-generate-headlines": {
    stepName: "03-generate-headlines",
    temperature: 0.4,
    maxTokens: 500,
    model: "sonnet-4.5",
    useStructuredModel: true,
  },

  "04-create-outline": {
    stepName: "04-create-outline",
    temperature: 0.6,
    maxTokens: 3000,
    model: "sonnet-4",
    useStructuredModel: false,
  },

  "05-draft-article": {
    stepName: "05-draft-article",
    temperature: 0.7,
    maxTokens: 3000,
    model: "sonnet-4",
    useStructuredModel: false,
  },

  "06-revise-article": {
    stepName: "06-revise-article",
    temperature: 0.5,
    maxTokens: 3700,
    model: "sonnet-4",
    useStructuredModel: false,
  },

  "07-source-attribution": {
    stepName: "07-source-attribution",
    temperature: 0.2,
    maxTokens: 3700,
    model: "sonnet-4",
    useStructuredModel: false,
  },

  "08-apply-color-coding": {
    stepName: "08-apply-color-coding",
    temperature: 0.7,
    maxTokens: 3000,
    model: "sonnet-4",
    useStructuredModel: false,
  },
  "09-detect-rips": {
    stepName: "09-detect-rips",
    temperature: 0.7,
    maxTokens: 3000,
    model: "sonnet-4",
    useStructuredModel: false,
  },
} as const;

/* ==========================================================================*/
// Helper Functions
/* ==========================================================================*/

export function getAggregationStepConfig(stepName: stepName, userSpecifiedModel: ModelAlias): FinalizedStepConfig {
  const baseConfig = STEP_CONFIGS[stepName];

  // Get the actual model name from the user-selected model or the default model
  const modelAndProvider = getModelAndProvider(userSpecifiedModel, baseConfig.model);

  if (baseConfig.useStructuredModel) {
    return {
      ...baseConfig,
      modelAndProvider,
      structuredModel: getStructuredModel(userSpecifiedModel),
      temperatureStructured: baseConfig.temperature,
    } as FinalizedStepConfig;
  }

  return {
    ...baseConfig,
    modelAndProvider,
  } as FinalizedStepConfig;
}
