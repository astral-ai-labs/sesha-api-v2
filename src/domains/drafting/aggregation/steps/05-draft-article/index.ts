/* ==========================================================================*/
// index.ts — Draft aggregated article step execution
/* ==========================================================================*/
// Purpose: Generate the full aggregated article from multiple sources
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
import { getExampleArticles, getWordTarget, prepareSources, getSentenceGuidance } from "./helpers";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Generate the full aggregated article from multiple sources and outline.
 */
async function draftArticle(request: DraftArticleRequest, stepConfig: StepConfig): Promise<DraftArticleResponse> {
  // 1️⃣ Get word target and examples ----
  const wordTarget = getWordTarget(request.lengthRange);
  const exampleArticles = getExampleArticles(wordTarget);
  const sentenceGuidance = getSentenceGuidance(wordTarget);
  
  // 2️⃣ Create headline and blobs text ----
  const headlineAndBlobsText = formatHeadlinesBlobs(request.context.generatedHeadlines, request.context.generatedBlobs);
  
  // 3️⃣ Prepare sources with aggregated facts ----
  const preparedSources = prepareSources(
    request.context.extractedFactsResults,
    request.context.extractedFactsConditionalResults,
    request.sources
  );

  // 4️⃣ Determine if verbatim mode is used ----
  const isVerbatim = request.sources.some(source => source.flags?.copySourceVerbatim);
  
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
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
  };

  // 6️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, userTemplateVariables, PromptType.ASSISTANT);

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
  return createSuccessResponse({ draftedArticle: aiResult.text }, stepConfig.model, aiResult.usage);
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { draftArticle };
export type { DraftArticleRequest, DraftArticleResponse };
