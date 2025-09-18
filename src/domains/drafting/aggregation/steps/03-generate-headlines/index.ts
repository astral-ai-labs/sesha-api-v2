/* ==========================================================================*/
// index.ts — Generate headlines step execution
/* ==========================================================================*/
// Purpose: Generate punchy headline and engaging content blobs from source(s)
// Sections: Imports, Schema, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { z } from "zod";
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call/generateText";
import { simpleGenerateObject } from "@/core/ai/call/generateObject";

// Internal Modules ----
import { createSuccessResponse } from "@/domains/drafting/common/utils";
import type { GenerateHeadlinesRequest, GenerateHeadlinesResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Schema
/* ==========================================================================*/

const HeadlineAndBlobsSchema = z.object({
  headline: z.string().describe("A punchy, attention-grabbing headline based on Source 1 that captures the most newsworthy development"),
  blobs: z.array(z.string()).describe("Array of short, punchy sentences (10-20 words) covering core highlights across all sources"),
});

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Generate punchy headline and engaging content blobs from source facts.
 */
async function generateHeadlines(request: GenerateHeadlinesRequest, stepConfig: StepConfig): Promise<GenerateHeadlinesResponse> {
  // 1️⃣ Prepare template variables for aggregation ----
  const userTemplateVariables = {
    input: {
      noOfBlobs: request.numberOfBlobs,
      instructions: request.instructions,
    },
    sources: request.sources.map((source, index) => {
      // Get corresponding facts from step 01 and conditional step 02
      const factsResult = request.context.extractedFactsResults.find(result => result.sourceNumber === index + 1);
      const conditionalResult = request.context.extractedFactsConditionalResults.find(result => result.sourceNumber === index + 1);

      return {
        ...source,
        factsBitSplitting1: factsResult?.extractedFacts || "",
        factsBitSplitting2: conditionalResult?.factsBitSplitting2 || "",
      };
    }),
  };

  // 2️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, undefined, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, userTemplateVariables, PromptType.ASSISTANT);

  // 3️⃣ Generate raw headline and blobs ----
  const rawResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 4️⃣ Structure the output ----
  const structuredResult = await simpleGenerateObject({
    model: stepConfig.model,
    systemPrompt: "Do not change any word in the output. Just return the headline and blobs in the specified format. Do not add any other text or commentary. Verbatim.",
    userPrompt: "Output the headline and blobs in the specified format. Here is the raw output from the AI: " + rawResult.text,
    schema: HeadlineAndBlobsSchema,
    temperature: 0.1,
    maxTokens: 500,
  });

  // 5️⃣ Calculate combined usage ----
  const combinedUsage = {
    inputTokens: rawResult.usage.inputTokens + structuredResult.usage.inputTokens,
    outputTokens: rawResult.usage.outputTokens + structuredResult.usage.outputTokens,
    totalTokens: rawResult.usage.totalTokens + structuredResult.usage.totalTokens,
  };

  // 6️⃣ Structure response with usage tracking ----
  return createSuccessResponse(
    {
      generatedHeadline: structuredResult.object.headline,
      generatedBlobs: structuredResult.object.blobs,
    },
    stepConfig.model,
    combinedUsage
  );
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { generateHeadlines };
export type { GenerateHeadlinesRequest, GenerateHeadlinesResponse };
