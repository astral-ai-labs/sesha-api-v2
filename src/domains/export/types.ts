/* ==========================================================================*/
// types.ts — Export data type definitions
/* ==========================================================================*/
// Purpose: Type definitions for article export functionality
// Sections: Imports, Types, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import type { ingestionTypeEnum } from "@/core/db/schema";

/* ==========================================================================*/
// Primitive Types & Interfaces
/* ==========================================================================*/

type DraftType = (typeof ingestionTypeEnum.enumValues)[number];

type ExportFormat = "docx" | "pdf" | "email";

type ExportArticleApiRequest = {
  orgId: number;
  slug: string;
  version: string;
  format: ExportFormat;
};

// ============================================================
// Types & Interfaces
// ===================================================

interface ArticleExportData {
  headline: string;
  slug: string;
  version: string;
  rawContent?: string;
  rawRichContent?: string;
  blobs?: string;
  authorName: string;
  draftType: DraftType;
}

interface ArticleExportDataWithHtml extends ArticleExportData {
  html: string;
}

interface ExportHandlerResponse {
  success: boolean;
  data?: Response;
  error?: string;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { ArticleExportData, ArticleExportDataWithHtml, ExportFormat, ExportArticleApiRequest, ExportHandlerResponse };
