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
import type { BlobsCount, LengthRange, ModelSelection, RequestMetadata, Source } from "./primitives";
import type { LLMTokenUsage } from "@/core/usage/types";
import type { stepName as AggregationStepName } from "../../aggregation/steps.config";
import type { stepName as DigestionStepName } from "../../digestion/steps.config";
import { articles } from "@/core/db";

/* ==========================================================================*/
// Step Types
/* ==========================================================================*/

interface StepConfig {
  stepName: AggregationStepName | DigestionStepName;
  model: string;
  temperature: number;
  maxTokens: number;
  structuredModel?: string;
  temperatureStructured?: number;
}

/**
 * Generic step request with typed context from previous steps.
 */
interface StepRequest<TContext = Record<string, unknown>> {
  sources: Source[];
  instructions: string;
  numberOfBlobs: BlobsCount;
  lengthRange: LengthRange;
  modelSelection: ModelSelection;
  context: TContext;
}

/**
 * Generic step response with typed output.
 */
interface StepResponse<TOutput = Record<string, unknown>> {
  success: boolean;
  output: TOutput;
  usage: LLMTokenUsage[];
}

/* ==========================================================================*/
// Pipeline Types
/* ==========================================================================*/

interface PipelineRequest {
  /** Execution context and user information */
  metadata: RequestMetadata;
  /** Number of content blobs to process */
  numberOfBlobs: BlobsCount;
  /** Target length for generated content */
  lengthRange: LengthRange;
  /** AI Model selected for article generation */
  modelSelection: ModelSelection;
  /** Detailed processing instructions */
  instructions: string;
  /** Optional user-provided headline override */
  userSpecifiedHeadline?: string;
  /** Source content to process */
  sources: Source[];
}


// ================================================================
// Article Status and Usage Result
// ================================================================

interface ArticleStatusAndUsageResult {
  article: typeof articles.$inferSelect;
  totalTokenUsage: LLMTokenUsage;
  totalCostUsd: string;
}


/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { StepConfig, ArticleStatusAndUsageResult, StepRequest, StepResponse, PipelineRequest };
