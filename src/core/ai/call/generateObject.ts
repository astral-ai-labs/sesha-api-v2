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
import OpenAI from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

/* ==========================================================================*/
// Client Initialization
/* ==========================================================================*/

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

/**
 * Configuration for structured object generation.
 */
interface GenerateObjectConfig<T> {
  model: string;
  systemPrompt?: string;
  userPrompt: string;
  assistantPrompt?: string;
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
 * Generate structured object using OpenAI SDK with structured outputs.
 */
async function simpleGenerateObject<T>(config: GenerateObjectConfig<T>): Promise<GenerateObjectResponse<T>> {
  // 1️⃣ Convert Zod schema to JSON Schema -----
  const jsonSchema = zodToJsonSchema(config.schema, "structured_output");

  // 2️⃣ Build messages array -----
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  
  if (config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }
  
  messages.push({ role: "user", content: config.userPrompt });
  
  if (config.assistantPrompt) {
    messages.push({ role: "assistant", content: config.assistantPrompt });
  }

  try {
    // 3️⃣ Call OpenAI with structured outputs -----
    const response = await openai.chat.completions.create({
      model: config.model,
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "structured_output",
          schema: jsonSchema,
          strict: true,
        },
      },
      temperature: config.temperature ?? 0.1,
      max_tokens: config.maxTokens ?? 4000,
    });

    // 4️⃣ Parse and return response -----
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    return {
      object: JSON.parse(content) as T,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
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
