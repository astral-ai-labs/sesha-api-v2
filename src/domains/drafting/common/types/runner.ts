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
import type { BlobsCount, LengthRange, ModelAlias, ModelAndProvider, RequestMetadata, Source } from "./primitives";
import type { LLMTokenUsage, LLMTokenUsageWithCostAndMetadata } from "@/core/usage/types";
import type { stepName as AggregationStepName } from "../../aggregation/steps.config";
import type { stepName as DigestionStepName } from "../../digestion/steps.config";
import { articles } from "@/core/db";

/* ==========================================================================*/
// Step Types
/* ==========================================================================*/

interface BaseStepConfig {
  stepName: AggregationStepName | DigestionStepName;
  model: ModelAlias;
  temperature: number;
  maxTokens: number;
  useStructuredModel: boolean;
}

interface FinalizedStepConfig extends Omit<BaseStepConfig, "model" | "useStructuredModel"> {
  modelAndProvider: ModelAndProvider;
  structuredModel?: string | undefined;
  temperatureStructured?: number | undefined;
}

/**
 * Generic step request with typed context from previous steps.
 */
interface StepRequest<TContext = Record<string, unknown>> {
  sources: Source[];
  instructions: string;
  numberOfBlobs: BlobsCount;
  lengthRange: LengthRange;
  context: TContext;
}

/**
 * Generic step response with typed output.
 */
interface StepResponse<TOutput = Record<string, unknown>> {
  success: boolean;
  output: TOutput;
  usage: LLMTokenUsageWithCostAndMetadata[];
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
  /** AI model for facts extraction */
  inputFactsExtractionModel: ModelAlias;
  /** AI model for headline and blob generation */
  inputHeadlineAndBlobGenerationModel: ModelAlias;
  /** AI model for article writing */
  inputArticleWritingModel: ModelAlias;
  /** AI model for RIPs detection */
  inputRipsDetectionModel: ModelAlias;
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
  modelAlias: ModelAlias;
  modelId: string;
  providerId: string;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { BaseStepConfig, FinalizedStepConfig, ArticleStatusAndUsageResult, StepRequest, StepResponse, PipelineRequest };
