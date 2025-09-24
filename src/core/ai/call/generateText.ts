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
import { NonRetriableError } from "inngest";

// Providers ---
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { FALLBACK_CLAUDE_MODEL } from "@/domains/drafting/common/defaults";

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
  const messages: Message[] = [];

  if (config.systemPrompt) {
    messages.push({ role: "system", content: config.systemPrompt });
  }
  if (config.userPrompt) {
    messages.push({ role: "user", content: config.userPrompt });
  }
  if (config.assistantPrompt) {
    messages.push({ role: "assistant", content: config.assistantPrompt });
  }

  const finalModel = config.model.toString();

  // 3️⃣ Generate text -----
  try {
    // Helper function to avoid code duplication
    const tryGenerate = async (modelProvider: (model: string) => LanguageModel, modelName: string) => {
      const result = await generateText({
        model: modelProvider(modelName),
        messages,
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      });

      return {
        text: result.text,
        usage: {
          inputTokens: result.usage.inputTokens ?? 0,
          outputTokens: result.usage.outputTokens ?? 0,
          totalTokens: result.usage.totalTokens ?? 0,
        },
      };
    };

    try {
      // Try primary Claude model
      return await tryGenerate(anthropic, finalModel);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AI_RetryError") {
        console.warn(`Primary Claude model failed, falling back to ${FALLBACK_CLAUDE_MODEL}`);

        try {
          // Try fallback Claude model
          return await tryGenerate(anthropic, FALLBACK_CLAUDE_MODEL);
        } catch (fallbackError: unknown) {
          if (fallbackError instanceof Error && fallbackError.name === "AI_RetryError") {
            console.warn("Fallback Claude model failed, falling back to GPT-5");
            // Final attempt with GPT-5
            return await tryGenerate(openai, "gpt-5");
          }
          throw fallbackError;
        }
      }
      throw error;
    }
  } catch (error: unknown) {
    throw new NonRetriableError(`Text generation failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error instanceof Error ? error : new Error(String(error)) });
  }
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { simpleGenerateText };
