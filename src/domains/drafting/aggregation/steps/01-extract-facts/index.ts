/* ==========================================================================*/
// index.ts — Extract facts step execution
/* ==========================================================================*/
// Purpose: Extract and rewrite facts from source content using AI analysis
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
import type { ExtractFactsRequest, ExtractFactsResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";
import type { VerboseLogger } from "@/domains/drafting/common/utils";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Extract and rewrite facts from source content using AI analysis.
 * Handles different processing modes based on source flags:
 * - Primary sources: First half processing with structured output
 * - Verbatim sources: Word-for-word reprinting with source tags
 * - Regular sources: Full rewrite with fact extraction and quote preservation
 */
export async function extractFacts(request: ExtractFactsRequest, stepConfig: StepConfig, verboseLogger?: VerboseLogger): Promise<ExtractFactsResponse> {
  // 2️⃣ Prepare template variables -----
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  const userTemplateVariables = {
    source: request.sources[0],
    date: currentDate,
  };

  // 3️⃣ Load and format prompts -----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, userTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, userTemplateVariables, PromptType.ASSISTANT);

  // 4️⃣ Log final prompts before AI call -----
  verboseLogger?.logStepPrompts("01-extract-facts", {
    system: formattedSystem,
    user: formattedUser,
    assistant: formattedAssistant
  });

  // 5️⃣ Generate AI response -----
  const aiResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 6️⃣ Structure response with usage tracking -----
  const response = createSuccessResponse({ extractedFacts: aiResult.text }, stepConfig.model, aiResult.usage);
  
  // 7️⃣ Log step output -----
  verboseLogger?.logStepOutput("01-extract-facts", response.output);
  
  return response;
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { ExtractFactsRequest, ExtractFactsResponse };
