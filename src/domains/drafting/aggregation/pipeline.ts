/* ==========================================================================*/
// pipeline.ts — Aggregation pipeline orchestration
/* ==========================================================================*/
// Purpose: Orchestrate the complete aggregation pipeline from multiple sources to draft
// Sections: Imports, Pipeline Implementation
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Internal Modules ----
import { inngest } from "@/core/inngest/client";
import { extractFacts } from "./steps/01-extract-facts";
import { extractFactsConditional } from "./steps/02-extract-facts-conditional";
import { generateHeadlines } from "./steps/03-generate-headlines";
// TODO: Import remaining steps when implemented
// import { createOutline } from "./steps/04-create-outline";
// import { draftArticle } from "./steps/05-draft-article";
// import { reviseArticle } from "./steps/06-revise-article";
// import { addSourceAttribution } from "./steps/07-source-attribution";
// import { applyColorCoding } from "./steps/08-apply-color-coding";
import { getStepConfig, stepName } from "./steps.config";
import { getArticleAsPipelineRequest, createRunSkeleton, updateArticleStatus, updateRun } from "../common/operations";

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

// Internal Modules ----
import type { Source } from "../common/types/_primitives";
import type { LLMTokenUsage } from "@/core/usage/types";

interface SourceFactsResult {
  sourceNumber: number;
  extractedFacts: string;
  usage: LLMTokenUsage[];
}

interface SourceFactsConditionalResult {
  sourceNumber: number;
  factsBitSplitting2: string;
  usage: LLMTokenUsage[];
}

/* ==========================================================================*/
// Pipeline Implementation
/* ==========================================================================*/

// RULES:
// Formatting prompts does not get wrapped within a step. its deterministic.
// The only stuff that gets wrapped within a step is the actual call to the AI, or if we need to do stuff like a DB call, other API call, stuff prone to failure.
// Aggregation processes multiple sources in parallel for steps 01 and 02, then sequentially for remaining steps.

