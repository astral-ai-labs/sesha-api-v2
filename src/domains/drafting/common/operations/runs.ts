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

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export {
  createRunSkeleton,
  updateRun,
  type CreateRunSkeletonParams,
  type UpdateRunParams,
};
