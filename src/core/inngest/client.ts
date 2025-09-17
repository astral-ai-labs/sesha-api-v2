/* ==========================================================================*/
// client.ts — Inngest client configuration and initialization
/* ==========================================================================*/
// Purpose: Create and configure Inngest client for event handling
// Sections: Imports, Configuration, Public API
/* ==========================================================================*/

/* ==========================================================================*/
// Imports
/* ==========================================================================*/

// External Packages ---
import { Inngest, EventSchemas } from "inngest";

// Inngest Function Request Types
// IMPORTANT: This is a temporary import and will be removed eventually, or we need to find a better way to handle this.
import { DraftingInngestEvent } from "@/domains/drafting/common/types/inngest";

// ======================================================
// Event Schemas
// ======================================================

type Events = {
  "drafting/trigger/aggregation": DraftingInngestEvent;
  "drafting/trigger/digestion": DraftingInngestEvent;
};

/* ==========================================================================*/
// Configuration
/* ==========================================================================*/

/**
 * Inngest client instance for sending and receiving events.
 */
const inngest = new Inngest({ id: "sesha-api", schemas: new EventSchemas().fromRecord<Events>() });

/* ==========================================================================*/
// Public API
/* ==========================================================================*/
export { inngest };
