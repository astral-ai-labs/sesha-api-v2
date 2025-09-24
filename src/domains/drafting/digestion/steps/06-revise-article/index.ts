/* ==========================================================================*/
// index.ts — Revise article step execution
/* ==========================================================================*/
// Purpose: Paraphrase the full draft article for flow, clarity, and non-plagiarism
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
import type { ReviseArticleRequest, ReviseArticleResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import type { VerboseLogger } from "@/domains/drafting/common/utils";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Revise and polish the draft article for clarity and flow.
 */
async function reviseArticle(request: ReviseArticleRequest, stepConfig: StepConfig, verboseLogger?: VerboseLogger): Promise<ReviseArticleResponse> {
  // 1️⃣ Prepare template variables ----

  const userTemplateVariables = {
    draftedArticle: request.context.draftedArticle,
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
    assistant: formattedAssistant
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

  // 5️⃣ Structure response with usage tracking ----
  const response = createSuccessResponse({ revisedArticle: aiResult.text }, stepConfig.model, aiResult.usage);
  
  // 6️⃣ Log step output ----
  verboseLogger?.logStepOutput(stepConfig.stepName, response.output);
  
  return response;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { reviseArticle, type ReviseArticleRequest, type ReviseArticleResponse };
