/* ==========================================================================*/
// index.ts — Source attribution step execution
/* ==========================================================================*/
// Purpose: Add in-sentence attribution for multi-source aggregated content
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
import type { SourceAttributionRequest, SourceAttributionResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import type { VerboseLogger } from "@/domains/drafting/common/utils";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Add proper in-sentence attribution for each source used in aggregated content.
 */
export async function addSourceAttribution(request: SourceAttributionRequest, stepConfig: StepConfig, verboseLogger?: VerboseLogger): Promise<SourceAttributionResponse> {
  // 1️⃣ Validate input ----
  if (!request.context.revisedArticle?.trim()) {
    throw new Error("Revised article cannot be empty");
  }

  const systemTemplateVariables = {
    sources: request.sources,
  };

  // 2️⃣ Prepare template variables ----
  const userTemplateVariables = {
    rewrittenArticle: request.context.revisedArticle,
    sources: request.sources,
  };

  const assistantTemplateVariables = {
    sources: request.sources,
  };

  // 3️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, assistantTemplateVariables, PromptType.ASSISTANT);

  // 4️⃣ Log final prompts before AI call ----
  verboseLogger?.logStepPrompts(stepConfig.stepName, {
    system: formattedSystem,
    user: formattedUser,
    assistant: formattedAssistant,
  });

  // 4️⃣ Generate AI response ----
  const aiResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 5️⃣ Clean up the response ----
  const cleanedText = aiResult.text
    .replace(/<\/?article[^>]*>/g, "") // Remove any <article> or </article> tags
    .replace(/<\/?rewrite[^>]*>/g, "") // Remove any <rewrite> or </rewrite> tags
    .trim(); // Remove leading and trailing whitespace

  // 6️⃣ Structure response with usage tracking ----
  const response = createSuccessResponse({ attributedArticle: cleanedText }, stepConfig.model, aiResult.usage);

  // 7️⃣ Log step output ----
  verboseLogger?.logStepOutput(stepConfig.stepName, response.output);

  return response;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { SourceAttributionRequest, SourceAttributionResponse };
