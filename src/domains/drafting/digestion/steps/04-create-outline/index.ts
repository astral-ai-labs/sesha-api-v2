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

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Create structural outline for the article with comprehensive key points.
 */
async function createOutline(request: CreateOutlineRequest, stepConfig: StepConfig): Promise<CreateOutlineResponse> {
  // 1️⃣ Prepare template variables ----
  const systemTemplateVariables = {
    extractedFactsSummary: request.context.extractedFactsSummary,
  };
  
  // 2️⃣ Create headline and blobs text ----
  const headlineAndBlobsText = formatHeadlinesBlobs(request.context.generatedHeadline, request.context.generatedBlobs);
  
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
  return createSuccessResponse({ createdOutline: aiResult.text }, stepConfig.model, aiResult.usage);
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { createOutline, type CreateOutlineRequest, type CreateOutlineResponse };
