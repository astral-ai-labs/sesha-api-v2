/* ==========================================================================*/
// index.ts — Digest verbatim conditional step execution
/* ==========================================================================*/
// Purpose: Rewrite input verbatim with spelling/capitalization fixes and proper formatting
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
import type { DigestVerbatimConditionalRequest, DigestVerbatimConditionalResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import type { VerboseLogger } from "@/domains/drafting/common/utils";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Rewrite source content verbatim with spelling/capitalization fixes and proper formatting.
 * This step is used when copySourceVerbatim flag is true for a source.
 */
export async function digestVerbatimConditional(
  request: DigestVerbatimConditionalRequest, 
  stepConfig: StepConfig, 
  verboseLogger?: VerboseLogger
): Promise<DigestVerbatimConditionalResponse> {
  // 1️⃣ Prepare template variables ----
  const userTemplateVariables = {
    source: request.sources[0],
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

  // 5️⃣ Clean up the response ----
  const cleanedText = aiResult.text
    .replace(/<\/?output[^>]*>/g, '') // Remove any <output> or </output> tags
    .trim(); // Remove leading and trailing whitespace

  // 6️⃣ Structure response with usage tracking ----
  const response = createSuccessResponse({ digestedVerbatim: cleanedText }, stepConfig.model, aiResult.usage);
  
  // 7️⃣ Log step output ----
  verboseLogger?.logStepOutput(stepConfig.stepName, response.output);
  
  return response;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { DigestVerbatimConditionalRequest, DigestVerbatimConditionalResponse };
