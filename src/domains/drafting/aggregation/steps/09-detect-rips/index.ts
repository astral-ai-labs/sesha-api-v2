/* ==========================================================================*/
// index.ts — Detect Rips step execution
/* ==========================================================================*/
// Purpose: Detect Rips in final article based on source attribution
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Core AI Modules ----
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
// import { simpleGenerateText } from "@/core/ai/call/generateText";
import { simpleGenerateObject } from "@/core/ai/call/generateObject";

// Internal Modules ----
import { createSuccessResponse } from "@/domains/drafting/common/utils";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import type { VerboseLogger } from "@/domains/drafting/common/utils";
import { DEFAULT_STRUCTURED_MODEL } from "@/domains/drafting/common/defaults";
import { z } from "zod";

// Local Modules ----
import { extractLexicalDisplayText } from "./helpers";
import type { DetectRipsRequest, DetectRipsResponse } from "./types";

/* ==========================================================================*/
// Schema
/* ==========================================================================*/

const RipAnalysisSchema = z.object({
  overallRipAnalysis: z.string().describe("Your detailed analysis of the article's originality vs source similarity"),
  overallRipScore: z.number().describe("0-100 score of the article's originality vs source similarity"),
  ripComparisons: z
    .array(
      z.object({
        articleQuote: z.string().describe("exact text from article"),
        sourceQuote: z.string().describe("exact text from source"),
        sourceNumber: z.number().describe("1-6"),
        ripAnalysis: z.string().describe("why this constitutes a rip"),
      })
    )
    .describe("Array of rip comparisons"),
});

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Detect Rips in final article based on source attribution
 */
export async function detectRips(request: DetectRipsRequest, stepConfig: StepConfig, verboseLogger?: VerboseLogger): Promise<DetectRipsResponse> {
  console.log("request.context.colorCodedArticle", request.context.colorCodedArticle);

  // 1️⃣ Clean up the article ----
  const colorCleanedArticle = extractLexicalDisplayText(request.context.colorCodedArticle);

  console.log("colorCleanedArticle", colorCleanedArticle);

  // 2️⃣ Prepare template variables ----
  const userTemplateVariables = {
    colorCleanedArticle: colorCleanedArticle,
    sources: request.sources,
  };

  // 3️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  //  4️⃣ Format the prompts ----
  const formattedSystem = formatPrompt(prompts.systemTemplate, undefined, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, undefined, PromptType.ASSISTANT);

  // 5️⃣ Log final prompts before AI call ----
  verboseLogger?.logStepPrompts(stepConfig.stepName, {
    system: formattedSystem,
    user: formattedUser,
    assistant: formattedAssistant,
  });

  // 7️⃣ Structure the output ----

  const structuredResult = await simpleGenerateObject({
    model: stepConfig.structuredModel || DEFAULT_STRUCTURED_MODEL,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    schema: RipAnalysisSchema,
    temperature: 0.1,
    maxTokens: 4000,
  });

  // 8️⃣ Calculate combined usage ----
//   TODO: Remove if we keep the structured model only
  const combinedUsage = {
    inputTokens: structuredResult.usage.inputTokens,
    outputTokens: structuredResult.usage.outputTokens,
    totalTokens: structuredResult.usage.totalTokens,
  };

  // 9️⃣ Structure response with usage tracking ----
  const response = createSuccessResponse(
    {
      overallRipAnalysis: structuredResult.object.overallRipAnalysis,
      overallRipScore: structuredResult.object.overallRipScore,
      ripComparisons: structuredResult.object.ripComparisons,
    },
    stepConfig.model,
    combinedUsage
  );

  // 10️⃣ Log step output ----
  verboseLogger?.logStepOutput(stepConfig.stepName, response.output);

  return response;
}
