/* ==========================================================================*/
// formatStepResponse.ts — Step response formatting utilities
/* ==========================================================================*/
// Purpose: Reduce repetition in step response creation
/* ==========================================================================*/

// Internal Modules ----
import type { StepResponse } from "../types/runner";
import type { LLMTokenUsageWithCostAndMetadata } from "@/core/usage/types";
import type { ModelAndProvider } from "../types/primitives";

/* ==========================================================================*/
// Utility Functions
/* ==========================================================================*/

/**
 * Create successful step response with usage tracking.
 */
export function createSuccessResponse<TOutput>(output: TOutput, modelAndProvider: ModelAndProvider, usage: { inputTokens: number; outputTokens: number; totalTokens: number }): StepResponse<TOutput> {
  const tokenUsage: LLMTokenUsageWithCostAndMetadata = {
    modelAlias: modelAndProvider.modelAlias,
    modelId: modelAndProvider.modelId,
    providerId: modelAndProvider.providerId,
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
