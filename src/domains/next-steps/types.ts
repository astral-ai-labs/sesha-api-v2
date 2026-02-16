/* ==========================================================================*/
// types.ts — Next Steps data type definitions
/* ==========================================================================*/
// Purpose: Type definitions for next steps functionality
// Sections: Imports, Interfaces & Schemas, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

import { z } from "zod";

/* ==========================================================================*/
// Interfaces & Schemas
/* ==========================================================================*/

interface NextStepsApiRequest {
  orgId: number;
  slug: string;
  version: string;
  userId: string;
  async?: boolean;
}

interface LinkItem {
  id: string;    // e.g., "link_1" - used as placeholder in text
  text: string;  // Link display text
  url: string;   // URL or mailto:
}

interface StepItem {
  step: string;        // Text with {link_1}, {link_2} placeholders
  links?: LinkItem[];  // Links to replace placeholders
}

interface OtherInfo {
  text: string;        // Text with {link_1}, {link_2} placeholders
  links?: LinkItem[];  // Links to replace placeholders
}

interface NextStepsResponse {
  mustDo: StepItem[];
  important: StepItem[];
  optional: StepItem[];
  otherRelevantInformation: OtherInfo;
  linksToSources: LinkItem[];
}

interface NextStepsResponse2 {
  mustDo: string[];
  important: string[];
  optional: string[];
  sources: string[];
}

// Zod Schemas
const LinkItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  url: z.string(),
});

const StepItemSchema = z.object({
  step: z.string(),
  links: z.array(LinkItemSchema).optional(),
});

const OtherInfoSchema = z.object({
  text: z.string(),
  links: z.array(LinkItemSchema).optional(),
});

const NextStepsSchema = z.object({
  mustDo: z.array(StepItemSchema),
  important: z.array(StepItemSchema),
  optional: z.array(StepItemSchema),
  otherRelevantInformation: OtherInfoSchema,
  linksToSources: z.array(LinkItemSchema),
});

const NextStepsSchema2 = z.object({
  mustDo: z.array(z.string()),
  important: z.array(z.string()),
  optional: z.array(z.string()),
});


/* ==========================================================================*/
// Public API
/* ==========================================================================*/

export type { NextStepsApiRequest, NextStepsResponse, NextStepsResponse2, LinkItem, StepItem, OtherInfo };
export { NextStepsSchema, NextStepsSchema2 };
