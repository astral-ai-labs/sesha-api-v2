/* ==========================================================================*/
// drafts.ts — Draft article data operations
/* ==========================================================================*/
// Purpose: Handle article data retrieval and status management for drafting pipeline
// Sections: Imports, Types, Implementation, Public API

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { eq, asc } from "drizzle-orm";

// Internal Modules ----
import { db, articles, articleSources, articleStatusEnum } from "@/core/db";
import type { PipelineRequest } from "../types/runner";

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

type ArticleStatus = (typeof articleStatusEnum.enumValues)[number];

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Fetches article data and transforms it into a PipelineRequest.
 */
async function getArticleAsPipelineRequest(articleId: string): Promise<PipelineRequest> {
  // 1️⃣ Validate input -----
  if (!articleId?.trim()) {
    throw new Error("Article ID cannot be empty");
  }

  // 2️⃣ Get article data -----
  const article = await db
    .select()
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  if (!article || article.length === 0) {
    throw new Error(`Article not found: ${articleId}`);
  }

  const articleData = article[0];

  // 3️⃣ Get article sources -----
  const sources = await db
    .select()
    .from(articleSources)
    .where(eq(articleSources.articleId, articleId))
    .orderBy(asc(articleSources.sortOrder));

  // 4️⃣ Transform sources for pipeline -----
  const transformedSources = sources.map((source, index) => ({
    number: index + 1,
    attribution: source.attribution || "Unknown Source",
    originType: "unknown" as const,
    url: source.url || undefined,
    description: source.description || "",
    text: source.text,
    flags: {
      isPrimarySource: source.isPrimary,
      copySourceVerbatim: source.isVerbatim,
      isBaseSource: source.isBase,
    },
  }));

  // 5️⃣ Build pipeline request -----
  return {
    metadata: {
      userId: articleData.createdByUserId || "",
      orgId: articleData.orgId.toString(),
      draftType: articleData.ingestionType,
      articleId: articleData.id,
    },
    numberOfBlobs: articleData.inputPresetBlobs,
    lengthRange: articleData.inputPresetLength,
    instructions: articleData.inputPresetInstructions || "",
    userSpecifiedHeadline: articleData.headline || undefined,
    sources: transformedSources,
  } as unknown as PipelineRequest;
}

/**
 * Updates article status and timestamp.
 */
async function updateArticleStatus(articleId: string, status: ArticleStatus) {
  // 1️⃣ Validate input -----
  if (!articleId?.trim()) {
    throw new Error("Article ID cannot be empty");
  }

  // 2️⃣ Update article status -----
  const [article] = await db
    .update(articles)
    .set({
      status,
      statusUpdatedAt: new Date(),
    })
    .where(eq(articles.id, articleId))
    .returning();

  return article;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export {
  getArticleAsPipelineRequest,
  updateArticleStatus,
  type ArticleStatus,
};
