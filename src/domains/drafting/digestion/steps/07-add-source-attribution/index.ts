/* ==========================================================================*/
// index.ts — Add source attribution step execution
/* ==========================================================================*/
// Purpose: Split the final article into one sentence per line, preserving inline quotes
// Sections: Imports, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call/generateText";

// Internal Modules ----
import { createSuccessResponse } from "@/domains/drafting/common/utils";
import type { AddSourceAttributionRequest, AddSourceAttributionResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Format article with proper sentence-per-line structure and clean attribution.
 */
async function addSourceAttribution(request: AddSourceAttributionRequest, stepConfig: StepConfig): Promise<AddSourceAttributionResponse> {
  // 1️⃣ Prepare template variables ----
  const userTemplateVariables = {
    revisedArticle: request.context.revisedArticle,
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

  // 4️⃣ Clean up the response ----
  const cleanedText = aiResult.text
    .replace(/<\/?output[^>]*>/g, '') // Remove any <output> or </output> tags
    .trim(); // Remove leading and trailing whitespace

  // 5️⃣ Structure response with usage tracking ----
  return createSuccessResponse({ attributedArticle: cleanedText }, stepConfig.model, aiResult.usage);
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { addSourceAttribution, type AddSourceAttributionRequest, type AddSourceAttributionResponse };
