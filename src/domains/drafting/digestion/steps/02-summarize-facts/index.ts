/* ==========================================================================*/
// index.ts — Summarize facts step execution
/* ==========================================================================*/
// Purpose: Create comprehensive summary from extracted facts
// Sections: Imports, Implementation, Public API

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call";

// Internal Modules ----
import { createSuccessResponse } from "@/domains/drafting/common/utils";
import type { SummarizeFactsRequest, SummarizeFactsResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Create comprehensive summary from extracted facts and source content.
 */
async function summarizeFacts(request: SummarizeFactsRequest, stepConfig: StepConfig): Promise<SummarizeFactsResponse> {
  // 1️⃣ Prepare template variables ----
  const systemTemplateVariables = {
    instructions: request.instructions,
  };

  const userTemplateVariables = {
    source: request.sources[0],
  };

  // 2️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
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
  return createSuccessResponse({ extractedFactsSummary: aiResult.text }, stepConfig.model, aiResult.usage);
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { summarizeFacts, type SummarizeFactsRequest, type SummarizeFactsResponse };
