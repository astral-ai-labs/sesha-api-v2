/* ==========================================================================*/
// function.ts — Next Steps Inngest function
/* ==========================================================================*/
// Purpose: Inngest function for async next steps generation with logging
// Sections: Imports, Types, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Core Modules ----
import { inngest } from "@/core/inngest/client";

// Internal Modules ----
import { getArticleContentBySlugAndVersion, saveAndPropagateNextSteps } from "./operations";
import { generateNextSteps } from "./service";

/* ==========================================================================*/
// Types
/* ==========================================================================*/

interface NextStepsInngestEvent {
  data: {
    orgId: number;
    slug: string;
    version: string;
  };
}

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

const nextStepsFunction = inngest.createFunction(
  { id: "generate-next-steps", retries: 2 },
  { event: "next-steps/trigger/generate" },
  async ({ event, step, logger }) => {
    const { orgId, slug, version } = event.data;

    logger.info("Next steps generation started", { orgId, slug, version });

    // 1️⃣ Fetch article content ----
    const articleContent = await step.run("fetch-article-content", async () => {
      const content = await getArticleContentBySlugAndVersion(orgId, slug, version);
      if (!content) {
        throw new Error(`Article not found: ${slug} v${version}`);
      }
      logger.info("Article content fetched", { slug, version, contentLength: content.length });
      return content;
    });

    // 2️⃣ Generate next steps ----
    const result = await step.run("generate-next-steps", async () => {
      const nextStepsResult = await generateNextSteps(articleContent);
      logger.info("Next steps generated", {
        slug,
        version,
        mustDoCount: nextStepsResult.response.mustDo.length,
        importantCount: nextStepsResult.response.important.length,
        optionalCount: nextStepsResult.response.optional.length,
        linksCount: nextStepsResult.response.linksToSources.length,
        usage: nextStepsResult.usage,
      });
      return nextStepsResult;
    });

    // 3️⃣ Save and propagate to database ----
    const saveResult = await step.run("save-next-steps", async () => {
      const { currentUpdated, propagatedCount } = await saveAndPropagateNextSteps(
        orgId,
        slug,
        version,
        result.response
      );
      logger.info("Next steps saved to database", {
        slug,
        version,
        currentUpdated,
        propagatedCount,
      });
      return { currentUpdated, propagatedCount };
    });

    return {
      success: true,
      response: result.response,
      usage: result.usage,
      saved: saveResult,
    };
  }
);

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { nextStepsFunction, type NextStepsInngestEvent };
