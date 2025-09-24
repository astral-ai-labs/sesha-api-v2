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
import { digestVerbatimConditional } from "./steps/04-digest-verbatim-conditional";
import { getStepConfig, stepName } from "./steps.config";
import { getArticleAsPipelineRequest, createRunSkeleton, updateArticleStatus, updateArticleStatusAndUsage, getCurrentUsageAndCost, finalizeDraft } from "../common/operations";
import { createVerboseLogger } from "../common/utils";

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
      // IMPORTANT: event.data.event.data.request.articleId is the articleId, different from event.data.request.articleId
      const articleId = event.data.event.data.request.articleId;

      // Get accumulated usage before marking as failed
      const currentUsage = await getCurrentUsageAndCost(articleId);

      // Mark article as failed
      await updateArticleStatus(articleId, "failed");

      return {
        success: false,
        totalTokenUsage: currentUsage.totalTokenUsage,
        totalCostUsd: currentUsage.totalCostUsd,
      };
    },
  },
  // Trigger
  { event: "drafting/trigger/digestion" },
  // Handler
  async ({ event, step, logger, runId }) => {
    // 1️⃣ Extract metadata from event -----
    const { articleId, userId, draftType, lengthRange } = event.data.request;

    // 2️⃣ Create verbose logger -----
    const verboseLogger = createVerboseLogger(logger, event.data.verbose, runId);

    // Log initial request once
    verboseLogger.logInitialRequest(event.data.request);

    // 3️⃣ Run pipeline request and skeleton run in parallel -----
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
    const [pipelineRequest] = await Promise.all([getPipelineRequest, initializeRun]);

    // 4️⃣ Check for verbatim mode -----
    const isVerbatim = pipelineRequest.sources.some((source) => source.flags.copySourceVerbatim);

    if (isVerbatim && event.data.verbose) {
      console.log("verbatim mode detected - Using shortened 4-step pipeline flow");
    }

    // 5️⃣ Update status to started -----
    await step.run("update-status-started", async () => {
      return await updateArticleStatus(articleId, "started");
    });

    const baseStepRequest = {
      sources: pipelineRequest.sources,
      instructions: pipelineRequest.instructions,
      numberOfBlobs: pipelineRequest.numberOfBlobs,
      lengthRange: pipelineRequest.lengthRange,
    };

    // 6️⃣ Extract facts from sources -----
    let stepName: stepName = "01-extract-facts";
    const extractedFacts = await step.run(stepName, async () => {
      // Build step request from pipeline data
      const extractFactsRequest = {
        ...baseStepRequest,
        context: {},
      };

      return await extractFacts(extractFactsRequest, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 1
    await step.run("update-status-usage-step-1", async () => {
      const progressPercent = isVerbatim ? "30%" : "10%";
      return await updateArticleStatusAndUsage(articleId, progressPercent, extractedFacts.usage);
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

      return await summarizeFacts(summarizeFactsRequest, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 2
    await step.run("update-status-usage-step-2", async () => {
      return await updateArticleStatusAndUsage(articleId, isVerbatim ? "60%" : "20%", summarizedFacts.usage);
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
      return await generateHeadlines(generatedHeadlinesRequest, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 3
    await step.run("update-status-usage-step-3", async () => {
      return await updateArticleStatusAndUsage(articleId, isVerbatim ? "80%" : "30%", generatedHeadlines.usage);
    });

    // 7️⃣ Handle verbatim flow -----
    if (isVerbatim) {
      // VERBATIM FLOW: Skip remaining steps and use verbatim processing
      stepName = "04-digest-verbatim-conditional";
      const verbatimResult = await step.run(stepName, async () => {
        const verbatimRequest = {
          ...baseStepRequest,
          context: {},
        };
        return await digestVerbatimConditional(verbatimRequest, getStepConfig(stepName), verboseLogger);
      });

      const formattedBlobsVerbatim = generatedHeadlines.output.generatedBlobs.join("\n");

      // Final step: finalize draft for verbatim
      const finalizedDraftVerbatim = await step.run("finalize-draft-verbatim", async () => {
        return await finalizeDraft(articleId, userId, {
          draftType: draftType,
          headline: generatedHeadlines.output.generatedHeadline,
          blob: formattedBlobsVerbatim,
          content: verbatimResult.output.digestedVerbatim,
          userSpecifiedHeadline: pipelineRequest.userSpecifiedHeadline,
        });
      });

      // Final step: accumulate verbatim usage and mark completed
      const finalResult = await step.run("finalize-verbatim-completed", async () => {
        return await updateArticleStatusAndUsage(articleId, "completed", verbatimResult.usage);
      });

      // Send completion email
      await step.run("send-completion-email-verbatim", async () => {
        const emailPayload = {
          to: [finalizedDraftVerbatim.userInfo.email],
          subject: `Article Complete: ${pipelineRequest.userSpecifiedHeadline || generatedHeadlines.output.generatedHeadline} version ${finalizedDraftVerbatim.article.version}`,
          articleHref: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/article?slug=${finalizedDraftVerbatim.article.slug}&version=${finalizedDraftVerbatim.article.version}`,
          name: finalizedDraftVerbatim.userInfo.firstName || "there",
          slug: finalizedDraftVerbatim.article.slug,
          version: finalizedDraftVerbatim.article.version,
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/drafting/send-completion-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
          throw new Error(`Failed to send completion email: ${response.statusText}`);
        }

        return await response.json();
      });

      // Verbose logs are automatically handled by Inngest logger

      return {
        success: true,
        totalTokenUsage: finalResult.totalTokenUsage,
        totalCostUsd: finalResult.totalCostUsd,
      };
    }

    // 8️⃣ Create article outline (normal flow) -----
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
      return await createOutline(createOutlineRequest, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 4
    await step.run("update-status-usage-40", async () => {
      return await updateArticleStatusAndUsage(articleId, "40%", createdOutline.usage);
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
      return await draftArticle(draftArticleRequest, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after major step (drafting)
    await step.run("update-status-usage-70", async () => {
      return await updateArticleStatusAndUsage(articleId, "70%", draftedArticle.usage);
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
      return await reviseArticle(reviseArticleRequest, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 6
    await step.run("update-status-usage-90", async () => {
      return await updateArticleStatusAndUsage(articleId, "90%", revisedArticle.usage);
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
      return await addSourceAttribution(addSourceAttributionRequest, getStepConfig(stepName), verboseLogger);
    });

    const formattedBlobs = generatedHeadlines.output.generatedBlobs.join("\n");

    // Final step: finalize draft
    const finalizedDraft = await step.run("finalize-draft", async () => {
      return await finalizeDraft(articleId, userId, {
        draftType: draftType,
        headline: generatedHeadlines.output.generatedHeadline,
        blob: formattedBlobs,
        content: attributedArticle.output.attributedArticle,
        userSpecifiedHeadline: pipelineRequest.userSpecifiedHeadline,
      });
    });

    // Final step: accumulate final usage and mark completed
    const finalResult = await step.run("finalize-completed", async () => {
      return await updateArticleStatusAndUsage(articleId, "completed", attributedArticle.usage);
    });

    // Send completion email
    await step.run("send-completion-email", async () => {
      const emailPayload = {
        to: [finalizedDraft.userInfo.email],
        subject: `Article Complete: ${pipelineRequest.userSpecifiedHeadline || generatedHeadlines.output.generatedHeadline} version ${finalizedDraft.article.version}`,
        articleHref: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/article?slug=${finalizedDraft.article.slug}&version=${finalizedDraft.article.version}`,
        name: finalizedDraft.userInfo.firstName || "there",
        slug: finalizedDraft.article.slug,
        version: finalizedDraft.article.version,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/drafting/send-completion-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to send completion email: ${response.statusText}`);
      }

      return await response.json();
    });

    // Verbose logs are automatically handled by Inngest logger

    return {
      success: true,
      totalTokenUsage: finalResult.totalTokenUsage,
      totalCostUsd: finalResult.totalCostUsd,
    };
  }
);
