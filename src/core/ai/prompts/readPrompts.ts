/* ==========================================================================*/
// readPrompt.ts — Simple prompt file reader utility
/* ==========================================================================*/
// Purpose: Read mustache prompt files from step directories
/* ==========================================================================*/

// Core/Node Modules ---
import { readFile } from "fs/promises";
import path from "path";

// External Packages ---
import { NonRetriableError } from "inngest";

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

  // Handle ROOT path issue by extracting relative path from src/
  const cleanStepPath = stepPath.includes("/ROOT/") && stepPath.includes("src/") ? stepPath.substring(stepPath.indexOf("src/")) : stepPath;

  const filePath = path.join(process.cwd(), cleanStepPath, "prompts", fileName);

  try {
    return readFile(filePath, "utf-8");
  } catch (error: unknown) {
    throw new NonRetriableError(`Failed to read prompt file ${filePath}`, { cause: error instanceof Error ? error : new Error(String(error)) });
  }
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
