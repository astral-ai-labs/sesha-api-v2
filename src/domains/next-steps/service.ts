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
import { streamText, Tool, Output, generateText } from "ai";
import { xai } from "@ai-sdk/xai";

// Core AI Modules ----
import { formatPrompt, PromptType, readAllPrompts } from "@/core/ai/prompts";

// Internal Modules ----
import type { NextStepsResponse, NextStepsResponse2 } from "./types";
import { NextStepsSchema, NextStepsSchema2 } from "./types";
import { saveAndPropagateNextSteps } from "./operations";

/* ==========================================================================*/
// Constants
/* ==========================================================================*/

const NEXT_STEPS_MODEL = "grok-4-1-fast-non-reasoning";

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

interface StreamingCallbacks {
  onComplete?: (response: NextStepsResponse | NextStepsResponse2, usage: GenerateNextStepsResult["usage"]) => Promise<void> | void;
}

interface ArticleMetadata {
  orgId: number;
  slug: string;
  version: string;
  userId: string;
}

/* ==========================================================================*/
// Tool Constants
/* ==========================================================================*/

const WEB_SEARCH_TOOL = xai.tools.webSearch({ enableImageUnderstanding: false }) as unknown as Tool<Record<string, never>, { query: string; sources: Array<{ title: string; url: string; snippet: string }> }>;
const X_SEARCH_TOOL = xai.tools.xSearch() as unknown as Tool<Record<string, never>, { query: string; posts: Array<{ author: string; url: string; text: string; likes: number }> }>;

/* ==========================================================================*/
// Implementation
/* ==========================================================================*/

/**
 * Generate next steps with streaming and structured output.
 */
function generateNextStepsStreaming(systemPrompt: string, userPrompt: string, articleMetadata: ArticleMetadata, callbacks?: StreamingCallbacks) {
  const result = streamText({
    model: xai.responses("grok-4-1-fast-non-reasoning"),
    system: systemPrompt,
    prompt: userPrompt,
    output: Output.object({ schema: NextStepsSchema }),
    temperature: 0.7,
    tools: {
      web_search: WEB_SEARCH_TOOL,
      // x_search: X_SEARCH_TOOL,
    },
    onFinish: async (finishResult) => {
      try {
        if (!finishResult.text) {
          return;
        }

        const response = JSON.parse(finishResult.text) as NextStepsResponse;

        const usage = {
          inputTokens: finishResult.usage.inputTokens ?? 0,
          outputTokens: finishResult.usage.outputTokens ?? 0,
          totalTokens: finishResult.usage.totalTokens ?? (finishResult.usage.inputTokens ?? 0) + (finishResult.usage.outputTokens ?? 0),
        };

        await saveAndPropagateNextSteps(articleMetadata.orgId, articleMetadata.slug, articleMetadata.version, response, articleMetadata.userId);

        if (callbacks?.onComplete) {
          await callbacks.onComplete(response, usage);
        }
      } catch (error) {
        // Silently fail - stream has already completed successfully for the client
        console.error("Failed to parse or save next steps (stream already delivered):", error);
      }
    },
  });

  return result;
}

// IMPORTANT: This uses live search, which Grok is depreciating
// function generateNextStepsStreaming2(prompt: string) {
//   const result = streamText({
//     model: xai("grok-4-fast-non-reasoning"),
//     prompt: prompt,
//     output: Output.object({ schema: NextStepsSchema2 }),
//     includeRawChunks: true,
//     providerOptions: {
//       xai: {
//         searchParameters: {
//           mode: "on", // 'auto', 'on', or 'off'
//           returnCitations: true,
//           maxSearchResults: 10,
//           sources: [
//             { type: "web", maxResults: 10, },
//             { type: "x", maxResults: 10 },
//           ],
//         },
//         include: "inline_citations"
//       },
//     },

//   });

//   return result;
// }

function generateNextStepsStreaming2(prompt: string, articleMetadata: ArticleMetadata) {
  const fullStream = streamText({
    model: xai.responses("grok-4-fast-non-reasoning"),
    prompt: prompt,
    includeRawChunks: true,
    output: Output.object({ schema: NextStepsSchema2 }),
    tools: {
      web_search: xai.tools.webSearch(),
      x_search: xai.tools.xSearch(),
    },
    onFinish: async (finishResult) => {

      // 1️⃣ Check if the stream completed successfully ----
      if (!finishResult.text) {
        return;
      }

      const sources: string[] = [];
      if (finishResult.sources && finishResult.sources.length > 0) {
        for (const source of finishResult.sources) {
          if (source.sourceType === "url") {
            sources.push(source.url);
          }
        }
      }

      // 2️⃣ Parse the response ----
      const response = JSON.parse(finishResult.text) as NextStepsResponse2;

      response.sources = sources;

      console.log("Sources of the response:", response.sources);


      // 3️⃣ Save and propagate next steps ----
      await saveAndPropagateNextSteps(articleMetadata.orgId, articleMetadata.slug, articleMetadata.version, response, articleMetadata.userId);

    },
  });

  // IMPORTANT: Keep for reference. This is a debugging tool to see the tool calls and sources
  // for await (const part of fullStream) {
  //   if (part.type === "tool-call") {
  //     if (part.toolName === "web_search" || part.toolName === "x_search") {
  //       console.log("Tool call:", part.toolName);
  //     }
  //   } else if (part.type === "text-delta") {
  //     process.stdout.write(part.text);
  //   } else if (part.type === "source" && part.sourceType === "url") {
  //     console.log(`Source: ${part.url}`);
  //   }
  // }

  return fullStream;
}
/**
 * Generate next steps suggestions using Grok 4 reasoning (non-streaming).
 */
async function generateNextSteps(article: string): Promise<GenerateNextStepsResult> {
  // 1️⃣ Load and format prompts ----
  const prompts = await readAllPrompts(__dirname);
  const formattedSystem = formatPrompt(prompts.systemTemplate, undefined, PromptType.SYSTEM);
  const formattedUser = formatPrompt(prompts.userTemplate, { article }, PromptType.USER);

  // 2️⃣ Generate next steps with schema ----
  const result = await generateText({
    model: xai.responses(NEXT_STEPS_MODEL),
    system: formattedSystem,
    prompt: formattedUser,
    output: Output.object({ schema: NextStepsSchema }),
    temperature: 0.7,
    tools: {
      web_search: WEB_SEARCH_TOOL,
      x_search: X_SEARCH_TOOL,
    },
  });

  if (!result.output) {
    throw new Error("Failed to generate next steps: No output returned");
  }

  return {
    response: result.output,
    usage: {
      inputTokens: result.usage.inputTokens ?? 0,
      outputTokens: result.usage.outputTokens ?? 0,
      totalTokens: (result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0),
    },
  };
}

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { generateNextSteps, generateNextStepsStreaming, generateNextStepsStreaming2, type GenerateNextStepsResult, type StreamingCallbacks, type ArticleMetadata };
