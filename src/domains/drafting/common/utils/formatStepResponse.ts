/* ==========================================================================*/
// formatStepResponse.ts — Step response formatting utilities
/* ==========================================================================*/
// Purpose: Reduce repetition in step response creation
/* ==========================================================================*/

// Internal Modules ----
import type { StepResponse } from "../types/runner";
import type { LLMTokenUsage } from "@/core/usage/types";

/* ==========================================================================*/
// Utility Functions
/* ==========================================================================*/

/**
 * Create successful step response with usage tracking.
 */
export function createSuccessResponse<TOutput>(output: TOutput, model: string, usage: { inputTokens: number; outputTokens: number; totalTokens: number }): StepResponse<TOutput> {
  const tokenUsage: LLMTokenUsage = {
    model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
  };

  return {
    success: true,
    output,
    usage: [tokenUsage],
  };
}
