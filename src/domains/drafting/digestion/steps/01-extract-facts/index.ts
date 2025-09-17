/* ==========================================================================*/
// index.ts — Extract facts step execution
/* ==========================================================================*/
// Purpose: Extract facts from source content using AI
/* ==========================================================================*/

// Core Modules ----
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call";

// Internal Modules ----
import { createSuccessResponse } from "@/domains/drafting/common/utils";
import type { ExtractFactsRequest, ExtractFactsResponse } from "@/domains/drafting/digestion/steps/01-extract-facts/types";
import { StepConfig } from "@/domains/drafting/common/types";

/* ==========================================================================*/
// Step Configuration
/* ==========================================================================*/

/* ==========================================================================*/
// Step Function
/* ==========================================================================*/

/**
 * Extract facts from source content using AI analysis.
 */
export async function extractFacts(request: ExtractFactsRequest, stepConfig: StepConfig): Promise<ExtractFactsResponse> {
  // 1️⃣ Prepare template variables ----
  const userTemplateVariables = {
    source: request.sources[0],
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
  return createSuccessResponse({ extractedFacts: aiResult.text }, stepConfig.model, aiResult.usage);
}
