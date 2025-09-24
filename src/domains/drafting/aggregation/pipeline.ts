/* ==========================================================================*/
// pipeline.ts — Aggregation pipeline orchestration
/* ==========================================================================*/
// Purpose: Orchestrate the complete aggregation pipeline from source(s) to draft
// Sections: Imports, Pipeline Implementation
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ----
import { inngest } from "@/core/inngest/client";

// Internal Modules ----
import { extractFacts } from "./steps/01-extract-facts";
import { extractFactsConditional } from "./steps/02-extract-facts-conditional";
import { generateHeadlines } from "./steps/03-generate-headlines";
import { createOutline } from "./steps/04-create-outline";
import { draftArticle } from "./steps/05-draft-article";
import { reviseArticle } from "./steps/06-revise-article";
import { addSourceAttribution } from "./steps/07-source-attribution";
import { applyColorCoding } from "./steps/08-apply-color-coding";
// import { detectRips } from "./steps/09-detect-rips";
import { getStepConfig, stepName } from "./steps.config";
import { getArticleAsPipelineRequest, createRunSkeleton, updateArticleStatus, updateArticleStatusAndUsage, getCurrentUsageAndCost, finalizeDraft } from "../common/operations";
import { createVerboseLogger } from "../common/utils";
import type { Source } from "../common/types/primitives";
import type { SourceFactsResult, SourceFactsConditionalResult } from "./steps/02-extract-facts-conditional/types";

/* ==========================================================================*/
// Pipeline Implementation
/* ==========================================================================*/

// RULES:
// Formatting prompts does not get wrapped within a step. its deterministic.
// The only stuff that gets wrapped within a step is the actual call to the AI, or if we need to do stuff like a DB call, other API call, stuff prone to failure.
// Aggregation processes sources in parallel for steps 01 and 02, then sequentially for remaining steps.

