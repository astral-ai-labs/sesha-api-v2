/* ==========================================================================*/
// index.ts — Generate headlines step execution
/* ==========================================================================*/
// Purpose: Generate punchy headline and engaging content blobs
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
import type { VerboseLogger } from "@/domains/drafting/common/utils";
import { DEFAULT_STRUCTURED_MODEL } from "@/domains/drafting/common/defaults";

/* ==========================================================================*/
// Schema
/* ==========================================================================*/

const HeadlineAndBlobsSchema = z.object({
  headline: z.string().describe("A punchy, attention-grabbing headline that captures the most newsworthy development"),
  blobs: z.array(z.string()).describe("Array of short, punchy sentences covering core highlights of the story"),
});

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Generate punchy headline and engaging content blobs from extracted facts.
 */
async function generateHeadlines(request: GenerateHeadlinesRequest, stepConfig: StepConfig, verboseLogger?: VerboseLogger): Promise<GenerateHeadlinesResponse> {
  const userTemplateVariables = {
    numberOfBlobs: request.numberOfBlobs,
    instructions: request.instructions,
    source: request.sources[0],
    extractedFacts: request.context.extractedFacts,
    extractedFactsSummary: request.context.extractedFactsSummary,
  };

  // 2️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, undefined, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, undefined, PromptType.ASSISTANT);

  // 3️⃣ Log final prompts before AI call ----
  verboseLogger?.logStepPrompts(stepConfig.stepName, {
    system: formattedSystem,
    user: formattedUser,
    assistant: formattedAssistant,
  });

  // 4️⃣ Generate raw headline and blobs ----
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
    model: stepConfig.structuredModel || DEFAULT_STRUCTURED_MODEL,
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
  const response = createSuccessResponse(
    {
      finalizedHeadline: request.context.userSpecifiedHeadline || structuredResult.object.headline, // If the user specified a headline, use it, otherwise use the generated headline
      finalizedBlobs: structuredResult.object.blobs,
    },
    stepConfig.model,
    combinedUsage
  );

  // 7️⃣ Log step output ----
  verboseLogger?.logStepOutput(stepConfig.stepName, response.output);

  return response;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { generateHeadlines };
