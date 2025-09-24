/* ==========================================================================*/
// steps.config.ts — Aggregation pipeline step configurations
/* ==========================================================================*/
// Purpose: Centralized configuration for all aggregation pipeline steps
/* ==========================================================================*/

// Internal Modules ----
import type { StepConfig } from "../common/types/runner";
import { DEFAULT_CLAUDE_MODEL as DEFAULT_MODEL, DEFAULT_STRUCTURED_MODEL } from "../common/defaults";

/* ==========================================================================*/
// Types
/* ==========================================================================*/

export type stepName = "01-extract-facts" | "02-extract-facts-conditional" | "03-generate-headlines" | "04-create-outline" | "05-draft-article" | "06-revise-article" | "07-source-attribution" | "08-apply-color-coding" | "09-detect-rips";

/* ==========================================================================*/
// Step Configurations
/* ==========================================================================*/

export const STEP_CONFIGS: Record<stepName, StepConfig> = {
  "01-extract-facts": {
    stepName: "01-extract-facts",
    model: DEFAULT_MODEL,
    temperature: 0.8,
    maxTokens: 4000,
  },

  "02-extract-facts-conditional": {
    stepName: "02-extract-facts-conditional",
    model: DEFAULT_MODEL,
    temperature: 0.8,
    maxTokens: 4000,
  },

  "03-generate-headlines": {
    stepName: "03-generate-headlines",
    model: DEFAULT_MODEL,
    structuredModel: DEFAULT_STRUCTURED_MODEL,
    temperature: 0.4,
    temperatureStructured: 0.1,
    maxTokens: 500,
  },

  "04-create-outline": {
    stepName: "04-create-outline",
    model: DEFAULT_MODEL,
    temperature: 0.6,
    maxTokens: 3000,
  },

  "05-draft-article": {
    stepName: "05-draft-article",
    model: DEFAULT_MODEL,
    temperature: 0.7,
    maxTokens: 3000,
  },

  "06-revise-article": {
    stepName: "06-revise-article",
    model: DEFAULT_MODEL,
    temperature: 0.5,
    maxTokens: 3700,
  },

  "07-source-attribution": {
    stepName: "07-source-attribution",
    model: DEFAULT_MODEL,
    temperature: 0.2,
    maxTokens: 3700,
  },

  "08-apply-color-coding": {
    stepName: "08-apply-color-coding",
    model: DEFAULT_MODEL,
    temperature: 0.7,
    maxTokens: 3000,
  },
  "09-detect-rips": {
    stepName: "09-detect-rips",
    model: DEFAULT_MODEL,
    structuredModel: DEFAULT_STRUCTURED_MODEL,
    temperatureStructured: 0.1,
    temperature: 0.7,
    maxTokens: 3000,
  },
} as const;

export function getStepConfig(stepName: stepName): StepConfig {
  return STEP_CONFIGS[stepName];
}
