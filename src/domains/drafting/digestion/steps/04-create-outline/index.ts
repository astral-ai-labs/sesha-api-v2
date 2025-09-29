/* ==========================================================================*/
// index.ts — Create outline step execution
/* ==========================================================================*/
// Purpose: Create structural outline for the article with 10+ key points
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
import type { CreateOutlineRequest, CreateOutlineResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import type { VerboseLogger } from "@/domains/drafting/common/utils";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Create structural outline for the article with comprehensive key points.
 */
async function createOutline(request: CreateOutlineRequest, stepConfig: StepConfig, verboseLogger?: VerboseLogger): Promise<CreateOutlineResponse> {
  // 1️⃣ Prepare template variables ----
  const systemTemplateVariables = {
    extractedFactsSummary: request.context.extractedFactsSummary,
  };
  
  // 2️⃣ Create headline and blobs text ----
  const headlineAndBlobsText = formatHeadlinesBlobs(request.context.finalizedHeadline, request.context.finalizedBlobs);
  
  const userTemplateVariables = {
    source: request.sources[0],
    instructions: request.instructions,
    extractedFacts: request.context.extractedFacts,
    extractedFactsSummary: request.context.extractedFactsSummary,
    headlineAndBlobsText: headlineAndBlobsText,
  };

  // 3️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, undefined, PromptType.ASSISTANT);

  // 4️⃣ Log final prompts before AI call ----
  verboseLogger?.logStepPrompts(stepConfig.stepName, {
    system: formattedSystem,
    user: formattedUser,
    assistant: formattedAssistant
  });

  // 5️⃣ Generate AI response ----
  const aiResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 6️⃣ Structure response with usage tracking ----
  const response = createSuccessResponse({ createdOutline: aiResult.text }, stepConfig.model, aiResult.usage);
  
  // 7️⃣ Log step output ----
  verboseLogger?.logStepOutput(stepConfig.stepName, response.output);
  
  return response;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { createOutline, type CreateOutlineRequest, type CreateOutlineResponse };
