/* ==========================================================================*/
// modelMappings.ts — Model selection to actual model name mappings
/* ==========================================================================*/
// Purpose: Centralized mapping between user selections and actual model names
/* ==========================================================================*/

// Internal Modules -----
import type { ModelSelection } from "../types/primitives";

/* ==========================================================================*/
// Model Mappings
/* ==========================================================================*/

/**
 * Maps user-selected model enum values to actual Claude model names
 */
export const CLAUDE_MODEL_MAPPING: Record<ModelSelection, string> = {
  "claude-3.7": "claude-3-7-sonnet-20250219",
  "claude-4": "claude-sonnet-4-20250514",
  "claude-4.5": "claude-sonnet-4-5-20250929"
} as const;

/**
 * Maps user-selected model enum values to structured model names
 * For now, we'll use the same mapping, but you could have different structured models
 */
export const STRUCTURED_MODEL_MAPPING: Record<ModelSelection, string> = {
    "claude-3.7": "gpt-4o",
    "claude-4": "gpt-4o",
    "claude-4.5": "gpt-4o",
  } as const;

/* ==========================================================================*/
// Helper Functions
/* ==========================================================================*/

/**
 * Get the actual Claude model name from user selection
 */
export function getClaudeModel(modelSelection: ModelSelection): string {
  return CLAUDE_MODEL_MAPPING[modelSelection];
}

export function getStructuredModel(modelSelection: ModelSelection): string {
    return STRUCTURED_MODEL_MAPPING[modelSelection];
}