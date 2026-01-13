/* ==========================================================================*/
// index.ts — Next Steps domain public API
/* ==========================================================================*/
// Purpose: Export public interface for next steps functionality
/* ==========================================================================*/

// Types
export type { NextStepsApiRequest, NextStepsResponse, LinkItem, StepItem, OtherInfo } from "./types";
export { NextStepsSchema } from "./types";

// Operations
export {
  getArticleContentBySlugAndVersion,
  saveNextStepsForVersion,
  propagateNextStepsToSubsequentVersions,
  saveAndPropagateNextSteps,
} from "./operations";

// Service
export { generateNextSteps, generateNextStepsStreaming, type GenerateNextStepsResult, type StreamingCallbacks } from "./service";

// Inngest
export { nextStepsFunction, type NextStepsInngestEvent } from "./function";
