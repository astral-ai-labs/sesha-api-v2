/* ==========================================================================*/
// operations.ts — Next Steps data operations
/* ==========================================================================*/
// Purpose: Handle article data retrieval for next steps functionality
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { eq, and } from "drizzle-orm";

// Internal Modules ----
import { db, articles } from "@/core/db";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Retrieves article content by slug and version for next steps generation.
 */
async function getArticleContentBySlugAndVersion(orgId: number, slug: string, version: string): Promise<string | null> {
  // 1️⃣ Query for article content -----
  const articleResult = await db
    .select({
      content: articles.content,
    })
    .from(articles)
    .where(and(eq(articles.orgId, orgId), eq(articles.slug, slug), eq(articles.version, version)))
    .limit(1);

  // 2️⃣ Return null if not found -----
  if (!articleResult.length) {
    return null;
  }

  return articleResult[0].content;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { getArticleContentBySlugAndVersion };
