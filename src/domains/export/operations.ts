/* ==========================================================================*/
// operations.ts — Export data operations
/* ==========================================================================*/
// Purpose: Handle article data retrieval for export functionality
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { eq, and, sql } from "drizzle-orm";

// Internal Modules ----
import { db, articles, users } from "@/core/db";
import type { ArticleExportData } from "./types";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Retrieves article data formatted for export by slug and version.
 */
async function getArticleExportDataBySlugAndVersion(orgId: number, slug: string, version: string): Promise<ArticleExportData | null> {
  // 1️⃣ Query for article with creator info -----
  const articleResult = await db
    .select({
      // Article fields needed for export
      headline: articles.headline,
      slug: articles.slug,
      version: articles.version,
      content: articles.content,
      richContent: articles.richContent,
      blob: articles.blob,
      ingestionType: articles.ingestionType,
      // Author name
      authorName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`,
    })
    .from(articles)
    .leftJoin(users, eq(articles.createdByUserId, users.id))
    .where(and(eq(articles.orgId, orgId), eq(articles.slug, slug), eq(articles.version, version)))
    .limit(1);

  // 2️⃣ Return null if not found -----
  if (!articleResult.length) {
    return null;
  }

  const article = articleResult[0];

  // 3️⃣ Transform to export format -----
  return {
    headline: article.headline || "",
    slug: article.slug,
    version: article.version,
    rawContent: article.content || undefined,
    rawRichContent: article.richContent || undefined,
    blobs: article.blob || undefined,
    authorName: article.authorName || "Unknown",
    draftType: article.ingestionType,
  };
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { getArticleExportDataBySlugAndVersion };
