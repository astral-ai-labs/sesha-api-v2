/* ==========================================================================*/
// step.ts — Generic step execution patterns
/* ==========================================================================*/
// Purpose: Generic step request/response types for type-safe pipeline execution
// Sections: Imports, Type Aliases, Step Types, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import type { Source, LLMTokenUsage } from "./base";

/* ==========================================================================*/
// Type Aliases
/* ==========================================================================*/

/**
 * Default context type for steps that don't need specific context.
 */
type DefaultContext = Record<string, unknown>;

/**
 * Default output type for steps that don't need specific output.
 */
type DefaultOutput = Record<string, unknown>;

/* ==========================================================================*/
// Step Types
/* ==========================================================================*/

/**
 * Generic step request with typed context from previous steps.
 */
interface StepRequest<TContext = DefaultContext> {
  sources: Source[];
  instructions: string;
  context: TContext;
}

/**
 * Generic step response with typed output.
 */
interface StepResponse<TOutput = DefaultOutput> {
  success: boolean;
  output: TOutput;
  usage: LLMTokenUsage[];
}


/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { DefaultContext, DefaultOutput, StepRequest, StepResponse };
