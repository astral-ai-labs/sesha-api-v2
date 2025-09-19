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

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Conditionally process source facts based on source flags.
 * For primary sources: Complete second-half processing from step 01 results.
 * For verbatim/default sources: Return minimal processing (dashes).
 */
async function extractFactsConditional(
  request: ExtractFactsConditionalRequest, 
  stepConfig: StepConfig
): Promise<ExtractFactsConditionalResponse> {
  // 1️⃣ Validate input ----
  if (!request.sources || request.sources.length !== 1) {
    throw new Error("Extract facts conditional step requires exactly one source");
  }

  const source = request.sources[0];
  
  if (!request.context.extractedFactsResults) {
    throw new Error("Extract facts conditional step requires results from step 01");
  }

  // 2️⃣ Find corresponding facts from step 01 ----
  const correspondingFactsResult = request.context.extractedFactsResults.find(
    result => result.sourceNumber === source.number
  );

  if (!correspondingFactsResult) {
    throw new Error(`No facts found from step 01 for source ${source.number}`);
  }

  // 3️⃣ Prepare template variables ----
  const systemTemplateVariables = {
    source: {
      ...source,
      factsBitSplitting: correspondingFactsResult.extractedFacts,
      accredit: source.attribution,
    },
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  };

  const userTemplateVariables = {
    source: {
      ...source,
      factsBitSplitting: correspondingFactsResult.extractedFacts,
      accredit: source.attribution,
    },
    date: new Date().toISOString().split('T')[0],
  };

  // 4️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, systemTemplateVariables, PromptType.ASSISTANT);

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
  return createSuccessResponse(
    { factsBitSplitting2: aiResult.text }, 
    stepConfig.model, 
    aiResult.usage
  );
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { 
  extractFactsConditional,
  type ExtractFactsConditionalRequest,
  type ExtractFactsConditionalResponse 
};
