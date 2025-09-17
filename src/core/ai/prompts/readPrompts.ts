/* ==========================================================================*/
// readPrompt.ts — Simple prompt file reader utility
/* ==========================================================================*/
// Purpose: Read mustache prompt files from step directories
/* ==========================================================================*/

// Core/Node Modules ---
import { readFile } from "fs/promises";
import path from "path";

// Internal Modules ----
import { PromptType } from "@/core/ai/prompts/types";

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Read a prompt file from a step's prompts directory.
 */
async function readPrompt(stepPath: string, promptType: PromptType): Promise<string> {
  const fileName = `${promptType}.mustache`;
  const filePath = path.join(stepPath, "prompts", fileName);

  return readFile(filePath, "utf-8");
}

/**
 * Read all prompts from a step's prompts directory (simple, fast).
 */
async function readAllPrompts(stepPath: string): Promise<{
  systemTemplate?: string;
  userTemplate: string;
  assistantTemplate?: string;
}> {
  const [systemRes, userRes, assistantRes] = await Promise.all([readPrompt(stepPath, PromptType.SYSTEM).catch(() => undefined), readPrompt(stepPath, PromptType.USER), readPrompt(stepPath, PromptType.ASSISTANT).catch(() => undefined)]);

  return {
    systemTemplate: systemRes,
    userTemplate: userRes,
    assistantTemplate: assistantRes,
  };
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { readPrompt, readAllPrompts };
