/* ==========================================================================*/
// pipeline.ts — Digestion pipeline orchestration
/* ==========================================================================*/
// Purpose: Orchestrate the complete digestion pipeline from article to draft
// Sections: Imports, Pipeline Implementation

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import { inngest } from "@/core/inngest/client";
import { extractFacts } from "./steps/01-extract-facts";
import { summarizeFacts } from "./steps/02-summarize-facts";
import { generateHeadlines } from "./steps/03-generate-headlines";
import { createOutline } from "./steps/04-create-outline";
import { draftArticle } from "./steps/05-draft-article";
import { reviseArticle } from "./steps/06-revise-article";
import { addSourceAttribution } from "./steps/07-add-source-attribution";
import { getStepConfig, stepName } from "./steps.config";
import { getArticleAsPipelineRequest, createRunSkeleton, updateArticleStatus, updateRun } from "../common/operations";

/* ==========================================================================*/
// Pipeline Implementation
/* ==========================================================================*/

// RULES:
// Formatting prompts does not get wrapped within a step. its deterministic.
// The only stuff that gets wrapped within a step is the actual call to the AI, or if we need to do stuff like a DB call, other API call, stuff prone to failure.

export default inngest.createFunction(
  // Config
  {
    id: "run-drafting-digestion",
    onFailure: async ({ event }) => {
      // Mark article as failed when pipeline exhausts all retries
      // IMPORTANT: event.data.event.data.metadata.articleId is the articleId, different from event.data.metadata.articleId
      const articleId = event.data.event.data.metadata.articleId;
      await updateArticleStatus(articleId, "failed");
    },
  },
  // Trigger
  { event: "drafting/trigger/digestion" },
  // Handler
  async ({ event, step }) => {
    // 1️⃣ Extract metadata from event -----
    const { articleId, userId, draftType, lengthRange } = event.data.metadata;

    // 2️⃣ Run pipeline request and skeleton run in parallel -----
    const getPipelineRequest = step.run("get-pipeline-request", async () => {
      return await getArticleAsPipelineRequest(articleId);
    });

    const initializeRun = step.run("initialize-run", async () => {
      return await createRunSkeleton({
        articleId,
        triggeredByUserId: userId,
        ingestionType: draftType,
        length: lengthRange,
      });
    });

    // Wait for both steps to complete in parallel
    const [pipelineRequest, run] = await Promise.all([getPipelineRequest, initializeRun]);

    // 3️⃣ Update status to started -----
    await step.run("update-status-started", async () => {
      return await updateArticleStatus(articleId, "started");
    });

    const baseStepRequest = {
      sources: pipelineRequest.sources,
      instructions: pipelineRequest.instructions,
      numberOfBlobs: pipelineRequest.numberOfBlobs,
      lengthRange: pipelineRequest.lengthRange,
    };

    // 4️⃣ Extract facts from sources -----
    let stepName: stepName = "01-extract-facts";
    const extractedFacts = await step.run(stepName, async () => {
      // Build step request from pipeline data
      const extractFactsRequest = {
        ...baseStepRequest,
        context: {},
      };

      return await extractFacts(extractFactsRequest, getStepConfig(stepName));
    });

    // Update status after step 1
    await step.run("update-status-10", async () => {
      return await updateArticleStatus(articleId, "10%");
    });

    // 5️⃣ Summarize extracted facts -----
    stepName = "02-summarize-facts";
    const summarizedFacts = await step.run(stepName, async () => {
      // Build step request with extracted facts as context
      const summarizeFactsRequest = {
        ...baseStepRequest,
        context: {
          extractedFacts: extractedFacts.output.extractedFacts,
        },
      };

      return await summarizeFacts(summarizeFactsRequest, getStepConfig(stepName));
    });

    // Update status after step 2
    await step.run("update-status-20", async () => {
      return await updateArticleStatus(articleId, "20%");
    });

    // 6️⃣ Generate headlines -----
    stepName = "03-generate-headlines";
    const generatedHeadlines = await step.run(stepName, async () => {
      const generatedHeadlinesRequest = {
        ...baseStepRequest,
        context: {
          extractedFacts: extractedFacts.output.extractedFacts,
          extractedFactsSummary: summarizedFacts.output.extractedFactsSummary,
        },
      };
      return await generateHeadlines(generatedHeadlinesRequest, getStepConfig(stepName));
    });

    // Update status after step 3
    await step.run("update-status-30", async () => {
      return await updateArticleStatus(articleId, "30%");
    });

    // 7️⃣ Create article outline -----
    stepName = "04-create-outline";
    const createdOutline = await step.run(stepName, async () => {
      const createOutlineRequest = {
        ...baseStepRequest,
        context: {
          extractedFacts: extractedFacts.output.extractedFacts,
          extractedFactsSummary: summarizedFacts.output.extractedFactsSummary,
          generatedHeadline: generatedHeadlines.output.generatedHeadline,
          generatedBlobs: generatedHeadlines.output.generatedBlobs,
        },
      };
      return await createOutline(createOutlineRequest, getStepConfig(stepName));
    });

    // Update status after step 4
    await step.run("update-status-40", async () => {
      return await updateArticleStatus(articleId, "40%");
    });

    // 8️⃣ Draft article -----
    stepName = "05-draft-article";
    const draftedArticle = await step.run(stepName, async () => {
      const draftArticleRequest = {
        ...baseStepRequest,
        context: {
          extractedFacts: extractedFacts.output.extractedFacts,
          extractedFactsSummary: summarizedFacts.output.extractedFactsSummary,
          generatedHeadline: generatedHeadlines.output.generatedHeadline,
          generatedBlobs: generatedHeadlines.output.generatedBlobs,
          createdOutline: createdOutline.output.createdOutline,
        },
      };
      return await draftArticle(draftArticleRequest, getStepConfig(stepName));
    });

    // Update status after step 5
    await step.run("update-status-70", async () => {
      return await updateArticleStatus(articleId, "70%");
    });

    // 9️⃣ Revise article -----
    stepName = "06-revise-article";
    const revisedArticle = await step.run(stepName, async () => {
      const reviseArticleRequest = {
        ...baseStepRequest,
        context: {
          draftedArticle: draftedArticle.output.draftedArticle,
        },
      };
      return await reviseArticle(reviseArticleRequest, getStepConfig(stepName));
    });

    // Update status after step 6
    await step.run("update-status-90", async () => {
      return await updateArticleStatus(articleId, "90%");
    });

    // 🔟 Add source attribution -----
    stepName = "07-add-source-attribution";
    const attributedArticle = await step.run(stepName, async () => {
      const addSourceAttributionRequest = {
        ...baseStepRequest,
        context: {
          revisedArticle: revisedArticle.output.revisedArticle,
        },
      };
      return await addSourceAttribution(addSourceAttributionRequest, getStepConfig(stepName));
    });

    // Final status update to completed
    await step.run("update-status-completed", async () => {
      return await updateArticleStatus(articleId, "completed");
    });

    // Finalize run with aggregated usage data
    await step.run("finalize-run", async () => {
      // 1️⃣ Aggregate all token usage -----
      const allUsage = [
        ...extractedFacts.usage,
        ...summarizedFacts.usage,
        ...generatedHeadlines.usage,
        ...createdOutline.usage,
        ...draftedArticle.usage,
        ...revisedArticle.usage,
        ...attributedArticle.usage,
      ];

      const totalInputTokens = allUsage.reduce((sum, usage) => sum + usage.inputTokens, 0);
      const totalOutputTokens = allUsage.reduce((sum, usage) => sum + usage.outputTokens, 0);

      // 2️⃣ Update run with final usage data -----
      return await updateRun({
        id: run.id,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        // TODO: Calculate cost based on model usage and pricing
        costUsd: "0.00", // Placeholder for cost calculation
      });
    });

    return {
      pipelineRequest,
      run,
      extractedFacts,
      summarizedFacts,
      generatedHeadlines,
      createdOutline,
      draftedArticle,
      revisedArticle,
      attributedArticle,
    };
  }
);
