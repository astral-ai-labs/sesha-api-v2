/* ==========================================================================*/
// index.ts — Revise article step execution
/* ==========================================================================*/
// Purpose: Revise aggregated article for clarity, simplicity, and source accuracy
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Core Modules ----
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call";

// Internal Modules ----
import { createSuccessResponse } from "@/domains/drafting/common/utils";
import type { ReviseArticleRequest, ReviseArticleResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Revise aggregated article with three specific edits for clarity and readability.
 */
async function reviseArticle(request: ReviseArticleRequest, stepConfig: StepConfig): Promise<ReviseArticleResponse> {
  // 1️⃣ Prepare template variables ----
  const userTemplateVariables = {
    sources: request.sources,
    article: request.context.draftedArticle,
  };

  // 2️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, undefined, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, undefined, PromptType.ASSISTANT);

  // 3️⃣ Generate AI response ----
  const aiResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 4️⃣ Structure response with usage tracking ----
  return createSuccessResponse({ revisedArticle: aiResult.text }, stepConfig.model, aiResult.usage);
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { reviseArticle, type ReviseArticleRequest, type ReviseArticleResponse };
