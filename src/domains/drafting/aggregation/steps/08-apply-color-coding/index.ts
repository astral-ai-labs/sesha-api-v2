/* ==========================================================================*/
// index.ts — Apply color coding step execution
/* ==========================================================================*/
// Purpose: Apply color coding to final article based on source attribution
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
import type { ApplyColorCodingRequest, ApplyColorCodingResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Apply color coding to the final article based on source attribution.
 */
async function applyColorCoding(request: ApplyColorCodingRequest, stepConfig: StepConfig): Promise<ApplyColorCodingResponse> {
  // 1️⃣ Prepare template variables ----
  const userTemplateVariables = {
    sources: request.sources,
    rewrittenArticle: request.context.attributedArticle,
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
    .replace(/<\/?final-draft[^>]*>/g, '') // Remove any <final-draft> or </final-draft> tags
    .replace(/<\/?rewrite[^>]*>/g, '') // Remove any <rewrite> or </rewrite> tags
    .trim(); // Remove leading and trailing whitespace

  // 5️⃣ Structure response with usage tracking ----
  return createSuccessResponse(
    { 
      colorCodedArticle: cleanedText,
      richContent: cleanedText, // Rich content is the same as color coded article
    }, 
    stepConfig.model, 
    aiResult.usage
  );
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { applyColorCoding, type ApplyColorCodingRequest, type ApplyColorCodingResponse };
