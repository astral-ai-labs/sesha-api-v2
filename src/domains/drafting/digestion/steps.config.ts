/* ==========================================================================*/
// steps.config.ts — Digestion pipeline step configurations
/* ==========================================================================*/
// Purpose: Centralized configuration for all digestion pipeline steps
/* ==========================================================================*/

// Internal Modules ----
import type { StepConfig } from "../common/types/runner";
import { DEFAULT_CLAUDE_MODEL as DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "../common/defaults";
import { getClaudeModel } from "../common/utils/modelMappings";
import type { ModelSelection } from "../common/types";

/* ==========================================================================*/
// Types
/* ==========================================================================*/

export type stepName = "01-extract-facts" | "02-summarize-facts" | "03-generate-headlines" | "04-create-outline" | "04-digest-verbatim-conditional" | "05-draft-article" | "06-revise-article" | "07-add-source-attribution";

/* ==========================================================================*/
// Step Configurations
/* ==========================================================================*/

export const STEP_CONFIGS: Record<stepName, Omit<StepConfig, "model">> = {
  "01-extract-facts": {
    stepName: "01-extract-facts",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: 2500,
  },

  "02-summarize-facts": {
    stepName: "02-summarize-facts",
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
  },
  "03-generate-headlines": {
    stepName: "03-generate-headlines",
    temperature: 0.5,
    maxTokens: 500,
  },

  "04-create-outline": {
    stepName: "04-create-outline",
    temperature: 0.6,
    maxTokens: DEFAULT_MAX_TOKENS,
  },

  "04-digest-verbatim-conditional": {
    stepName: "04-digest-verbatim-conditional",
    temperature: 0.2,
    maxTokens: 4000,
  },

  "05-draft-article": {
    stepName: "05-draft-article",
    temperature: 0.6,
    maxTokens: 3000,
  },

  "06-revise-article": {
    stepName: "06-revise-article",
    temperature: 0.5,
    maxTokens: 3700,
  },

  "07-add-source-attribution": {
    stepName: "07-add-source-attribution",
    temperature: 0.2, // Very precise for attribution
    maxTokens: 3700,
  },
} as const;

/* ==========================================================================*/
// Helper Functions
/* ==========================================================================*/

/**
 * Get step configuration with user-selected model
 */
export function getStepConfig(stepName: stepName, modelSelection: ModelSelection): StepConfig {
  const baseConfig = STEP_CONFIGS[stepName];
  const model = getClaudeModel(modelSelection);

  return {
    ...baseConfig,
    model
  } as StepConfig;
}