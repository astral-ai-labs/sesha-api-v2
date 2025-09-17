/* ==========================================================================*/
// generateText.ts — AI text generation wrapper utility
/* ==========================================================================*/
// Purpose: Provide a simple wrapper around AI SDK's generateText function
// Sections: Imports, Types, Implementation, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { generateText, LanguageModel } from "ai";
import { SystemModelMessage, UserModelMessage, AssistantModelMessage } from "ai";

/* ==========================================================================*/
// Types & Interfaces
/* ==========================================================================*/

type Message = SystemModelMessage | UserModelMessage | AssistantModelMessage;

/**
 * Configuration for text generation using individual prompt strings.
 */
interface GenerateTextConfig {
  model: LanguageModel;
  systemPrompt?: string;
  userPrompt: string;
  assistantPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Result from text generation.
 */
interface GenerateTextResponse {
  text: string;
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
 * Generate text using AI SDK with simplified configuration options.
 */
async function simpleGenerateText(config: GenerateTextConfig): Promise<GenerateTextResponse> {
  let messages: Message[] = [];

  if (config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }
  if (config.userPrompt) {
    messages.push({ role: "user", content: config.userPrompt });
  }
  if (config.assistantPrompt) {
    messages.push({ role: "assistant", content: config.assistantPrompt });
  }

  // 3️⃣ Generate text -----
  try {
    const result = await generateText({
      model: config.model,
      messages: messages,
      temperature: config.temperature,
      maxOutputTokens: config.maxTokens,
    });

    // 4️⃣ Parse response -----
    return {
      text: result.text,
      usage: {
        inputTokens: result.usage.inputTokens ?? 0,
        outputTokens: result.usage.outputTokens ?? 0,
        totalTokens: result.usage.totalTokens ?? 0,
      },
    };
  } catch (error: unknown) {
    throw new Error(`Text generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { simpleGenerateText };
