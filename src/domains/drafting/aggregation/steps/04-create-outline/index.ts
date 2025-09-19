/* ==========================================================================*/
// index.ts — Create outline step execution
/* ==========================================================================*/
// Purpose: Create structural outline for aggregated article from source(s)
// Sections: Imports, Helpers, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// Core Modules ----
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call";

// Internal Modules ----
import { createSuccessResponse, formatHeadlinesBlobs } from "@/domains/drafting/common/utils";
import type { CreateOutlineRequest, CreateOutlineResponse } from "./types";
import type { StepConfig } from "@/domains/drafting/common/types/runner";

/* ==========================================================================*/
// Helpers
/* ==========================================================================*/

/**
 * Build sources array with factsBitSplitting1 and factsBitSplitting2 combined.
 */
function buildSourcesWithFactsSplitting(
  sources: CreateOutlineRequest["sources"],
  extractedFactsResults: CreateOutlineRequest["context"]["extractedFactsResults"],
  extractedFactsConditionalResults: CreateOutlineRequest["context"]["extractedFactsConditionalResults"]
) {
  return sources.map((source, index) => {
    const factsResult = extractedFactsResults.find(r => r.sourceNumber === index + 1);
    const conditionalResult = extractedFactsConditionalResults.find(r => r.sourceNumber === index + 1);
    
    return {
      ...source,
      factsBitSplitting1: factsResult?.extractedFacts || "",
      factsBitSplitting2: conditionalResult?.factsBitSplitting2 || "",
    };
  });
}

/**
 * Check if any source has useVerbatim flag set.
 */
function hasVerbatimSource(sources: CreateOutlineRequest["sources"]): boolean {
  return sources.some(source => source.flags?.copySourceVerbatim);
}

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Create structural outline for aggregated article from source(s).
 */
async function createOutline(request: CreateOutlineRequest, stepConfig: StepConfig): Promise<CreateOutlineResponse> {
  // 1️⃣ Prepare sources with combined facts ----
  const sourcesWithFacts = buildSourcesWithFactsSplitting(
    request.sources,
    request.context.extractedFactsResults,
    request.context.extractedFactsConditionalResults
  );

  // 2️⃣ Create headline and blobs text ----
  const headlineAndBlobsText = formatHeadlinesBlobs(
    request.context.generatedHeadline, 
    request.context.generatedBlobs
  );

  // 3️⃣ Prepare template variables ----
  const systemTemplateVariables = {
    isVerbatim: hasVerbatimSource(request.sources),
    example_outlines: "", // TODO: Add example outlines if needed
  };

  const userTemplateVariables = {
    headline: request.context.generatedHeadline,
    blobs: headlineAndBlobsText,
    instructions: request.instructions,
    keyPointInstructions: `Pull from each source and weave them together to create ${sourcesWithFacts.length} comprehensive key points.`,
    sources: sourcesWithFacts,
  };

  // 4️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);

  const formattedSystem = formatPrompt(prompts.systemTemplate, systemTemplateVariables, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, userTemplateVariables, PromptType.USER);
  const formattedAssistant = formatPrompt(prompts.assistantTemplate, undefined, PromptType.ASSISTANT);

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
  return createSuccessResponse({ createdOutline: aiResult.text }, stepConfig.model, aiResult.usage);
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { createOutline, type CreateOutlineRequest, type CreateOutlineResponse };
