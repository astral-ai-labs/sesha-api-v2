/* ==========================================================================*/
// index.ts — Extract facts conditional step execution
/* ==========================================================================*/
// Purpose: Conditionally process sources based on isPrimarySource and useVerbatim flags
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
import type { ExtractFactsConditionalRequest, ExtractFactsConditionalResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import type { VerboseLogger } from "@/domains/drafting/common/utils";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Conditionally process source facts based on source flags.
 * For primary sources: Complete second-half processing from step 01 results.
 * For verbatim/default sources: Return minimal processing (dashes).
 */
async function extractFactsConditional(request: ExtractFactsConditionalRequest, stepConfig: StepConfig, verboseLogger?: VerboseLogger): Promise<ExtractFactsConditionalResponse> {
  // 1️⃣ Find corresponding facts from step 01 ----
  const correspondingFactsResult = request.context.extractedFactsResults.find((result) => result.sourceNumber === request.sources[0].number);

  // 3️⃣ Prepare template variables ----
  const systemTemplateVariables = {
    source: request.sources[0],
    factsBitSplitting: correspondingFactsResult?.extractedFacts,
    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
  };

  const userTemplateVariables = {
    source: request.sources[0],
    factsBitSplitting: correspondingFactsResult?.extractedFacts,
    date: new Date().toISOString().split("T")[0],
  };

  // 4️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, systemTemplateVariables, PromptType.ASSISTANT);

  // 5️⃣ Log final prompts before AI call ----
  verboseLogger?.logStepPrompts(stepConfig.stepName, {
    system: formattedSystem,
    user: formattedUser,
    assistant: formattedAssistant
  });

  // 6️⃣ Generate AI response ----
  const aiResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 7️⃣ Structure response with usage tracking ----
  const response = createSuccessResponse({ factsBitSplitting2: aiResult.text }, stepConfig.model, aiResult.usage);
  
  // 8️⃣ Log step output ----
  verboseLogger?.logStepOutput(stepConfig.stepName, response.output);
  
  return response;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { extractFactsConditional, type ExtractFactsConditionalRequest, type ExtractFactsConditionalResponse };
