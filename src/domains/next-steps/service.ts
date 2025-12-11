/* ==========================================================================*/
// service.ts — Next Steps AI generation service
/* ==========================================================================*/
// Purpose: Generate next steps suggestions using Grok 4 reasoning
// Sections: Imports, Constants, Types, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

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
 * Generate next steps suggestions using Grok 4 reasoning.
 */
async function generateNextSteps(article: string): Promise<GenerateNextStepsResult> {
  // 1️⃣ Load prompts ----
  const prompts = await readAllPrompts(__dirname);

  // 2️⃣ Format prompts with article ----
  const formattedSystem = formatPrompt(prompts.systemTemplate, undefined, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, { article }, PromptType.USER);

  // 3️⃣ Generate next steps with Grok ----
  const result = await simpleGenerateText({
    model: NEXT_STEPS_MODEL.modelId as any,
    provider: NEXT_STEPS_MODEL.provider,
    systemPrompt: formattedSystem,
    userPrompt: formattedUser,
    temperature: 0.7,
    maxTokens: 8000,
  });

  // 4️⃣ Parse JSON response ----
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
