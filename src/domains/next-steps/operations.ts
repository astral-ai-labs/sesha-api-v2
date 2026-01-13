/* ==========================================================================*/
// operations.ts — Next Steps data operations
/* ==========================================================================*/
// Purpose: Handle article data retrieval and storage for next steps functionality
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { eq, and, gt, asc } from "drizzle-orm";

// Internal Modules ----
import { db, articles } from "@/core/db";
import type { NextStepsResponse } from "./types";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Retrieves article content by slug and version for next steps generation.
 */
async function getArticleContentBySlugAndVersion(orgId: number, slug: string, version: string): Promise<string | null> {
  const articleResult = await db
    .select({ content: articles.content })
    .from(articles)
    .where(and(eq(articles.orgId, orgId), eq(articles.slug, slug), eq(articles.version, version)))
    .limit(1);

  if (!articleResult.length) {
    return null;
  }

  return articleResult[0].content;
}

/**
 * Saves next steps to a specific article version.
 */
async function saveNextStepsForVersion(
  orgId: number,
  slug: string,
  version: string,
  nextSteps: NextStepsResponse,
  triggeredByUserId: string,
  triggeredAtVersion: string
): Promise<void> {
  await db
    .update(articles)
    .set({
      nextSteps,
      nextStepsTriggeredByUserId: triggeredByUserId,
      nextStepsTriggeredAtVersion: triggeredAtVersion,
    })
    .where(and(eq(articles.orgId, orgId), eq(articles.slug, slug), eq(articles.version, version)));
}

/**
 * Propagates next steps to subsequent versions that were triggered at the current version.
 * Returns the number of versions updated.
 */
async function propagateNextStepsToSubsequentVersions(
  orgId: number,
  slug: string,
  currentVersion: string,
  nextSteps: NextStepsResponse,
  triggeredByUserId: string,
  triggeredAtVersion: string
): Promise<number> {
  // 1️⃣ Get all subsequent versions ordered ascending ----
  const subsequentVersions = await db
    .select({ version: articles.version, nextStepsTriggeredAtVersion: articles.nextStepsTriggeredAtVersion })
    .from(articles)
    .where(and(eq(articles.orgId, orgId), eq(articles.slug, slug), gt(articles.version, currentVersion)))
    .orderBy(asc(articles.version));

  if (!subsequentVersions.length) {
    return 0;
  }

  // 2️⃣ Find versions to update (where nextStepsTriggeredAtVersion equals current version) ----
  const versionsToUpdate: string[] = [];
  for (const row of subsequentVersions) {
    if (row.nextStepsTriggeredAtVersion === currentVersion) {
      versionsToUpdate.push(row.version);
    }
  }

  if (!versionsToUpdate.length) {
    return 0;
  }

  // 3️⃣ Update all versions that need updating ----
  for (const version of versionsToUpdate) {
    await db
      .update(articles)
      .set({
        nextSteps,
        nextStepsTriggeredByUserId: triggeredByUserId,
        nextStepsTriggeredAtVersion: triggeredAtVersion,
      })
      .where(and(eq(articles.orgId, orgId), eq(articles.slug, slug), eq(articles.version, version)));
  }

  return versionsToUpdate.length;
}

/**
 * Saves next steps and propagates to subsequent versions.
 * Returns the total number of versions updated (including current).
 */
async function saveAndPropagateNextSteps(
  orgId: number,
  slug: string,
  version: string,
  nextSteps: NextStepsResponse,
  triggeredByUserId: string
): Promise<{ currentUpdated: boolean; propagatedCount: number }> {
  // 1️⃣ Save to current version ----
  await saveNextStepsForVersion(orgId, slug, version, nextSteps, triggeredByUserId, version);

  // 2️⃣ Propagate to subsequent versions ----
  const propagatedCount = await propagateNextStepsToSubsequentVersions(
    orgId,
    slug,
    version,
    nextSteps,
    triggeredByUserId,
    version
  );

  return { currentUpdated: true, propagatedCount };
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export {
  getArticleContentBySlugAndVersion,
  saveNextStepsForVersion,
  propagateNextStepsToSubsequentVersions,
  saveAndPropagateNextSteps,
};
