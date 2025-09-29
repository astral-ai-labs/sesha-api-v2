/* ==========================================================================*/
// drafts.ts — Draft article data operations
/* ==========================================================================*/
// Purpose: Handle article data retrieval and status management for drafting pipeline
// Sections: Imports, Types, Implementation, Public API

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { eq, asc, desc } from "drizzle-orm";

// Internal Modules ----
import { db, articles, articleSources, articleStatusEnum, runs, users } from "@/core/db";
import type { PipelineRequest, ArticleStatusAndUsageResult, RipQuoteComparison, DraftType } from "../types";
import { LLMTokenUsage } from "@/core/usage/types";
import { NonRetriableError } from "inngest";

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

type ArticleStatus = (typeof articleStatusEnum.enumValues)[number];

interface FinalizeDraftData {
  draftType: DraftType;
  blob: string;
  content: string;
  richContent?: string;
  headline: string;
  userSpecifiedHeadline?: string;

  // Rips
  ripScore?: number;
  ripAnalysis?: string;
  ripComparisons?: RipQuoteComparison[];
}

interface FinalizeDraftResult {
  article: typeof articles.$inferSelect;
  userInfo: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

// TODO: Move this to a dedicated pricing module
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Claude 3.5/3.7 Sonnet
  "claude-3-5-sonnet-20240620": { input: 3, output: 15 },
  "claude-3-5-sonnet": { input: 3, output: 15 },
  "claude-3-7-sonnet": { input: 3, output: 15 },
  // Claude 4 Sonnet
  "claude-sonnet-4-20250514": { input: 3, output: 15 },
  // Claude 4 Opus
  "claude-4-opus": { input: 15, output: 75 },
  // Claude 3 Opus
  "claude-3-opus": { input: 15, output: 75 },
  // Claude 3.5 Haiku
  "claude-3-5-haiku": { input: 0.8, output: 4 },
  // Claude 3 Haiku
  "claude-3-haiku": { input: 0.25, output: 1.25 },
  // OpenAI GPT-4o
  "gpt-4o": { input: 2.5, output: 10 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
};

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Finalize draft by updating article with final content and fetch user info.
 */
async function finalizeDraft(articleId: string, userId: string, draftData: FinalizeDraftData): Promise<FinalizeDraftResult> {
  // 1️⃣ Validate input -----
  if (!articleId?.trim()) {
    throw new NonRetriableError("Article ID cannot be empty");
  }

  if (!draftData.blob?.trim() || !draftData.content?.trim()) {
    throw new NonRetriableError("All draft fields (blob, content) are required");
  }

  if (draftData.draftType === "aggregate" && !draftData.richContent?.trim()) {
    throw new NonRetriableError("Rich content is required for aggregate draft type");
  }

  // 2️⃣ Update article with final content -----
  const [article] = await db
    .update(articles)
    .set({
      // Only update headline if user didn't specify one originally
      ...(draftData.userSpecifiedHeadline ? {} : { headline: draftData.headline }),
      // Set headlineAuthor based on whether user provided headline
      headlineAuthor: draftData.userSpecifiedHeadline ? "human" : "ai",
      blob: draftData.blob,
      content: draftData.content,
      richContent: draftData.richContent,
      statusUpdatedAt: new Date(),
      // Rips
      ripScore: draftData.ripScore,
      ripAnalysis: draftData.ripAnalysis,
      ripComparisons: draftData.ripComparisons,

    })
    .where(eq(articles.id, articleId))
    .returning();

  if (!article) {
    throw new NonRetriableError(`Failed to update article: ${articleId}`);
  }

  // 3️⃣ Fetch user information for email -----
  const [user] = await db
    .select({
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new NonRetriableError(`User not found for article: ${articleId}`);
  }

  return {
    article,
    userInfo: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
}

/**
 * Calculate cost for usage data based on model pricing.
 */
function calculateUsageCost(usage: LLMTokenUsage[]): number {
  return usage.reduce((totalCost, u) => {
    const model = u.model;
    const pricing = model ? MODEL_PRICING[model] : null;

    if (!pricing) {
      // Default to Claude 3.5 Sonnet pricing if model not found
      const defaultPricing = { input: 3, output: 15 };
      const inputCost = (u.inputTokens / 1_000_000) * defaultPricing.input;
      const outputCost = (u.outputTokens / 1_000_000) * defaultPricing.output;
      return totalCost + inputCost + outputCost;
    }

    const inputCost = (u.inputTokens / 1_000_000) * pricing.input;
    const outputCost = (u.outputTokens / 1_000_000) * pricing.output;
    return totalCost + inputCost + outputCost;
  }, 0);
}

/**
 * Fetches article data and transforms it into a PipelineRequest.
 */
async function getArticleAsPipelineRequest(articleId: string): Promise<PipelineRequest> {
  // 1️⃣ Validate input -----
  if (!articleId?.trim()) {
    throw new Error("Article ID cannot be empty");
  }

  // 2️⃣ Get article data -----
  const article = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);

  if (!article || article.length === 0) {
    throw new Error(`Article not found: ${articleId}`);
  }

  const articleData = article[0];

  // 3️⃣ Get article sources -----
  const sources = await db.select().from(articleSources).where(eq(articleSources.articleId, articleId)).orderBy(asc(articleSources.sortOrder));

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
    numberOfBlobs: articleData.inputBlobs,
    lengthRange: articleData.inputLength,
    instructions: articleData.inputInstructions || "",
    userSpecifiedHeadline: articleData.headlineAuthor === "human" ? articleData.headline : undefined,
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

/**
 * Gets the current accumulated usage and cost from the most recent run.
 */
async function getCurrentUsageAndCost(articleId: string): Promise<{ totalTokenUsage: LLMTokenUsage; totalCostUsd: string }> {
  // Find the most recent run for this article
  const [recentRun] = await db.select().from(runs).where(eq(runs.articleId, articleId)).orderBy(desc(runs.createdAt)).limit(1);

  if (!recentRun) {
    return {
      totalTokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      totalCostUsd: "0.00",
    };
  }

  return {
    totalTokenUsage: {
      inputTokens: recentRun.inputTokens,
      outputTokens: recentRun.outputTokens,
      totalTokens: recentRun.inputTokens + recentRun.outputTokens,
    },
    totalCostUsd: recentRun.costUsd,
  };
}

/**
 * Updates article status and accumulates usage data in the most recent run - all in a single transaction.
 */
async function updateArticleStatusAndUsage(articleId: string, status: ArticleStatus, usage: LLMTokenUsage[]): Promise<ArticleStatusAndUsageResult> {
  // 1️⃣ Validate input -----
  if (!articleId?.trim()) {
    throw new Error("Article ID cannot be empty");
  }

  if (!usage || usage.length === 0) {
    // If no usage data, just update status and return zero usage
    const article = await updateArticleStatus(articleId, status);
    return {
      article,
      totalTokenUsage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
      totalCostUsd: "0.00",
    };
  }

  // 2️⃣ Calculate step totals once -----
  const stepInputTokens = usage.reduce((sum, u) => sum + u.inputTokens, 0);
  const stepOutputTokens = usage.reduce((sum, u) => sum + u.outputTokens, 0);
  const stepCostUsd = calculateUsageCost(usage);

  // 3️⃣ Execute transaction to update both article and run -----
  return await db.transaction(async (tx) => {
    // Update article status
    const [article] = await tx
      .update(articles)
      .set({
        status,
        statusUpdatedAt: new Date(),
      })
      .where(eq(articles.id, articleId))
      .returning();

    // Find the most recent run for this article
    const [recentRun] = await tx.select().from(runs).where(eq(runs.articleId, articleId)).orderBy(desc(runs.createdAt)).limit(1);

    // Calculate final totals
    const finalInputTokens = recentRun ? recentRun.inputTokens + stepInputTokens : stepInputTokens;
    const finalOutputTokens = recentRun ? recentRun.outputTokens + stepOutputTokens : stepOutputTokens;
    const finalTotalTokens = finalInputTokens + finalOutputTokens;
    const existingCostUsd = recentRun ? parseFloat(recentRun.costUsd) : 0;
    const finalCostUsd = (existingCostUsd + stepCostUsd).toFixed(6);

    if (recentRun) {
      await tx
        .update(runs)
        .set({
          inputTokens: finalInputTokens,
          outputTokens: finalOutputTokens,
          costUsd: finalCostUsd,
        })
        .where(eq(runs.id, recentRun.id));
    }

    return {
      article,
      totalTokenUsage: {
        inputTokens: finalInputTokens,
        outputTokens: finalOutputTokens,
        totalTokens: finalTotalTokens,
      },
      totalCostUsd: finalCostUsd,
    };
  });
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { finalizeDraft, getArticleAsPipelineRequest, updateArticleStatus, updateArticleStatusAndUsage, getCurrentUsageAndCost, type ArticleStatus, type ArticleStatusAndUsageResult, type FinalizeDraftData, type FinalizeDraftResult };
