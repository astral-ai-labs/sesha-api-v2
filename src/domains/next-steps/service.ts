/* ==========================================================================*/
// service.ts — Next Steps AI generation service
/* ==========================================================================*/
// Purpose: Generate next steps suggestions using Grok 4 reasoning
// Sections: Imports, Types, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import path from "path";

// Core AI Modules ----
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";
import { simpleGenerateText } from "@/core/ai/call/generateText";

// Internal Modules ----
import { MODEL_ALIAS_MAPPING } from "@/domains/drafting/common/utils/modelMappings";
import type { NextStepsResponse } from "./types";
import { NextStepsSchema } from "./types";

/* ==========================================================================*/
// Constants
/* ==========================================================================*/

const NEXT_STEPS_MODEL = MODEL_ALIAS_MAPPING["grok-4.1-fast-reasoning"];

/* ==========================================================================*/
// Types
/* ==========================================================================*/

interface GenerateNextStepsResult {
  response: NextStepsResponse;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Generate next steps suggestions for an article using Grok 4 reasoning.
 */
async function generateNextSteps(article: string): Promise<GenerateNextStepsResult> {
  // 1️⃣ Load prompts ----
  const promptsPath = path.join(__dirname, "prompts").replace(/\\/g, "/");
  const prompts = await readAllPrompts(promptsPath);

  // 2️⃣ Format prompts with article ----
  const formattedSystem = formatPrompt(prompts.systemTemplate, undefined, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, { article }, PromptType.USER);

  // 3️⃣ Add JSON instruction to system prompt ----
  const systemWithJsonInstruction = `${formattedSystem}

OUTPUT: Respond with a valid JSON object matching this exact structure:
{
  "mustDo": ["string array of must-do steps"],
  "important": ["string array of important steps"],
  "optional": ["string array of optional steps"],
  "otherRelevantInformation": "string with relevant context",
  "linksToSources": ["string array of HTML anchor tags"]
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown code blocks.`;

  // 4️⃣ Call Grok 4 reasoning model ----
  const result = await simpleGenerateText({
    model: NEXT_STEPS_MODEL.provider.languageModel(NEXT_STEPS_MODEL.modelId),
    provider: NEXT_STEPS_MODEL.provider,
    systemPrompt: systemWithJsonInstruction,
    userPrompt: formattedUser,
    temperature: 0.7,
    maxTokens: 4000,
  });

  // 5️⃣ Parse JSON response ----
  const cleanedText = result.text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");

  const parsed = NextStepsSchema.safeParse(JSON.parse(cleanedText));
  if (!parsed.success) {
    throw new Error(`Failed to parse next steps response: ${parsed.error.message}`);
  }

  return {
    response: parsed.data,
    usage: result.usage,
  };
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { generateNextSteps, type GenerateNextStepsResult };
