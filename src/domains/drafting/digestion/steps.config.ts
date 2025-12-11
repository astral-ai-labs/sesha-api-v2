/* ==========================================================================*/
// steps.config.ts — Digestion pipeline step configurations
/* ==========================================================================*/
// Purpose: Centralized configuration for all digestion pipeline steps
/* ==========================================================================*/

// Internal Modules ----
import type { BaseStepConfig, FinalizedStepConfig } from "../common/types/runner";
import { DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "../common/defaults";
import { getModelAndProvider, getStructuredModel } from "../common/utils/modelMappings";
import type { ModelAlias } from "../common/types/primitives";

/* ==========================================================================*/
// Types
/* ==========================================================================*/

export type stepName = "01-extract-facts" | "02-summarize-facts" | "03-generate-headlines" | "04-create-outline" | "04-digest-verbatim-conditional" | "05-draft-article" | "06-revise-article" | "07-add-source-attribution";

/* ==========================================================================*/
// Step Configurations
/* ==========================================================================*/

export const STEP_CONFIGS: Record<stepName, BaseStepConfig> = {
  "01-extract-facts": {
    stepName: "01-extract-facts",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: 2500,
    model: "sonnet-4.5",
    useStructuredModel: false,
  },

  "02-summarize-facts": {
    stepName: "02-summarize-facts",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    model: "sonnet-4.5",
    useStructuredModel: false,
  },
  "03-generate-headlines": {
    stepName: "03-generate-headlines",
    temperature: 0.5,
    maxTokens: 500,
    model: "sonnet-4.5",
    useStructuredModel: false,
  },

  "04-create-outline": {
    stepName: "04-create-outline",
    temperature: 0.6,
    maxTokens: DEFAULT_MAX_TOKENS,
    model: "sonnet-4",
    useStructuredModel: false,
  },

  "04-digest-verbatim-conditional": {
    stepName: "04-digest-verbatim-conditional",
    temperature: 0.2,
    maxTokens: 4000,
    model: "sonnet-4.5",
    useStructuredModel: false,
  },

  "05-draft-article": {
    stepName: "05-draft-article",
    temperature: 0.6,
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

  "07-add-source-attribution": {
    stepName: "07-add-source-attribution",
    temperature: 0.2, // Very precise for attribution
    maxTokens: 3700,
    model: "sonnet-4",
    useStructuredModel: false,
  },
} as const;

/* ==========================================================================*/
// Helper Functions
/* ==========================================================================*/

/**
 * Get step configuration with user-selected model
 */
export function getDigestionStepConfig(stepName: stepName, userSpecifiedModel: ModelAlias): FinalizedStepConfig {
  const baseConfig = STEP_CONFIGS[stepName];
  const modelAndProvider = getModelAndProvider(userSpecifiedModel, baseConfig.model);

  if (baseConfig.useStructuredModel) {
    return {
      ...baseConfig,
      modelAndProvider,
      structuredModel: getStructuredModel(userSpecifiedModel),
    } as FinalizedStepConfig;
  }

  return {
    ...baseConfig,
    modelAndProvider,
  } as FinalizedStepConfig;
}