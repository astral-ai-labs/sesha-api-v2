/* ==========================================================================*/
// runs.ts — Run tracking and cost management operations
/* ==========================================================================*/
// Purpose: Handle run lifecycle, token tracking, and cost calculations
// Sections: Imports, Types, Operations, Public API

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { eq } from "drizzle-orm";

// Internal Modules ----
import { db, runs } from "@/core/db";
import { ingestionTypeEnum, lengthEnum } from "@/core/db/schema";
import type { LLMTokenUsage } from "@/core/usage/types";

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

type IngestionType = (typeof ingestionTypeEnum.enumValues)[number];
type Length = (typeof lengthEnum.enumValues)[number];

interface CreateRunSkeletonParams {
  articleId: string;
  triggeredByUserId?: string;
  ingestionType: IngestionType;
  length: Length;
}

interface UpdateRunParams {
  id: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: string;
}

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Creates a basic run record with minimal required fields.
 */
async function createRunSkeleton(params: CreateRunSkeletonParams) {
  // 1️⃣ Validate input -----
  if (!params.articleId?.trim()) {
    throw new Error("Article ID cannot be empty");
  }

  // 2️⃣ Create run record -----
  const [run] = await db
    .insert(runs)
    .values({
      articleId: params.articleId,
      triggeredByUserId: params.triggeredByUserId,
      ingestionType: params.ingestionType,
      length: params.length,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: "0.00",
    })
    .returning();

  return run;
}

/**
 * Updates run with token counts and cost information.
 */
async function updateRun(params: UpdateRunParams) {
  // 1️⃣ Validate input -----
  if (!params.id?.trim()) {
    throw new Error("Run ID cannot be empty");
  }

  // 2️⃣ Build update data -----
  const updateData: Partial<typeof runs.$inferInsert> = {};
  
  if (params.inputTokens !== undefined) updateData.inputTokens = params.inputTokens;
  if (params.outputTokens !== undefined) updateData.outputTokens = params.outputTokens;
  if (params.costUsd !== undefined) updateData.costUsd = params.costUsd;

  // 3️⃣ Update run record -----
  const [run] = await db
    .update(runs)
    .set(updateData)
    .where(eq(runs.id, params.id))
    .returning();

  return run;
}

/**
 * Finalizes run with accumulated usage data from pipeline steps.
 */
async function finalizeRunWithUsage(runId: string, usage: LLMTokenUsage[]) {
  // 1️⃣ Validate input -----
  if (!runId?.trim()) {
    throw new Error("Run ID cannot be empty");
  }

  // 2️⃣ Aggregate usage data -----
  const totalInputTokens = usage.reduce((sum, u) => sum + u.inputTokens, 0);
  const totalOutputTokens = usage.reduce((sum, u) => sum + u.outputTokens, 0);

  // 3️⃣ Update run with final usage data -----
  return await updateRun({
    id: runId,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    // TODO: Calculate cost based on model usage and pricing
    costUsd: "0.00", // Placeholder for cost calculation
  });
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export {
  createRunSkeleton,
  updateRun,
  finalizeRunWithUsage,
  type CreateRunSkeletonParams,
  type UpdateRunParams,
};
