/* ==========================================================================*/
// index.ts — Draft aggregated article step execution
/* ==========================================================================*/
// Purpose: Generate the full aggregated article from source(s)
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Core Modules ----
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call";

// Internal Modules ----
import { createSuccessResponse, formatHeadlinesBlobs } from "@/domains/drafting/common/utils";
import type { DraftArticleRequest, DraftArticleResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import { getExampleArticles, getWordTarget, getSentenceGuidance } from "./helpers";
import type { VerboseLogger } from "@/domains/drafting/common/utils";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/
/**
 * Generate the full aggregated article from source(s) and outline.
 */
async function draftArticle(request: DraftArticleRequest, stepConfig: StepConfig, verboseLogger?: VerboseLogger): Promise<DraftArticleResponse> {
  // 1️⃣ Get word target and examples ----
  const wordTarget = getWordTarget(request.lengthRange);
  const exampleArticles = getExampleArticles(wordTarget);
  const sentenceGuidance = getSentenceGuidance(wordTarget);

  // 2️⃣ Create headline and blobs text ----
  const headlineAndBlobsText = formatHeadlinesBlobs(request.context.generatedHeadlines, request.context.generatedBlobs);

  // 3️⃣ Prepare sources with aggregated facts ----
  const preparedSources = request.sources.map((source) => {
    const factsResult = request.context.extractedFactsResults.find((r) => r.sourceNumber === source.number);
    const conditionalResult = request.context.extractedFactsConditionalResults.find((r) => r.sourceNumber === source.number);

    return {
      ...source,
      factsBitSplitting1: factsResult?.extractedFacts || "",
      factsBitSplitting2: conditionalResult?.factsBitSplitting2 || "",
    };
  });

  // 4️⃣ Determine if verbatim mode is used ----
  const isVerbatim = request.sources.some((source) => source.flags?.copySourceVerbatim);

  // 5️⃣ Prepare template variables ----
  const systemTemplateVariables = {
    isVerbatim,
    wordTarget: wordTarget.toString(),
    sentence_guidance: sentenceGuidance,
    instructions: request.instructions,
    example_articles: exampleArticles,
  };

  const userTemplateVariables = {
    headline: request.context.generatedHeadlines,
    blobs: headlineAndBlobsText,
    wordTarget: wordTarget.toString(),
    articleOutline: request.context.createdOutline,
    instructions: request.instructions,
    sentence_guidance: sentenceGuidance,
    sources: preparedSources,
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  // 6️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, userTemplateVariables, PromptType.ASSISTANT);

  // 7️⃣ Log final prompts before AI call ----
  verboseLogger?.logStepPrompts(stepConfig.stepName, {
    system: formattedSystem,
    user: formattedUser,
    assistant: formattedAssistant,
  });

  // 7️⃣ Generate AI response ----
  const aiResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 8️⃣ Structure response with usage tracking ----
  const response = createSuccessResponse({ draftedArticle: aiResult.text }, stepConfig.model, aiResult.usage);

  // 9️⃣ Log step output ----
  verboseLogger?.logStepOutput(stepConfig.stepName, response.output);

  return response;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { draftArticle };
export type { DraftArticleRequest, DraftArticleResponse };
