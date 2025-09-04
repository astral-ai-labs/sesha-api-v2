/* ==========================================================================*/
// pipeline.ts — Pipeline configuration and request types
/* ==========================================================================*/
// Purpose: Define types for pipeline execution requests and metadata
// Sections: Imports, Interfaces, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import { BlobsCount, LengthRange, LLMTokenUsage, RunType, Source } from "./base";

/* ==========================================================================*/
// Pipeline Configuration
/* ==========================================================================*/

/**
 * Pipeline execution metadata for user and organization context.
 */
interface PipelineMetadata {
  /** Unique identifier for the requesting user */
  userId: string;
  /** Organization identifier for billing and access control */
  orgId: string;
  /** Aggregation or Digestion */
  runType: RunType;
  /** Optional version identifier for pipeline configuration */
  currentVersionDecimal?: string;
}

/**
 * User instructions and configuration for pipeline execution.
 */
interface PipelineInstruction {
  /** Unique slug identifier for the pipeline type */
  slug: string;
  /** Optional user-provided headline override */
  userSpecifiedHeadline?: string;
  /** Detailed processing instructions */
  instructions: string;
  /** Number of content blobs to process */
  blobs: BlobsCount;
  /** Target length for generated content */
  length: LengthRange;
}

/**
 * Complete pipeline execution request with metadata, instructions, and sources.
 */
interface PipelineRequest {
  /** Execution context and user information */
  metadata: PipelineMetadata;
  /** Processing instructions and configuration */
  instruction: PipelineInstruction;
  /** Source content to process */
  sources: Source[];
}

/**
 * Complete pipeline execution response with cost and usage information.
 */
export interface PipelineResponse {
  success: boolean;
  usage: LLMTokenUsage;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { PipelineMetadata, PipelineInstruction, PipelineRequest };
