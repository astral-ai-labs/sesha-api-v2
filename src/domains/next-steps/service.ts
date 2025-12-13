/* ==========================================================================*/
// service.ts — Next Steps AI generation service
/* ==========================================================================*/
// Purpose: Generate next steps suggestions using Grok 4 reasoning
// Sections: Imports, Constants, Types, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ----
import { generateText, Tool } from "ai";
import { xai, xaiTools } from "@ai-sdk/xai";

// Core AI Modules ----
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";

// Internal Modules ----
import type { NextStepsResponse } from "./types";
import { NextStepsSchema } from "./types";

/* ==========================================================================*/
// Constants
/* ==========================================================================*/

const NEXT_STEPS_MODEL = "grok-4-1-fast";

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

  // 3️⃣ Generate next steps with Grok Responses API ----
  const webSearchTool = xai.tools.webSearch();
  const xSearchTool = xai.tools.xSearch();

  const result = await generateText({
    model: xai.responses(NEXT_STEPS_MODEL),
    system: formattedSystem,
    prompt: formattedUser,
    temperature: 0.7,
    tools: {
      web_search: xaiTools.webSearch() as unknown as Tool<Record<string, never>, { query: string; sources: Array<{ title: string; url: string; snippet: string }> }>,
      x_search: xaiTools.xSearch() as unknown as Tool<Record<string, never>, { query: string; posts: Array<{ author: string; text: string; url: string; likes: number }> }>,
    },
  });

  // 4️⃣ Parse JSON response ----
  const cleanedText = result.text
    .trim()
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "");
  const parsed = NextStepsSchema.safeParse(JSON.parse(cleanedText));

  if (!parsed.success) {
    throw new Error(`Failed to parse next steps response: ${parsed.error.message}`);
  }

  const inputTokens = result.usage.inputTokens ?? 0;
  const outputTokens = result.usage.outputTokens ?? 0;
  const totalTokens = inputTokens + outputTokens;

  return {
    response: parsed.data,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens,
    },
  };
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { generateNextSteps, type GenerateNextStepsResult };