export default inngest.createFunction(
  // Config
  {
    id: "run-drafting-aggregation",
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
  { event: "drafting/trigger/aggregation" },
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

    // 3️⃣ Validate sources for aggregation -----
    if (!pipelineRequest.sources || pipelineRequest.sources.length === 0) {
      throw new Error("Aggregation pipeline requires at least one source");
    }

    // 4️⃣ Update status to started -----
    await step.run("update-status-started", async () => {
      return await updateArticleStatus(articleId, "started");
    });

    const baseStepRequest = {
      instructions: pipelineRequest.instructions,
      numberOfBlobs: pipelineRequest.numberOfBlobs,
      lengthRange: pipelineRequest.lengthRange,
    };

    // 5️⃣ Extract facts from all sources in parallel -----
    let stepName: stepName = "01-extract-facts";

    // Create parallel step execution for each source (not nested)
    const parallelExtractions = pipelineRequest.sources.map((source: Source) =>
      step.run(`extract-facts-source-${source.number}`, async () => {
        // Build single-source request for this source
        const singleSourceRequest = {
          ...baseStepRequest,
          sources: [source], // Single source per parallel execution
          context: {},
        };

        const result = await extractFacts(singleSourceRequest, getStepConfig(stepName), verboseLogger);

        return {
          sourceNumber: source.number,
          extractedFacts: result.output.extractedFacts,
          usage: result.usage,
        } as SourceFactsResult;
      })
    );

    // Wait for all parallel extractions to complete
    const extractedFactsResults = {
      extractedFactsResults: await Promise.all(parallelExtractions),
      get totalUsage() {
        return this.extractedFactsResults.flatMap((result: SourceFactsResult) => result.usage);
      },
    };

    // Update status and accumulate usage after step 1
    await step.run("update-status-usage-10", async () => {
      return await updateArticleStatusAndUsage(articleId, "10%", extractedFactsResults.totalUsage);
    });

    // 6️⃣ Extract facts conditional from all sources in parallel -----
    stepName = "02-extract-facts-conditional";

    // Create parallel step execution for each source (not nested)
    const parallelConditionalExtractions = pipelineRequest.sources.map((source: Source) =>
      step.run(`extract-facts-conditional-source-${source.number}`, async () => {
        // Build single-source request with step 01 results as context
        const singleSourceRequest = {
          ...baseStepRequest,
          sources: [source], // Single source per parallel execution
          context: {
            extractedFactsResults: extractedFactsResults.extractedFactsResults as SourceFactsResult[],
          },
        };

        const result = await extractFactsConditional(singleSourceRequest, getStepConfig(stepName), verboseLogger);

        return {
          sourceNumber: source.number,
          factsBitSplitting2: result.output.factsBitSplitting2,
          usage: result.usage,
        } as SourceFactsConditionalResult;
      })
    );

    // Wait for all parallel conditional extractions to complete
    const extractedFactsConditional = {
      extractedFactsConditionalResults: await Promise.all(parallelConditionalExtractions),
      get totalUsage() {
        return this.extractedFactsConditionalResults.flatMap((result: SourceFactsConditionalResult) => result.usage);
      },
    };

    // Update status and accumulate usage after step 2
    await step.run("update-status-usage-20", async () => {
      return await updateArticleStatusAndUsage(articleId, "20%", extractedFactsConditional.totalUsage);
    });

    // 7️⃣ Generate headlines (sequential, uses all source results) -----
    stepName = "03-generate-headlines";
    const generatedHeadlines = await step.run(stepName, async () => {
      const request = {
        ...baseStepRequest,
        sources: pipelineRequest.sources,
        context: {
          extractedFactsResults: extractedFactsResults.extractedFactsResults as SourceFactsResult[],
          extractedFactsConditionalResults: extractedFactsConditional.extractedFactsConditionalResults as SourceFactsConditionalResult[],
        },
      };
      return await generateHeadlines(request, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 3
    await step.run("update-status-usage-30", async () => {
      return await updateArticleStatusAndUsage(articleId, "30%", generatedHeadlines.usage);
    });

    // 8️⃣ Create outline (sequential, uses all source results) -----
    stepName = "04-create-outline";
    const createdOutline = await step.run(stepName, async () => {
      const request = {
        ...baseStepRequest,
        sources: pipelineRequest.sources,
        context: {
          extractedFactsResults: extractedFactsResults.extractedFactsResults as SourceFactsResult[],
          extractedFactsConditionalResults: extractedFactsConditional.extractedFactsConditionalResults as SourceFactsConditionalResult[],
          generatedHeadline: generatedHeadlines.output.generatedHeadline,
          generatedBlobs: generatedHeadlines.output.generatedBlobs,
        },
      };
      return await createOutline(request, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 4
    await step.run("update-status-usage-40", async () => {
      return await updateArticleStatusAndUsage(articleId, "40%", createdOutline.usage);
    });

    // 9️⃣ Draft article (sequential, uses all source results) -----
    stepName = "05-draft-article";
    const draftedArticle = await step.run(stepName, async () => {
      const request = {
        ...baseStepRequest,
        sources: pipelineRequest.sources,
        context: {
          extractedFactsResults: extractedFactsResults.extractedFactsResults as SourceFactsResult[],
          extractedFactsConditionalResults: extractedFactsConditional.extractedFactsConditionalResults as SourceFactsConditionalResult[],
          generatedHeadlines: generatedHeadlines.output.generatedHeadline,
          generatedBlobs: generatedHeadlines.output.generatedBlobs,
          createdOutline: createdOutline.output.createdOutline,
        },
      };
      return await draftArticle(request, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 5
    await step.run("update-status-usage-60", async () => {
      return await updateArticleStatusAndUsage(articleId, "60%", draftedArticle.usage);
    });

    // 🔟 Revise article (sequential) -----
    stepName = "06-revise-article";
    const revisedArticle = await step.run(stepName, async () => {
      const request = {
        ...baseStepRequest,
        sources: pipelineRequest.sources,
        context: {
          draftedArticle: draftedArticle.output.draftedArticle,
        },
      };
      return await reviseArticle(request, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 6
    await step.run("update-status-usage-70", async () => {
      return await updateArticleStatusAndUsage(articleId, "70%", revisedArticle.usage);
    });

    // 1️⃣1️⃣ Add source attribution (sequential) -----
    stepName = "07-source-attribution";
    const attributedArticle = await step.run(stepName, async () => {
      const request = {
        ...baseStepRequest,
        sources: pipelineRequest.sources,
        context: {
          revisedArticle: revisedArticle.output.revisedArticle,
        },
      };
      return await addSourceAttribution(request, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 7
    await step.run("update-status-usage-90", async () => {
      return await updateArticleStatusAndUsage(articleId, "90%", attributedArticle.usage);
    });

    // 1️⃣2️⃣ Apply color coding (sequential) -----
    stepName = "08-apply-color-coding";
    const colorCodedArticle = await step.run(stepName, async () => {
      const request = {
        ...baseStepRequest,
        sources: pipelineRequest.sources,
        context: {
          attributedArticle: attributedArticle.output.attributedArticle,
        },
      };
      return await applyColorCoding(request, getStepConfig(stepName), verboseLogger);
    });

    // Update status and accumulate usage after step 8
    // TODO: add back when we reimplement the rip step
    // await step.run("update-status-usage-90", async () => {
    //   return await updateArticleStatusAndUsage(articleId, "90%", colorCodedArticle.usage);
    // });

    // 1️⃣3️⃣ Detect rips (sequential, final step) -----
    // stepName = "09-detect-rips";
    // const ripAnalysis = await step.run(stepName, async () => {
    //   const request = {
    //     ...baseStepRequest,
    //     sources: pipelineRequest.sources,
    //     context: {
    //       colorCodedArticle: colorCodedArticle.output.richContent,
    //     },
    //   };
    //   return await detectRips(request, getStepConfig(stepName), verboseLogger);
    // });

    // TODO: Remove when we reimplement the step
    const ripAnalysis = {
      output: {
        overallRipScore: 0,
        overallRipAnalysis: "",
        ripComparisons: [],
      },
    };

    const formattedBlobs = generatedHeadlines.output.generatedBlobs.join("\n");

    // Final step: finalize draft
    const finalizedDraft = await step.run("finalize-draft", async () => {
      return await finalizeDraft(articleId, userId, {
        draftType: draftType,
        headline: generatedHeadlines.output.generatedHeadline,
        blob: formattedBlobs,
        content: colorCodedArticle.output.content,
        richContent: colorCodedArticle.output.richContent,
        userSpecifiedHeadline: pipelineRequest.userSpecifiedHeadline,
        ripScore: ripAnalysis.output.overallRipScore,
        ripAnalysis: ripAnalysis.output.overallRipAnalysis,
        ripComparisons: ripAnalysis.output.ripComparisons,
      });
    });

    // Final step: accumulate final usage and mark completed
    const finalResult = await step.run("finalize-completed", async () => {
      return await updateArticleStatusAndUsage(articleId, "completed", colorCodedArticle.usage);
    });

    // Send completion email
    await step.run("send-completion-email", async () => {
      const emailPayload = {
        to: [finalizedDraft.userInfo.email],
        subject: `Article Complete: ${generatedHeadlines.output.generatedHeadline} version ${finalizedDraft.article.version}`,
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

    return {
      success: true,
      totalTokenUsage: finalResult.totalTokenUsage,
      totalCostUsd: finalResult.totalCostUsd,
    };
  }
);