export default inngest.createFunction(
  // Config
  {
    id: "run-drafting-aggregation",
    onFailure: async ({ event }) => {
      // Mark article as failed when pipeline exhausts all retries
      // IMPORTANT: event.data.event.data.metadata.articleId is the articleId, different from event.data.metadata.articleId
      const articleId = event.data.event.data.metadata.articleId;
      await updateArticleStatus(articleId, "failed");
    },
  },
  // Trigger
  { event: "drafting/trigger/aggregation" },
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

    // 3️⃣ Validate multiple sources for aggregation -----
    if (!pipelineRequest.sources || pipelineRequest.sources.length === 0) {
      throw new Error("Aggregation pipeline requires at least one source");
    }

    if (pipelineRequest.sources.length === 1) {
      throw new Error("Aggregation pipeline requires multiple sources. Use digestion for single source.");
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
    const extractedFactsResults = await step.run(stepName, async () => {
      // 1️⃣ Create parallel step execution for each source -----
      const parallelExtractions = pipelineRequest.sources.map((source: Source, index: number) => 
        step.run(`extract-facts-source-${source.number}`, async () => {
          // Build single-source request for this source
          const singleSourceRequest = {
            ...baseStepRequest,
            sources: [source], // Single source per parallel execution
            context: {},
          };
          
          const result = await extractFacts(singleSourceRequest, getStepConfig(stepName));
          
          return {
            sourceNumber: source.number,
            extractedFacts: result.output.extractedFacts,
            usage: result.usage,
          } as SourceFactsResult;
        })
      );

      // 2️⃣ Wait for all parallel extractions to complete -----
      const results = await Promise.all(parallelExtractions);
      
      // 3️⃣ Aggregate usage data -----
      const totalUsage = results.flatMap((result: SourceFactsResult) => result.usage);
      
      return {
        extractedFactsResults: results,
        totalUsage,
      };
    });

    // Update status after step 1
    await step.run("update-status-10", async () => {
      return await updateArticleStatus(articleId, "10%");
    });

    // 6️⃣ Extract facts conditional from all sources in parallel -----
    stepName = "02-extract-facts-conditional";
    const extractedFactsConditional = await step.run(stepName, async () => {
      // 1️⃣ Create parallel step execution for each source -----
      const parallelConditionalExtractions = pipelineRequest.sources.map((source: Source, index: number) => 
        step.run(`extract-facts-conditional-source-${source.number}`, async () => {
          // Build single-source request with step 01 results as context
          const singleSourceRequest = {
            ...baseStepRequest,
            sources: [source], // Single source per parallel execution
            context: {
              extractedFactsResults: extractedFactsResults.extractedFactsResults as SourceFactsResult[],
            },
          };
          
          const result = await extractFactsConditional(singleSourceRequest, getStepConfig(stepName));
          
          return {
            sourceNumber: source.number,
            factsBitSplitting2: result.output.factsBitSplitting2,
            usage: result.usage,
          } as SourceFactsConditionalResult;
        })
      );

      // 2️⃣ Wait for all parallel conditional extractions to complete -----
      const results = await Promise.all(parallelConditionalExtractions);
      
      // 3️⃣ Aggregate usage data -----
      const totalUsage = results.flatMap((result: SourceFactsConditionalResult) => result.usage);
      
      return {
        extractedFactsConditionalResults: results,
        totalUsage,
      };
    });

    // Update status after step 2
    await step.run("update-status-20", async () => {
      return await updateArticleStatus(articleId, "20%");
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
      return await generateHeadlines(request, getStepConfig(stepName));
    });

    // Update status after step 3
    await step.run("update-status-30", async () => {
      return await updateArticleStatus(articleId, "30%");
    });

    // TODO: Step 04 - Create outline (sequential)
    // stepName = "04-create-outline";
    // const createdOutline = await step.run(stepName, async () => {
    //   const request = {
    //     ...baseStepRequest,
    //     sources: pipelineRequest.sources,
    //     context: {
    //       extractedFactsResults: extractedFactsResults.extractedFactsResults,
    //       extractedFactsConditionalResults: extractedFactsConditional.extractedFactsConditionalResults,
    //       generatedHeadline: generatedHeadlines.output.generatedHeadline,
    //       generatedBlobs: generatedHeadlines.output.generatedBlobs,
    //     },
    //   };
    //   return await createOutline(request, getStepConfig(stepName));
    // });

    // TODO: Update status after step 4
    // await step.run("update-status-40", async () => {
    //   return await updateArticleStatus(articleId, "40%");
    // });

    // TODO: Step 05 - Draft article (sequential)
    // stepName = "05-draft-article";
    // const draftedArticle = await step.run(stepName, async () => {
    //   const request = {
    //     ...baseStepRequest,
    //     sources: pipelineRequest.sources,
    //     context: {
    //       extractedFactsResults: extractedFactsResults.extractedFactsResults,
    //       extractedFactsConditionalResults: extractedFactsConditional.extractedFactsConditionalResults,
    //       generatedHeadline: generatedHeadlines.output.generatedHeadline,
    //       generatedBlobs: generatedHeadlines.output.generatedBlobs,
    //       createdOutline: createdOutline.output.createdOutline,
    //     },
    //   };
    //   return await draftArticle(request, getStepConfig(stepName));
    // });

    // TODO: Update status after step 5
    // await step.run("update-status-70", async () => {
    //   return await updateArticleStatus(articleId, "70%");
    // });

    // TODO: Step 06 - Revise article (sequential)
    // stepName = "06-revise-article";
    // const revisedArticle = await step.run(stepName, async () => {
    //   const request = {
    //     ...baseStepRequest,
    //     sources: pipelineRequest.sources,
    //     context: {
    //       draftedArticle: draftedArticle.output.draftedArticle,
    //     },
    //   };
    //   return await reviseArticle(request, getStepConfig(stepName));
    // });

    // TODO: Update status after step 6
    // await step.run("update-status-80", async () => {
    //   return await updateArticleStatus(articleId, "80%");
    // });

    // TODO: Step 07 - Source attribution (sequential)
    // stepName = "07-source-attribution";
    // const attributedArticle = await step.run(stepName, async () => {
    //   const request = {
    //     ...baseStepRequest,
    //     sources: pipelineRequest.sources,
    //     context: {
    //       revisedArticle: revisedArticle.output.revisedArticle,
    //     },
    //   };
    //   return await addSourceAttribution(request, getStepConfig(stepName));
    // });

    // TODO: Update status after step 7
    // await step.run("update-status-90", async () => {
    //   return await updateArticleStatus(articleId, "90%");
    // });

    // TODO: Step 08 - Apply color coding (sequential, final step)
    // stepName = "08-apply-color-coding";
    // const colorCodedArticle = await step.run(stepName, async () => {
    //   const request = {
    //     ...baseStepRequest,
    //     sources: pipelineRequest.sources,
    //     context: {
    //       attributedArticle: attributedArticle.output.attributedArticle,
    //     },
    //   };
    //   return await applyColorCoding(request, getStepConfig(stepName));
    // });

    // TODO: Final status update to completed
    // await step.run("update-status-completed", async () => {
    //   return await updateArticleStatus(articleId, "completed");
    // });

    // TODO: Finalize run with aggregated usage data
    // await step.run("finalize-run", async () => {
    //   // 1️⃣ Aggregate all token usage from all steps -----
    //   const allUsage = [
    //     ...extractedFactsResults.totalUsage,
    //     ...extractedFactsConditional.totalUsage,
    //     ...generatedHeadlines.usage,
    //     ...createdOutline.usage,
    //     ...draftedArticle.usage,
    //     ...revisedArticle.usage,
    //     ...attributedArticle.usage,
    //     ...colorCodedArticle.usage,
    //   ];

    //   const totalInputTokens = allUsage.reduce((sum, usage) => sum + usage.inputTokens, 0);
    //   const totalOutputTokens = allUsage.reduce((sum, usage) => sum + usage.outputTokens, 0);

    //   // 2️⃣ Update run with final usage data -----
    //   return await updateRun({
    //     id: run.id,
    //     inputTokens: totalInputTokens,
    //     outputTokens: totalOutputTokens,
    //     // TODO: Calculate cost based on model usage and pricing
    //     costUsd: "0.00", // Placeholder for cost calculation
    //   });
    // });

    // TODO: Return aggregated results from all steps
    return {
      pipelineRequest,
      run,
      extractedFactsResults: extractedFactsResults.extractedFactsResults,
      extractedFactsConditional: extractedFactsConditional.extractedFactsConditionalResults,
      generatedHeadlines,
      // createdOutline,
      // draftedArticle,
      // revisedArticle,
      // attributedArticle,
      // colorCodedArticle,
    };
  }
);