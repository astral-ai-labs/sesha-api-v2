/* ==========================================================================*/
// index.ts — Draft article step execution
/* ==========================================================================*/
// Purpose: Generate the full digest article from outline and source material
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call/generateText";

// Internal Modules ----
import { createSuccessResponse, formatHeadlinesBlobs } from "@/domains/drafting/common/utils";
import type { DraftArticleRequest, DraftArticleResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import { getExampleArticles, getWordTarget } from "./helpers";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Generate the full digest article from outline and source material.
 */
async function draftArticle(request: DraftArticleRequest, stepConfig: StepConfig): Promise<DraftArticleResponse> {
  // 1️⃣ Get word target and examples ----
  const wordTarget = getWordTarget(request.lengthRange);
  const exampleArticles = getExampleArticles(wordTarget);
  
  // 2️⃣ Create headline and blobs text ----
  const headlineAndBlobsText = formatHeadlinesBlobs(request.context.generatedHeadline, request.context.generatedBlobs);
  
  // 3️⃣ Prepare template variables ----
  const systemTemplateVariables = {
    instructions: request.instructions,
    lengthRange: request.lengthRange,
    wordTarget: wordTarget.toString(),
    exampleArticles: exampleArticles,
  };
  
  const userTemplateVariables = {
    lengthRange: request.lengthRange,
    wordTarget: wordTarget.toString(),
    source: request.sources[0],
    instructions: request.instructions,
    extractedFacts: request.context.extractedFacts,
    extractedFactsSummary: request.context.extractedFactsSummary,
    headlineAndBlobsText: headlineAndBlobsText,
    createdOutline: request.context.createdOutline,
  };

  // 4️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, undefined, PromptType.ASSISTANT);

  // 4️⃣ Generate AI response ----
  const aiResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 5️⃣ Structure response with usage tracking ----
  return createSuccessResponse({ draftedArticle: aiResult.text }, stepConfig.model, aiResult.usage);
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { draftArticle, type DraftArticleRequest, type DraftArticleResponse };
