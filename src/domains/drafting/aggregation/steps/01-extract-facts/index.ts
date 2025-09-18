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
export async function extractFacts(
  request: ExtractFactsRequest, 
  stepConfig: StepConfig
): Promise<ExtractFactsResponse> {
  // 1️⃣ Validate input -----
  if (!request.sources || request.sources.length === 0) {
    throw new Error("At least one source is required for fact extraction");
  }

  if (request.sources.length > 1) {
    throw new Error("Extract facts step processes only one source at a time");
  }

  const source = request.sources[0];

  if (!source.text?.trim()) {
    throw new Error(`Source ${source.number} has no content to process`);
  }

  // 2️⃣ Prepare template variables -----
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const userTemplateVariables = {
    source: {
      number: source.number,
      attribution: source.attribution,
      accredit: source.attribution, // Legacy field name used in prompts
      text: source.text,
      isPrimarySource: source.flags.isPrimarySource,
      useVerbatim: source.flags.copySourceVerbatim,
    },
    date: currentDate,
  };

  // 3️⃣ Load and format prompts -----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, userTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, userTemplateVariables, PromptType.ASSISTANT);

  // 4️⃣ Generate AI response -----
  const aiResult = await simpleGenerateText({
    model: stepConfig.model,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    assistantPrompt: formattedAssistant,
    temperature: stepConfig.temperature,
    maxTokens: stepConfig.maxTokens,
  });

  // 5️⃣ Structure response with usage tracking -----
  return createSuccessResponse(
    { extractedFacts: aiResult.text }, 
    stepConfig.model, 
    aiResult.usage
  );
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export type { ExtractFactsRequest, ExtractFactsResponse };
