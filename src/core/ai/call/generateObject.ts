/* ==========================================================================*/
// generateObject.ts — AI structured object generation wrapper utility
/* ==========================================================================*/
// Purpose: Provide a simple wrapper around AI SDK's generateObject function
// Sections: Imports, Types, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { generateObject, LanguageModel } from "ai";
import { z } from "zod";

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

/**
 * Configuration for structured object generation.
 */
interface GenerateObjectConfig<T> {
  model: LanguageModel;
  systemPrompt?: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Result from structured object generation.
 */
interface GenerateObjectResponse<T> {
  object: T;
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
 * Generate structured object using AI SDK with simplified configuration options.
 */
async function simpleGenerateObject<T>(config: GenerateObjectConfig<T>): Promise<GenerateObjectResponse<T>> {
  // 1️⃣ Generate structured object -----
  try {
    const result = await generateObject({
      model: config.model,
      system: config.systemPrompt,
      prompt: config.userPrompt,
      schema: config.schema,
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens,
    });

    // 2️⃣ Parse response -----
    return {
      object: result.object,
      usage: {
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
        totalTokens: result.usage.totalTokens ?? 0,
      },
    };
  } catch (error: unknown) {
    throw new Error(`Structured object generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { simpleGenerateObject };
