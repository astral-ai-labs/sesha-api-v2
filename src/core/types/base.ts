/* ==========================================================================*/
// base.ts — Core domain types and interfaces for SESHA API
/* ==========================================================================*/
// Purpose: Define fundamental types for sources, usage tracking, and pipeline configuration
// Sections: Types, Interfaces, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Configuration Types
/* ==========================================================================*/

/**
 * Pipeline run type.
 */
type RunType = "aggregation" | "digestion" | "other";

/**
 * Number of content blobs to process (1-6).
 */
type BlobsCount = "1" | "2" | "3" | "4" | "5" | "6";

/**
 * Target length ranges for generated content.
 */
type LengthRange = "100-250" | "400-550" | "700-850" | "1000-1200";

/**
 * Source origin classification for content attribution.
 */
type SourceOriginType = "file" | "url" | "unknown";

/* ==========================================================================*/
// Source Management
/* ==========================================================================*/

/**
 * Processing flags that control how sources are handled.
 */
interface SourceFlags {
  /** Whether this is the primary source for content generation */
  isPrimarySource: boolean;
  /** Whether to copy source content verbatim without processing */
  copySourceVerbatim: boolean;
  /** Whether this serves as the foundational source */
  isBaseSource: boolean;
}

/**
 * Content source with metadata and processing instructions.
 */
interface Source {
  /** Sequential source number for ordering and reference */
  number: number;
  /** Source attribution (e.g., "The New York Times") */
  attribution: string;
  /** Classification of source origin */
  originType: SourceOriginType;
  /** Optional file path or URL for source location */
  link?: string;
  /** Human-readable description of the source */
  description: string;
  /** Raw text content from the source */
  text: string;
  /** Processing flags for this source */
  flags: SourceFlags;
}

/**
 * Individual source facts result from parallel processing.
 * Used to maintain source-to-facts relationship throughout the pipeline.
 */
interface SourceFactsExtractionResult {
  sourceNumber: number;
  extractedFacts: string;
  extractedFactsConditional?: string;
}
/* ==========================================================================*/
// Usage & Cost Tracking
/* ==========================================================================*/

/**
 * Token usage data for a single LLM API call.
 */
interface LLMTokenUsage {
  /** Number of input tokens consumed */
  inputTokens: number;
  /** Number of output tokens generated */
  outputTokens: number;
  /** Total cost in USD for the call */
  costUsd?: number;
  /** Model identifier used for the request */
  model?: string;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { BlobsCount, LengthRange, SourceOriginType, Source, SourceFlags, SourceFactsExtractionResult, LLMTokenUsage, RunType };
