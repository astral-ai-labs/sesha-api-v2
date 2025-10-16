/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Core (App-wide) -----
import { ingestionTypeEnum, lengthEnum, blobsEnum, modelEnum } from "@/core/db/schema";

/* ==========================================================================*/
// Low Level Types
/* ==========================================================================*/

type DraftType = (typeof ingestionTypeEnum.enumValues)[number];
type LengthRange = (typeof lengthEnum.enumValues)[number];
type BlobsCount = (typeof blobsEnum.enumValues)[number];
type ModelSelection = (typeof modelEnum.enumValues)[number];

/**
 * Comparison of a quote from the article and a quote from a source
 */
interface RipQuoteComparison {
  /** Quote from the article */
  articleQuote: string;
  /** Quote from the source */
  sourceQuote: string;
  /** Number of the source */
  sourceNumber: number;
  /** Analysis of the rip */
  ripAnalysis: string;
}

// ===================================================
// Source Types
// ===================================================

type SourceOriginType = "file" | "url" | "unknown";

interface SourceFlags {
  /** Whether this is the primary source for content generation */
  isPrimarySource: boolean;
  /** Whether to copy source content verbatim without processing */
  copySourceVerbatim: boolean;
  /** Whether this serves as the foundational source */
  isBaseSource: boolean;
}

interface Source {
  /** Sequential source number for ordering and reference */
  number: number;
  /** Source attribution (e.g., "The New York Times") */
  attribution: string;
  /** Classification of source origin */
  originType: SourceOriginType;
  /** Optional URL for source location */
  url?: string;
  /** Human-readable description of the source */
  description: string;
  /** Raw text content from the source */
  text: string;
  /** Processing flags for this source */
  flags: SourceFlags;
}

// ======================================================
// Metadata Types
// ======================================================

interface RequestMetadata {
  /** Unique identifier for the requesting user */
  userId: string;
  /** Organization identifier for billing and access control */
  orgId: string;
  /** Aggregation or Digestion */
  draftType: DraftType;
  /** Unique identifier for the article */
  articleId: string;
  /** Number of blobs for the article */
  numberOfBlobs: BlobsCount;
  /** Length range for the article */
  lengthRange: LengthRange;
  /** AI model for article generation */
  modelSelection: ModelSelection;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/

export type { DraftType, LengthRange, BlobsCount, ModelSelection, SourceOriginType, Source, SourceFlags, RequestMetadata, RipQuoteComparison };
