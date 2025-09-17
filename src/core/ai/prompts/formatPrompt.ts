/* ==========================================================================*/
// formatPrompt.ts — Mustache template formatting utility
/* ==========================================================================*/
// Purpose: Format prompt templates with variables using Mustache templating
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import Mustache from "mustache";

// Internal Modules ----
import { PromptType } from "./types";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Format a prompt template with variables using Mustache templating.
 */
function formatPrompt(promptTemplate?: string, variables?: Record<string, unknown>, type?: PromptType.SYSTEM | PromptType.ASSISTANT): string | undefined;
function formatPrompt(promptTemplate: string, variables: Record<string, unknown> | undefined, type: PromptType.USER): string;
function formatPrompt(promptTemplate?: string, variables?: Record<string, unknown>, type: PromptType = PromptType.SYSTEM): string | undefined {
  if (!promptTemplate) return undefined;
  if (!variables) return promptTemplate;

  try {
    return Mustache.render(promptTemplate, variables);
  } catch (error: unknown) {
    throw new Error(`Prompt formatting failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { formatPrompt };
