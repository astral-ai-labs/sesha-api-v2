/* ==========================================================================*/
// steps.config.ts — Digestion pipeline step configurations
/* ==========================================================================*/
// Purpose: Centralized configuration for all digestion pipeline steps
/* ==========================================================================*/

// Internal Modules ----
import type { StepConfig } from "../common/types/runner";
import { DEFAULT_CLAUDE_MODEL as DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from "../common/defaults";

/* ==========================================================================*/
// Types
/* ==========================================================================*/

export type stepName = "01-extract-facts" | "02-summarize-facts" | "03-generate-headlines" | "04-create-outline" | "04-digest-verbatim-conditional" | "05-draft-article" | "06-revise-article" | "07-add-source-attribution";

/* ==========================================================================*/
// Step Configurations
/* ==========================================================================*/

export const STEP_CONFIGS: Record<stepName, StepConfig> = {
  "01-extract-facts": {
    stepName: "01-extract-facts",
    model: DEFAULT_MODEL,
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: 2500,
  },

  "02-summarize-facts": {
    stepName: "02-summarize-facts",
    model: DEFAULT_MODEL,
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
  },
  "03-generate-headlines": {
    stepName: "03-generate-headlines",
    model: DEFAULT_MODEL,
    temperature: 0.5,
    maxTokens: 500,
  },

  "04-create-outline": {
    stepName: "04-create-outline",
    model: DEFAULT_MODEL,
    temperature: 0.6,
    maxTokens: DEFAULT_MAX_TOKENS,
  },

  "04-digest-verbatim-conditional": {
    stepName: "04-digest-verbatim-conditional",
    model: DEFAULT_MODEL,
    temperature: 0.2,
    maxTokens: 4000,
  },

  "05-draft-article": {
    stepName: "05-draft-article",
    model: DEFAULT_MODEL,
    temperature: 0.6,
    maxTokens: 3000,
  },

  "06-revise-article": {
    stepName: "06-revise-article",
    model: DEFAULT_MODEL,
    temperature: 0.5,
    maxTokens: 3700,
  },

  "07-add-source-attribution": {
    stepName: "07-add-source-attribution",
    model: DEFAULT_MODEL,
    temperature: 0.2, // Very precise for attribution
    maxTokens: 3700,
  },
} as const;

export function getStepConfig(stepName: stepName): StepConfig {
  return STEP_CONFIGS[stepName];
}